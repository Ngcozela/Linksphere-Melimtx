/* ------------------------------------------
    COLLECTION BUTTON HANDLER (unused)
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


  // Drag-to-scroll Desktop
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

  // Drag-to-scroll Mobile
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
  let countdown = 30;
  let countdownInterval = null;

  /* ------------------------------
      SHOW COUNTDOWN
  ------------------------------*/
  const countdownDisplay = document.getElementById("countdown");
  function startCountdown() {
    countdown = 30;
    countdownDisplay.textContent = countdown + "s";

    countdownInterval = setInterval(() => {
      countdown--;
      countdownDisplay.textContent = countdown + "s";

      if (countdown <= 0) {
        clearInterval(countdownInterval);
        countdownDisplay.textContent = "Done";
        proceedBtn.disabled = false;
        proceedBtn.classList.add("active");
      }
    }, 1000);
  }


  /* ------------------------------
      COLLECTION CLICK → OPEN GATE
  ------------------------------*/
  collectionTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      selectedLink = tab.dataset.link;   // final destination

      modal.classList.add("active");

      proceedBtn.disabled = true;
      proceedBtn.classList.remove("active");

      if (countdownInterval) clearInterval(countdownInterval);
      startCountdown();
    });
  });


  /* ------------------------------------------
      PROCEED BUTTON
  -------------------------------------------*/
  proceedBtn.addEventListener("click", () => {
    if (!proceedBtn.disabled && selectedLink) {
      window.open(selectedLink, "_blank");
      modal.classList.remove("active");
    }
  });


  /* ------------------------------------------
      RANDOM YOUTUBE AD
  -------------------------------------------*/
  const youtubeVideos = [
    "qRYmz6k3bR8",
    "eimI_VjnPA8",
  ];

  const iframe = document.getElementById("adgateYoutube");
  const playBtn = document.getElementById("playAdVideo");

  function loadRandomYoutubeAd() {
    const randomVideo = youtubeVideos[Math.floor(Math.random() * youtubeVideos.length)];
    iframe.src = `https://www.youtube.com/embed/${randomVideo}?autoplay=1&controls=1&rel=0`;
  }

  playBtn.addEventListener("click", () => {
    loadRandomYoutubeAd();
  });


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

        proceedBtn.disabled = true;
        proceedBtn.classList.remove("active");

        if (countdownInterval) clearInterval(countdownInterval);
        startCountdown();
      }, 800);
    }
  }

});
