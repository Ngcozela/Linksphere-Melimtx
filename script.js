/* ==========================================================
      AD-GATE SYSTEM — VERSION A (MATCHES YOUR HTML EXACTLY)
========================================================== */

/* --------------------
    GLOBAL STATE
--------------------- */
let selectedLink = "";
let chosenMethod = null;  // "ads" or "video"
let adViews = [false, false, false];
let ytPlayer = null;
let countdown = 30;
let countdownInterval = null;
let countdownStarted = false;

/* --------------------
    DOM ELEMENTS
--------------------- */
const gateModal = document.getElementById("gateModal");
const proceedBtn = document.getElementById("proceed-btn");
const playAdVideoBtn = document.getElementById("playAdVideo");
const youtubeFrame = document.getElementById("adgateYoutube");
const gateDescription = document.getElementById("gate-description");
const adButtons = document.querySelectorAll(".ad-btn");


/* ==========================================================
      OPEN AD GATE
========================================================== */

document.addEventListener("DOMContentLoaded", () => {
    const tabs = document.querySelectorAll(".collection-tab");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            selectedLink = tab.dataset.link || "";
            openAdGate();
        });
    });

    // Auto-open if collection passed in URL
    const params = new URLSearchParams(window.location.search);
    const col = params.get("collection");
    if (col) {
        const target = Array.from(tabs).find(t =>
            t.textContent.toLowerCase().includes(`collection ${col}`)
        );
        if (target) {
            selectedLink = target.dataset.link;
            openAdGate();
        }
    }
});


/* ==========================================================
      MODAL CONTROL
========================================================== */

function openAdGate() {
    resetGate();

    gateModal.classList.add("active");
    gateModal.setAttribute("aria-hidden", "false");
}

function closeAdGate() {
    gateModal.classList.remove("active");
    gateModal.setAttribute("aria-hidden", "true");

    stopCountdown();

    youtubeFrame.src = ""; // stop video completely
}

document.getElementById("closeGate").addEventListener("click", closeAdGate);


/* ==========================================================
      RESET GATE
========================================================== */

function resetGate() {
    chosenMethod = null;
    adViews = [false, false, false];
    countdown = 30;
    countdownStarted = false;

    proceedBtn.disabled = true;
    proceedBtn.classList.remove("active");
    proceedBtn.textContent = "Wait 30s...";

    stopCountdown();

    // Reset video
    youtubeFrame.src = "";
    playAdVideoBtn.disabled = false;
    playAdVideoBtn.style.opacity = "1";

    gateDescription.textContent =
        "Watch 3 short ads or play a 30-second video to unlock this collection.";

    adButtons.forEach(btn => {
        btn.classList.remove("viewed", "disabled");
    });
}


/* ==========================================================
      METHOD A — VIEW 3 ADS
========================================================== */

adButtons.forEach((btn, index) => {
    btn.addEventListener("click", () => {

        if (chosenMethod === "video") return;

        chosenMethod = "ads";
        lockVideoOption();

        adViews[index] = true;
        btn.classList.add("viewed");

        const url = btn.dataset.url;
        if (url) window.open(url, "_blank");

        if (adViews.every(v => v)) {
            unlockProceed("All 3 ads viewed — you can proceed.");
        }
    });
});

function lockVideoOption() {
    playAdVideoBtn.disabled = true;
    playAdVideoBtn.style.opacity = "0.5";
}


/* ==========================================================
      METHOD B — WATCH VIDEO 30 SECONDS
========================================================== */

playAdVideoBtn.addEventListener("click", () => {
    if (chosenMethod === "ads") return;

    chosenMethod = "video";
    lockAdsOption();

    loadRandomVideo();
});

function lockAdsOption() {
    adButtons.forEach(b => b.classList.add("disabled"));
}


/* ==========================================================
      LOAD RANDOM VIDEO
========================================================== */

function loadRandomVideo() {
    const ids = ["qRYmz6k3bR8", "eimI_VjnPA8", "8xUX3D_GxBQ"];

    let id = ids[Math.floor(Math.random() * ids.length)];

    document.querySelector(".ad-video-wrapper").style.display = "block";

    const src = `https://www.youtube.com/embed/${id}?enablejsapi=1&autoplay=1&controls=1&rel=0`;

    youtubeFrame.src = src;

    // Build player AFTER iframe loads
    setTimeout(() => {
        ytPlayer = new YT.Player("adgateYoutube", {
            events: {
                "onStateChange": onPlayerStateChange
            }
        });
    }, 600);
}


/* ==========================================================
      VIDEO STATE LISTENER — FIXED LOGIC
========================================================== */

function onPlayerStateChange(event) {
    if (chosenMethod !== "video") return;

    switch (event.data) {

        case YT.PlayerState.PLAYING:
            if (!countdownStarted) {
                countdownStarted = true;
                startCountdown(); // ← countdown starts ONLY when the video visually begins
            }
            break;

        case YT.PlayerState.PAUSED:
            stopCountdown(); // pause countdown if user pauses
            break;

        case YT.PlayerState.ENDED:
            finishCountdown(); // instantly unlock if video finishes early
            break;
    }
}


/* ==========================================================
      COUNTDOWN LOGIC — FIXED & STABLE
========================================================== */

function startCountdown() {
    stopCountdown(); // avoid double intervals

    countdownInterval = setInterval(() => {
        countdown--;
        proceedBtn.textContent = `Wait ${countdown}s...`;

        if (countdown <= 0) {
            finishCountdown();
        }
    }, 1000);
}

function stopCountdown() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
}

function finishCountdown() {
    stopCountdown();
    unlockProceed("30-second video watched — you can proceed.");
}


/* ==========================================================
      UNLOCK PROCEED BUTTON
========================================================== */

function unlockProceed(message) {
    proceedBtn.disabled = false;
    proceedBtn.classList.add("active");
    proceedBtn.textContent = "Proceed";
    gateDescription.textContent = message;
}


/* ==========================================================
      PROCEED
========================================================== */

proceedBtn.addEventListener("click", () => {
    if (!proceedBtn.disabled && selectedLink) {
        window.location.href = selectedLink;
    }
});
