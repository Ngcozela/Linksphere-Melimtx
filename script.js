/* script.js — main logic for Melimtx collections */

/* ------------------------------------------
   CONFIG & STATE
-------------------------------------------*/
const AD_COUNT_REQUIRED = 3;
const DEFAULT_COUNTDOWN = 30; // seconds for gate countdown / video

let selectedLink = "";
let timerInterval = null;
let timeLeft = DEFAULT_COUNTDOWN;
let adsViewed = 0;
let playAdTimeout = null;

/* ------------------------------------------
   DOM HELPERS
-------------------------------------------*/
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

/* ------------------------------------------
   SAFE-INIT ON DOM READY
-------------------------------------------*/
document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const adultModal = $("#adultWarningModal");
  const adultContinueBtn = $("#adult-warning-continue");
  const container = document.querySelector(".collections-container");
  const leftArrow = document.querySelector(".left-arrow");
  const rightArrow = document.querySelector(".right-arrow");
  const collectionTabs = $$(".collection-tab");
  const gateModal = $("#gateModal");
  const closeGate = $("#closeGate");
  const adBtns = $$(".ad-btn");
  const playAdButton = $("#playAdVideo");
  const proceedBtn = $("#proceed-btn");
  const iframe = $("#adgateYoutube");
  const adButtonGroup = $("#adButtonGroup");

  /* --------------------------
     Adult warning (session)
  ---------------------------*/
  if (!sessionStorage.getItem("adultWarningShown")) {
    adultModal.classList.add("active");
    adultModal.setAttribute("aria-hidden", "false");
  }
  adultContinueBtn.addEventListener("click", () => {
    adultModal.classList.remove("active");
    adultModal.setAttribute("aria-hidden", "true");
    sessionStorage.setItem("adultWarningShown", "true");
  });

  /* --------------------------
     Collections scroll arrows
  ---------------------------*/
  leftArrow.addEventListener("click", () => container.scrollBy({ left: -300, behavior: "smooth" }));
  rightArrow.addEventListener("click", () => container.scrollBy({ left: 300, behavior: "smooth" }));

  leftArrow.addEventListener("keydown", (e) => { if (e.key === "Enter") container.scrollBy({ left: -300, behavior: "smooth" }); });
  rightArrow.addEventListener("keydown", (e) => { if (e.key === "Enter") container.scrollBy({ left: 300, behavior: "smooth" }); });

  /* --------------------------
     Drag-to-scroll (desktop & mobile)
  ---------------------------*/
  let startX, scrollLeft, isDown = false;
  container.addEventListener("mousedown", (e) => { isDown = true; startX = e.pageX - container.offsetLeft; scrollLeft = container.scrollLeft; });
  container.addEventListener("mouseleave", () => isDown = false);
  container.addEventListener("mouseup", () => isDown = false);
  container.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 1.5;
    container.scrollLeft = scrollLeft - walk;
  });

  container.addEventListener("touchstart", (e) => { startX = e.touches[0].pageX; scrollLeft = container.scrollLeft; });
  container.addEventListener("touchmove", (e) => {
    const x = e.touches[0].pageX;
    const walk = (x - startX) * 1.5;
    container.scrollLeft = scrollLeft - walk;
  });

  /* --------------------------
     Collection tab click -> open ad gate
  ---------------------------*/
  collectionTabs.forEach((tab) => {
    // click or keyboard Enter to open gate
    const openForTab = (e) => {
      e.preventDefault();
      selectedLink = tab.dataset.link || "";
      openAdGate();
    };

    tab.addEventListener("click", openForTab);
    tab.addEventListener("keydown", (e) => { if (e.key === "Enter") openForTab(e); });
  });

  /* --------------------------
     Gate open/close
  ---------------------------*/
  function openAdGate() {
    // reset state
    adsViewed = 0;
    timeLeft = DEFAULT_COUNTDOWN;
    clearInterval(timerInterval);
    clearTimeout(playAdTimeout);

    // reset UI
    adBtns.forEach((b) => b.classList.remove("viewed"));
    proceedBtn.disabled = true;
    proceedBtn.classList.remove("active");
    proceedBtn.textContent = `Please wait ${timeLeft}s...`;

    // show modal
    gateModal.classList.add("active");
    gateModal.setAttribute("aria-hidden", "false");

    // load a placeholder random video (ready-to-play)
    loadRandomYoutubeAd();

    // start countdown (this controls the proceed button baseline)
    startTimer();
  }

  closeGate.addEventListener("click", () => closeModal());
  closeGate.addEventListener("keydown", (e) => { if (e.key === "Enter") closeModal(); });

  function closeModal() {
    gateModal.classList.remove("active");
    gateModal.setAttribute("aria-hidden", "true");
    clearInterval(timerInterval);
    clearTimeout(playAdTimeout);
    iframe.src = ""; // stop video playback
  }

  /* --------------------------
     PROCEED button click
  ---------------------------*/
  proceedBtn.addEventListener("click", () => {
    if (!proceedBtn.disabled && selectedLink) {
      window.open(selectedLink, "_blank");
      closeModal();
    }
  });

  /* --------------------------
     AD BUTTONS - mark viewed, and open URL in new window
     watching 3 will unlock immediately
  ---------------------------*/
  adBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const url = btn.dataset.url;
      if (!url) return;

      // if already viewed, do nothing
      if (btn.classList.contains("viewed")) {
        // still open ad landing in new tab to remain consistent
        window.open(url, "_blank");
        return;
      }

      // mark viewed visually
      btn.classList.add("viewed");
      adsViewed++;

      // open ad in new tab (so user can watch)
      window.open(url, "_blank");

      // if user viewed enough ads, unlock
      if (adsViewed >= AD_COUNT_REQUIRED) {
        unlockProceed("You watched 3 ads — you can proceed.");
      }
    });
  });

  /* --------------------------
     Play 30s Ad button — starts a 30s timer
     after which proceed unlocks
  ---------------------------*/
  let playAdActive = false;
  playAdButton.addEventListener("click", () => {
    if (playAdActive) return; // avoid double clicks
    playAdActive = true;

    // show a random longer ad video and start a 30s timer
    loadRandomYoutubeAd(true);

    // visual feedback: change button state
    playAdButton.textContent = "Playing... (30s)";
    playAdButton.disabled = true;

    // After 30 seconds grant unlock
    playAdTimeout = setTimeout(() => {
      unlockProceed("30-second ad played — you can proceed.");
      playAdButton.textContent = "Play 30s Ad";
      playAdButton.disabled = false;
      playAdActive = false;
    }, DEFAULT_COUNTDOWN * 1000);
  });

  /* --------------------------
     Timer - baseline countdown shown in the modal
     If reaches 0 -> unlock proceed (in case user doesn't watch ads)
  ---------------------------*/
  function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      timeLeft--;
      if (timeLeft < 0) timeLeft = 0;
      proceedBtn.textContent = `Please wait ${timeLeft}s...`;

      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        unlockProceed("Timer finished — you can proceed.");
      }
    }, 1000);
  }

  function unlockProceed(message) {
    clearInterval(timerInterval);
    clearTimeout(playAdTimeout);
    proceedBtn.disabled = false;
    proceedBtn.classList.add("active");
    proceedBtn.textContent = "Proceed";
    // small accessible hint
    const desc = $("#gate-description");
    if (desc) {
      desc.textContent = message;
    }
  }

  /* --------------------------
     Random YouTube ad loader (single place)
     If long parameter true -> choose a longer video ID
  ---------------------------*/
  const shortYoutubeIds = ["qRYmz6k3bR8", "eimI_VjnPA8"];
  const longYoutubeIds = ["8xUX3D_GxBQ", "qRYmz6k3bR8", "eimI_VjnPA8"]; // fallback list

  function loadRandomYoutubeAd(long = false) {
    const pool = long ? longYoutubeIds : shortYoutubeIds;
    const id = pool[Math.floor(Math.random() * pool.length)];
    const src = `https://www.youtube.com/embed/${id}?autoplay=1&controls=1&rel=0`;
    iframe.src = src;
  }

  /* --------------------------
     Handle ?collection= param to auto-open modal for that collection
  ---------------------------*/
  const urlParams = new URLSearchParams(window.location.search);
  const collectionParam = urlParams.get("collection");
  if (collectionParam) {
    const targetTab = collectionTabs.find((tab) =>
      tab.querySelector("p") && tab.querySelector("p").textContent.toLowerCase().includes(`collection ${collectionParam}`)
    );
    if (targetTab) {
      selectedLink = targetTab.dataset.link;
      targetTab.scrollIntoView({ behavior: "smooth", inline: "center" });
      setTimeout(() => {
        openAdGate();
      }, 400);
    }
  }

  /* --------------------------
     Accessibility: close modal with ESC
  ---------------------------*/
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      // close any open modal
      if (gateModal.classList.contains("active")) closeModal();
      if (adultModal.classList.contains("active")) { adultModal.classList.remove("active"); adultModal.setAttribute("aria-hidden", "true"); sessionStorage.setItem("adultWarningShown", "true"); }
    }
  });
});

let ytPlayer;
let countdownStarted = false;

function onYouTubeIframeAPIReady() {
  const iframe = document.getElementById("adVideo");

  if (!iframe) return;

  ytPlayer = new YT.Player("adVideo", {
    events: {
      onStateChange: function(event) {
        if (event.data === YT.PlayerState.PLAYING && !countdownStarted) {
          countdownStarted = true;
          startCountdown();
        }
      }
    }
  });
}

// -----------------------------
// YT STATE LISTENER
// -----------------------------
function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    startCountdown();
  } else if (event.data === YT.PlayerState.PAUSED) {
    stopCountdown();
  } else if (event.data === YT.PlayerState.ENDED) {
    finishCountdown();
  }
}

// -----------------------------
// Countdown Logic
// -----------------------------
function startCountdown() {
  if (isCounting) return; // already running
  isCounting = true;

  countdownInterval = setInterval(() => {
    countdown--;
    countdownEl.textContent = countdown;

    if (countdown <= 0) {
      finishCountdown();
    }
  }, 1000);
}

function stopCountdown() {
  isCounting = false;
  clearInterval(countdownInterval);
}

function finishCountdown() {
  stopCountdown();
  proceedBtn.disabled = false;
  countdownEl.textContent = "0";
}