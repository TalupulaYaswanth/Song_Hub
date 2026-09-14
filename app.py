from flask import Flask, render_template, request, jsonify
from models import db, User, Transcription, SavedSong
import os
import urllib.request
import urllib.parse
import json
import base64
import time
import re

app = Flask(__name__)
# Secure database URI inside the instance folder (standard Flask practice)
instance_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'instance')
if not os.path.exists(instance_path):
    os.makedirs(instance_path)

app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(instance_path, "database.db")}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['TEMPLATES_AUTO_RELOAD'] = True
app.jinja_env.auto_reload = True

# --- Spotify API Credentials ---
# Get yours free at: https://developer.spotify.com/dashboard
SPOTIFY_CLIENT_ID = os.environ.get('SPOTIFY_CLIENT_ID', '223c6e9c4f9e4420b407ae2a9634bc23')
SPOTIFY_CLIENT_SECRET = os.environ.get('SPOTIFY_CLIENT_SECRET', 'd972333ffa294c5d949133d98756dd34')
spotify_token_cache = {'token': None, 'expires_at': 0}

db.init_app(app)

# Create tables if they don't exist
with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/owner')
def owner_dashboard():
    return render_template('owner.html')

# --- API Endpoints ---

@app.route('/api/auth', methods=['POST'])
def auth_user():
    data = request.json
    if not data or 'uid' not in data:
        return jsonify({"error": "Invalid payload"}), 400
    
    user = User.query.filter_by(uid=data['uid']).first()
    
    if user:
        if user.blocked:
            return jsonify({"status": "blocked", "message": "ACCOUNT TERMINATED: This identity has been blocked by the Master Administrator."}), 403
        # Update last login
        user.last_login = db.func.now()
        user.display_name = data.get('displayName', user.display_name)
        user.photo_url = data.get('photoURL', user.photo_url)
    else:
        # Create new user
        user = User(
            uid=data['uid'],
            email=data['email'],
            display_name=data.get('displayName', ''),
            photo_url=data.get('photoURL', '')
        )
        db.session.add(user)
        
    db.session.commit()
    return jsonify({"status": "success", "user": user.to_dict()})

@app.route('/api/transcriptions', methods=['GET', 'POST'])
def handle_transcriptions():
    if request.method == 'POST':
        try:
            data = request.json
            new_history = Transcription(
                user_id=data['userId'],
                user_email=data.get('userEmail') or 'unknown@user.com',
                user_name=data.get('userName') or 'Unknown Identity',
                song_name=data.get('songName') or 'Untitled Track',
                lyrics=data.get('lyrics') or '[]'
            )
            db.session.add(new_history)
            db.session.commit()
            return jsonify({"status": "success", "id": new_history.id})
        except Exception as e:
            db.session.rollback()
            print(f"❌ DATABASE ERROR: {str(e)}")
            return jsonify({"error": "Database Commit Failed", "details": str(e)}), 500
    else:
        user_id = request.args.get('userId')
        if not user_id:
            return jsonify({"error": "Missing userId parameter"}), 400
        history = Transcription.query.filter_by(user_id=user_id).order_by(Transcription.timestamp.desc()).limit(20).all()
        return jsonify([h.to_dict() for h in history])

@app.route('/api/transcriptions/clear', methods=['POST'])
def clear_transcriptions():
    data = request.json
    uid = data.get('uid')
    if not uid:
        return jsonify({"error": "Missing user confirmation"}), 400
    
    Transcription.query.filter_by(user_id=uid).delete()
    db.session.commit()
    return jsonify({"status": "success", "message": "History purged from database"})

@app.route('/api/transcriptions/delete', methods=['POST'])
def delete_transcription():
    data = request.json
    transcription_id = data.get('id')
    uid = data.get('uid')
    
    if not transcription_id or not uid:
        return jsonify({"error": "Missing parameters"}), 400
        
    item = Transcription.query.filter_by(id=transcription_id, user_id=uid).first()
    if item:
        db.session.delete(item)
        db.session.commit()
        return jsonify({"status": "success"})
    return jsonify({"error": "Record not found"}), 404

@app.route('/api/admin/users', methods=['GET'])
def get_users():
    # In a real app we'd verify admin identity here (e.g. check email == OWNER_EMAIL)
    users = User.query.all()
    transcriptions_count = Transcription.query.count()
    return jsonify({
        "users": [u.to_dict() for u in users],
        "total_transcriptions": transcriptions_count
    })

@app.route('/api/admin/system', methods=['GET'])
def get_system_feed():
    histories = Transcription.query.order_by(Transcription.timestamp.desc()).limit(20).all()
    return jsonify([h.to_dict() for h in histories])

@app.route('/api/admin/block', methods=['POST'])
def block_user():
    data = request.json
    uid = data.get('uid')
    blocked = data.get('blocked', True)
    
    user = User.query.filter_by(uid=uid).first()
    if user:
        user.blocked = blocked
        db.session.commit()
        return jsonify({"status": "success", "user": user.to_dict()})
    return jsonify({"error": "User not found"}), 404

@app.route('/api/lyrics', methods=['GET'])
def get_lyrics():
    artist = request.args.get('artist', '')
    title = request.args.get('title', '')
    if not title:
        return jsonify({"error": "Missing song title"}), 400

    # Clean title and artist to maximize lyrics search match rate
    clean_title = re.sub(r'\(.*?\)|\[.*?\]', '', title)
    clean_title = re.split(r'\s*-\s*', clean_title)[0].strip()
    clean_artist = re.split(r'[,&]', artist)[0].strip() if artist else ''

    # 1. Search Lrclib for exact time-synchronized lyrics (matching song tempo & timestamps)
    try:
        query_str = f"{clean_title} {clean_artist}".strip()
        safe_q = urllib.parse.quote(query_str)
        req = urllib.request.Request(
            f'https://lrclib.net/api/search?q={safe_q}',
            headers={'User-Agent': 'SongToTextApp/1.0'}
        )
        response = urllib.request.urlopen(req, timeout=5)
        results = json.loads(response.read().decode('utf-8'))

        if isinstance(results, list) and len(results) > 0:
            # Check for syncedLyrics with exact millisecond timestamps
            for item in results:
                if item.get('syncedLyrics') and len(item['syncedLyrics'].strip()) > 30:
                    return jsonify({
                        "synced": True,
                        "syncedLyrics": item['syncedLyrics'],
                        "plainLyrics": item.get('plainLyrics', ''),
                        "duration": item.get('duration', 0)
                    })
            
            # If no synced lyrics, return plain lyrics from first match
            for item in results:
                if item.get('plainLyrics') and len(item['plainLyrics'].strip()) > 30:
                    return jsonify({
                        "synced": False,
                        "lyrics": item['plainLyrics'],
                        "duration": item.get('duration', 0)
                    })
    except Exception as e:
        print(f"Lrclib Search error: {e}")

    # 2. Fallback to Lyrics.ovh
    try:
        if clean_artist and clean_title:
            safe_artist = urllib.parse.quote(clean_artist)
            safe_title = urllib.parse.quote(clean_title)
            req = urllib.request.Request(
                f'https://api.lyrics.ovh/v1/{safe_artist}/{safe_title}',
                headers={'User-Agent': 'Mozilla/5.0'}
            )
            response = urllib.request.urlopen(req, timeout=4)
            data = json.loads(response.read().decode('utf-8'))
            if data.get('lyrics'):
                return jsonify({"synced": False, "lyrics": data.get('lyrics')})
    except Exception as e:
        print(f"Lyrics.ovh fallback error: {e}")

    return jsonify({"error": "No lyrics found"}), 404

@app.route('/api/proxy/audio', methods=['GET'])
def proxy_audio():
    url = request.args.get('url', '')
    if not url:
        return jsonify({"error": "Missing url"}), 400
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        response = urllib.request.urlopen(req, timeout=10)
        return response.read(), 200, {'Content-Type': 'audio/mpeg', 'Access-Control-Allow-Origin': '*'}
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- Spotify API ---

def get_spotify_token():
    """Get a Spotify access token using Client Credentials flow. Caches until expiry."""
    if spotify_token_cache['token'] and time.time() < spotify_token_cache['expires_at']:
        return spotify_token_cache['token']
    
    if SPOTIFY_CLIENT_ID == 'YOUR_SPOTIFY_CLIENT_ID':
        return None  # Not configured
    
    try:
        auth_str = f'{SPOTIFY_CLIENT_ID}:{SPOTIFY_CLIENT_SECRET}'
        auth_b64 = base64.b64encode(auth_str.encode()).decode()
        
        data = urllib.parse.urlencode({'grant_type': 'client_credentials'}).encode()
        req = urllib.request.Request(
            'https://accounts.spotify.com/api/token',
            data=data,
            headers={
                'Authorization': f'Basic {auth_b64}',
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        )
        response = urllib.request.urlopen(req, timeout=5)
        result = json.loads(response.read().decode('utf-8'))
        
        spotify_token_cache['token'] = result['access_token']
        spotify_token_cache['expires_at'] = time.time() + result.get('expires_in', 3600) - 60
        
        return result['access_token']
    except Exception as e:
        print(f"Spotify Token Error: {e}")
        return None

@app.route('/api/spotify/search', methods=['GET'])
def spotify_search():
    query = request.args.get('q', '')
    limit = request.args.get('limit', '30')
    
    if not query:
        return jsonify({"error": "Missing search query"}), 400
    
    token = get_spotify_token()
    if not token:
        return jsonify({"error": "Spotify not configured", "tracks": []}), 200
    
    try:
        safe_query = urllib.parse.quote(query)
        req = urllib.request.Request(
            f'https://api.spotify.com/v1/search?q={safe_query}&type=track&limit={limit}',
            headers={
                'Authorization': f'Bearer {token}',
                'User-Agent': 'Mozilla/5.0'
            }
        )
        response = urllib.request.urlopen(req, timeout=5)
        data = json.loads(response.read().decode('utf-8'))
        
        tracks = []
        for item in data.get('tracks', {}).get('items', []):
            preview = item.get('preview_url')
            if preview:  # Only include tracks with playable previews
                images = item.get('album', {}).get('images', [])
                artwork = images[0]['url'] if images else ''
                tracks.append({
                    'trackName': item.get('name', 'Unknown'),
                    'artistName': ', '.join(a['name'] for a in item.get('artists', [])),
                    'previewUrl': preview,
                    'artworkUrl': artwork,
                    'provider': 'Spotify'
                })
        
        return jsonify({"tracks": tracks})
    except Exception as e:
        print(f"Spotify Search Error: {e}")
        return jsonify({"error": str(e), "tracks": []}), 200

@app.route('/api/songs/save', methods=['POST'])
def save_song():
    data = request.json
    uid = data.get('uid')
    
    if not uid:
        return jsonify({"error": "Missing user confirmation"}), 400
        
    # Check if already saved
    existing = SavedSong.query.filter_by(user_id=uid, track_name=data.get('trackName')).first()
    if existing:
        return jsonify({"status": "exists", "message": "Song already in library"})
        
    new_song = SavedSong(
        user_id=uid,
        track_name=data.get('trackName'),
        artist_name=data.get('artistName'),
        preview_url=data.get('previewUrl'),
        artwork_url=data.get('artworkUrl'),
        provider=data.get('provider')
    )
    db.session.add(new_song)
    db.session.commit()
    
    return jsonify({"status": "success", "id": new_song.id})

@app.route('/api/songs/saved', methods=['GET'])
def get_saved_songs():
    uid = request.args.get('uid')
    if not uid:
        return jsonify({"error": "Missing user confirmation"}), 400
        
    songs = SavedSong.query.filter_by(user_id=uid).order_by(SavedSong.timestamp.desc()).all()
    return jsonify([s.to_dict() for s in songs])

@app.route('/api/songs/delete', methods=['POST'])
def delete_song():
    data = request.json
    song_id = data.get('id')
    uid = data.get('uid')
    
    if not song_id or not uid:
        return jsonify({"error": "Missing parameters"}), 400
        
    song = SavedSong.query.filter_by(id=song_id, user_id=uid).first()
    if song:
        db.session.delete(song)
        db.session.commit()
        return jsonify({"status": "success"})
    return jsonify({"error": "Song not found"}), 404

if __name__ == '__main__':
    try:
        from waitress import serve
        print("[*] Starting Production WSGI Server (Waitress) on port 5000...")
        serve(app, host='0.0.0.0', port=5000)
    except ImportError:
        print("[!] Waitress not installed. Falling back to Flask development server.")
        print("   To fix the warning, run: pip install waitress")
        app.run(debug=True, port=5000)
