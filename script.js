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

// --- AGE VERIFICATION POPUP (only once per visit) ---
window.addEventListener("load", function () {
  const modal = document.getElementById("age-modal");
  const enterBtn = document.getElementById("enter-btn");
  const leaveBtn = document.getElementById("leave-btn");

  // Check if the user has already verified their age
  const verified = localStorage.getItem("ageVerified");

  if (!verified) {
    // Show the popup only if not yet verified
    modal.style.display = "flex";
  }

  enterBtn.addEventListener("click", function () {
    localStorage.setItem("ageVerified", "true"); // remember verification
    modal.style.display = "none"; // hide popup
  });

  leaveBtn.addEventListener("click", function () {
    alert("You must be 18+ to enter this site.");
    window.location.href = "https://www.google.com";
  });
});

