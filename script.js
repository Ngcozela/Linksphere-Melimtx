function openCollection(num) {
  alert("Opening Collection " + num + "...");
  // In the future, you could redirect to another page:
  // window.location.href = `collection${num}.html`;
}
/*Age Verification Pop-Up*/
document.addEventListener("DOMContentLoaded", () => {
  const popup = document.getElementById("age-popup");
  const confirmBtn = document.getElementById("confirm-age");

  // Check if the user has already confirmed age
  const verified = localStorage.getItem("ageVerified");

  if (!verified) {
    popup.classList.add("active");
  }

  confirmBtn.addEventListener("click", () => {
    localStorage.setItem("ageVerified", "true");
    popup.classList.remove("active");
  });
});
