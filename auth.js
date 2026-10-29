// Auth - Manoranjan
// Google, Gmail, Phone login (demo mode - no backend)

const AUTH_KEY = 'manoranjan_user';
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID'; // Replace with your Client ID from Google Cloud Console

function setUser(user) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  window.location.href = 'index.html';
}

function getUser() {
  try {
    const data = localStorage.getItem(AUTH_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function logout() {
  localStorage.removeItem(AUTH_KEY);
  window.location.href = 'login.html';
}

function checkAuth() {
  if (document.getElementById('phoneLoginForm')) return;
  if (!getUser()) {
    window.location.href = 'login.html';
  }
}

// Phone login
let otpSent = false;
const PHONE_OTP = '123456'; // Demo OTP - any 6 digits works in demo mode

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('phoneLoginForm')) {
    initLogin();
  } else {
    checkAuth();
  }
});

function initLogin() {
  const phoneForm = document.getElementById('phoneLoginForm');
  const otpGroup = document.getElementById('otpGroup');
  const phoneInput = document.getElementById('phone');
  const otpInput = document.getElementById('otp');
  const phoneBtnText = document.getElementById('phoneBtnText');
  const phoneSubmitBtn = document.getElementById('phoneSubmitBtn');

  // Google Sign-In
  document.getElementById('googleSignIn')?.addEventListener('click', handleGoogleSignIn);
  document.getElementById('gmailSignIn')?.addEventListener('click', handleGoogleSignIn);

  // Phone form
  phoneForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const phone = phoneInput.value.replace(/\D/g, '');
    
    if (!otpSent) {
      if (phone.length >= 10) {
        otpSent = true;
        otpGroup.style.display = 'block';
        otpInput.focus();
        phoneBtnText.textContent = 'Verify OTP';
        phoneInput.disabled = true;
      } else {
        alert('Please enter a valid 10-digit phone number.');
      }
    } else {
      const otp = otpInput.value;
      if (otp.length === 6) {
        setUser({
          type: 'phone',
          phone: phoneInput.value,
          name: 'User',
          email: null
        });
      } else {
        alert('Please enter the 6-digit OTP.');
      }
    }
  });
}

function handleGoogleSignIn() {
  if (typeof google !== 'undefined' && GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.includes('YOUR_')) {
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response) => {
        const payload = parseJwt(response.credential);
        setUser({
          type: 'google',
          email: payload.email,
          name: payload.name || payload.email,
          picture: payload.picture
        });
      }
    });
    google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed()) {
        google.accounts.id.renderButton(document.getElementById('googleSignIn'), {
          theme: 'outline',
          size: 'large',
          width: 320,
          text: 'continue_with'
        });
      }
    });
  } else {
    setUser({
      type: 'google',
      email: 'user@gmail.com',
      name: 'Demo User'
    });
  }
}

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return {};
  }
}
