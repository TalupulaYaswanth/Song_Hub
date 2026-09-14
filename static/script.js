import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';

env.allowLocalModels = false;
let transcriber = null;

// --- CONFIGURATION ---
// ⚠️ PASTE YOUR FIREBASE CONFIG HERE FROM THE GUIDE
const firebaseConfig = {
  apiKey: "AIzaSyBPXv3PvIHrDrNAoN4HxrQy-LIrXo4Bayo",
  authDomain: "mylovely2d.firebaseapp.com",
  projectId: "mylovely2d",
  storageBucket: "mylovely2d.firebasestorage.app",
  messagingSenderId: "252661420811",
  appId: "1:252661420811:web:329709218c12b468b5480e",
  measurementId: "G-LJBCG7XM2Q"
};

const OWNER_EMAIL = 'talupulayaswanth13@gmail.com';

const OFFLINE_COLLECTION = [
  { trackName: "Echoes of Eternity", artistName: "SoundHelix", previewUrl: "/static/assets/audio/song1.mp3", artworkUrl: "/static/assets/images/song1.jpg" },
  { trackName: "Midnight Serenade", artistName: "SoundHelix", previewUrl: "/static/assets/audio/song2.mp3", artworkUrl: "/static/assets/images/song2.jpg" },
  { trackName: "Neon Dreams", artistName: "SoundHelix", previewUrl: "/static/assets/audio/song3.mp3", artworkUrl: "/static/assets/images/song3.jpg" },
  { trackName: "Celestial Voyage", artistName: "SoundHelix", previewUrl: "/static/assets/audio/song4.mp3", artworkUrl: "/static/assets/images/song4.png" },
  { trackName: "Urban Jungle", artistName: "SoundHelix", previewUrl: "/static/assets/audio/song5.mp3", artworkUrl: "/static/assets/images/song5.png" },
  { trackName: "Oceanic Bliss", artistName: "SoundHelix", previewUrl: "/static/assets/audio/song6.mp3", artworkUrl: "/static/assets/images/song6.jpg" },
  { trackName: "Mountain High", artistName: "SoundHelix", previewUrl: "/static/assets/audio/song7.mp3", artworkUrl: "/static/assets/images/song7.jpg" },
  { trackName: "Golden Hour", artistName: "SoundHelix", previewUrl: "/static/assets/audio/song8.mp3", artworkUrl: "/static/assets/images/song8.jpg" },
  { trackName: "Velvet Sky", artistName: "SoundHelix", previewUrl: "/static/assets/audio/song9.mp3", artworkUrl: "/static/assets/images/song9.jpg" },
  { trackName: "Infinite Horizon", artistName: "SoundHelix", previewUrl: "/static/assets/audio/song10.mp3", artworkUrl: "/static/assets/images/song10.jpg" }
];

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const loginScreen = document.getElementById('login-screen');
  const libraryScreen = document.getElementById('library-screen');
  const songGrid = document.getElementById('song-grid');
  const loadingSpinner = document.getElementById('loading-spinner');
  const phoneApp = document.getElementById('phone-app');
  
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const backLibraryBtn = document.getElementById('back-library-btn');
  const languageSelect = document.getElementById('language-select');
  const yearSelect = document.getElementById('year-select');
  const atmosphereSelect = document.getElementById('atmosphere-select');
  
  const uploadZone = document.getElementById('upload-zone');
  const audioInput = document.getElementById('audio-upload');
  const fileNameDisplay = document.getElementById('file-name');
  const connectivityBadge = document.getElementById('connectivity-badge');
  const libraryTitle = document.getElementById('library-title');
  const globalSearchInput = document.getElementById('global-search-input');
  const searchClearBtn = document.getElementById('search-clear-btn');
  const searchBar = document.getElementById('search-bar');
  const searchTrigger = document.getElementById('search-trigger');
  const searchFilterBadge = document.getElementById('search-filter-badge');

  // Auth Form Elements
  const authForm = document.getElementById('email-login-form');
  const authEmailInput = document.getElementById('auth-email');
  const authPasswordInput = document.getElementById('auth-password');
  const authSubmitBtn = document.getElementById('email-auth-btn');
  const authBtnText = document.getElementById('auth-btn-text');
  const toggleAuthMode = document.getElementById('toggle-auth-mode');
  const authToggleText = document.getElementById('auth-toggle-text');
  const authError = document.getElementById('auth-error');
  let isLoginMode = true;

  
  const playPauseBtn = document.getElementById('play-pause-btn');
  const playIconTemplate = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
  const pauseIconTemplate = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;
  
  const transcribeBtn = document.getElementById('transcribe-btn');
  const transcribeText = document.getElementById('transcribe-text');
  const transcriptOutput = document.getElementById('transcript-output');
  const downloadTxtBtn = document.getElementById('download-txt-btn');
  
  // History Elements
  const historyBtn = document.getElementById('history-btn');
  const savedSongsBtn = document.getElementById('saved-songs-btn');
  const historyModal = document.getElementById('history-modal');
  const closeHistoryBtn = document.getElementById('close-history-btn');
  const historyList = document.getElementById('history-list');
  const clearHistoryBtn = document.getElementById('clear-history-btn');

  // Admin Elements
  const adminBtn = document.getElementById('admin-btn');
  const mainSavedPlaylistBtn = document.getElementById('main-saved-playlist-btn');
  const homeLibraryBtn = document.getElementById('home-library-btn');
  const adminModal = document.getElementById('admin-modal');
  const closeAdminBtn = document.getElementById('close-admin-btn');
  const adminUserList = document.getElementById('admin-user-list');
  const totalUsersCount = document.getElementById('total-users-count');
  const globalSongsCount = document.getElementById('global-songs-count');
  const profileDropdown = document.getElementById('profile-dropdown');
  const menuLogout = document.getElementById('menu-logout');
  const menuSecurity = document.getElementById('menu-security');
  const menuOwner = document.getElementById('menu-owner');
  const menuAccount = document.getElementById('menu-account');

  
  // God Profile UI Elements
  const userProfileHeader = document.getElementById('user-profile-header');
  const userAvatar = document.getElementById('user-avatar');
  const userDisplayName = document.getElementById('user-display-name');
  
  let currentUser = null;
  let isTranscribing = false;
  let currentFile = null;  // True if cloud, File if local
  let wavesurfer = null;
  let activeSongName = "";
  let activeArtistName = "";
  let transcriptionCache = [];
  let isViewingSavedLibrary = false;
  let cachedSavedSongs = [];
  let searchExpanded = false;

  // Auth State Management
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUser = user;
      
      // IMMEDIATE UI TRANSITION
      loginScreen.style.display = 'none';
      libraryScreen.style.display = 'flex';
      
      updateUserUI(user);
      
      // Save User to Python SQL Server
      try {
        const response = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || user.email.split('@')[0],
                photoURL: user.photoURL
            })
        });
        
        const data = await response.json();
        
        if (response.status === 403 && data.status === 'blocked') {
          alert(data.message);
          signOut(auth);
          return;
        }
      } catch (sqlError) {
        console.warn("⚠️ Local Server Sync Alert (Flask might not be running):", sqlError.message);
      }
      
      // Owner Logic
      if (user.email === OWNER_EMAIL) {
        adminBtn.style.display = 'flex';
        adminBtn.onclick = () => window.location.href = "/owner";
        menuOwner.style.display = 'flex'; // Show the Master Tile in grid
      } else {
        menuOwner.style.display = 'none';
      }

      mainSavedPlaylistBtn.style.display = 'flex';
      mainSavedPlaylistBtn.onclick = () => fetchSavedLibrary();
      
      homeLibraryBtn.onclick = () => {
        fetchLibrary(languageSelect.value);
      };

      fetchLibrary(languageSelect.value);
      initWavesurfer();
    } else {
      currentUser = null;
      loginScreen.style.display = 'flex';
      libraryScreen.style.display = 'none';
      phoneApp.style.display = 'none';
      mainSavedPlaylistBtn.style.display = 'none';
      if(wavesurfer) wavesurfer.pause();
    }
  });

  const updateUserUI = (user) => {
    const finalName = user.displayName || user.email.split('@')[0];
    userDisplayName.textContent = finalName;
    userAvatar.textContent = finalName.charAt(0);
    
    // Panel Branding (New)
    const panelName = document.getElementById('user-display-name-panel');
    const panelEmail = document.getElementById('user-email-panel');
    const panelAvatar = document.getElementById('user-avatar-large');
    
    if (panelName) panelName.textContent = finalName;
    if (panelEmail) panelEmail.textContent = user.email;
    if (panelAvatar) panelAvatar.textContent = finalName.charAt(0);

    if (user.photoURL) {
      userAvatar.style.backgroundImage = `url(${user.photoURL})`;
      userAvatar.style.backgroundSize = 'cover';
      userAvatar.textContent = '';
      
      if (panelAvatar) {
        panelAvatar.style.backgroundImage = `url(${user.photoURL})`;
        panelAvatar.style.backgroundSize = 'cover';
        panelAvatar.textContent = '';
      }
    }
    userProfileHeader.style.display = 'flex';
  };

  // Initialize wavesurfer safely
  const initWavesurfer = () => {
    if (!wavesurfer) {
      wavesurfer = WaveSurfer.create({
        container: '#waveform',
        waveColor: 'rgba(139, 92, 246, 0.4)',
        progressColor: '#8b5cf6',
        cursorColor: '#ec4899',
        barWidth: 4,
        barRadius: 4,
        height: 250,
      });

      wavesurfer.on('play', () => { playPauseBtn.innerHTML = pauseIconTemplate; });
      wavesurfer.on('pause', () => { playPauseBtn.innerHTML = playIconTemplate; });
      wavesurfer.on('finish', () => { playPauseBtn.innerHTML = playIconTemplate; });

      let lastActiveLineIndex = -1;
      wavesurfer.on('timeupdate', (currentTime) => {
        if (isTranscribing || transcriptionCache.length === 0) return;
        
        let activeLineIndex = -1;
        for (let i = transcriptionCache.length - 1; i >= 0; i--) {
          if (currentTime >= transcriptionCache[i].time) {
            activeLineIndex = i;
            break;
          }
        }

        if (activeLineIndex !== lastActiveLineIndex) {
          const lines = transcriptOutput.querySelectorAll('.lyric-line');
          if (lastActiveLineIndex >= 0 && lines[lastActiveLineIndex]) {
            lines[lastActiveLineIndex].classList.remove('active');
          }
          if (activeLineIndex >= 0 && lines[activeLineIndex]) {
            lines[activeLineIndex].classList.add('active');
            lines[activeLineIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          lastActiveLineIndex = activeLineIndex;
        }

        // Handle Word Highlighting inside active line only
        if (activeLineIndex >= 0 && transcriptionCache[activeLineIndex]?.words?.length > 0) {
          const activeLineEl = transcriptOutput.querySelectorAll('.lyric-line')[activeLineIndex];
          if (activeLineEl) {
            const wordSpans = activeLineEl.querySelectorAll('.lyric-word');
            const wordsData = transcriptionCache[activeLineIndex].words;
            wordSpans.forEach((wordSpan, wIndex) => {
              const wData = wordsData[wIndex];
              if (wData && currentTime >= wData.start && currentTime <= (wData.end || wData.start + 0.5)) {
                if (!wordSpan.classList.contains('active')) wordSpan.classList.add('active');
              } else {
                if (wordSpan.classList.contains('active')) wordSpan.classList.remove('active');
              }
            });
          }
        }
      });
    }
  };

  // Library Fetching
  const fetchLibrary = async (term = 'bollywood') => {
    // Reset saved library mode
    isViewingSavedLibrary = false;
    cachedSavedSongs = [];
    searchBar.classList.remove('saved-mode');
    searchFilterBadge.classList.remove('active');
    globalSearchInput.placeholder = 'Search for songs, artists, or albums...';

    loadingSpinner.style.display = 'flex';
    songGrid.style.display = 'none';
    
    // Check Connectivity
    if (!navigator.onLine) {
      console.log("📴 Offline Mode: Loading local collection...");
      connectivityBadge.textContent = "Offline Mode";
      connectivityBadge.style.color = "#ff3131";
      connectivityBadge.style.borderColor = "#ff3131";
      connectivityBadge.style.background = "rgba(255, 49, 49, 0.1)";
      libraryTitle.textContent = "Local Backup Hits";
      renderSongs(OFFLINE_COLLECTION);
      return;
    }

    connectivityBadge.textContent = "Online Cloud";
    connectivityBadge.style.color = "#00ff41";
    connectivityBadge.style.borderColor = "#00ff41";
    connectivityBadge.style.background = "rgba(0, 255, 65, 0.1)";
    
    if (globalSearchInput.value.trim() !== "") {
        libraryTitle.textContent = `Search: ${globalSearchInput.value.trim()}`;
    } else {
        libraryTitle.textContent = "Global Top Hits";
    }

    try {
      // Fetch concurrently from three APIs (Spotify goes through our Flask backend)
      const [itunesRes, jamendoRes, spotifyRes] = await Promise.allSettled([
        fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(term)}&limit=50&entity=song`),
        fetch(`https://api.jamendo.com/v3.0/tracks/?client_id=b5b9fac1&format=json&limit=50&search=${encodeURIComponent(term)}`),
        fetch(`/api/spotify/search?q=${encodeURIComponent(term)}&limit=30`)
      ]);
      
      let formattedSongs = [];

      // Process iTunes Data
      if (itunesRes.status === 'fulfilled') {
        try {
          const data = await itunesRes.value.json();
          const itunesSongs = data.results.map(track => ({
            trackName: track.trackName || 'Unknown Title',
            artistName: track.artistName || 'Unknown Artist',
            previewUrl: track.previewUrl,
            artworkUrl: track.artworkUrl100 ? track.artworkUrl100.replace('100x100bb', '300x300bb') : '',
            provider: 'Apple'
          })).filter(s => s.previewUrl); // Must have audio
          formattedSongs = [...formattedSongs, ...itunesSongs];
        } catch(e) { console.warn("iTunes Parse Error:", e); }
      }

      // Process Jamendo (Indie Cloud) Data
      if (jamendoRes.status === 'fulfilled') {
        try {
          const data = await jamendoRes.value.json();
          if (data.results) {
            const jamendoSongs = data.results.map(track => ({
              trackName: track.name || 'Unknown Title',
              artistName: track.artist_name || 'Unknown Artist',
              previewUrl: track.audio,
              artworkUrl: track.image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80',
              provider: 'Jamendo'
            })).filter(s => s.previewUrl);
            formattedSongs = [...formattedSongs, ...jamendoSongs];
          }
        } catch(e) { console.warn("Jamendo Parse Error:", e); }
      }

      // Process Spotify Data (via our Flask backend proxy)
      if (spotifyRes.status === 'fulfilled') {
        try {
          const data = await spotifyRes.value.json();
          if (data.tracks && data.tracks.length > 0) {
            formattedSongs = [...formattedSongs, ...data.tracks];
            console.log(`🎵 Spotify returned ${data.tracks.length} tracks`);
          }
        } catch(e) { console.warn("Spotify Parse Error:", e); }
      }

      if (formattedSongs.length === 0) throw new Error("All Cloud APIs failed to return music");

      // Prioritize Jamendo (full songs) first, then Spotify/iTunes (30s previews)
      const fullSongs = formattedSongs.filter(s => s.provider === 'Jamendo').sort(() => 0.5 - Math.random());
      const previewSongs = formattedSongs.filter(s => s.provider !== 'Jamendo').sort(() => 0.5 - Math.random());
      formattedSongs = [...fullSongs, ...previewSongs];
      
      renderSongs(formattedSongs);
    } catch (e) {
      console.error("Cloud fetch completely failed, falling back to local:", e);
      renderSongs(OFFLINE_COLLECTION);
    }  };

  const renderSongs = (songs) => {
    songGrid.innerHTML = '';
    songs.forEach(song => {
      const card = document.createElement('div');
      card.className = 'song-card';
      
      // Sanitized content for non-interactive elements
      const safeTrackName = song.trackName.replace(/"/g, '&quot;');
      const safeArtistName = song.artistName.replace(/"/g, '&quot;');
      const artworkUrl = song.artworkUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80';

      // Provider badge color
      const providerColors = {
        'Apple': { bg: '#000000', border: 'rgba(255,255,255,0.3)', color: '#ffffff' },
        'Jamendo': { bg: 'rgba(255,165,0,0.15)', border: 'rgba(255,165,0,0.4)', color: '#ffa500' },
        'Spotify': { bg: 'rgba(30,215,96,0.15)', border: 'rgba(30,215,96,0.4)', color: '#1ed760' }
      };
      const prov = providerColors[song.provider] || providerColors['Apple'];

      card.innerHTML = `
        <button class="download-song-btn" title="Download Audio" style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.6); border: 2px solid var(--primary-glow); border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: white; z-index: 2;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
        </button>
        ${song.provider ? `<span style="position: absolute; top: 24px; left: 24px; background: ${prov.bg}; border: 1px solid ${prov.border}; color: ${prov.color}; font-size: 10px; font-weight: 800; padding: 4px 8px; border-radius: 8px; z-index: 2; backdrop-filter: blur(8px); letter-spacing: 1px; text-transform: uppercase; white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,0.5);">${song.provider !== 'Jamendo' && song.provider !== 'Local' ? '30s' : 'Full'}</span>` : ''}
        <img src="${artworkUrl}" alt="${safeTrackName}">
        <h3>${safeTrackName}</h3>
        <p>${safeArtistName}</p>
        <button class="save-lib-btn" style="width: 100%; margin-top: 10px; padding: 6px; background: rgba(236, 72, 153, 0.1); border: 1px solid #ec4899; color: #ec4899; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 4px; z-index: 2;">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
          Save to Library
        </button>
        ${song.id ? `
        <button class="delete-song-btn" style="width: 100%; margin-top: 6px; padding: 6px; background: rgba(255, 49, 49, 0.1); border: 1px solid #ff3131; color: #ff3131; border-radius: 6px; cursor: pointer; font-size: 11px; display: flex; align-items: center; justify-content: center; gap: 4px; z-index: 2;">
          Remove from Library
        </button>` : ''}
      `;

      // Master Card Click -> Play Song
      card.onclick = () => selectSong(song.previewUrl, song.trackName, song.artworkUrl, song.artistName);

      // --- Internal Event Assignments (Safe from Syntax Errors) ---
      
      const dlBtn = card.querySelector('.download-song-btn');
      dlBtn.onclick = (e) => {
        e.stopPropagation();
        const a = document.createElement('a');
        a.href = song.previewUrl;
        a.download = `${song.trackName}.mp3`;
        a.target = '_blank';
        a.click();
      };

      const saveBtn = card.querySelector('.save-lib-btn');
      saveBtn.onclick = (e) => {
        e.stopPropagation();
        window.saveSongToAccount(saveBtn, song.trackName, song.artistName, song.previewUrl, song.artworkUrl, song.provider || "Local");
      };

      if (song.id) {
        const delBtn = card.querySelector('.delete-song-btn');
        delBtn.onclick = (e) => {
          e.stopPropagation();
          window.deleteSongFromAccount(delBtn, song.id);
        };
      }

      songGrid.appendChild(card);
    });
    loadingSpinner.style.display = 'none';
    songGrid.style.display = 'grid';
  };

  window.addEventListener('online', () => fetchLibrary(languageSelect.value));
  window.addEventListener('offline', () => fetchLibrary(languageSelect.value));

  // Provide Save Song Logic to Window
  window.saveSongToAccount = async (btn, trackName, artistName, previewUrl, artworkUrl, provider) => {
    if (!currentUser) return alert("You must be logged in to save songs.");
    
    // UI Feedback
    const ogHtml = btn.innerHTML;
    btn.innerHTML = `Saving...`;
    btn.disabled = true;

    try {
      const res = await fetch('/api/songs/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: currentUser.uid,
          trackName,
          artistName,
          previewUrl,
          artworkUrl,
          provider
        })
      });
      const data = await res.json();
      
      if (data.status === 'success') {
        btn.innerHTML = `Saved ✓`;
        btn.style.background = '#ec4899';
        btn.style.color = 'white';
      } else if (data.status === 'exists') {
        btn.innerHTML = `Already Saved`;
      }
    } catch (e) {
      console.error(e);
      btn.innerHTML = `Error`;
    }
  };

  window.deleteSongFromAccount = async (btn, songId) => {
    if (!confirm("Are you sure you want to remove this song from your library?")) return;
    
    btn.disabled = true;
    btn.textContent = "Removing...";

    try {
      const res = await fetch('/api/songs/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: currentUser.uid, id: songId })
      });
      const data = await res.json();
      if (data.status === 'success') {
        fetchSavedLibrary(); // Refresh view
      }
    } catch (e) {
      console.error(e);
      btn.disabled = false;
      btn.textContent = "Error";
    }
  };

  const fetchSavedLibrary = async () => {
    if (!currentUser) return;
    loadingSpinner.style.display = 'flex';
    songGrid.style.display = 'none';
    
    connectivityBadge.textContent = "My Library";
    connectivityBadge.style.color = "#ec4899";
    connectivityBadge.style.borderColor = "#ec4899";
    connectivityBadge.style.background = "rgba(236, 72, 153, 0.1)";
    libraryTitle.textContent = "Saved private stash";
    
    // Enable saved library search mode
    isViewingSavedLibrary = true;
    searchBar.classList.add('saved-mode');
    searchFilterBadge.classList.add('active');
    globalSearchInput.placeholder = 'Filter your saved library...';
    
    // Clear any existing search
    globalSearchInput.value = '';
    searchClearBtn.classList.remove('active');

    try {
      const res = await fetch(`/api/songs/saved?uid=${currentUser.uid}`);
      const savedSongs = await res.json();
      cachedSavedSongs = savedSongs; // Cache for local filtering
      renderSongs(savedSongs);
    } catch (e) {
      console.error(e);
      cachedSavedSongs = [];
      renderSongs([]);
    }
  };

  const selectSong = (audioUrl, trackName, imageSource, artistName) => {
    activeSongName = trackName;
    activeArtistName = artistName || "";
    libraryScreen.style.display = 'none';
    phoneApp.style.display = 'flex';
    currentFile = "cloud";
    transcriptionCache = [];
    fileNameDisplay.textContent = activeSongName;
    wavesurfer.load(audioUrl);
    playPauseBtn.disabled = false;
    transcribeBtn.disabled = false;
    downloadTxtBtn.style.display = 'none';
    transcriptOutput.textContent = "Song retrieved from Cloud. Tap transcribe to analyze.";
  };

  // SQL History Logic
  const saveTranscriptionHistory = async (songName, lyricsArray) => {
    if (!currentUser) return;
    try {
      // Fallback logic for missing metadata
      const payload = {
        userId: currentUser.uid,
        userEmail: currentUser.email || 'unknown@user.com',
        userName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Unknown User',
        songName: songName || 'Untitled Track',
        lyrics: JSON.stringify(lyricsArray)
      };

      const res = await fetch('/api/transcriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.details || "Server rejected data");
      }
      
      console.log("✅ History synced to SQL Cloud.");
    } catch (e) {
      console.error("❌ SQL SYNC FAILED:", e.message);
      // Optional: Show a subtle toast or log alert to user
    }
  };

  const renderHistoryEntries = async () => {
    if (!currentUser) return;
    historyList.innerHTML = '<p style="text-align: center;">Syncing with Global Cloud SQL...</p>';
    
    try {
      const response = await fetch(`/api/transcriptions?userId=${currentUser.uid}`);
      const historyData = await response.json();
      
      historyList.innerHTML = '';

      if (historyData.length === 0) {
        historyList.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">No history found.</p>';
        return;
      }

      historyData.forEach((item) => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `
          <div class="history-info">
            <h4>${item.songName}</h4>
            <p>${new Date(item.timestamp).toLocaleString()}</p>
          </div>
          <button class="delete-history-btn" style="background:none; border:none; color:#ff4757; cursor:pointer; padding:5px;" onclick="(function(e){ e.stopPropagation(); window.deleteHistoryEntry(${item.id}); })(event)">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
          </button>
        `;
        div.onclick = () => {
          transcriptOutput.innerHTML = "";
          item.lyrics.forEach(l => {
            const span = document.createElement('span');
            span.className = 'lyric-line';
            span.textContent = l.text;
            transcriptOutput.appendChild(span);
          });
          libraryScreen.style.display = 'none';
          phoneApp.style.display = 'flex';
          fileNameDisplay.textContent = item.songName;
          
          transcriptionCache = item.lyrics;
          downloadTxtBtn.style.display = 'block';

          historyModal.classList.remove('active');
        };
        historyList.appendChild(div);
      });
    } catch (e) {
      console.error(e);
      historyList.innerHTML = '<p style="color: red;">Error syncing SQL history.</p>';
    }
  };

  window.deleteHistoryEntry = async (id) => {
    if (!confirm("Delete this transcription history?")) return;
    try {
        await fetch('/api/transcriptions/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid: currentUser.uid, id: id })
        });
        renderHistoryEntries();
    } catch (e) { console.error(e); }
  };

  // Event Listeners
  loginBtn.onclick = () => signInWithPopup(auth, provider).catch(e => {
    console.error("Login Error:", e);
    alert("Google Login Error: " + e.message);
  });

  const guestLoginBtn = document.getElementById('guest-login-btn');
  if (guestLoginBtn) {
    guestLoginBtn.onclick = () => {
      const guestUser = {
        uid: 'guest_' + Math.random().toString(36).substring(2, 9),
        email: 'guest@wav2text.local',
        displayName: 'Guest Explorer',
        photoURL: null
      };
      currentUser = guestUser;
      loginScreen.style.display = 'none';
      libraryScreen.style.display = 'flex';
      updateUserUI(guestUser);
      fetchLibrary(languageSelect.value);
      initWavesurfer();
    };
  }

  // Auth Mode Toggling
  toggleAuthMode.onclick = () => {
    isLoginMode = !isLoginMode;
    authBtnText.textContent = isLoginMode ? 'Sign In' : 'Create Account';
    authToggleText.innerHTML = isLoginMode 
      ? `Don't have an account? <span id="toggle-auth-mode">Sign Up</span>`
      : `Already have an account? <span id="toggle-auth-mode">Sign In</span>`;
    
    // Re-bind toggle click since we replaced innerHTML
    document.getElementById('toggle-auth-mode').onclick = toggleAuthMode.onclick;
    authError.style.display = 'none';
  };

  // Auth Form Submission
  authForm.onsubmit = async (e) => {
    e.preventDefault();
    const email = authEmailInput.value;
    const password = authPasswordInput.value;
    authError.style.display = 'none';
    authSubmitBtn.disabled = true;
    authSubmitBtn.style.opacity = '0.7';

    try {
      if (isLoginMode) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      authError.textContent = err.message.replace('Firebase:', '').trim();
      authError.style.display = 'block';
    } finally {
      authSubmitBtn.disabled = false;
      authSubmitBtn.style.opacity = '1';
    }
  };
  
  logoutBtn.onclick = () => signOut(auth);
  
  // Profile Dropdown Open Logic
  userProfileHeader.onclick = (e) => {
    e.stopPropagation();
    profileDropdown.classList.toggle('active');
  };

  document.addEventListener('click', () => {
    profileDropdown.classList.remove('active');
  });

  // Prevent clicks inside the panel from closing it instantly
  profileDropdown.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // Ensure History button closes panel when modal opens
  historyBtn.onclick = () => {
    renderHistoryEntries();
    historyModal.classList.add('active');
    profileDropdown.classList.remove('active');
  };

  if (savedSongsBtn) {
    savedSongsBtn.onclick = () => {
      fetchSavedLibrary();
      profileDropdown.classList.remove('active');
    };
  }

  menuLogout.onclick = () => signOut(auth);
  menuSecurity.onclick = () => window.open('https://myaccount.google.com/security', '_blank');
  menuOwner.onclick = () => window.location.href = "/owner";
  menuAccount.onclick = () => alert(`Current Identity: ${currentUser.displayName}\nEmail: ${currentUser.email}\nCloud UID: ${currentUser.uid}`);

  atmosphereSelect.onchange = (e) => {
    const theme = e.target.value;
    document.body.classList.remove('theme-abyss', 'theme-cyber');
    if (theme === 'abyss') document.body.classList.add('theme-abyss');
    if (theme === 'cyber') document.body.classList.add('theme-cyber');
    console.log(`🌌 Atmosphere Shifted: ${theme}`);
  };

  const fetchByFilters = () => {
    const lang = languageSelect.value;
    const year = yearSelect && yearSelect.value ? yearSelect.value : '';
    // Appending 'hits' helps the APIs find relevant music clusters for a specific era
    const query = year ? `${lang} ${year} hits` : lang;
    fetchLibrary(query);
    console.log(`🎵 Filter Applied: ${query}`);
  };

  languageSelect.onchange = fetchByFilters;
  if (yearSelect) yearSelect.onchange = fetchByFilters;

  // Offline Mode Toggle Logic
  const offlineToggle = document.getElementById('offline-toggle');
  if (offlineToggle) {
    offlineToggle.onchange = (e) => {
      const isForcedOffline = e.target.checked;
      if (isForcedOffline) {
        isViewingSavedLibrary = false;
        cachedSavedSongs = [];
        searchBar.classList.remove('saved-mode');
        searchFilterBadge.classList.remove('active');
        globalSearchInput.placeholder = 'Search for songs, artists, or albums...';
        connectivityBadge.textContent = "Offline Mode (Forced)";
        connectivityBadge.style.color = "#ff3131";
        connectivityBadge.style.borderColor = "#ff3131";
        connectivityBadge.style.background = "rgba(255, 49, 49, 0.1)";
        libraryTitle.textContent = "Local Backup Hits";
        renderSongs(OFFLINE_COLLECTION);
      } else {
        // Re-fetch online library
        fetchLibrary(languageSelect.value);
      }
    };
  }


  // ═══════════════════════════════════════════════════════════════
  // ANIMATED EXPANDING SEARCH BAR + LOCAL LIBRARY FILTERING
  // ═══════════════════════════════════════════════════════════════

  const expandSearch = () => {
    if (searchExpanded) return;
    searchBar.classList.add('expanded');
    searchExpanded = true;
    setTimeout(() => globalSearchInput.focus(), 300);
  };

  const collapseSearch = () => {
    if (!searchExpanded) return;
    if (globalSearchInput.value.trim() !== '') return; // Don't collapse with active search
    searchBar.classList.remove('expanded');
    searchExpanded = false;
    globalSearchInput.blur();
  };

  // Click magnifying glass to expand
  searchTrigger.onclick = (e) => {
    e.stopPropagation();
    if (!searchExpanded) {
      expandSearch();
    }
  };

  // Click the collapsed bar itself to expand
  searchBar.onclick = (e) => {
    if (!searchExpanded) {
      e.stopPropagation();
      expandSearch();
    }
  };

  // Collapse on click outside
  document.addEventListener('click', (e) => {
    if (searchExpanded && !searchBar.contains(e.target)) {
      collapseSearch();
    }
  });

  // Collapse on Escape key, Search on Enter key
  globalSearchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      globalSearchInput.value = '';
      searchClearBtn.classList.remove('active');
      if (isViewingSavedLibrary) {
        renderSongs(cachedSavedSongs);
      } else {
        fetchLibrary(languageSelect.value);
      }
      collapseSearch();
    }
    
    // ── ENTER KEY: Trigger immediate search ──
    if (e.key === 'Enter') {
      e.preventDefault();
      const query = globalSearchInput.value.trim();
      if (query.length === 0) return;
      
      clearTimeout(searchTimeout); // Cancel any pending debounce
      
      if (isViewingSavedLibrary) {
        // Local filter for saved library
        const lowerQ = query.toLowerCase();
        const filtered = cachedSavedSongs.filter(song =>
          (song.trackName || '').toLowerCase().includes(lowerQ) ||
          (song.artistName || '').toLowerCase().includes(lowerQ) ||
          (song.provider || '').toLowerCase().includes(lowerQ)
        );
        libraryTitle.textContent = filtered.length > 0
          ? `Found ${filtered.length} match${filtered.length !== 1 ? 'es' : ''}`
          : 'No matches found';
        renderSongs(filtered);
      } else {
        // Cloud API search — immediate, no minimum character limit
        fetchLibrary(query);
      }
    }
  });

  // Search Logic (with local library filtering)
  let searchTimeout = null;
  globalSearchInput.oninput = (e) => {
    const query = e.target.value.trim();
    
    // Show/Hide Clear Button
    if (query.length > 0) {
      searchClearBtn.classList.add('active');
    } else {
      searchClearBtn.classList.remove('active');
    }

    // ── SAVED LIBRARY: Local instant filtering ──
    if (isViewingSavedLibrary) {
      if (query.length > 0) {
        const lowerQ = query.toLowerCase();
        const filtered = cachedSavedSongs.filter(song =>
          (song.trackName || '').toLowerCase().includes(lowerQ) ||
          (song.artistName || '').toLowerCase().includes(lowerQ) ||
          (song.provider || '').toLowerCase().includes(lowerQ)
        );
        libraryTitle.textContent = filtered.length > 0
          ? `Found ${filtered.length} match${filtered.length !== 1 ? 'es' : ''}`
          : 'No matches found';
        renderSongs(filtered);
      } else {
        libraryTitle.textContent = 'Saved private stash';
        renderSongs(cachedSavedSongs);
      }
      return; // Skip cloud API calls
    }

    // ── CLOUD LIBRARY: Debounced API calls ──
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      if (query.length > 2) {
        fetchLibrary(query);
      } else if (query.length === 0) {
        fetchLibrary(languageSelect.value);
      }
    }, 500);
  };

  searchClearBtn.onclick = () => {
    globalSearchInput.value = '';
    searchClearBtn.classList.remove('active');
    if (isViewingSavedLibrary) {
      libraryTitle.textContent = 'Saved private stash';
      renderSongs(cachedSavedSongs);
    } else {
      fetchLibrary(languageSelect.value);
    }
    globalSearchInput.focus();
  };

  closeHistoryBtn.onclick = () => historyModal.classList.remove('active');

  clearHistoryBtn.onclick = async () => {
    if (!confirm("☢️ NUCLEAR ACTION: Are you sure you want to wipe your entire transcription history from the database?")) return;
    
    clearHistoryBtn.disabled = true;
    clearHistoryBtn.textContent = "Wiping...";

    try {
      const res = await fetch('/api/transcriptions/clear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: currentUser.uid })
      });
      const data = await res.json();
      if (data.status === 'success') {
        renderHistoryEntries();
        alert("History successfully purged.");
      }
    } catch (e) {
      console.error(e);
      alert("Nuclear Strike Failed: Server Connection Error.");
    } finally {
      clearHistoryBtn.disabled = false;
      clearHistoryBtn.textContent = "Clear History";
    }
  };

  backLibraryBtn.onclick = () => {
    phoneApp.style.display = 'none';
    libraryScreen.style.display = 'flex';
    wavesurfer.pause();
  };

  uploadZone.onclick = () => audioInput.click();
  audioInput.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      currentFile = file;
      activeSongName = file.name;
      activeArtistName = "";
      transcriptionCache = [];
      fileNameDisplay.textContent = file.name;
      wavesurfer.load(URL.createObjectURL(file));
      playPauseBtn.disabled = transcribeBtn.disabled = false;
      downloadTxtBtn.style.display = 'none';
      transcriptOutput.textContent = "Local file ready. Tap transcribe to run AI (may take a moment to load model initially).";
    }
  };

  playPauseBtn.onclick = () => wavesurfer.playPause();

  transcribeBtn.onclick = async () => {
    if (!currentFile || isTranscribing) return;
    isTranscribing = true;
    transcribeBtn.disabled = true;
    downloadTxtBtn.style.display = 'none';
    transcribeText.textContent = 'Processing...';
    transcriptOutput.innerHTML = '<div style="color:var(--primary-glow); margin-bottom: 10px;">Initializing...</div>';
    
    try {
      if (currentFile === "cloud") {
        // Fast Cloud Lyrics API
        transcriptOutput.innerHTML = '<div style="color:var(--cmd-cyan); margin-bottom: 10px;">☁️ Fetching real lyrics from Global Database...</div>';
        
        const response = await fetch(`/api/lyrics?artist=${encodeURIComponent(activeArtistName)}&title=${encodeURIComponent(activeSongName)}`);
        const data = await response.json();
        
        if (data.lyrics) {
          const lines = data.lyrics.split('\n').filter(l => l.trim() !== '');
          transcriptionCache = lines.map((text, i) => {
            const lineTime = i * 3.5;
            const words = text.split(' ').map((w, wi, arr) => ({
              text: w,
              start: lineTime + (wi * (3.5 / arr.length)),
              end: lineTime + ((wi + 1) * (3.5 / arr.length))
            }));
            return { time: lineTime, text, words };
          });
        } else {
          transcriptionCache = [
            { time: 0, text: "🎵 Instrumental / No Lyrics Found 🎵", words: [{text: "Instrumental", start: 0, end: 5}] }
          ];
        }
      } else {
        // Local AI Whisper Transcription
        transcriptOutput.innerHTML = '<div style="color:#ec4899; margin-bottom: 10px;">🧠 Loading AI Model...</div>';
        
        if (!transcriber) {
          transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en');
        }
        
        transcriptOutput.innerHTML = '<div style="color:#ec4899; margin-bottom: 10px;">🧠 AI Listening word-by-word...</div>';
        
        const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
        const arrayBuffer = await currentFile.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const audioData = audioBuffer.getChannelData(0);
        
        const result = await transcriber(audioData, {
            chunk_length_s: 30,
            stride_length_s: 5,
            return_timestamps: 'word',
        });

        if (result.chunks && result.chunks.length > 0) {
           // Group words into lines for better UI
           const wordsPerLine = 6;
           transcriptionCache = [];
           for (let i = 0; i < result.chunks.length; i += wordsPerLine) {
              const chunkSlice = result.chunks.slice(i, i + wordsPerLine);
              const lineText = chunkSlice.map(c => c.text).join(' ');
              transcriptionCache.push({
                time: chunkSlice[0].timestamp[0],
                text: lineText,
                words: chunkSlice.map(c => ({
                  text: c.text,
                  start: c.timestamp[0],
                  end: c.timestamp[1]
                }))
              });
           }
        } else {
           transcriptionCache = [{ time: 0, text: result.text, words: [] }];
        }
      }
      
      // Verification & Display logic (Word-by-Word Spans)
      transcriptOutput.innerHTML = "";
      transcriptionCache.forEach(line => {
        const lineDiv = document.createElement('div');
        lineDiv.className = 'lyric-line';
        
        line.words.forEach(w => {
          const wordSpan = document.createElement('span');
          wordSpan.className = 'lyric-word';
          wordSpan.textContent = w.text + ' ';
          lineDiv.appendChild(wordSpan);
        });
        
        if (line.words.length === 0) lineDiv.textContent = line.text;
        transcriptOutput.appendChild(lineDiv);
      });
      
      downloadTxtBtn.style.display = 'block';
      await saveTranscriptionHistory(activeSongName, transcriptionCache);
      
    } catch (e) {
      console.error("Transcription Error:", e);
      transcriptOutput.innerHTML = `<div style="color:#ff4757">Error: ${e.message}</div>`;
    } finally {
      isTranscribing = false;
      transcribeBtn.disabled = false;
      transcribeText.textContent = 'Transcribe';
    }
  };

  // Download Functionality
  downloadTxtBtn.onclick = () => {
    if (transcriptionCache.length === 0) return;
    
    // Format text nicely
    const blockText = transcriptionCache.map(l => l.text).join('\\n');
    const fullText = `Transcription for: ${activeSongName}\\n====================\\n\\n${blockText}\\n\\nGenerated by Wav2Text God-Mode`;

    const blob = new Blob([fullText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Transcription_${activeSongName.replace(/\\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };
});

