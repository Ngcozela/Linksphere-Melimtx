
function openCollection(num) {
  console.log("Clicked collection:", num);
  alert("Opening Collection " + num + "...");
  // window.location.href = `collection${num}.html`;
}
/*Section scrolling script*/
document.addEventListener("DOMContentLoaded", () => {
  /* -------------------------
     ADULT CONTENT WARNING POPUP
  ----------------------------*/
  const adultModal = document.getElementById("adultWarningModal");
  const adultContinueBtn = document.getElementById("adult-warning-continue");

  // Only show once per visit
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

  // Touch-friendly horizontal scroll on mobile
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

  // Mobile touch scroll
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

  let adsWatched = 0;
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
      adsWatched = 0;
      adBtns.forEach(btn => btn.classList.remove("watched"));
      proceedBtn.disabled = true;
      proceedBtn.classList.remove("active");
    });
  });

  // Handle "Watch Ad" buttons
  adBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      if (!btn.classList.contains("watched")) {
        btn.classList.add("watched");
        adsWatched++;
        if (adsWatched >= 3) {
          proceedBtn.disabled = false;
          proceedBtn.classList.add("active");
        }
      }
    });
  });

  // Handle video skip logic
  adVideo.addEventListener("loadedmetadata", () => {
    const duration = adVideo.duration;

    
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

  document.addEventListener("DOMContentLoaded", () => {
  // ---------------------------
  // Ad-Gate Elements
  // ---------------------------
  const modal = document.getElementById("gateModal");
  const proceedBtn = document.getElementById("proceed-btn");
  const adBtns = document.querySelectorAll(".ad-btn");
  const adVideo = document.getElementById("ad-video");
  const collectionTabs = document.querySelectorAll(".collection-tab");

  let adsViewed = 0;
  let selectedLink = "";

  // ---------------------------
  // Handle Collection Tab Click
  // ---------------------------
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

  // ---------------------------
  // Ad Button Logic
  // ---------------------------
  adBtns.forEach(btn => {
    // Store original text for resetting
    btn.dataset.originalText = btn.textContent;

    btn.addEventListener("click", () => {
      const adUrl = btn.getAttribute("data-url");
      
      // Open ad in new tab
      if (adUrl) {
        window.open(adUrl, "_blank");
      }

      // Mark ad as viewed if not already
      if (!btn.classList.contains("viewed")) {
        btn.classList.add("viewed");
        btn.textContent = "Viewed";
        adsViewed++;
      }

      // Enable proceed button after 3 ads
      if (adsViewed >= 3) {
        proceedBtn.disabled = false;
        proceedBtn.classList.add("active");
      }
    });
  });

  // ---------------------------
  // Proceed Button Logic
  // ---------------------------
  proceedBtn.addEventListener("click", () => {
    if (selectedLink && !proceedBtn.disabled) {
      window.open(selectedLink, "_blank");
      modal.classList.remove("active");
    }
  });

  // ---------------------------
  // Video Skip Logic (if used)
  // ---------------------------
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

  adVideo.addEventListener("loadedmetadata", () => {
    const duration = adVideo.duration;
    if (duration > 30) {
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
});

/* ------------------------------
    RANDOM YOUTUBE AD LOADER
------------------------------- */

// Add your YouTube video IDs here
const youtubeVideos = [
  "https://youtu.be/qRYmz6k3bR8?si=PuLGmYgoI_pDbzwk",
  "https://youtu.be/eimI_VjnPA8?si=-TeQFAkGdU4g4BHJ",
  
];

// Load a random YouTube video
function loadRandomYoutubeAd() {
  const randomVideo = youtubeVideos[Math.floor(Math.random() * youtubeVideos.length)];
  const iframe = document.getElementById("adgateYoutube");

  iframe.src = `https://www.youtube.com/embed/${randomVideo}?autoplay=1&controls=1&rel=0`;
}

// When user clicks PLAY AD
document.getElementById("playAdVideo").addEventListener("click", () => {
  loadRandomYoutubeAd();

  // Only add skip after 30s if the video is long enough
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

  
  }
);
