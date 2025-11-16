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

/* script.js — ad-gate logic (locked method after first choice) */

/* ----------------------
   CONFIG / STATE
-----------------------*/
const AD_COUNT_REQUIRED = 3;
const VIDEO_COUNTDOWN_SECONDS = 30;

let selectedLink = "";
let adsViewed = 0;
let chosenMethod = null; // "ads" or "video" or null
let viewedAdButtons = new Set();

// YT player state
let ytPlayer = null;
let ytPlayerReady = false;
let countdownRemaining = VIDEO_COUNTDOWN_SECONDS;
let countdownInterval = null;
let isCounting = false;
let currentVideoId = "";

/* ----------------------
   DOM SHORTCUTS
-----------------------*/
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

/* Elements */
const gateModal = $("#gateModal");
const closeGate = $("#closeGate");
const adBtns = $$(".ad-btn");
const playAdButton = $("#playAdVideo");
const proceedBtn = $("#proceed-btn");
const iframe = $("#adgateYoutube");
const adVideoWrapper = document.querySelector(".ad-video-wrapper");
const gateDescription = $("#gate-description");
const collectionTabs = $$(".collection-tab");
const adultModal = $("#adultWarningModal");
const adultContinueBtn = $("#adult-warning-continue");

/* ----------------------
   UTILS
-----------------------*/
function safeOpenUrl(url) {
  try {
    window.open(url, "_blank");
  } catch (e) {
    console.warn("Could not open URL:", url, e);
  }
}

function resetGateUI() {
  // reset ad buttons
  adBtns.forEach(b => b.classList.remove("viewed"));
  viewedAdButtons.clear();
  adsViewed = 0;

  // reset proceed
  proceedBtn.disabled = true;
  proceedBtn.classList.remove("active");
  proceedBtn.setAttribute("aria-disabled", "true");
  proceedBtn.textContent = "Choose an option";

  // reset video area
  adVideoWrapper.style.display = "none";
  iframe.src = "";
  destroyPlayerIfAny();

  // reset countdown
  countdownRemaining = VIDEO_COUNTDOWN_SECONDS;
  stopCountdown();
  chosenMethod = null;
  playAdButton.disabled = false;
}

function openGateForLink(link) {
  selectedLink = link || "";
  resetGateUI();
  gateModal.classList.add("active");
  gateModal.setAttribute("aria-hidden", "false");
  gateDescription.textContent = "Choose an option to unlock this collection:";
}

/* ----------------------
   Collection tab handlers
-----------------------*/
collectionTabs.forEach(tab => {
  tab.addEventListener("click", (e) => {
    e.preventDefault();
    const link = tab.dataset.link || "";
    // store selected link then open the gate modal
    openGateForLink(link);
  });

  tab.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const link = tab.dataset.link || "";
      openGateForLink(link);
    }
  });
});

/* ----------------------
   Close modal
-----------------------*/
closeGate && closeGate.addEventListener("click", () => {
  closeGateModal();
});
function closeGateModal() {
  gateModal.classList.remove("active");
  gateModal.setAttribute("aria-hidden", "true");
  resetGateUI();
}

/* ----------------------
   Adult warning
-----------------------*/
if (!sessionStorage.getItem("adultWarningShown") && adultModal) {
  adultModal.classList.add("active");
  adultModal.setAttribute("aria-hidden", "false");
}
adultContinueBtn && adultContinueBtn.addEventListener("click", () => {
  if (adultModal) {
    adultModal.classList.remove("active");
    adultModal.setAttribute("aria-hidden", "true");
    sessionStorage.setItem("adultWarningShown", "true");
  }
});

/* ----------------------
   AD BUTTON (Option A) logic
   — if user clicks any ad button, lock video option and mark ad as viewed
-----------------------*/
adBtns.forEach((btn, idx) => {
  btn.addEventListener("click", (e) => {
    // If video method already chosen, ignore clicks for choosing method
    if (chosenMethod === "video") {
      // still open the ad landing if they click but do not change method
      safeOpenUrl(btn.dataset.url);
      return;
    }

    // If no method yet chosen, lock to ads method
    if (!chosenMethod) {
      chosenMethod = "ads";
      // disable video controls to enforce "locked after first choice"
      playAdButton.disabled = true;
      playAdButton.setAttribute("aria-pressed", "false");
      adVideoWrapper.style.display = "none";
      // Clear any iframe/player to avoid confusion
      iframe.src = "";
      destroyPlayerIfAny();
    }

    // Mark this ad as viewed (only once)
    const url = btn.dataset.url;
    if (!viewedAdButtons.has(idx)) {
      viewedAdButtons.add(idx);
      adsViewed = viewedAdButtons.size;
      btn.classList.add("viewed");
      // Open the ad landing in a new tab (user can watch)
      safeOpenUrl(url);
    } else {
      // If clicked again, still open the URL but do not double-count
      safeOpenUrl(url);
    }

    // If user viewed all required ads -> unlock
    if (adsViewed >= AD_COUNT_REQUIRED) {
      unlockProceed("You watched 3 ads — you can proceed.");
    } else {
      gateDescription.textContent = `Viewed ${adsViewed}/${AD_COUNT_REQUIRED} ads — view all to unlock, or choose video instead.`;
    }
  });
});

/* ----------------------
   Video path (Option B)
   — choose video: lock ad buttons (they remain clickable but won't change method)
   — only when user clicks Play (YT PLAYING) does countdown start
-----------------------*/
playAdButton.addEventListener("click", async () => {
  // If ads method already chosen, do nothing except open video player for info
  if (chosenMethod === "ads") {
    // optional: give feedback
    gateDescription.textContent = "You've already chosen the ad path — finish viewing 3 ads to unlock.";
    return;
  }

  // If not chosen yet, set video as chosen and lock ad buttons (so they don't change method)
  if (!chosenMethod) {
    chosenMethod = "video";
    // visually disable ad buttons (they still open links but won't change method)
    adBtns.forEach(b => b.setAttribute("disabled", "true"));
    adBtns.forEach(b => b.classList.add("disabled"));
  }

  // Show video wrapper and load a random video
  adVideoWrapper.style.display = "block";
  gateDescription.textContent = "Play the video below — countdown starts when playback begins.";

  // Set iframe src to a randomly selected ID with enablejsapi=1 so API can control it
  const videoId = randomVideoId();
  currentVideoId = videoId;
  // set src with enablejsapi=1 and origin to allow API (origin optional but recommended)
  const origin = window.location.origin;
  iframe.src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1`;

  // If API is already ready create or re-create player
  if (window.YT && window.YT.Player) {
    createOrLoadPlayer(videoId);
  } else {
    // if API not loaded yet, it will call onYouTubeIframeAPIReady which will create player
    // do nothing else here
  }

  // give the play button an aria-pressed state
  playAdButton.setAttribute("aria-pressed", "true");
  playAdButton.disabled = true; // user can't choose it again; player controls playback
});

/* ----------------------
   Proceed button
-----------------------*/
proceedBtn.addEventListener("click", () => {
  if (proceedBtn.disabled) return;
  if (selectedLink) {
    safeOpenUrl(selectedLink);
  }
  closeGateModal();
});

/* ----------------------
   Unlock UI helper
-----------------------*/
function unlockProceed(message) {
  stopCountdown();
  proceedBtn.disabled = false;
  proceedBtn.classList.add("active");
  proceedBtn.setAttribute("aria-disabled", "false");
  proceedBtn.textContent = "Proceed";
  if (gateDescription) gateDescription.textContent = message || "Unlocked — proceed to collection.";
}

/* ----------------------
   Random YouTube pool
-----------------------*/
const shortYoutubeIds = ["qRYmz6k3bR8", "eimI_VjnPA8"];
const longYoutubeIds = ["8xUX3D_GxBQ", "qRYmz6k3bR8", "eimI_VjnPA8"];

function randomVideoId() {
  // prefer long list for the 30s option to increase chance it's >=30s
  const pool = longYoutubeIds;
  return pool[Math.floor(Math.random() * pool.length)];
}

/* ----------------------
   YouTube Iframe API handling
-----------------------*/
// This function is called by the YT API when it's ready.
function onYouTubeIframeAPIReady() {
  // If we already loaded a video and iframe.src is set, create a player
  if (iframe && iframe.src && iframe.src.length) {
    createOrLoadPlayer(currentVideoId);
  }
}

function createOrLoadPlayer(videoId) {
  try {
    if (ytPlayer) {
      // if player exists, load the new video
      try {
        ytPlayer.loadVideoById(videoId);
      } catch (err) {
        // if load fails, destroy and recreate
        ytPlayer.destroy();
        ytPlayer = null;
      }
    }

    if (!ytPlayer) {
      ytPlayer = new YT.Player("adgateYoutube", {
        events: {
          onReady: (ev) => {
            ytPlayerReady = true;
            // do NOT start countdown yet — only when playback begins
          },
          onStateChange: onPlayerStateChange
        }
      });
    }
  } catch (err) {
    console.warn("YT player creation error:", err);
  }
}

function destroyPlayerIfAny() {
  try {
    if (ytPlayer && ytPlayer.destroy) {
      ytPlayer.destroy();
    }
  } catch (e) {
    // ignore
  } finally {
    ytPlayer = null;
    ytPlayerReady = false;
  }
}

/* YT state mapping:
   -1 (unstarted), 0 ended, 1 playing, 2 paused, 3 buffering, 5 video cued
*/
function onPlayerStateChange(event) {
  // If method is not video, ignore
  if (chosenMethod !== "video") return;

  const state = event.data;
  if (state === YT.PlayerState.PLAYING) {
    // If not counting yet, start countdown
    if (!isCounting) {
      startCountdown();
    } else {
      // if counting already, resume if it was paused
      resumeCountdown();
    }
  } else if (state === YT.PlayerState.PAUSED || state === YT.PlayerState.BUFFERING) {
    // pause countdown
    pauseCountdown();
  } else if (state === YT.PlayerState.ENDED) {
    // If ended before finishing countdown, pause or finish based on remaining time
    if (countdownRemaining <= 0) {
      finishCountdownAndUnlock();
    } else {
      // if video ended but countdown not finished, we pause waiting for user action (they can replay)
      pauseCountdown();
    }
  }
}

/* ----------------------
   Countdown controls (30s)
-----------------------*/
function startCountdown() {
  if (isCounting) return;
  isCounting = true;

  // Visual: set proceed to show seconds remaining
  proceedBtn.textContent = `Please wait ${countdownRemaining}s...`;
  proceedBtn.disabled = true;
  proceedBtn.setAttribute("aria-disabled", "true");

  countdownInterval = setInterval(() => {
    countdownRemaining--;
    if (countdownRemaining < 0) countdownRemaining = 0;

    proceedBtn.textContent = `Please wait ${countdownRemaining}s...`;

    if (countdownRemaining <= 0) {
      finishCountdownAndUnlock();
    }
  }, 1000);
}

function pauseCountdown() {
  if (!isCounting) return;
  isCounting = false;
  clearInterval(countdownInterval);
  // Keep the proceed text showing remaining seconds
  proceedBtn.textContent = `Please wait ${countdownRemaining}s... (paused)`;
}

function resumeCountdown() {
  if (isCounting) return;
  isCounting = true;
  // resume interval
  countdownInterval = setInterval(() => {
    countdownRemaining--;
    if (countdownRemaining < 0) countdownRemaining = 0;
    proceedBtn.textContent = `Please wait ${countdownRemaining}s...`;
    if (countdownRemaining <= 0) {
      finishCountdownAndUnlock();
    }
  }, 1000);
}

function stopCountdown() {
  isCounting = false;
  clearInterval(countdownInterval);
  countdownInterval = null;
  countdownRemaining = VIDEO_COUNTDOWN_SECONDS;
}

function finishCountdownAndUnlock() {
  stopCountdown();
  unlockProceed("30 seconds of playback completed — you can proceed.");
}

/* ----------------------
   Handle unlocking from ads path
-----------------------*/
function unlockIfAdsComplete() {
  if (adsViewed >= AD_COUNT_REQUIRED) {
    unlockProceed("You watched 3 ads — you can proceed.");
  }
}

/* ----------------------
   Respond to ad-viewing updates
-----------------------*/
// Ensure internal adsViewed is kept in sync with viewedAdButtons set
Object.defineProperty(window, "markAdViewedInternal", {
  value: function(index) {
    viewedAdButtons.add(index);
    adsViewed = viewedAdButtons.size;
    if (adsViewed >= AD_COUNT_REQUIRED) {
      unlockProceed("You watched 3 ads — you can proceed.");
    } else {
      gateDescription.textContent = `Viewed ${adsViewed}/${AD_COUNT_REQUIRED} ads — view all to unlock, or choose video instead.`;
    }
  }
});

/* ----------------------
   Keyboard accessibility / esc to close
-----------------------*/
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (gateModal.classList.contains("active")) closeGateModal();
    if (adultModal && adultModal.classList.contains("active")) {
      adultModal.classList.remove("active");
      adultModal.setAttribute("aria-hidden", "true");
      sessionStorage.setItem("adultWarningShown", "true");
    }
  }
});

/* ----------------------
   URL param handling (auto open gate for collection)
-----------------------*/
(function handleCollectionParam() {
  const urlParams = new URLSearchParams(window.location.search);
  const collectionParam = urlParams.get("collection");
  if (!collectionParam) return;
  // Look for the tab whose <p> text includes "collection X"
  const found = collectionTabs.find(tab => {
    const p = tab.querySelector("p");
    return p && p.textContent.toLowerCase().includes(`collection ${collectionParam}`);
  });
  if (found) {
    // scroll into view, set selected link and open gate
    found.scrollIntoView({behavior: "smooth", inline: "center"});
    const link = found.dataset.link;
    openGateForLink(link);
  }
})();

/* ----------------------
   Initialization: nothing to do here; YT API loads globally
-----------------------*/
