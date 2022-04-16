(function() {
  'use strict';
  const version = 'Version: 2022.04.17';
  const SVG_NS = 'http://www.w3.org/2000/svg';

  window.addEventListener('load', init, false);
  const num = 12;
  const speedStep = 64;
  const interval = 10;

  let step = 0;
  let stepPrev = 0;
  let speed = 0;

  let elemSpeedInfo;

  let elemStop;
  let elemStart;
  let elemSpeedDown;
  let elemSpeedUp;

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
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('width', '120');
    svg.setAttribute('height', '60');
    for (const child of elem.childNodes) {
      const elem = child.cloneNode(true);
      svg.appendChild(elem);
    }
    if (Math.abs(speed) > 1) {
      const text = document.createElementNS(SVG_NS, 'text');
      text.setAttribute('x', 65);
      text.setAttribute('y', 40);
      text.appendChild(document.createTextNode(`x${Math.abs(speed)}`));
      svg.appendChild(text);
    }
    svg.setAttribute('transform', 'scale(0.5 0.5)');
    elemSpeedInfo.appendChild(svg);
  }

  function stop() {
    elemStop.style.display = 'none';
    elemStart.style.display = 'block';
    speed = 0;
    updateSpeedInfo();
  }

  function init() {
    document.getElementById('versionInfo').innerText = version;

    const elemSvg = document.getElementById('svgBoard');
    elemSpeedInfo = document.getElementById('speedInfo');
    elemStart = document.getElementById('buttonStart');
    elemStop = document.getElementById('buttonStop');
    elemSpeedDown = document.getElementById('buttonSpeedDown');
    elemSpeedUp = document.getElementById('buttonSpeedUp');

    elemStart.addEventListener('click', function() {
      elemStop.style.display = 'block';
      elemStart.style.display = 'none';
      speed = 1;
      updateSpeedInfo();
    }, false);

    elemStop.addEventListener('click', stop, false);

    elemSpeedDown.addEventListener('click', function() {
      elemStop.style.display = 'block';
      elemStart.style.display = 'none';
      switch (speed) {
      case -1:
      case -2:
      case -4:
      case -8:
      case -16:
      case -32:
        speed *= 2;
        break;
      default:
        speed = -1;
        break;
      }
      while (step % speed != 0) step++;
      updateSpeedInfo();
    }, false);

    elemSpeedUp.addEventListener('click', function() {
      elemStop.style.display = 'block';
      elemStart.style.display = 'none';
      switch (speed) {
      case 1:
      case 2:
      case 4:
      case 8:
      case 16:
      case 32:
        speed *= 2;
        break;
      default:
        speed = 2;
        break;
      }
      step = step - step % speed;
      updateSpeedInfo();
    }, false);

    const array = [];
    function hanoi(n, f, t, v)
    {
      if (n > 0) {
        hanoi(n - 1, f, v, t);
        array.push([f, t]);
        hanoi(n - 1, v, t, f);
      }
    }

    hanoi(num, 0, 2, 1);

    const statesArray = [[], [], []];
    statesArray[0] = Array.from(new Array(num), (_, i) => i + 1).reverse(); // num, num-1, ..., 2, 1
    draw(elemSvg, statesArray);
    stepPrev = step;

    updateSpeedInfo();

    {
      let i = 0;
      window.setInterval(function() {
        step += speed;
        if (step > array.length * speedStep) {
          stop();
          step = array.length * speedStep;
        }
        if (step < 0) {
          stop();
          step = 0;
        }
        if (step != stepPrev && step % speedStep == 0) {
          stepPrev = step;
          if (speed > 0) {
            if (i != array.length) {
              const from = array[i][0];
              const to = array[i][1];

              const val = statesArray[from][statesArray[from].length - 1];
              statesArray[from].pop();
              statesArray[to].push(val);
              draw(elemSvg, statesArray);

              i++;
            }
          } else {
            if (i != 0) {
              i--;

              const from = array[i][1];
              const to = array[i][0];

              const val = statesArray[from][statesArray[from].length - 1];
              statesArray[from].pop();
              statesArray[to].push(val);
              draw(elemSvg, statesArray);
            }
          }
        }
      }, interval);
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

  function draw(elemSvg, statesArray) {
    while (elemSvg.firstChild) {
      elemSvg.removeChild(elemSvg.firstChild);
    }
    const g = document.createElementNS(SVG_NS, 'g');
    const svgWidth = 500;
    const svgHeight = 50 + 10 * num;
    elemSvg.style.width = svgWidth;
    elemSvg.style.height = svgHeight;

    // 床
    {
      const rect = createRect({x: 0, y: svgHeight - 10, width: svgWidth, height: 10});
      rect.setAttribute('fill', '#a80');
      g.appendChild(rect);
    }
    for (let i = 0; i < 3; ++i) {
      const x = 100 + 150 * i - 5;
      // 棒
      {
        const rect = createRect({x: x, y: svgHeight - 20 - num * 10, width: 10, height: (num + 1) * 10});
        rect.setAttribute('fill', '#a80');
        g.appendChild(rect);
      }

      const states = statesArray[i];
      let y = svgHeight - 10 - 10;
      const width = 5;
      // リング
      for (const state of states) {
        const rect = createRect({x: x - state * width, y: y, width: 10 + width * (2 * state), height: 10});
        rect.setAttribute('fill', colors[(state - 1) % colors.length]);
        g.appendChild(rect);
        y -= 10;
      }
    }

    {
      const text = document.createElementNS(SVG_NS, 'text');
      text.setAttribute('x', 15);
      text.setAttribute('y', 20);
      text.appendChild(document.createTextNode(`${step / speedStep}手目`));
      g.appendChild(text);
    }
    elemSvg.appendChild(g);
  }
})();
