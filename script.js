// =============================
//  GLOBAL VARIABLES
// =============================
let selectedLink = "";
let chosenMethod = null;        // "ads" or "video"
let adViews = [false, false, false];
let ytPlayer = null;
let videoCountdown = 30;
let countdownInterval = null;

// =============================
//  OPEN COLLECTION + AD GATE
// =============================
$(document).ready(function () {

    // Handle click on collection tabs
    $(".collection-tab").on("click", function () {
        selectedLink = $(this).data("link");

        openAdGate();
    });

    // Support direct links via ?collection=#
    const params = new URLSearchParams(window.location.search);
    const collectionID = params.get("collection");
    if (collectionID) {
        const tab = $(`.collection-tab[data-collection="${collectionID}"]`);
        if (tab.length) {
            selectedLink = tab.data("link");
            openAdGate();
        }
    }

    // Ad buttons
    $(".ad-btn").on("click", function () {

        // ❌ If user already chose "video", ads are locked
        if (chosenMethod === "video") return;

        // If first ad click → set method to "ads"
        chosenMethod = "ads";

        // Lock video method after choosing ads
        lockVideoOption(); // ✅ INSERTED FOR OPTION A

        let index = $(this).data("index");
        adViews[index] = true;

        // open ad link in new tab
        let url = $(this).data("url");
        window.open(url, "_blank");

        checkAdCompletion();
    });

    // Proceed button (initially locked)
    $("#proceedBtn").on("click", function () {
        if (!$(this).hasClass("unlocked")) return;
        if (selectedLink) window.location.href = selectedLink;
    });
});

// =============================
//  MODAL OPEN/CLOSE
// =============================
function openAdGate() {
    $("#adGateModal").fadeIn(200);
    resetGateState();
}

function closeAdGate() {
    $("#adGateModal").fadeOut(200);
}

// =============================
//  RESET STATE
// =============================
function resetGateState() {
    chosenMethod = null;
    adViews = [false, false, false];

    $("#proceedBtn")
        .removeClass("unlocked")
        .text("Locked");

    // Reset ads
    $(".ad-btn").removeClass("done disabled");

    // Reset video
    videoCountdown = 30;
    $("#countdownText").text("30");
    $("#videoSection").hide();

    $("#videoPlayBtn").removeClass("disabled");  // ✅ INSERTED (unlock play button)

    if (countdownInterval) clearInterval(countdownInterval);
}

// =============================
//  LOCK VIDEO OPTION (when ads chosen)
// =============================
function lockVideoOption() {
    $("#videoPlayBtn").addClass("disabled"); // disables clicking video option
}

// LOCK ADS OPTION (when video chosen)
function lockAdsOption() {
    $(".ad-btn").addClass("disabled"); // disables clicking ads
}

// =============================
//    METHOD A – 3 ADS
// =============================
function checkAdCompletion() {

    // visually mark completed ads
    adViews.forEach((v, i) => {
        if (v) $(`.ad-btn[data-index="${i}"]`).addClass("done");
    });

    // unlock if all 3 viewed
    if (adViews.every(v => v)) {
        unlockProceed();
    }
}

// =============================
//  UNLOCK PROCEED BUTTON
// =============================
function unlockProceed() {
    $("#proceedBtn")
        .addClass("unlocked")
        .text("Proceed");
}

// =============================
//    METHOD B – VIDEO
// =============================

// Trigger video mode
function startVideoMode() {

    // ❌ If user already chose ads, video is locked
    if (chosenMethod === "ads") return;

    // Set method to video
    chosenMethod = "video";

    // Lock ads once video method chosen
    lockAdsOption();  // ✅ INSERTED FOR OPTION A

    $("#videoSection").show();

    // Initialize YouTube player
    if (!ytPlayer) {
        ytPlayer = new YT.Player("adVideo", {
            events: {
                "onStateChange": onPlayerStateChange
            }
        });
    }
}

// Countdown starts ONLY when video actually starts playing
function onPlayerStateChange(event) {

    if (chosenMethod !== "video") return;

    if (event.data === YT.PlayerState.PLAYING) {
        startVideoCountdown();
    }

    if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.BUFFERING) {
        stopVideoCountdown();
    }
}

// Start the 30s countdown
function startVideoCountdown() {

    if (countdownInterval) return;

    countdownInterval = setInterval(() => {

        videoCountdown--;
        $("#countdownText").text(videoCountdown);

        if (videoCountdown <= 0) {
            stopVideoCountdown();
            unlockProceed();
        }

    }, 1000);
}

function stopVideoCountdown() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
}

// =============================
//  EXPOSE VIDEO BUTTON FUNCTION
// =============================
window.startVideoMode = startVideoMode;
