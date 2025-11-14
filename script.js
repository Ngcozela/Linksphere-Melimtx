/* ------------------------------------------
    COLLECTION BUTTON HANDLER
-------------------------------------------*/
function openCollection(num) {
  console.log("Clicked collection:", num);
  alert("Opening Collection " + num + "...");
}

/* ------------------------------------------
    ALL JS RUNS AFTER DOM IS READY
-------------------------------------------*/
document.addEventListener("DOMContentLoaded", () => {

  /* ------------------------------------------
      ADULT WARNING
  -------------------------------------------*/
  const adultModal = document.getElementById("adultWarningModal");
  const adultContinueBtn = document.getElementById("adult-warning-continue");

  if (!sessionStorage.getItem("adultWarningShown")) {
    adultModal.classList.add("active");
  }

  adultContinueBtn.addEventListener("click", () => {
    adultModal.classList.remove("active");
    sessionStorage.setItem("adultWarningShown", "true");
  });

  /* ------------------------------------------
      SCROLLING COLLECTIONS
  -------------------------------------------*/
  const container = document.querySelector(".collections-container");
  const leftArrow = document.querySelector(".left-arrow");
  const rightArrow = document.querySelector(".right-arrow");

  leftArrow.addEventListener("click", () =>
    container.scrollBy({ left: -300, behavior: "smooth" })
  );

  rightArrow.addEventListener("click", () =>
    container.scrollBy({ left: 300, behavior: "smooth" })
  );

  let startX, scrollLeft, isDown = false;

  container.addEventListener("mousedown", (e) => {
    isDown = true;
    startX = e.pageX - container.offsetLeft;
    scrollLeft = container.scrollLeft;
  });

  container.addEventListener("mouseleave", () => isDown = false);
  container.addEventListener("mouseup", () => isDown = false);

  container.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    const x = e.pageX - container.offsetLeft;
    container.scrollLeft = scrollLeft - (x - startX) * 1.5;
  });

  container.addEventListener("touchstart", (e) => {
    startX = e.touches[0].pageX;
    scrollLeft = container.scrollLeft;
  });

  container.addEventListener("touchmove", (e) => {
    const x = e.touches[0].pageX;
    container.scrollLeft = scrollLeft - (x - startX) * 1.5;
  });

  /* ------------------------------------------
      AD-GATE GENERAL LOGIC
  -------------------------------------------*/
  const modal = document.getElementById("gateModal");
  const proceedBtn = document.getElementById("proceed-btn");
  const adBtns = document.querySelectorAll(".ad-btn");
  const collectionTabs = document.querySelectorAll(".collection-tab");

  let adsViewed = 0;
  let selectedLink = "";

  collectionTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      selectedLink = tab.dataset.link;

      modal.classList.add("active");

      adsViewed = 0;
      adBtns.forEach(btn => {
        btn.classList.remove("viewed");
        btn.textContent = btn.dataset.originalText || btn.textContent;
      });

      proceedBtn.disabled = true;
      proceedBtn.classList.remove("active");
    });
  });

  adBtns.forEach(btn => {
    btn.dataset.originalText = btn.textContent;

    btn.addEventListener("click", () => {
      const adUrl = btn.dataset.url;
      if (adUrl) window.open(adUrl, "_blank");

      if (!btn.classList.contains("viewed")) {
        btn.classList.add("viewed");
        btn.textContent = "Viewed";
        adsViewed++;
      }

      if (adsViewed >= 3) {
        proceedBtn.disabled = false;
        proceedBtn.classList.add("active");
      }
    });
  });

  proceedBtn.addEventListener("click", () => {
    if (selectedLink && !proceedBtn.disabled) {
      window.open(selectedLink, "_blank");
      modal.classList.remove("active");
    }
  });

  /* ------------------------------------------
      RANDOM YOUTUBE AD + 30s COUNTDOWN
  -------------------------------------------*/

  // Your YouTube video list
  const youtubeVideos = [
    "qRYmz6k3bR8",
    "eimI_VjnPA8",
  ];

  let player;
  let countdownTimer;
  const countdownDisplay = document.getElementById("countdownTimer");

  // Load YouTube API
  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  document.body.appendChild(tag);

  // This function runs when the YouTube API is ready
  window.onYouTubeIframeAPIReady = function () {
    player = new YT.Player("adgateYoutube", {
      events: {
        "onStateChange": handleVideoState
      }
    });
  };

  // Random video loader
  function loadRandomYoutubeAd() {
    const id = youtubeVideos[Math.floor(Math.random() * youtubeVideos.length)];
    player.loadVideoById(id);
  }

  // Handle Play button
  document.getElementById("playAdVideo").addEventListener("click", () => {
    loadRandomYoutubeAd();
  });

  // Handle countdown unlock
  function handleVideoState(event) {
    if (event.data === YT.PlayerState.PLAYING) {
      startCountdown();
    }
  }

  function startCountdown() {
    let remaining = 30;

    countdownDisplay.textContent = `Unlocking in ${remaining}s`;
    countdownDisplay.style.display = "block";

    clearInterval(countdownTimer);

    countdownTimer = setInterval(() => {
      remaining--;
      countdownDisplay.textContent = `Unlocking in ${remaining}s`;

      if (remaining <= 0) {
        clearInterval(countdownTimer);
        countdownDisplay.textContent = "Unlocked!";
        proceedBtn.disabled = false;
        proceedBtn.classList.add("active");
      }
    }, 1000);
  }

  /* ------------------------------------------
      URL PARAMETER TRIGGER
  -------------------------------------------*/
  const urlParams = new URLSearchParams(window.location.search);
  const collectionParam = urlParams.get("collection");

  if (collectionParam) {
    const targetTab = [...collectionTabs].find(tab =>
      tab.querySelector("p").textContent
        .toLowerCase()
        .includes(`collection ${collectionParam}`)
    );

    if (targetTab) {
      selectedLink = targetTab.dataset.link;

      targetTab.scrollIntoView({ behavior: "smooth", inline: "center" });

      setTimeout(() => {
        modal.classList.add("active");

        adsViewed = 0;
        adBtns.forEach(btn => btn.classList.remove("viewed"));

        proceedBtn.disabled = true;
        proceedBtn.classList.remove("active");
      }, 1000);
    }
  }
});
