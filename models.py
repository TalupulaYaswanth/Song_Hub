from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    uid = db.Column(db.String(100), unique=True, nullable=False) # Firebase UID
    email = db.Column(db.String(120), unique=True, nullable=False)
    display_name = db.Column(db.String(100))
    photo_url = db.Column(db.String(500))
    last_login = db.Column(db.DateTime, default=datetime.utcnow)
    blocked = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            'uid': self.uid,
            'email': self.email,
            'displayName': self.display_name,
            'photoURL': self.photo_url,
            'lastLogin': self.last_login.isoformat() if self.last_login else None,
            'blocked': self.blocked
        }

class Transcription(db.Model):
    __tablename__ = 'transcriptions'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(100), nullable=False) # Firebase UID reference
    user_email = db.Column(db.String(120), nullable=False)
    user_name = db.Column(db.String(100), nullable=False)
    song_name = db.Column(db.String(255), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    lyrics = db.Column(db.Text, nullable=False) # Stored as JSON string

    def to_dict(self):
        import json
        try:
            parsed_lyrics = json.loads(self.lyrics)
        except:
            parsed_lyrics = []
            
        return {
            'id': self.id,
            'userId': self.user_id,
            'userEmail': self.user_email,
            'userName': self.user_name,
            'songName': self.song_name,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'lyrics': parsed_lyrics
        }

class SavedSong(db.Model):
    __tablename__ = 'saved_songs'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(100), nullable=False) # Firebase UID mapping
    track_name = db.Column(db.String(255), nullable=False)
    artist_name = db.Column(db.String(255), nullable=False)
    preview_url = db.Column(db.String(500), nullable=False)
    artwork_url = db.Column(db.String(500))
    provider = db.Column(db.String(50))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.user_id,
            'trackName': self.track_name,
            'artistName': self.artist_name,
            'previewUrl': self.preview_url,
            'artworkUrl': self.artwork_url,
            'provider': self.provider,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }
