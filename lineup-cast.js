/* =========================================================
   라인업 캐스트 랜딩페이지 — JavaScript
   페이지 스크롤에 따라 캐스트 이미지가 수평으로 이동
   ========================================================= */
(function () {
  'use strict';

  var reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  var prefersReduce = reduceMQ.matches;

  var carousel = document.querySelector('.cast-carousel');
  var sticky = carousel ? carousel.querySelector('.cast-carousel__sticky') : null;
  var carouselContainer = carousel ? carousel.querySelector('.cast-carousel__container') : null;
  var carouselImg = carousel ? carousel.querySelector('.cast-carousel__img') : null;

  if (!carousel || !sticky || !carouselContainer || !carouselImg) return;

  /* ---------------------------------------------------------
     수평 스크롤 — 트랙을 스크롤하는 동안 이미지가 좌 → 우로 이동
     --------------------------------------------------------- */
  /* 가로 1px을 미는 데 쓰는 세로 스크롤 양.
     1 = 손가락이 움직인 만큼 이미지가 움직인다. 키우면 느긋해지고, 줄이면 빨라진다. */
  var PACE = 1.25;

  var ticking = false;
  var maxScroll = 0;

  /* 가로로 밀어야 할 거리만큼 트랙 높이를 잡는다.
     넘치는 폭이 없으면(=이미지가 화면보다 좁으면) 트랙은 한 화면으로 줄인다. */
  function measure() {
    var overflow = carouselImg.offsetWidth - sticky.clientWidth;
    maxScroll = Math.max(0, overflow);
    carousel.style.setProperty(
      '--track-h', (sticky.clientHeight + maxScroll * PACE) + 'px');
  }

  function updateCarouselScroll() {
    ticking = false;
    if (prefersReduce) return;

    // 트랙 안에서 얼마나 내려왔는지 (0 ~ 1)
    var travel = carousel.offsetHeight - sticky.clientHeight;
    var progress = travel > 0 ? -carousel.getBoundingClientRect().top / travel : 0;
    progress = Math.max(0, Math.min(1, progress));

    carouselContainer.style.transform =
      'translate3d(' + (-progress * maxScroll).toFixed(2) + 'px, 0, 0)';
  }

  function requestFrame() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateCarouselScroll);
  }

  function remeasure() {
    measure();
    requestFrame();
  }

  if (!prefersReduce) {
    measure();
    window.addEventListener('scroll', requestFrame, { passive: true });
    window.addEventListener('resize', remeasure, { passive: true });
    window.addEventListener('load', remeasure);
    if (!carouselImg.complete) {
      carouselImg.addEventListener('load', remeasure, { once: true });
    }
    requestFrame();
  }

  /* 사용자가 도중에 모션 최소화를 켜면 즉시 정지 */
  function handleMotionChange() {
    prefersReduce = reduceMQ.matches;
    if (prefersReduce) {
      carouselContainer.style.transform = '';
      carousel.style.removeProperty('--track-h');
    } else {
      remeasure();
    }
  }

  if (typeof reduceMQ.addEventListener === 'function') {
    reduceMQ.addEventListener('change', handleMotionChange);
  } else if (typeof reduceMQ.addListener === 'function') {
    reduceMQ.addListener(handleMotionChange);
  }
})();
