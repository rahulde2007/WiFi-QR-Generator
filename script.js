// WiFi QR Code Generator Logic
import './assets/qrcode.min.js';

function initApp() {
  const form = document.querySelector('#wifi-form') || document.querySelector('form');
  const img = document.querySelector('#qr-img') || document.querySelector('.qr-container img');
  const ssid = document.querySelector('#ssid') || document.querySelector('.ssid');
  const password = document.querySelector('#password') || document.querySelector('.password');
  const qrWarning = document.querySelector('#qr-warning') || document.querySelector('.qr-warning');
  const printBtn = document.querySelector('#print-btn') || document.querySelector('button');
  const qrContainer = document.querySelector('#qr-container') || document.querySelector('.qr-container');

  const defaultTitle = document.title;
  const cleanTitle = defaultTitle.replace(/\s*\|\s*@coding\.stella/i, '').replace(/@coding\.stella/i, '').trim();

  let bounceTimeout = null;

  // Bounce micro-animation using CSS class (zero inline CSS)
  function triggerBounce() {
    if (!qrContainer) return;
    qrContainer.classList.add('bounce');
    if (bounceTimeout) {
      clearTimeout(bounceTimeout);
    }
    bounceTimeout = setTimeout(() => {
      qrContainer.classList.remove('bounce');
    }, 150);
  }

  // Escape special characters according to the WiFi QR code specification (\, ;, ,, ", :)
  function escapeWifiString(str) {
    if (!str) return '';
    return str.replace(/([\\;,":])/g, '\\$1');
  }

  // Generate WiFi payload string
  function buildWifiPayload(networkName, netPassword) {
    const escapedSSID = escapeWifiString(networkName);
    const escapedPass = escapeWifiString(netPassword);
    return `WIFI:T:WPA;S:${escapedSSID};P:${escapedPass};;`;
  }

  // Generate QR Code strictly using the local offline generator (zero network requests)
  function renderQRCode(payload) {
    if (typeof qrcode === 'function' && img) {
      const qr = qrcode(0, 'M');
      qr.addData(payload);
      qr.make();
      if (typeof qr.toSVGDataURL === 'function') {
        img.src = qr.toSVGDataURL(164, 2);
      } else {
        img.src = qr.toDataURL(164, 2);
      }
    }
  }

  // Check if inputs represent a valid WiFi network configuration
  function hasValidInputs() {
    const s = ssid ? ssid.value.trim() : '';
    const p = password ? password.value.trim() : '';
    return s.length > 0 && p.length > 0;
  }

  // Manage visibility of warning text and @coding.stella using class-based system and title state
  function updateVisibility(isValid) {
    if (qrWarning) {
      qrWarning.classList.toggle('hidden', isValid);
    }
    if (form) {
      form.classList.toggle('has-valid-qr', isValid);
    }
    document.title = isValid ? cleanTitle : defaultTitle;
    document.querySelectorAll('*').forEach((el) => {
      if (el.children.length === 0 && el.textContent && el.textContent.includes('@coding.stella')) {
        el.classList.toggle('hidden', isValid);
      }
    });
  }

  // Update QR Code, visibility state, and trigger bounce micro-animation
  function update() {
    const payload = buildWifiPayload(ssid ? ssid.value : '', password ? password.value : '');
    renderQRCode(payload);
    triggerBounce();
    updateVisibility(hasValidInputs());
  }


  // Event Listeners for live typing and Enter key
  if (ssid) {
    ssid.addEventListener('input', update);
    ssid.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        update();
      }
    });
  }

  if (password) {
    password.addEventListener('input', update);
    password.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        update();
      }
    });
  }

  // Print button click handler
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // Initial QR Code rendering on page load
  update();
}

// Ensure execution whether loaded as deferred module or after DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
