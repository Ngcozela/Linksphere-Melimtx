
function openCollection(num) {
  console.log("Clicked collection:", num);
  alert("Opening Collection " + num + "...");
  // window.location.href = `collection${num}.html`;
}
/*Section scrolling script*/
document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.collections-container');
  const leftArrow = document.querySelector('.left-arrow');
  const rightArrow = document.querySelector('.right-arrow');

  let scrollInterval;

  function startScroll(direction) {
    stopScroll();
    scrollInterval = setInterval(() => {
      container.scrollLeft += direction === 'right' ? 8 : -8;
    }, 10);
  }

  function stopScroll() {
    clearInterval(scrollInterval);
  }

  leftArrow.addEventListener('mouseenter', () => startScroll('left'));
  rightArrow.addEventListener('mouseenter', () => startScroll('right'));
  leftArrow.addEventListener('mouseleave', stopScroll);
  rightArrow.addEventListener('mouseleave', stopScroll);
});

// === Access Gate ===
const gateModal = document.getElementById('gateModal');
const adButtons = document.querySelectorAll('.ad-btn');
const video = document.getElementById('ad-video');
const proceedBtn = document.getElementById('proceed-btn');

let currentLink = null;
let adsViewed = 0;
let videoWatched = false;

// Intercept clicks on collection tabs
document.querySelectorAll('.collection-tab').forEach(tab => {
  tab.addEventListener('click', (e) => {
    e.preventDefault(); // stop instant navigation
    e.stopPropagation();
    currentLink = tab.dataset.link;
    gateModal.classList.add('active');
  });
});

// Simulate ad views
adButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    if (!btn.classList.contains('viewed')) {
      btn.classList.add('viewed');
      adsViewed++;
    }
    checkAccess();
  });
});

// Track video progress (30 seconds)
video.addEventListener('timeupdate', () => {
  if (video.currentTime >= 30 && !videoWatched) {
    videoWatched = true;
    checkAccess();
  }
});

// Check if all conditions met
function checkAccess() {
  if (adsViewed >= 3 || videoWatched) {
    proceedBtn.classList.add('active');
    proceedBtn.disabled = false;
    proceedBtn.style.cursor = 'pointer';
  }
}

// Proceed only after unlock
proceedBtn.addEventListener('click', () => {
  if (proceedBtn.classList.contains('active') && currentLink) {
    gateModal.classList.remove('active');
    window.location.href = currentLink; // Redirect now
  }
});

// Optional: clicking outside modal closes it
gateModal.addEventListener('click', (e) => {
  if (e.target === gateModal) {
    gateModal.classList.remove('active');
    resetGate();
  }
});

// Reset for next use
function resetGate() {
  adsViewed = 0;
  videoWatched = false;
  adButtons.forEach(btn => btn.classList.remove('viewed'));
  video.currentTime = 0;
  proceedBtn.classList.remove('active');
  proceedBtn.disabled = true;
  proceedBtn.style.cursor = 'not-allowed';
}

// === ADULT CONTENT WARNING POPUP (shows once per 24 hours) ===
const adultModal = document.getElementById('adultWarningModal');
const adultContinueBtn = document.getElementById('adult-warning-continue');

// Check if the popup should appear
function shouldShowAdultWarning() {
  const warningData = JSON.parse(localStorage.getItem('adultWarningShown'));
  if (!warningData) return true; // never shown
  const hoursSince = (Date.now() - warningData.timestamp) / (1000 * 60 * 60);
  return hoursSince >= 24; // show again after 24 hours
}

if (shouldShowAdultWarning()) {
  adultModal.classList.add('active');
  document.body.style.overflow = 'hidden'; // prevent background scroll
}

adultContinueBtn.addEventListener('click', () => {
  localStorage.setItem('adultWarningShown', JSON.stringify({ shown: true, timestamp: Date.now() }));
  adultModal.classList.remove('active');
  document.body.style.overflow = 'auto';
});
