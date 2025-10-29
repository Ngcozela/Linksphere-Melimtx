function openCollection(num) {
  alert("Opening Collection " + num + "...");
  // In the future, you could redirect to another page:
  // window.location.href = `collection${num}.html`;
}
function openCollection(id) {
  const links = {
    1: "https://mega.nz/folder/yfZ2AaoQ#zTF7PfZWA76b4xEXkzsOFw",
    2: "https://mega.nz/folder/TfB1yJoK#Syn3y_p-VGQ43D99TPiJ1g",
    3: "https://mega.nz/folder/CWgAmSpS#Tw4s30Hg6Yiw_BrmSj9zJA",
    4: "https://mega.nz/folder/DXg3yIrZ#uqXVAUjtjdWuNeYJeBzOrA",
    5: "https://mega.nz/folder/PKJQEDhK#Dcp7IfThNt1LyZG5yqI-Eg",
    6: "https://mega.nz/folder/qLJhlZaY#GHokgrQWUwgxrITUvj0yHg",
    7: "https://mega.nz/folder/6DpTTDYI#I2vX9ITM6g4jdg588M50rQ",
    8: "https://mega.nz/folder/LbowTBTY#IiMDk54kU6ezraACqWS4NQ",
    9: "https://mega.nz/folder/iKoXASwR#oN92zfZK7I1ZespC3Hj0Sg",
    10: "https://mega.nz/folder/rP5kADLJ#0JaCHCcUR7R6TH72EVKB_Q",
  };

  // Open link for the clicked tab
  if (links[id]) {
    window.open(links[id], "_blank");
  }
}
function openCollection(id) {
  // Redirects to checkpoint, telling it which collection was clicked
  window.location.href = `choice.html?collection=${id}`;
}

// --- SMART EDGE SCROLL (only active when hovering over collections) ---
const row = document.getElementById("collectionsRow");
let scrollSpeed = 0;
let scrolling = false;
let isHovering = false;

// Detect when mouse enters or leaves the collections section
row.addEventListener("mouseenter", () => (isHovering = true));
row.addEventListener("mouseleave", () => {
  isHovering = false;
  scrolling = false;
});

// Listen for mouse movement ONLY while hovering over the section
document.addEventListener("mousemove", (e) => {
  if (!isHovering) return; // ignore movements outside the section

  const edgeZone = 100; // px from edges that trigger scroll
  const sectionBounds = row.getBoundingClientRect();
  const mouseX = e.clientX;

  // Determine if cursor is near the section edges
  if (mouseX < sectionBounds.left + edgeZone && mouseX > sectionBounds.left) {
    // Left edge → scroll left
    scrollSpeed = -10 * (1 - (mouseX - sectionBounds.left) / edgeZone);
    scrolling = true;
  } else if (
    mouseX > sectionBounds.right - edgeZone &&
    mouseX < sectionBounds.right
  ) {
    // Right edge → scroll right
    scrollSpeed = 10 * ((mouseX - (sectionBounds.right - edgeZone)) / edgeZone);
    scrolling = true;
  } else {
    scrollSpeed = 0;
    scrolling = false;
  }
});

// Smooth scroll loop
function autoScroll() {
  if (scrolling && row) {
    row.scrollLeft += scrollSpeed;
  }
  requestAnimationFrame(autoScroll);
}
autoScroll();
