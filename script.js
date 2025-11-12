document.addEventListener("DOMContentLoaded", () => {
  /* -------------------------
     ADULT CONTENT WARNING POPUP
  ----------------------------*/
  const adultModal = document.getElementById("adultWarningModal");
  const adultContinueBtn = document.getElementById("adult-warning-continue");

  if (!sessionStorage.getItem("adultWarningShown")) {
    adultModal.classList.add("active");
  }

  adultContinueBtn.addEventListener("click", () => {
    adultModal.classList.remove("active");
    sessionStorage.setItem("adultWarningShown", "true");
  });

  /* -------------------------
     SCROLLING COLLECTIONS
  ----------------------------*/
  const container = document.querySelector(".collections-container");
  const leftArrow = document.querySelector(".left-arrow");
  const rightArrow = document.querySelector(".right-arrow");

  leftArrow.addEventListener("click", () => {
    container.scrollBy({ left: -300, behavior: "smooth" });
  });
  rightArrow.addEventListener("click", () => {
    container.scrollBy({ left: 300, behavior: "smooth" });
  });

  // Touch-friendly horizontal scroll
  let startX, scrollLeft, isDown = false;

  container.addEventListener("mousedown", (e) => {
    isDown = true;
    startX = e.pageX - container.offsetLeft;
    scrollLeft = container.scrollLeft;
  });
  container.addEventListener("mouseleave", () => (isDown = false));
  container.addEventListener("mouseup", () => (isDown = false));
  container.addEventListener("mousemove", (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - container.offsetLeft;
    const walk = (x - startX) * 1.5;
    container.scrollLeft = scrollLeft - walk;
  });

  container.addEventListener("touchstart", (e) => {
    startX = e.touches[0].pageX;
    scrollLeft = container.scrollLeft;
  });
  container.addEventListener("touchmove", (e) => {
    const x = e.touches[0].pageX;
    const walk = (x - startX) * 1.5;
    container.scrollLeft = scrollLeft - walk;
  });

  /* -------------------------
     AD-GATE LOGIC
  ----------------------------*/
  const modal = document.getElementById("gateModal");
  const proceedBtn = document.getElementById("proceed-btn");
  const adBtns = document.querySelectorAll(".ad-btn");
  const adVideo = document.getElementById("ad-video");
  const collectionTabs = document.querySelectorAll(".collection-tab");

  let adsViewed = 0;
  let selectedLink = "";

  // Skip button setup
  const skipBtn = document.createElement("button");
  skipBtn.textContent = "Skip Ad";
  skipBtn.style.cssText = `
    display: none;
    margin-top: 10px;
    background: #ff7b00;
    color: #fff;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: bold;
  `;
  adVideo.insertAdjacentElement("afterend", skipBtn);

  // Handle collection tab click
  collectionTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      selectedLink = tab.dataset.link;
      modal.classList.add("active");
      adsViewed = 0;
      adBtns.forEach(btn => btn.classList.remove("viewed"));
      proceedBtn.disabled = true;
      proceedBtn.classList.remove("active");
    });
  });

  // Ad button logic
  adBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const adUrl = btn.getAttribute("data-url");
      if (adUrl) {
        window.open(adUrl, "_blank");
      }

      if (!btn.classList.contains("viewed")) {
        btn.classList.add("viewed");
        btn.textContent = "Viewed ✅";
        adsViewed++;
      }

      if (adsViewed >= 3) {
        proceedBtn.disabled = false;
        proceedBtn.classList.add("active");
      }
    });
  });

  // Video skip logic
  adVideo.addEventListener("loadedmetadata", () => {
    const duration = adVideo.duration;
    if (duration > 30) {
      skipBtn.style.display = "none";
      adVideo.addEventListener("play", () => {
        setTimeout(() => {
          if (!adVideo.paused && adVideo.currentTime >= 30) {
            skipBtn.style.display = "inline-block";
          }
        }, 30000);
      });
    }
  });

  skipBtn.addEventListener("click", () => {
    adVideo.pause();
    skipBtn.style.display = "none";
    proceedBtn.disabled = false;
    proceedBtn.classList.add("active");
  });

  proceedBtn.addEventListener("click", () => {
    if (selectedLink && !proceedBtn.disabled) {
      window.open(selectedLink, "_blank");
      modal.classList.remove("active");
    }
  });

  /* -------------------------
     URL PARAMETER TRIGGER
     (Direct link opens Ad Gate)
  ----------------------------*/
  const urlParams = new URLSearchParams(window.location.search);
  const collectionParam = urlParams.get("collection");

  if (collectionParam) {
    const targetTab = Array.from(collectionTabs).find(tab =>
      tab.querySelector("p").textContent.toLowerCase().includes(`collection ${collectionParam}`)
    );

    if (targetTab) {
      selectedLink = targetTab.dataset.link;

      // Scroll into view for nice effect
      targetTab.scrollIntoView({ behavior: "smooth", inline: "center" });

      // Open Ad Gate automatically
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

// Inject Adsterra banner dynamically
const adBox = document.getElementById("adBox");

if (adBox) {
  const script1 = document.createElement("script");
  script1.type = "text/javascript";
  script1.innerHTML = `
    atOptions = {
      'key': '1235cadbe8897064a09ba4fc77b33e18',
      'format': 'iframe',
      'height': 120,
      'width': 728,
      'params': {}
    };
  `;

  const script2 = document.createElement("script");
  script2.type = "text/javascript";
  script2.src = "//www.highperformanceformat.com/1235cadbe8897064a09ba4fc77b33e18/invoke.js";

  adBox.appendChild(script1);
  adBox.appendChild(script2);
}


