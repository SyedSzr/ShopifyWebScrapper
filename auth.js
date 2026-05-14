// auth.js
const SUPABASE_URL = 'https://unzxegztytqanahiijym.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_QFBKdS8lDf1Yc0d6Hh0Sww_hEIBYUuG';

let supabaseClient;

try {
    // Use a distinct variable name to avoid conflict with global supabase
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('Supabase initialized successfully.');
} catch (e) {
    console.error('Supabase initialization failed:', e);
}

async function loginWithGoogle() {
    console.log('Attempting to login with Google...');
    const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin }
    });
    if (error) {
        console.error('Login Error:', error.message);
        alert('Login Error: ' + error.message);
    }
}

async function logout() {
    console.log('Logging out...');
    const { error } = await supabaseClient.auth.signOut();
    if (error) console.error('Logout Error:', error.message);
    updateAuthUI(null);
}

function updateAuthUI(user) {
    const authBtns = document.querySelectorAll('.authBtn');
    console.log(`Updating UI for user: ${user ? user.email : 'None'}. Found ${authBtns.length} buttons.`);
    authBtns.forEach(btn => {
        // Replace the button with a clean clone to remove any previous listeners
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        if (user) {
            const avatarUrl = user.user_metadata?.avatar_url || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';
            newBtn.innerHTML = `<img src="${avatarUrl}" width="18" height="18" style="border-radius: 50%; margin-right: 8px; object-fit: cover;"/> Logout`;
            newBtn.addEventListener('click', e => {
                e.preventDefault();
                logout();
            });
        } else {
            newBtn.innerHTML = 'Login with Google';
            newBtn.addEventListener('click', e => {
                e.preventDefault();
                loginWithGoogle();
            });
        }
    });
}

// Show a welcome banner for the logged‑in user
function showWelcome(user) {
    // Remove any existing welcome message
    const existing = document.querySelector('.container h2.welcome');
    if (existing) existing.remove();
    if (!user) return;
    const name = user.user_metadata?.full_name || user.email || 'User';
    const welcome = document.createElement('h2');
    welcome.className = 'welcome';
    welcome.textContent = `Welcome to Shopify Scraper, ${name}!`;
    welcome.style.color = 'var(--accent)';
    const container = document.querySelector('.container');
    if (container) container.insertBefore(welcome, container.firstChild);
}

async function initAuth() {
    // Clean up the URL hash that Supabase adds after redirect
    if (window.location.hash) {
        history.replaceState(null, '', window.location.pathname);
    }
    // Get the current session (Supabase automatically restores it from cookies/localStorage)
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    if (error) console.error('Session fetch error:', error);
    updateAuthUI(session?.user);
    showWelcome(session?.user);
    // Listen for future auth state changes (login, logout, token refresh)
    supabaseClient.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event);
        updateAuthUI(session?.user);
        showWelcome(session?.user);
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
} else {
    initAuth();
}
