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

  // Account & Security Modal Elements
  const accountModal = document.getElementById('account-modal');
  const closeAccountModalBtn = document.getElementById('close-account-modal-btn');
  const modalCloseActionBtn = document.getElementById('modal-close-action-btn');
  const tabBtnAccount = document.getElementById('tab-btn-account');
  const tabBtnSecurity = document.getElementById('tab-btn-security');
  const tabPaneAccount = document.getElementById('tab-pane-account');
  const tabPaneSecurity = document.getElementById('tab-pane-security');
  const modalLogoutBtn = document.getElementById('modal-logout-btn');

  
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
  let activeAudioUrl = "";
  let transcriptionCache = [];
  let isViewingSavedLibrary = false;
  let cachedSavedSongs = [];
  let searchExpanded = false;
  let currentSongsList = [...OFFLINE_COLLECTION];
  let isShuffleActive = true;
  let activeArtworkUrl = "/static/assets/images/song1.jpg";
  let isPlayerMinimized = false;

  const shuffleLibraryBtn = document.getElementById('shuffle-library-btn');
  const shuffleBtn = document.getElementById('shuffle-btn');
  const nextRandomBtn = document.getElementById('next-random-btn');

  // Floating Mini Player Elements
  const minimizePlayerBtn = document.getElementById('minimize-player-btn');
  const floatingMiniPlayer = document.getElementById('floating-mini-player');
  const miniPlayerArtwork = document.getElementById('mini-player-artwork');
  const miniPlayerTitle = document.getElementById('mini-player-title');
  const miniPlayerArtist = document.getElementById('mini-player-artist');
  const miniPlayBtn = document.getElementById('mini-play-btn');
  const miniPlayIcon = document.getElementById('mini-play-icon');
  const miniEqualizerBars = document.getElementById('mini-equalizer-bars');
  const miniExpandBtn = document.getElementById('mini-expand-btn');
  const miniCloseBtn = document.getElementById('mini-close-btn');

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
      
      homeLibraryBtn.onclick = () => goHome();

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

      wavesurfer.on('play', () => { 
        playPauseBtn.innerHTML = pauseIconTemplate; 
        updateMiniPlayerUI();
      });
      wavesurfer.on('pause', () => { 
        playPauseBtn.innerHTML = playIconTemplate; 
        updateMiniPlayerUI();
      });
      wavesurfer.on('finish', () => {
        playPauseBtn.innerHTML = playIconTemplate;
        updateMiniPlayerUI();
        if (isShuffleActive) {
          console.log("🔀 Continuous Random Play: song finished, loading next random track...");
          setTimeout(() => {
            playRandomSong();
          }, 800);
        }
      });

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
            const oldWords = lines[lastActiveLineIndex].querySelectorAll('.lyric-word');
            oldWords.forEach(w => w.classList.remove('active', 'sung'));
          }
          if (activeLineIndex >= 0 && lines[activeLineIndex]) {
            lines[activeLineIndex].classList.add('active');
            lines[activeLineIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          lastActiveLineIndex = activeLineIndex;
        }

        // Handle Dynamic Word Glow matching song speed
        if (activeLineIndex >= 0 && transcriptionCache[activeLineIndex]?.words?.length > 0) {
          const activeLineEl = transcriptOutput.querySelectorAll('.lyric-line')[activeLineIndex];
          if (activeLineEl) {
            const wordSpans = activeLineEl.querySelectorAll('.lyric-word');
            const wordsData = transcriptionCache[activeLineIndex].words;

            for (let wIndex = 0; wIndex < wordSpans.length; wIndex++) {
              const wordSpan = wordSpans[wIndex];
              const wData = wordsData[wIndex];
              if (!wData) continue;

              const nextWord = wordsData[wIndex + 1];
              const wordEnd = nextWord ? nextWord.start : (wData.end || (wData.start + 0.8));

              if (currentTime >= wData.start && currentTime < wordEnd) {
                // Currently sung word -> GLOW IN COLOR!
                if (!wordSpan.classList.contains('active')) {
                  wordSpan.classList.add('active');
                  wordSpan.classList.remove('sung');
                }
              } else if (currentTime >= wordEnd) {
                // Completed word in active line -> Solid white sung
                if (!wordSpan.classList.contains('sung')) {
                  wordSpan.classList.remove('active');
                  wordSpan.classList.add('sung');
                }
              } else {
                // Upcoming word in active line -> Dimmed
                if (wordSpan.classList.contains('active') || wordSpan.classList.contains('sung')) {
                  wordSpan.classList.remove('active', 'sung');
                }
              }
            }
          }
        }
      });

      wavesurfer.on('ready', () => {
        const speedSelect = document.getElementById('playback-speed-select');
        if (speedSelect && wavesurfer) {
          const rate = parseFloat(speedSelect.value) || 1.0;
          wavesurfer.setPlaybackRate(rate);
        }
      });

      const speedSelect = document.getElementById('playback-speed-select');
      if (speedSelect) {
        speedSelect.onchange = () => {
          const rate = parseFloat(speedSelect.value) || 1.0;
          if (wavesurfer) {
            wavesurfer.setPlaybackRate(rate);
            console.log(`⏩ Adjusted audio playback speed to ${rate}x (karaoke synchronized)`);
          }
        };
      }
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
    currentSongsList = songs && songs.length > 0 ? songs : OFFLINE_COLLECTION;
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
        <div class="song-card-tags" style="display: flex; flex-wrap: wrap; gap: 4px; justify-content: center; margin-top: 8px;">
          <span style="font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 6px; background: rgba(139, 92, 246, 0.15); border: 1px solid rgba(139, 92, 246, 0.35); color: #a78bfa;">${song.provider || 'Cloud'}</span>
          <span style="font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 6px; background: rgba(0, 243, 255, 0.12); border: 1px solid rgba(0, 243, 255, 0.3); color: #00f3ff;">⚡ Synced</span>
          <span style="font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 6px; background: rgba(236, 72, 153, 0.12); border: 1px solid rgba(236, 72, 153, 0.3); color: #ec4899;">AI Lyrics</span>
        </div>
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
    activeAudioUrl = audioUrl;
    activeSongName = trackName;
    activeArtistName = artistName || "";
    activeArtworkUrl = imageSource || "/static/assets/images/song1.jpg";

    if (floatingMiniPlayer) {
      floatingMiniPlayer.style.display = 'none';
    }
    isPlayerMinimized = false;

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
    updateMiniPlayerUI();
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
          transcriptionCache = item.lyrics;
          renderLyricsDisplay(transcriptionCache);
          libraryScreen.style.display = 'none';
          phoneApp.style.display = 'flex';
          fileNameDisplay.textContent = item.songName;
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
      mainSavedPlaylistBtn.style.display = 'flex';
      updateUserUI(guestUser);
      goHome();
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
  
  // Unified Logout handler (works for both Guest and Authenticated users)
  const handleLogout = async () => {
    if (wavesurfer) {
      wavesurfer.pause();
    }
    if (profileDropdown) profileDropdown.classList.remove('active');
    if (historyModal) historyModal.classList.remove('active');
    if (accountModal) accountModal.classList.remove('active');
    if (floatingMiniPlayer) floatingMiniPlayer.style.display = 'none';

    currentUser = null;
    libraryScreen.style.display = 'none';
    phoneApp.style.display = 'none';
    mainSavedPlaylistBtn.style.display = 'none';
    loginScreen.style.display = 'flex';

    try {
      if (auth && auth.currentUser) {
        await signOut(auth);
      }
    } catch (e) {
      console.warn("Sign out handled:", e);
    }
  };

  // Unified Home Button Handler
  const goHome = () => {
    if (profileDropdown) profileDropdown.classList.remove('active');
    if (historyModal) historyModal.classList.remove('active');
    if (accountModal) accountModal.classList.remove('active');

    // If currently in God Player view, switch back to library
    if (phoneApp && (phoneApp.style.display === 'flex' || phoneApp.style.display === 'block')) {
      if (wavesurfer && wavesurfer.isPlaying()) {
        minimizePlayer();
      } else {
        phoneApp.style.display = 'none';
        libraryScreen.style.display = 'flex';
        if (wavesurfer) wavesurfer.pause();
      }
    } else if (libraryScreen) {
      libraryScreen.style.display = 'flex';
    }

    // Reset search input and search bar status
    if (globalSearchInput) {
      globalSearchInput.value = '';
      globalSearchInput.placeholder = 'Search for songs, artists, or albums...';
    }
    if (searchClearBtn) {
      searchClearBtn.classList.remove('active');
      searchClearBtn.style.display = 'none';
    }
    if (searchBar) {
      searchBar.classList.remove('saved-mode');
    }
    if (searchFilterBadge) {
      searchFilterBadge.classList.remove('active');
      searchFilterBadge.textContent = 'LIBRARY';
    }

    // Reset saved library mode
    isViewingSavedLibrary = false;
    cachedSavedSongs = [];

    // Reset library title and connectivity status
    if (libraryTitle) {
      libraryTitle.textContent = "Global Top Hits";
    }
    if (connectivityBadge && navigator.onLine) {
      connectivityBadge.textContent = "Online Cloud";
      connectivityBadge.style.color = "#00ff41";
      connectivityBadge.style.borderColor = "#00ff41";
      connectivityBadge.style.background = "rgba(0, 255, 65, 0.1)";
    }

    // Fetch and display default library
    const currentLang = languageSelect ? languageSelect.value : 'bollywood';
    fetchLibrary(currentLang);

    // Smooth scroll to top of library
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Tactile button animation feedback
    if (homeLibraryBtn) {
      homeLibraryBtn.classList.add('btn-clicked');
      setTimeout(() => homeLibraryBtn.classList.remove('btn-clicked'), 300);
    }
  };

  // Attach global navigation listeners (ALWAYS active)
  if (homeLibraryBtn) homeLibraryBtn.onclick = () => goHome();
  if (logoutBtn) logoutBtn.onclick = () => handleLogout();
  if (mainSavedPlaylistBtn) mainSavedPlaylistBtn.onclick = () => fetchSavedLibrary();
  
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

  // Account & Security Modal Handler
  const openAccountModal = (tab = 'account') => {
    if (profileDropdown) profileDropdown.classList.remove('active');
    if (!accountModal) return;

    const modalUserAvatar = document.getElementById('modal-user-avatar');
    const modalUserName = document.getElementById('modal-user-name');
    const modalUserEmail = document.getElementById('modal-user-email');
    const modalUserRole = document.getElementById('modal-user-role');
    const modalUserUid = document.getElementById('modal-user-uid');
    const securityExternal = document.getElementById('modal-security-external');

    const name = currentUser ? (currentUser.displayName || (currentUser.email ? currentUser.email.split('@')[0] : 'Guest Explorer')) : 'Guest Explorer';
    const email = currentUser ? (currentUser.email || 'guest@wav2text.local') : 'guest@wav2text.local';
    const uid = currentUser ? (currentUser.uid || 'guest_local') : 'guest_local';
    const isGuest = !currentUser || (currentUser.uid && currentUser.uid.startsWith('guest_'));
    const isOwner = currentUser && currentUser.email === OWNER_EMAIL;

    if (modalUserAvatar) modalUserAvatar.textContent = name.charAt(0).toUpperCase();
    if (modalUserName) modalUserName.textContent = name;
    if (modalUserEmail) modalUserEmail.textContent = email;
    if (modalUserUid) modalUserUid.textContent = uid;

    if (modalUserRole) {
      if (isOwner) {
        modalUserRole.textContent = 'Owner / Master Admin';
        modalUserRole.style.background = 'rgba(0, 243, 255, 0.15)';
        modalUserRole.style.color = '#00f3ff';
      } else if (isGuest) {
        modalUserRole.textContent = 'Guest Explorer';
        modalUserRole.style.background = 'rgba(236, 72, 153, 0.15)';
        modalUserRole.style.color = '#ec4899';
      } else {
        modalUserRole.textContent = 'Verified Member';
        modalUserRole.style.background = 'rgba(0, 255, 65, 0.15)';
        modalUserRole.style.color = '#00ff41';
      }
    }

    if (securityExternal) {
      securityExternal.style.display = isGuest ? 'none' : 'flex';
    }

    switchAccountTab(tab);
    accountModal.classList.add('active');
  };

  const switchAccountTab = (tab) => {
    if (tab === 'security') {
      if (tabBtnSecurity) tabBtnSecurity.classList.add('active');
      if (tabBtnAccount) tabBtnAccount.classList.remove('active');
      if (tabPaneSecurity) tabPaneSecurity.style.display = 'block';
      if (tabPaneAccount) tabPaneAccount.style.display = 'none';
    } else {
      if (tabBtnAccount) tabBtnAccount.classList.add('active');
      if (tabBtnSecurity) tabBtnSecurity.classList.remove('active');
      if (tabPaneAccount) tabPaneAccount.style.display = 'block';
      if (tabPaneSecurity) tabPaneSecurity.style.display = 'none';
    }
  };

  if (tabBtnAccount) tabBtnAccount.onclick = () => switchAccountTab('account');
  if (tabBtnSecurity) tabBtnSecurity.onclick = () => switchAccountTab('security');
  if (closeAccountModalBtn) closeAccountModalBtn.onclick = () => accountModal.classList.remove('active');
  if (modalCloseActionBtn) modalCloseActionBtn.onclick = () => accountModal.classList.remove('active');
  if (modalLogoutBtn) modalLogoutBtn.onclick = () => handleLogout();

  // Close account modal when clicking overlay outside content
  if (accountModal) {
    accountModal.addEventListener('click', (e) => {
      if (e.target === accountModal) {
        accountModal.classList.remove('active');
      }
    });
  }

  menuLogout.onclick = () => handleLogout();
  menuSecurity.onclick = () => openAccountModal('security');
  menuOwner.onclick = () => window.location.href = "/owner";
  menuAccount.onclick = () => openAccountModal('account');

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
    
    // Auto-sync transcription language selector to match song region
    const transcribeLanguageSelect = document.getElementById('transcribe-language-select');
    const regionMap = {
      'bollywood': 'hindi',
      'hindi': 'hindi',
      'telugu': 'telugu',
      'tamil': 'tamil',
      'punjabi': 'punjabi',
      'malayalam': 'malayalam',
      'marathi': 'marathi',
      'english': 'english'
    };
    if (transcribeLanguageSelect && regionMap[lang]) {
      transcribeLanguageSelect.value = regionMap[lang];
    }

    // Appending 'hits' helps the APIs find relevant music clusters for a specific era
    const query = year ? `${lang} ${year} hits` : lang;
    fetchLibrary(query);
    console.log(`🎵 Filter Applied: ${query} (Song Language synced: ${regionMap[lang] || 'auto'})`);
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

  // ── Floating Mini Player Bubble Engine ──
  const updateMiniPlayerUI = () => {
    if (!floatingMiniPlayer) return;

    const artUrl = activeArtworkUrl || '/static/assets/images/song1.jpg';
    if (miniPlayerArtwork) {
      miniPlayerArtwork.style.backgroundImage = `url("${artUrl}")`;
      miniPlayerArtwork.style.backgroundSize = 'cover';
      miniPlayerArtwork.style.backgroundPosition = 'center';
    }
    if (miniPlayerTitle) {
      miniPlayerTitle.textContent = activeSongName || "Playing Track";
    }
    if (miniPlayerArtist) {
      miniPlayerArtist.textContent = activeArtistName || "Unknown Artist";
    }

    const isPlaying = wavesurfer && wavesurfer.isPlaying();
    if (miniPlayerArtwork) {
      if (isPlaying) {
        miniPlayerArtwork.classList.add('spinning');
      } else {
        miniPlayerArtwork.classList.remove('spinning');
      }
    }
    if (miniEqualizerBars) {
      if (isPlaying) {
        miniEqualizerBars.classList.add('animating');
      } else {
        miniEqualizerBars.classList.remove('animating');
      }
    }
    if (miniPlayIcon) {
      if (isPlaying) {
        miniPlayIcon.innerHTML = `<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>`;
      } else {
        miniPlayIcon.innerHTML = `<polygon points="5 3 19 12 5 21 5 3"/>`;
      }
    }
  };

  const minimizePlayer = () => {
    if (!wavesurfer || !activeSongName) {
      phoneApp.style.display = 'none';
      libraryScreen.style.display = 'flex';
      return;
    }

    isPlayerMinimized = true;
    phoneApp.style.display = 'none';
    libraryScreen.style.display = 'flex';

    updateMiniPlayerUI();
    if (floatingMiniPlayer) {
      floatingMiniPlayer.style.display = 'flex';
      floatingMiniPlayer.classList.remove('exit');
      floatingMiniPlayer.classList.add('enter');
    }
    console.log("🫧 God Player minimized into floating mini bubble on the right side.");
  };

  const expandPlayer = () => {
    isPlayerMinimized = false;
    if (floatingMiniPlayer) {
      floatingMiniPlayer.classList.remove('enter');
      floatingMiniPlayer.classList.add('exit');
      setTimeout(() => {
        if (!isPlayerMinimized && floatingMiniPlayer) {
          floatingMiniPlayer.style.display = 'none';
          floatingMiniPlayer.classList.remove('exit');
        }
      }, 220);
    }
    libraryScreen.style.display = 'none';
    phoneApp.style.display = 'flex';
    console.log("📱 Restored full God Player view.");
  };

  if (minimizePlayerBtn) {
    minimizePlayerBtn.onclick = () => minimizePlayer();
  }

  if (floatingMiniPlayer) {
    floatingMiniPlayer.onclick = (e) => {
      if (e.target.closest('#mini-close-btn') || e.target.closest('#mini-play-btn')) return;
      expandPlayer();
    };
  }

  if (miniExpandBtn) {
    miniExpandBtn.onclick = (e) => {
      e.stopPropagation();
      expandPlayer();
    };
  }

  if (miniPlayBtn) {
    miniPlayBtn.onclick = (e) => {
      e.stopPropagation();
      if (wavesurfer) {
        wavesurfer.playPause();
      }
    };
  }

  if (miniCloseBtn) {
    miniCloseBtn.onclick = (e) => {
      e.stopPropagation();
      if (wavesurfer) {
        wavesurfer.pause();
      }
      isPlayerMinimized = false;
      floatingMiniPlayer.style.display = 'none';
    };
  }

  backLibraryBtn.onclick = () => {
    if (wavesurfer && wavesurfer.isPlaying()) {
      minimizePlayer();
    } else {
      phoneApp.style.display = 'none';
      libraryScreen.style.display = 'flex';
      if (wavesurfer) wavesurfer.pause();
    }
  };

  uploadZone.onclick = () => audioInput.click();
  audioInput.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      currentFile = file;
      activeSongName = file.name;
      activeArtistName = "Local Audio";
      activeArtworkUrl = "/static/assets/images/song1.jpg";
      transcriptionCache = [];
      fileNameDisplay.textContent = file.name;
      wavesurfer.load(URL.createObjectURL(file));
      playPauseBtn.disabled = transcribeBtn.disabled = false;
      downloadTxtBtn.style.display = 'none';
      transcriptOutput.textContent = "Local file ready. Tap transcribe to run AI (may take a moment to load model initially).";
      updateMiniPlayerUI();
    }
  };

  playPauseBtn.onclick = () => wavesurfer.playPause();

  // 🔀 Random Play / Shuffle Engine
  const playRandomSong = () => {
    const list = (currentSongsList && currentSongsList.length > 0) ? currentSongsList : OFFLINE_COLLECTION;
    if (!list || list.length === 0) return;
    
    // Pick a candidate (avoiding same song when possible)
    let candidate = list[Math.floor(Math.random() * list.length)];
    if (list.length > 1 && candidate.trackName === activeSongName) {
      const candidates = list.filter(s => s.trackName !== activeSongName);
      if (candidates.length > 0) {
        candidate = candidates[Math.floor(Math.random() * candidates.length)];
      }
    }
    
    console.log(`🔀 Playing in Random: ${candidate.trackName}`);
    selectSong(candidate.previewUrl, candidate.trackName, candidate.artworkUrl, candidate.artistName);
    
    wavesurfer.once('ready', () => {
      wavesurfer.play();
    });
  };

  const updateShuffleUI = () => {
    if (!shuffleBtn) return;
    if (isShuffleActive) {
      shuffleBtn.style.background = 'rgba(236, 72, 153, 0.25)';
      shuffleBtn.style.borderColor = '#ec4899';
      shuffleBtn.style.color = '#ec4899';
      shuffleBtn.style.boxShadow = '0 0 16px rgba(236, 72, 153, 0.6)';
    } else {
      shuffleBtn.style.background = 'rgba(255, 255, 255, 0.05)';
      shuffleBtn.style.borderColor = 'rgba(255, 255, 255, 0.15)';
      shuffleBtn.style.color = 'var(--text-secondary)';
      shuffleBtn.style.boxShadow = 'none';
    }
  };

  if (shuffleBtn) {
    updateShuffleUI();
    shuffleBtn.onclick = () => {
      isShuffleActive = !isShuffleActive;
      updateShuffleUI();
      if (isShuffleActive && (!wavesurfer || !wavesurfer.isPlaying())) {
        playRandomSong();
      }
    };
  }

  if (nextRandomBtn) {
    nextRandomBtn.onclick = () => playRandomSong();
  }

  if (shuffleLibraryBtn) {
    shuffleLibraryBtn.onclick = () => playRandomSong();
  }

  // Playback Speed Controller
  const playbackSpeedSelect = document.getElementById('playback-speed-select');
  if (playbackSpeedSelect) {
    playbackSpeedSelect.onchange = (e) => {
      const rate = parseFloat(e.target.value) || 1.0;
      if (wavesurfer) {
        wavesurfer.setPlaybackRate(rate);
        console.log(`⚡ Playback Rate set to ${rate}x`);
      }
    };
  }

  // Parse real synchronized LRC lyrics (millisecond timestamps) to match song tempo
  const parseLRCtoCache = (lrcString, audioDuration) => {
    const lines = lrcString.split('\n');
    const parsed = [];
    const timeRegex = /\[(\d{2}):(\d{2})\.?(\d{2,3})?\]/;

    for (let line of lines) {
      const match = timeRegex.exec(line);
      if (match) {
        const min = parseInt(match[1], 10);
        const sec = parseInt(match[2], 10);
        const ms = match[3] ? parseInt(match[3].padEnd(3, '0').substring(0, 3), 10) : 0;
        const timeInSec = min * 60 + sec + (ms / 1000);
        const text = line.replace(/\[\d{2}:\d{2}\.?\d*\]/g, '').trim();
        if (text && !text.startsWith('ar:') && !text.startsWith('ti:') && !text.startsWith('al:') && !text.startsWith('by:')) {
          parsed.push({ time: timeInSec, text });
        }
      }
    }

    if (parsed.length === 0) return null;

    // Handle preview track offset if the preview starts later in the song
    let offset = 0;
    if (audioDuration && audioDuration <= 35 && parsed[0].time > 25) {
      offset = parsed[0].time;
    }

    return parsed.map((item, idx) => {
      const startTime = Math.max(0, item.time - offset);
      const nextItem = parsed[idx + 1];
      const endTime = nextItem ? Math.max(startTime + 0.8, nextItem.time - offset) : startTime + 3.5;
      const duration = Math.max(0.6, endTime - startTime);

      const words = item.text.split(/\s+/).filter(w => w.length > 0);
      const wordDur = duration / Math.max(1, words.length);

      return {
        time: startTime,
        text: item.text,
        words: words.map((w, wi) => ({
          text: w,
          start: startTime + (wi * wordDur),
          end: startTime + ((wi + 1) * wordDur)
        }))
      };
    });
  };

  // When only plain lyrics are available, distribute them accurately across audio duration
  const formatPlainLyricsToCache = (plainText, audioDuration) => {
    const lines = plainText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) return [];
    
    const duration = audioDuration && audioDuration > 5 ? audioDuration : 30;
    const introBuffer = Math.min(2.0, duration * 0.05);
    const usableDuration = duration - introBuffer;
    const lineDuration = usableDuration / lines.length;

    return lines.map((text, i) => {
      const startTime = introBuffer + (i * lineDuration);
      const words = text.split(/\s+/).filter(w => w.length > 0);
      const wordDur = lineDuration / Math.max(1, words.length);

      return {
        time: startTime,
        text: text,
        words: words.map((w, wi) => ({
          text: w,
          start: startTime + (wi * wordDur),
          end: startTime + ((wi + 1) * wordDur)
        }))
      };
    });
  };

  // Render full interactive karaoke display with glowing words
  const renderLyricsDisplay = (lyricsList) => {
    transcriptOutput.innerHTML = "";
    if (!lyricsList || lyricsList.length === 0) return;

    lyricsList.forEach((line, lineIndex) => {
      const lineDiv = document.createElement('div');
      lineDiv.className = 'lyric-line';
      lineDiv.dataset.lineIndex = lineIndex;
      lineDiv.dataset.time = line.time;

      // Ensure words exist for highlighting
      let words = line.words;
      if (!words || words.length === 0) {
        const rawWords = (line.text || '').split(/\s+/).filter(w => w.length > 0);
        const dur = 3.0;
        const wDur = dur / Math.max(1, rawWords.length);
        words = rawWords.map((w, wi) => ({
          text: w,
          start: line.time + (wi * wDur),
          end: line.time + ((wi + 1) * wDur)
        }));
        line.words = words;
      }

      words.forEach((w) => {
        const wordSpan = document.createElement('span');
        wordSpan.className = 'lyric-word';
        wordSpan.textContent = w.text;
        wordSpan.dataset.start = w.start;
        wordSpan.dataset.end = w.end;
        wordSpan.title = `Seek to ${Math.round(w.start * 10) / 10}s`;

        // Click word to seek directly to that moment
        wordSpan.onclick = (e) => {
          e.stopPropagation();
          if (wavesurfer) {
            const dur = wavesurfer.getDuration();
            if (dur > 0) {
              wavesurfer.seekTo(Math.min(0.99, Math.max(0, w.start / dur)));
              if (!wavesurfer.isPlaying()) wavesurfer.play();
            }
          }
        };

        lineDiv.appendChild(wordSpan);
      });

      // Click line to seek to start of line
      lineDiv.onclick = () => {
        if (wavesurfer) {
          const dur = wavesurfer.getDuration();
          if (dur > 0) {
            wavesurfer.seekTo(Math.min(0.99, Math.max(0, line.time / dur)));
            if (!wavesurfer.isPlaying()) wavesurfer.play();
          }
        }
      };

      transcriptOutput.appendChild(lineDiv);
    });
  };

  transcribeBtn.onclick = async () => {
    if (!currentFile || isTranscribing) return;
    isTranscribing = true;
    transcribeBtn.disabled = true;
    downloadTxtBtn.style.display = 'none';
    transcribeText.textContent = 'Processing...';
    transcriptOutput.innerHTML = '<div style="color:var(--primary-glow); margin-bottom: 10px;">Initializing transcription...</div>';

    // Read selected song language
    const transcribeLanguageSelect = document.getElementById('transcribe-language-select');
    const selectedLang = transcribeLanguageSelect ? transcribeLanguageSelect.value : 'auto';
    const whisperLang = selectedLang === 'auto' ? null : selectedLang;
    const langDisplay = selectedLang === 'auto' ? 'Auto-Detect' : selectedLang.toUpperCase();
    const songDuration = wavesurfer ? wavesurfer.getDuration() : 30;
    
    try {
      let lyricsObtained = false;

      // 1. If Cloud song, check online lyrics database first
      if (currentFile === "cloud") {
        transcriptOutput.innerHTML = `<div style="color:var(--cmd-cyan); margin-bottom: 10px;">☁️ Searching synchronized lyrics database for [${langDisplay}]...</div>`;
        
        // Clean title for improved match rate
        const cleanTitle = activeSongName.replace(/\(.*?\)/g, '').replace(/\[.*?\]/g, '').replace(/-.*$/, '').trim();
        const cleanArtist = activeArtistName.split(',')[0].trim();

        try {
          const response = await fetch(`/api/lyrics?artist=${encodeURIComponent(cleanArtist)}&title=${encodeURIComponent(cleanTitle)}`);
          if (response.ok) {
            const data = await response.json();
            if (data.synced && data.syncedLyrics) {
              const lrcCache = parseLRCtoCache(data.syncedLyrics, songDuration);
              if (lrcCache && lrcCache.length > 0) {
                transcriptionCache = lrcCache;
                lyricsObtained = true;
                console.log("⏱️ Loaded exact time-synchronized LRC lyrics matching song speed!");
              }
            } else if (data.lyrics && data.lyrics.trim().length > 30) {
              transcriptionCache = formatPlainLyricsToCache(data.lyrics, songDuration);
              lyricsObtained = true;
            }
          }
        } catch (cloudErr) {
          console.warn("Cloud lyrics lookup failed, switching to AI Whisper model:", cloudErr);
        }
      }

      // 2. If Cloud lyrics were not found or this is a local audio file, run Multilingual AI Whisper Model!
      if (!lyricsObtained) {
        transcriptOutput.innerHTML = `<div style="color:#ec4899; margin-bottom: 10px;">🧠 Loading Multilingual AI Model (Whisper: ${langDisplay})...</div>`;
        
        // Load Multilingual Whisper model (supporting Hindi, Telugu, Tamil, Punjabi, English, etc.)
        if (!transcriber) {
          transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny');
        }

        transcriptOutput.innerHTML = `<div style="color:#ec4899; margin-bottom: 10px;">🧠 AI Listening & syncing tempo to song speed...</div>`;

        let arrayBuffer = null;
        if (currentFile === "cloud") {
          try {
            const audioRes = await fetch(activeAudioUrl);
            arrayBuffer = await audioRes.arrayBuffer();
          } catch (corsErr) {
            console.log("Direct audio fetch blocked by CORS, fetching via server proxy...");
            const proxyRes = await fetch(`/api/proxy/audio?url=${encodeURIComponent(activeAudioUrl)}`);
            arrayBuffer = await proxyRes.arrayBuffer();
          }
        } else {
          arrayBuffer = await currentFile.arrayBuffer();
        }

        const audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const audioData = audioBuffer.getChannelData(0);

        const whisperOptions = {
          chunk_length_s: 30,
          stride_length_s: 5,
          task: 'transcribe', // Transcribes in the original language of the song!
          return_timestamps: true // Real sentence & phrase timestamps directly from audio!
        };
        if (whisperLang) {
          whisperOptions.language = whisperLang;
        }

        const result = await transcriber(audioData, whisperOptions);

        if (result.chunks && result.chunks.length > 0) {
          transcriptionCache = result.chunks.map((chunk, index) => {
            const rawStart = Array.isArray(chunk.timestamp) ? chunk.timestamp[0] : null;
            const rawEnd = Array.isArray(chunk.timestamp) ? chunk.timestamp[1] : null;
            
            const startTime = typeof rawStart === 'number' ? rawStart : index * 3.5;
            const endTime = typeof rawEnd === 'number' ? rawEnd : startTime + 3.5;
            const duration = Math.max(0.6, endTime - startTime);
            
            const words = chunk.text.trim().split(/\s+/).filter(w => w.length > 0);
            const wordDur = duration / Math.max(1, words.length);

            return {
              time: startTime,
              text: chunk.text.trim(),
              words: words.map((w, wi) => ({
                text: w,
                start: startTime + (wi * wordDur),
                end: startTime + ((wi + 1) * wordDur)
              }))
            };
          });
        } else if (result.text && result.text.trim()) {
          transcriptionCache = formatPlainLyricsToCache(result.text, songDuration);
        } else {
          transcriptionCache = [{ time: 0, text: "🎵 Instrumental / No audible speech detected in track 🎵", words: [] }];
        }
      }

      // Display transcribed lyrics with glowing words matching song speed
      renderLyricsDisplay(transcriptionCache);
      
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

