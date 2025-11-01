function openCollection(num) {
  console.log("Clicked collection:", num);
  alert("Opening Collection " + num + "...");
  // window.location.href = `collection${num}.html`;
}
/*Section scrolling script*/
document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.collections-container');
  const leftArrow = document.querySelector('.left-arrow');
  const rightArrow = document.querySelector('.right-arrow');

  let scrollInterval;

  function startScroll(direction) {
    stopScroll();
    scrollInterval = setInterval(() => {
      container.scrollLeft += direction === 'right' ? 8 : -8;
    }, 10);
  }

  function stopScroll() {
    clearInterval(scrollInterval);
  }

  leftArrow.addEventListener('mouseenter', () => startScroll('left'));
  rightArrow.addEventListener('mouseenter', () => startScroll('right'));
  leftArrow.addEventListener('mouseleave', stopScroll);
  rightArrow.addEventListener('mouseleave', stopScroll);
});
