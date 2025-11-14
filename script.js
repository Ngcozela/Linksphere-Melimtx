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

  leftArrow.addEventListener("click", () => {
    container.scrollBy({ left: -300, behavior: "smooth" });
  });

  rightArrow.addEventListener("click", () => {
    container.scrollBy({ left: 300, behavior: "smooth" });
  });

  // Drag-to-scroll
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
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 1.5;
    container.scrollLeft = scrollLeft - walk;
  });

  // Mobile drag
  container.addEventListener("touchstart", (e) => {
    startX = e.touches[0].pageX;
    scrollLeft = container.scrollLeft;
  });

  container.addEventListener("touchmove", (e) => {
    const x = e.touches[0].pageX;
    const walk = (x - startX) * 1.5;
    container.scrollLeft = scrollLeft - walk;
  });

  /* ------------------------------------------
      AD-GATE LOGIC
  -------------------------------------------*/
  const modal = document.getElementById("gateModal");
  const proceedBtn = document.getElementById("proceed-btn");
  const adBtns = document.querySelectorAll(".ad-btn");
  const collectionTabs = document.querySelectorAll(".collection-tab");

  let selectedLink = "";
  let timerInterval;
  let timeLeft = 30;

  /* ---------------------------
      OPEN MODAL FROM TAB CLICK
  ----------------------------*/
  collectionTabs.forEach((tab) => {
    const link = tab.querySelector(".collection-link");

    link.addEventListener("click", (e) => {
      e.preventDefault();      // prevent navigation
      e.stopPropagation();     // prevent bubbling

      selectedLink = tab.dataset.link;

      openAdGate();
    });
  });

  function openAdGate() {
    modal.classList.add("active");

    // Reset UI
    timeLeft = 30;
    proceedBtn.disabled = true;
    proceedBtn.classList.remove("active");
    proceedBtn.textContent = "Please wait 30s...";

    // Start countdown
    startTimer();

    // Auto-load random YouTube ad
    loadRandomYoutubeAd();
  }

  /* ------------------------------------------
      TIMER + PROCEED UNLOCK
  -------------------------------------------*/
  function startTimer() {
    clearInterval(timerInterval);

    timerInterval = setInterval(() => {
      timeLeft--;
      proceedBtn.textContent = `Please wait ${timeLeft}s...`;

      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        proceedBtn.disabled = false;
        proceedBtn.classList.add("active");
        proceedBtn.textContent = "Proceed";
      }
    }, 1000);
  }

  proceedBtn.addEventListener("click", () => {
    if (!proceedBtn.disabled && selectedLink) {
      window.open(selectedLink, "_blank");
      modal.classList.remove("active");
    }
  });

  /* ------------------------------------------
      RANDOM YOUTUBE VIDEO LOADER
  -------------------------------------------*/
  const youtubeVideos = [
    "qRYmz6k3bR8",
    "eimI_VjnPA8",
  ];

  function loadRandomYoutubeAd() {
    const randomVideo =
      youtubeVideos[Math.floor(Math.random() * youtubeVideos.length)];

    const iframe = document.getElementById("adgateYoutube");
    iframe.src = `https://www.youtube.com/embed/${randomVideo}?autoplay=1&controls=1&rel=0`;
  }

  /* ------------------------------------------
      AUTO OPEN MODAL IF ?collection= PASSED
  -------------------------------------------*/
  const urlParams = new URLSearchParams(window.location.search);
  const collectionParam = urlParams.get("collection");

  if (collectionParam) {
    const targetTab = [...collectionTabs].find((tab) =>
      tab.querySelector("p").textContent
        .toLowerCase()
        .includes(`collection ${collectionParam}`)
    );

    if (targetTab) {
      selectedLink = targetTab.dataset.link;

      targetTab.scrollIntoView({ behavior: "smooth", inline: "center" });

      setTimeout(() => {
        openAdGate();
      }, 400);
    }
  }
});
