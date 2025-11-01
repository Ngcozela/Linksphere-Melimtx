function openCollection(num) {
  alert("Opening Collection " + num + "...");
  // In the future, you could redirect to another page:
  // window.location.href = `collection${num}.html`;
}

console.log("Clicked collection:", num);

/*Scroll bar script*/
const container = document.querySelector('.collections-container');
const leftArrow = document.querySelector('.left-arrow');
const rightArrow = document.querySelector('.right-arrow');

let scrollInterval;

// Smooth continuous scroll on hover
function startScroll(direction) {
  stopScroll();
  scrollInterval = setInterval(() => {
    container.scrollLeft += direction === 'right' ? 8 : -8;
  }, 10); // smaller interval = smoother scroll
}

function stopScroll() {
  clearInterval(scrollInterval);
}

// Arrow hover control
leftArrow.addEventListener('mouseenter', () => startScroll('left'));
rightArrow.addEventListener('mouseenter', () => startScroll('right'));
leftArrow.addEventListener('mouseleave', stopScroll);
rightArrow.addEventListener('mouseleave', stopScroll);

// Optional: stop scrolling if user clicks anywhere else
document.addEventListener('mouseleave', stopScroll);
