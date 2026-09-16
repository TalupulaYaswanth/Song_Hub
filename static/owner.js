import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
// --- CONFIGURATION ---
// ⚠️ PLEASE ENSURE THIS MATCHES YOUR MAIN script.js CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyARWdp12QPwV8wTEfq6zR6YE7OOCIJtz5Q",
  authDomain: "song-a5841.firebaseapp.com",
  projectId: "song-a5841",
  storageBucket: "song-a5841.firebasestorage.app",
  messagingSenderId: "148443523795",
  appId: "1:148443523795:web:6810d8daaaddaa75964226",
  measurementId: "G-PTYLVQW1PS"
};

const OWNER_EMAILS = [
  'talupulayaswanth13@gmail.com',
  'talupulayasant13@gmail.com'
];

const isOwner = (user) => {
  if (!user || !user.email) return false;
  const userEmail = user.email.trim().toLowerCase();
  return OWNER_EMAILS.some(e => e.toLowerCase() === userEmail);
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const loadingOverlay = document.getElementById('loading-overlay');
const userRegistryBody = document.getElementById('user-registry-body');
const totalUsersEl = document.getElementById('total-users');
const totalTranscriptionsEl = document.getElementById('total-transcriptions');
const globalFeedEl = document.getElementById('global-feed');

// Security Guard logic
onAuthStateChanged(auth, (user) => {
    if (!isOwner(user)) {
        alert("ACCESS DENIED: Master Identity Not Confirmed for: " + (user ? user.email : "Not logged in"));
        window.location.href = "/";
        return;
    }
    
    // Master Confirmed
    setTimeout(() => {
        loadingOverlay.style.display = 'none';
        initCommandCenter();
    }, 1500);
});

async function initCommandCenter() {
    fetchGlobalStats();
    fetchUserRegistry();
    fetchGlobalActivity();
}

async function fetchGlobalStats() {
    try {
        const res = await fetch('/api/admin/users');
        const data = await res.json();
        
        totalUsersEl.textContent = data.users.length;
        totalTranscriptionsEl.textContent = data.total_transcriptions;
    } catch (e) { console.error(e); }
}

async function fetchUserRegistry() {
    try {
        const res = await fetch('/api/admin/users');
        const data = await res.json();
        userRegistryBody.innerHTML = '';
        
        data.users.forEach((u) => {
            const row = document.createElement('tr');
            
            const isBlocked = u.blocked === true;
            
            row.innerHTML = `
                <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <img src="${u.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.displayName || u.email)}&background=00f3ff&color=000&size=30`}" style="width: 30px; border-radius: 50%; border: 1px solid var(--cmd-cyan);">
                        <span>${u.displayName || 'Unknown'}</span>
                    </div>
                </td>
                <td>${u.email}</td>
                <td>${u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'N/A'}</td>
                <td>
                    <span class="tag ${isBlocked ? 'tag-blocked' : 'tag-active'}">
                        ${isBlocked ? 'BLOCKED' : 'ACTIVE'}
                    </span>
                </td>
                <td>
                    <button class="btn-cmd ${isBlocked ? '' : 'danger'}" onclick="toggleUserBlock('${u.uid}', ${isBlocked})">
                        ${isBlocked ? 'UNBLOCK' : 'BLOCK'}
                    </button>
                </td>
            `;
            userRegistryBody.appendChild(row);
        });
    } catch (e) { console.error(e); }
}

async function fetchGlobalActivity() {
    try {
        const res = await fetch('/api/admin/system');
        const histories = await res.json();
        globalFeedEl.innerHTML = '';
        
        histories.forEach((data) => {
            const log = document.createElement('div');
            log.style.marginBottom = '8px';
            log.innerHTML = `[${new Date(data.timestamp).toLocaleTimeString()}] > USER: <span style="color:var(--cmd-cyan)">${data.userEmail}</span> TRANSCRIBED: <span style="color:#fff">"${data.songName}"</span>`;
            globalFeedEl.appendChild(log);
        });
    } catch (e) { console.error(e); }
}

// Exposed Functions to Window for HTML button usage
window.toggleUserBlock = async (userId, currentlyBlocked) => {
    const action = currentlyBlocked ? "UNBLOCK" : "BLOCK";
    if (!confirm(`Are you sure you want to ${action} this identity?`)) return;
    
    try {
        await fetch('/api/admin/block', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid: userId, blocked: !currentlyBlocked })
        });
        fetchUserRegistry();
    } catch (e) { alert("Operation Failed: Server Connection Error."); }
};

// Master Export Logic
document.getElementById('export-btn').onclick = async () => {
    try {
        const res = await fetch('/api/admin/system');
        const allData = await res.json();
        
        const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Master_Export_${new Date().getTime()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    } catch (e) { alert("Export Terminated: Buffer Error."); }
};

document.getElementById('logout-btn').onclick = () => signOut(auth).then(() => window.location.href = "/");
