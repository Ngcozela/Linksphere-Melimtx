// === AGE VERIFICATION MODAL (24-hour expiration) ===
window.addEventListener('DOMContentLoaded', () => {
  const ageModal = document.getElementById('ageModal');
  const ageYesBtn = document.getElementById('age-yes');
  const ageNoBtn = document.getElementById('age-no');

  // Return true if we should show modal again
  function shouldShowAgeModal() {
    const verifiedData = JSON.parse(localStorage.getItem('ageVerified'));
    if (!verifiedData) return true;
    const hoursSince = (Date.now() - verifiedData.timestamp) / (1000 * 60 * 60);
    return hoursSince >= 24;
  }

  if (ageModal && shouldShowAgeModal()) {
    ageModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  if (ageYesBtn) {
    ageYesBtn.addEventListener('click', () => {
      localStorage.setItem('ageVerified', JSON.stringify({
        verified: true,
        timestamp: Date.now()
      }));
      ageModal.classList.remove('active');
      document.body.style.overflow = 'auto';
    });
  }

  if (ageNoBtn) {
    ageNoBtn.addEventListener('click', () => {
      alert('Sorry, you must be 18 or older to access this site.');
      window.location.href = 'https://www.google.com';
    });
  }
});



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
