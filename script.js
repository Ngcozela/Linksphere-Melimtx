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

// Open modal when a tab is clicked
document.querySelectorAll('.collection-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    currentLink = tab.dataset.link;
    gateModal.classList.add('active');
  });
});

// Simulate watching an ad
adButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    if (!btn.classList.contains('viewed')) {
      btn.classList.add('viewed');
      adsViewed++;
    }
    checkAccess();
  });
});

// Simulate 30-second video requirement
video.addEventListener('timeupdate', () => {
  if (video.currentTime >= 30 && !videoWatched) {
    videoWatched = true;
    checkAccess();
  }
});

// Check if requirements are met
function checkAccess() {
  if (adsViewed >= 3 || videoWatched) {
    proceedBtn.classList.add('active');
    proceedBtn.disabled = false;
    proceedBtn.style.cursor = 'pointer';
  }
}

// Proceed to collection
proceedBtn.addEventListener('click', () => {
  if (proceedBtn.classList.contains('active') && currentLink) {
    gateModal.classList.remove('active');
    window.location.href = currentLink;
  }
});

// Close modal if clicked outside
gateModal.addEventListener('click', (e) => {
  if (e.target === gateModal) gateModal.classList.remove('active');
});

