// Handle tab switching + shareable URL
const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

function openTab(tabNumber, updateUrl = true) {
  tabButtons.forEach(btn => btn.classList.remove("active"));
  tabContents.forEach(tab => tab.classList.add("hidden"));

  document.querySelector(`.tab-btn[data-tab="${tabNumber}"]`).classList.add("active");
  document.getElementById(`tab-${tabNumber}`).classList.remove("hidden");

  if (updateUrl) {
    window.history.replaceState(null, "", `?tab=${tabNumber}`);
  }
}

tabButtons.forEach(button => {
  button.addEventListener("click", () => {
    openTab(button.dataset.tab);
  });
});

// Auto-open tab based on URL
const urlParams = new URLSearchParams(window.location.search);
const startTab = urlParams.get("tab") || 1;
openTab(startTab, false);

// ----------------------------
// Countdown Linked to Video Start
// ----------------------------
const timers = {};
const countdownSeconds = 10; // SET YOUR TIMER HERE

function setupVideo(tabNum) {
  const video = document.getElementById(`video-${tabNum}`);
  const timerDisplay = document.querySelector(`#timer-${tabNum} span`);
  const proceedBtn = document.getElementById(`proceed-${tabNum}`);

  let countdownStarted = false;
  let currentTime = countdownSeconds;

  video.addEventListener("play", () => {
    if (countdownStarted) return;
    countdownStarted = true;

    timerDisplay.textContent = currentTime;

    timers[tabNum] = setInterval(() => {
      currentTime--;
      timerDisplay.textContent = currentTime;

      if (currentTime <= 0) {
        clearInterval(timers[tabNum]);
        proceedBtn.classList.add("enabled");
        proceedBtn.disabled = false;
        proceedBtn.classList.remove("disabled");
      }
    }, 1000);
  });
}

// Setup for all 3 videos
setupVideo(1);
setupVideo(2);
setupVideo(3);
