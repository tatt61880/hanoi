(function () {
  'use strict';

  const app = window.app;
  Object.freeze(app);

  const SVG_NS = 'http://www.w3.org/2000/svg';
  const speedMax = 64;
  const moveDuration = 640;
  const svgWidth = 480;
  const ringHeight = 10;
  const floorHeight = 10;
  const barWidth = 10;
  const ringWidthStep = 5;
  const xPos = [90, 240, 390];
  const towerNames = ['A', 'B', 'C'];
  const colors = [
    '#E60012',
    '#F39800',
    '#FFF100',
    '#8FC31F',
    '#009944',
    '#009E96',
    '#00A0E9',
    '#0068B7',
    '#1D2088',
    '#920783',
    '#E4007F',
    '#E5004F',
  ];

  const elems = new app.Elems({
    main: 'main',
    svg: 'svg-board',
    diskCount: 'disk-count',
    stepInfo: 'step-info',
    stepRange: 'step-range',
    moveInfo: 'move-info',
    speedInfo: 'speed-info',
    buttonReload: 'button-reload',
    buttonScaleDown: 'button-scale-down',
    buttonScaleUp: 'button-scale-up',
    buttonToggle: 'button-toggle',
    buttonSpeedDown: 'button-speeddown',
    buttonSpeedUp: 'button-speedup',
    buttonPrev: 'button-prev',
    buttonNext: 'button-next',
  });

  let hanoi;
  let speed = 0;
  let frameId = null;
  let lastTime = null;
  let elapsed = 0;
  let floorY;
  const elemRings = [];

  window.addEventListener('DOMContentLoaded', init, { once: true });

  function init() {
    elems.init();
    elems.main.addEventListener('touchend', preventDisabledButtonZoom, {
      capture: true,
      passive: false,
    });
    elems.buttonReload.addEventListener('click', () => seek(0));
    elems.buttonScaleDown.addEventListener('click', () => changeDisks(-1));
    elems.buttonScaleUp.addEventListener('click', () => changeDisks(1));
    elems.buttonToggle.addEventListener('click', toggle);
    elems.buttonSpeedDown.addEventListener('click', rewind);
    elems.buttonSpeedUp.addEventListener('click', fastForward);
    elems.buttonPrev.addEventListener('click', () => stepBy(-1));
    elems.buttonNext.addEventListener('click', () => stepBy(1));
    elems.stepRange.addEventListener('input', () =>
      seek(Number(elems.stepRange.value))
    );
    document.addEventListener('keydown', keydown);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) setSpeed(0);
    });
    window.addEventListener('pagehide', () => setSpeed(0));
    reset(12);
  }

  function preventDisabledButtonZoom(event) {
    if (
      event.touches.length === 0 &&
      event.changedTouches.length === 1 &&
      event.target instanceof Element &&
      event.target.closest('button:disabled')
    ) {
      // Keep taps on disabled buttons from becoming native zoom gestures.
      event.preventDefault();
    }
  }

  function reset(num) {
    cancelFrame();
    speed = 0;
    hanoi = new app.Hanoi(num);
    elems.diskCount.textContent = num;
    elems.stepRange.max = hanoi.total;
    drawBoard();
    render();
  }

  function changeDisks(delta) {
    const num = hanoi.num + delta;
    if (num < app.Hanoi.minDisks || num > app.Hanoi.maxDisks) return;
    reset(num);
  }

  function cancelFrame() {
    if (frameId !== null) window.cancelAnimationFrame(frameId);
    frameId = null;
    lastTime = null;
    elapsed = 0;
  }

  function setSpeed(nextSpeed) {
    cancelFrame();
    speed = nextSpeed;
    if (
      (speed < 0 && hanoi.step === 0) ||
      (speed > 0 && hanoi.step === hanoi.total)
    ) {
      speed = 0;
    }
    updateControls();
    if (speed !== 0) frameId = window.requestAnimationFrame(animate);
  }

  function toggle() {
    if (speed !== 0) {
      setSpeed(0);
      return;
    }
    if (hanoi.step === hanoi.total) seek(0);
    setSpeed(1);
  }

  function rewind() {
    let nextSpeed = -1;
    if (speed < 0) nextSpeed = Math.max(-speedMax, speed * 2);
    setSpeed(nextSpeed);
  }

  function fastForward() {
    let nextSpeed = 2;
    if (speed > 0) nextSpeed = Math.min(speedMax, speed * 2);
    setSpeed(nextSpeed);
  }

  function seek(target) {
    cancelFrame();
    speed = 0;
    hanoi.seek(Math.max(0, Math.min(hanoi.total, target)));
    render();
  }

  function stepBy(delta) {
    seek(hanoi.step + delta);
  }

  function animate(time) {
    frameId = null;
    if (lastTime !== null) elapsed += (time - lastTime) * Math.abs(speed);
    lastTime = time;
    const moves = Math.floor(elapsed / moveDuration);
    if (moves > 0) {
      elapsed %= moveDuration;
      const target = hanoi.step + Math.sign(speed) * moves;
      hanoi.seek(Math.max(0, Math.min(hanoi.total, target)));
      if (hanoi.step === 0 || hanoi.step === hanoi.total) speed = 0;
      render();
    }
    if (speed !== 0) frameId = window.requestAnimationFrame(animate);
  }

  function keydown(event) {
    if (
      event.altKey ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.isComposing
    ) {
      return;
    }
    if (
      event.target instanceof Element &&
      event.target.closest(
        'input, textarea, select, button, a, summary, [contenteditable]:not([contenteditable="false"])'
      )
    ) {
      return;
    }

    const actions = {
      ' ': toggle,
      r: () => seek(0),
      R: () => seek(0),
      ArrowLeft: rewind,
      ArrowRight: fastForward,
      ArrowUp: () => changeDisks(1),
      ArrowDown: () => changeDisks(-1),
      ',': () => stepBy(-1),
      '.': () => stepBy(1),
    };
    if (!Object.hasOwn(actions, event.key)) return;
    event.preventDefault();
    if (!event.repeat) actions[event.key]();
  }

  function updateControls() {
    const atStart = hanoi.step === 0;
    const atEnd = hanoi.step === hanoi.total;
    elems.buttonScaleDown.disabled = hanoi.num === app.Hanoi.minDisks;
    elems.buttonScaleUp.disabled = hanoi.num === app.Hanoi.maxDisks;
    elems.buttonPrev.disabled = atStart;
    elems.buttonNext.disabled = atEnd;
    elems.buttonSpeedDown.disabled = atStart || speed === -speedMax;
    elems.buttonSpeedUp.disabled = atEnd || speed === speedMax;
    let buttonText = '再生';
    let status = '停止中';
    if (atEnd) {
      buttonText = 'もう一度';
      status = '完了';
    }
    if (speed !== 0) {
      buttonText = '一時停止';
      status = `再生中 ${speed}倍速`;
      if (speed < 0) status = `早戻し ${Math.abs(speed)}倍速`;
    }
    elems.buttonToggle.textContent = buttonText;
    if (elems.speedInfo.textContent !== status) {
      elems.speedInfo.textContent = status;
    }
  }

  function render() {
    for (let tower = 0; tower < hanoi.towers.length; tower++) {
      hanoi.towers[tower].forEach((disk, index) => {
        elemRings[disk].setAttribute(
          'x',
          xPos[tower] - disk * ringWidthStep - barWidth / 2
        );
        elemRings[disk].setAttribute('y', floorY - ringHeight * (index + 1));
      });
    }
    const progress = `${hanoi.step.toLocaleString(
      'ja-JP'
    )} / ${hanoi.total.toLocaleString('ja-JP')}`;
    elems.stepInfo.textContent = progress;
    elems.stepRange.value = hanoi.step;
    elems.stepRange.setAttribute('aria-valuetext', `${progress} 手`);
    let nextMove = 'すべての円盤を右の棒へ移動しました。';
    if (hanoi.step < hanoi.total) {
      const { disk, from, to } = hanoi.moves[hanoi.step];
      nextMove = `次の手：円盤${disk}を ${towerNames[from]} → ${towerNames[to]}`;
    }
    elems.moveInfo.textContent = nextMove;
    const positions = hanoi.towers
      .map((tower, i) => {
        if (tower.length === 0) return `${towerNames[i]}：なし`;
        return `${towerNames[i]}：下から円盤${tower.join('、')}`;
      })
      .join('。');
    elems.svg.setAttribute(
      'aria-label',
      `${hanoi.num}枚のハノイの塔、${hanoi.step}手目。${positions}`
    );
    updateControls();
  }

  function svgElement(tag, attributes) {
    const element = document.createElementNS(SVG_NS, tag);
    for (const [name, value] of Object.entries(attributes)) {
      element.setAttribute(name, value);
    }
    return element;
  }

  function drawBoard() {
    elems.svg.replaceChildren();
    elemRings.length = 0;
    floorY = 20 + ringHeight * (hanoi.num + 1);
    const height = floorY + floorHeight + 30;
    elems.svg.setAttribute('viewBox', `0 0 ${svgWidth} ${height}`);
    elems.svg.setAttribute('height', height);
    elems.svg.appendChild(
      svgElement('rect', {
        x: 0,
        y: floorY,
        width: svgWidth,
        height: floorHeight,
        fill: '#aa8800',
      })
    );
    for (let i = 0; i < 3; i++) {
      elems.svg.appendChild(
        svgElement('rect', {
          x: xPos[i] - barWidth / 2,
          y: 20,
          width: barWidth,
          height: floorY - 20,
          fill: '#aa8800',
        })
      );
      const label = svgElement('text', {
        x: xPos[i],
        y: height - 8,
        'text-anchor': 'middle',
      });
      label.textContent = towerNames[i];
      elems.svg.appendChild(label);
    }
    for (let disk = hanoi.num; disk >= 1; disk--) {
      const ring = svgElement('rect', {
        width: barWidth + 2 * disk * ringWidthStep,
        height: ringHeight,
        fill: colors[(disk - 1) % colors.length],
        'data-disk': disk,
      });
      const title = svgElement('title', {});
      title.textContent = `円盤${disk}`;
      ring.appendChild(title);
      elemRings[disk] = ring;
      elems.svg.appendChild(ring);
    }
  }
})();
