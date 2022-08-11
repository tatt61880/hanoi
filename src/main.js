(function() {
  'use strict';
  const version = 'Version: 2022.08.11';

  const SVG_NS = 'http://www.w3.org/2000/svg';

  const num = 12;
  const speedMax = 64;
  const speedStep = 64;
  const interval = 10;

  let step = 0;
  let stepPrev = 0;
  let speed = 0;

  let elemReload;
  let elemSpeedInfo;
  let elemStep;

  let svgHeight;
  const floorHeight = 10;
  const barWidth = 10;
  const ringWidthStep = 5;
  const ringHeight = 10;
  let elemRings = [];
  let xPos = [];

  let elemSvg;
  let elemStop;
  let elemStart;
  let elemSpeedDown;
  let elemSpeedUp;

  let setIntervalId;

  window.addEventListener('load', init, false);

  function keydown(e) {
    if (e.key == ' ') {
      if (speed != 1) {
        start();
      } else {
        stop();
      }
    } else if (e.key == 'r') {
      reload();
    } else if (e.key == 'ArrowLeft') {
      speedDown();
    } else if (e.key == 'ArrowRight') {
      speedUp();
    }
  }

  function updateSpeedInfo() {
    let elem;
    if (speed < 0) {
      elem = elemSpeedDown;
    } else if (speed == 0) {
      elem = elemStop;
    } else if (speed == 1) {
      elem = elemStart;
    } else {
      elem = elemSpeedUp;
    }
    while (elemSpeedInfo.firstChild) {
      elemSpeedInfo.removeChild(elemSpeedInfo.firstChild);
    }
    const g = document.createElementNS(SVG_NS, 'g');
    for (const child of elem.childNodes) {
      const elem = child.cloneNode(true);
      g.appendChild(elem);
    }
    if (Math.abs(speed) > 1) {
      const text = document.createElementNS(SVG_NS, 'text');
      text.setAttribute('x', 65);
      text.setAttribute('y', 40);
      text.appendChild(document.createTextNode(`x${Math.abs(speed)}`));
      g.appendChild(text);
    }
    g.setAttribute('transform', 'scale(0.5 0.5)');
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('width', '60');
    svg.setAttribute('height', '30');
    svg.appendChild(g);
    elemSpeedInfo.appendChild(svg);
  }

  function reload() {
    window.clearInterval(setIntervalId);
    reset();
  }

  function start() {
    if (step / speedStep == 2 ** num - 1) return;
    showElem(elemSpeedDown);
    showElem(elemStop);
    hideElem(elemStart);
    speed = 1;
    updateSpeedInfo();
  }

  function stop() {
    hideElem(elemStop);
    showElem(elemStart);
    speed = 0;
    updateSpeedInfo();
  }

  function speedDown() {
    hideElem(elemStop);
    showElem(elemStart);
    showElem(elemSpeedUp);
    if (speed < 0 && speed != -speedMax) {
      speed *= 2;
    } else {
      speed = -1;
    }
    while (step % speed != 0) step++;
    updateSpeedInfo();
  }

  function speedUp() {
    showElem(elemSpeedDown);
    hideElem(elemStop);
    showElem(elemStart);
    if (speed > 1 && speed != speedMax) {
      speed *= 2;
    } else {
      speed = 2;
    }
    step = step - step % speed;
    updateSpeedInfo();
  }

  function init() {
    document.getElementById('version').innerText = version;

    elemSvg = document.getElementById('svg-board');
    elemReload = document.getElementById('button-reload');
    elemSpeedInfo = document.getElementById('speed-info');
    elemStart = document.getElementById('button-start');
    elemStop = document.getElementById('button-stop');
    elemSpeedDown = document.getElementById('button-speeddown');
    elemSpeedUp = document.getElementById('button-speedup');

    document.addEventListener('keydown', keydown, false);

    elemReload.addEventListener('click', reload, false);
    elemStart.addEventListener('click', start, false);
    elemStop.addEventListener('click', stop, false);
    elemSpeedDown.addEventListener('click', speedDown, false);
    elemSpeedUp.addEventListener('click', speedUp, false);

    reset();
  }

  function reset() {
    const stepArray = [];
    function hanoi(n, f, t, v) {
      if (n > 0) {
        hanoi(n - 1, f, v, t);
        stepArray.push({from: f, to: t});
        hanoi(n - 1, v, t, f);
      }
    }

    hanoi(num, 0, 2, 1);

    const statesArray = [[], [], []];
    statesArray[0] = Array.from(new Array(num), (_, i) => i + 1).reverse(); // num, num-1, ..., 2, 1

    hideElem(elemSpeedDown);
    stop();
    step = 0;
    stepPrev = step;
    svgUpdateByArray(elemSvg, statesArray);

    updateSpeedInfo();

    {
      let i = 0;
      setIntervalId = window.setInterval(function() {
        step += speed;
        if (step < 0) {
          stop();
          hideElem(elemSpeedDown);
          step = 0;
        }
        if (step > stepArray.length * speedStep) {
          stop();
          hideElem(elemSpeedUp);
          hideElem(elemStart);
          step = stepArray.length * speedStep;
        }
        if (step != stepPrev && step % speedStep == 0) {
          stepPrev = step;
          if (speed > 0) {
            if (i != stepArray.length) {
              moveRing(stepArray[i].from, stepArray[i].to);
              i++;
            }
          } else {
            if (i != 0) {
              i--;
              moveRing(stepArray[i].to, stepArray[i].from);
            }
          }
        }
      }, interval);
    }

    function moveRing(from, to) {
      const state = statesArray[from].pop();
      statesArray[to].push(state);
      elemRings[state].setAttribute('x', xPos[to] - state * ringWidthStep - barWidth / 2);
      elemRings[state].setAttribute('y', svgHeight - floorHeight - ringHeight * statesArray[to].length);
      elemStep.innerHTML = `${step / speedStep}手目`;
    }
  }

  function createRect(param) {
    const rect = document.createElementNS(SVG_NS, 'rect');
    rect.setAttribute('x', param.x);
    rect.setAttribute('y', param.y);
    rect.setAttribute('width', param.width);
    rect.setAttribute('height', param.height);
    return rect;
  }

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

  function svgUpdateByArray(elemSvg, statesArray) {
    elemSvg.textContent = '';
    const g = document.createElementNS(SVG_NS, 'g');
    const svgWidth = 480;
    svgHeight = 30 + ringHeight * (num + 1) + floorHeight;
    elemSvg.style.width = svgWidth;
    elemSvg.style.height = svgHeight;

    // 床
    {
      const rect = createRect({x: 0, y: svgHeight - floorHeight, width: svgWidth, height: floorHeight});
      rect.setAttribute('fill', '#a80');
      g.appendChild(rect);
    }

    for (let i = 0; i < 3; ++i) {
      xPos[i] = svgWidth / 2 + 150 * (i - 1);
    }

    // 棒
    for (let i = 0; i < 3; ++i) {
      const rect = createRect({x: xPos[i] - barWidth / 2, y: svgHeight - floorHeight - (num + 1) * ringHeight, width: barWidth, height: (num + 1) * ringHeight});
      rect.setAttribute('fill', '#a80');
      g.appendChild(rect);
    }

    // リング
    for (let i = 0; i < 3; ++i) {
      let y = svgHeight - floorHeight - ringHeight;
      for (const state of statesArray[i]) {
        const rect = createRect({x: xPos[i] - state * ringWidthStep - barWidth / 2, y: y, width: barWidth + ringWidthStep * (2 * state), height: ringHeight});
        rect.setAttribute('fill', colors[(state - 1) % colors.length]);
        elemRings[state] = rect;
        g.appendChild(rect);
        y -= ringHeight;
      }
    }

    {
      elemStep = document.createElementNS(SVG_NS, 'text');
      elemStep.setAttribute('x', 15);
      elemStep.setAttribute('y', 20);
      elemStep.innerHTML = `${step / speedStep}手目`;
      g.appendChild(elemStep);
    }
    elemSvg.appendChild(g);
  }

  function showElem(elem) {
    if (elem === undefined) return;
    elem.style.display = 'block';
  }

  function hideElem(elem) {
    if (elem === undefined) return;
    elem.style.display = 'none';
  }
})();
