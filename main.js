/* =========================================================
   캐스트 랜딩 — main.js

   스크롤 한 축에 두 구간을 잇는다.

     1) 팬   : 화면을 가득 채운 채 좌 → 우로 밀린다
     2) 줌아웃: 다 밀면 카메라가 뒤로 빠지며 이미지 전체가 드러난다

   이미지의 '기준 크기'는 CSS에서 폭 100%(=화면 폭)다. 그게 곧 scale(1),
   즉 마지막에 보여줄 전체 모습이다. 팬 구간에서는 화면 높이를 채우도록
   scale 을 S배 키워 두고, 줌아웃 구간에서 S → 1 로 되돌린다.

   축소되면 이미지 밑에 화면 여백이 생기므로, 아래 이미지(.lineup-full)를
   그 밑변에 붙여 같이 끌어올린다. 덕분에 어느 순간에도 배경만 보이는 띠가 없다.
   ========================================================= */
(function () {
  'use strict';

  var reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  var prefersReduce = reduceMQ.matches;

  var carousel = document.querySelector('.cast-carousel');
  var sticky = carousel ? carousel.querySelector('.cast-carousel__sticky') : null;
  var stage = carousel ? carousel.querySelector('.cast-carousel__stage') : null;
  var img = carousel ? carousel.querySelector('.cast-carousel__img') : null;
  var below = document.querySelector('.lineup-full');

  if (!carousel || !sticky || !stage || !img) return;

  /* 가로 1px을 미는 데 쓰는 세로 스크롤 양.
     1 = 손가락이 움직인 만큼 이미지가 움직인다. 키우면 느긋해진다. */
  var PACE = 1.25;

  /* 줌아웃에 쓰는 스크롤 = 화면 높이 × 이 값. 키우면 더 천천히 빠진다. */
  var ZOOM_SCREENS = 0.9;

  var ticking = false;

  /* measure() 가 채우는 값들 */
  var vw = 0;          // 화면 폭
  var vh = 0;          // 화면 높이
  var baseH = 0;       // scale(1)일 때의 이미지 높이 = 전체가 보이는 높이
  var scaleMax = 1;    // 팬 구간의 확대 배율 (S)
  var panPx = 0;       // 가로로 밀어야 할 거리
  var panScroll = 0;   // 팬에 배정한 세로 스크롤
  var zoomScroll = 0;  // 줌아웃에 배정한 세로 스크롤
  var tail = 0;        // 마지막 상태에서 이미지 밑에 남는 화면 여백

  function measure() {
    vw = sticky.clientWidth;
    vh = sticky.clientHeight;
    baseH = img.offsetHeight;

    // 화면 높이를 채우려면 몇 배 키워야 하나.
    // 1 이하면(이미 화면보다 높으면) 밀 것도 뺄 것도 없다.
    scaleMax = baseH > 0 ? vh / baseH : 1;
    if (!isFinite(scaleMax) || scaleMax < 1) scaleMax = 1;

    // 확대하면 폭이 vw × S 가 되므로, 화면 밖으로 넘치는 폭은 vw × (S - 1)
    panPx = vw * (scaleMax - 1);
    panScroll = panPx * PACE;
    zoomScroll = panPx > 0 ? vh * ZOOM_SCREENS : 0;

    carousel.style.setProperty('--track-h', (vh + panScroll + zoomScroll) + 'px');

    /* 마지막 상태에서 이미지 밑에 남는 여백만큼 아래 이미지를 레이아웃째로 끌어올린다.
       음수 margin-top 이라야 문서 높이도 같이 줄어든다
       (margin-bottom 으로는 스크롤 높이가 줄지 않아 문서 끝에 빈 칸이 남는다).
       스크롤 도중 바뀌면 문서 길이가 출렁이므로 여기서 한 번만 잡는다. */
    tail = vh - baseH;
    if (tail < 0) tail = 0;
    if (below) below.style.marginTop = -tail + 'px';
  }

  function update() {
    ticking = false;
    if (prefersReduce) return;

    var rect = carousel.getBoundingClientRect();
    var scrolled = -rect.top;
    if (scrolled < 0) scrolled = 0;

    var scale, tx;

    if (panPx <= 0) {
      /* 화면이 이미지보다 옆으로 넓다 — 처음부터 전체가 보이는 게 맞다 */
      scale = 1;
      tx = 0;
    } else if (scrolled < panScroll) {
      /* 1) 팬 — 배율은 고정, 좌측 끝에서 우측 끝까지 민다.
         scale(S) 를 가운데 기준으로 걸면 좌측 끝이 vw(1-S)/2 에 놓이므로,
         거기서 +panPx/2 하면 화면 왼쪽 끝에 딱 맞는다. */
      scale = scaleMax;
      tx = panPx / 2 - (scrolled / panScroll) * panPx;
    } else {
      /* 2) 줌아웃 — 오른쪽 끝을 붙들어 둔 채 S → 1 로 되돌린다.
         tx = vw(1-scale)/2 는 배율이 1이 되는 순간 0이 되므로,
         끝나는 자리가 자연스럽게 화면 정중앙이다.
         배율은 로그로 보간해야 빠지는 속도가 고르게 보인다. */
      var q = zoomScroll > 0 ? (scrolled - panScroll) / zoomScroll : 1;
      if (q > 1) q = 1;
      scale = Math.pow(scaleMax, 1 - q);
      tx = vw * (1 - scale) / 2;
    }

    img.style.transform =
      'translate3d(' + tx.toFixed(2) + 'px, 0, 0) scale(' + scale.toFixed(4) + ')';

    /* 아래 이미지의 윗변을 메인 이미지의 밑변에 붙인다.
       둘 다 화면 기준으로 계산한다 — 섹션 기준으로 재면 고정이 풀리기 전까지
       둘 사이에 배경 띠가 남는다.
       섹션 밑변이 화면 밑변보다 올라온 뒤(=고정이 풀린 뒤)에는
       더 따라가지 않도록 화면 높이에서 멈춘다. 그 순간 보정값이 정확히 0이 되어
       이후로는 음수 margin 만으로 붙어 있는다. */
    if (below) {
      var sectionBottom = rect.bottom < vh ? vh : rect.bottom;
      var naturalTop = sectionBottom - tail;
      below.style.setProperty('--shift', (baseH * scale - naturalTop).toFixed(2) + 'px');
    }
  }

  function requestFrame() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  }

  /* 첫 화면은 rAF를 기다리지 않고 바로 그린다.
     한 프레임이라도 scale(1)(=전체가 보이는 상태)이 비치면 깜빡임으로 보인다. */
  function remeasure() {
    measure();
    update();
  }

  if (!prefersReduce) {
    remeasure();
    window.addEventListener('scroll', requestFrame, { passive: true });
    window.addEventListener('resize', remeasure, { passive: true });
    window.addEventListener('load', remeasure);
    if (!img.complete) img.addEventListener('load', remeasure, { once: true });
  }

  /* 도중에 모션 최소화를 켜면 전체 모습으로 되돌리고 트랙을 접는다 */
  function handleMotionChange() {
    prefersReduce = reduceMQ.matches;
    if (prefersReduce) {
      img.style.transform = '';
      carousel.style.removeProperty('--track-h');
      if (below) {
        below.style.removeProperty('--shift');
        below.style.marginTop = '';
      }
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
