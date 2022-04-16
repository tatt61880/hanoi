'use strict';
const version = 'Version: 2022.04.16';
const SVG_NS = 'http://www.w3.org/2000/svg';

window.addEventListener('load', init, false);
const num = 12;
let step = 0;
let stepPrev = 0;
let speed = 0;
const speedStep = 32;

function init(e) {
  const elemSvg = document.getElementById('svgBoard');
  const elemStart = document.getElementById('buttonStart');
  const elemStop = document.getElementById('buttonStop');
  const elemSpeedUp = document.getElementById('buttonSpeedUp');

  elemStart.addEventListener('click', function() {
    speed = 1;
    elemStop.style.display = 'block';
    elemStart.style.display = 'none'
  }, false);

  elemStop.addEventListener('click', function() {
    speed = 0;
    elemStop.style.display = 'none';
    elemStart.style.display = 'block'
  }, false);

  elemSpeedUp.addEventListener('click', function() {
    switch (speed) {
    case 1:
      step 
      speed = 2;
      break;
    case 2:
      speed = 4;
      break;
    case 4:
      speed = 8;
      break;
    case 8:
      speed = 16;
      break;
    default:
      speed = 2;
      break;
    }
    step = step - step % speedStep;
    console.log(`${speed} ${step} ${step % speedStep}`);
  }, false);

  const array = [];
  function hanoi(n, f, t, v)
  {
    if (n > 0) {
      hanoi(n - 1, f, v, t);
      array.push([f, t]);
      hanoi(n - 1 , v, t, f);
    }
  }

  hanoi(num, 0, 2, 1);

  const statesArray = [[], [], []];
  statesArray[0] = Array.from(new Array(num), (_, i) => (i + 1)).reverse(); // num, num-1, ..., 2, 1
  draw(elemSvg, statesArray);
  stepPrev = step;

  setTimeout(function() {
    let i = 0;
    let id = setInterval(function() {
      step += speed;
      if (step != stepPrev && step % speedStep == 0) {
        stepPrev = step;
        const from = array[i][0];
        const to = array[i][1];

        const val = statesArray[from][statesArray[from].length - 1];
        statesArray[from].pop();
        statesArray[to].push(val);
        draw(elemSvg, statesArray);

        i++;
        if (i == array.length) {
          clearInterval(id);
        }
      }
    }, 20);
  }, 500);
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
    let colorId = 0;
    // リング
    for (const state of states) {
      const rect = createRect({x: x - state * width, y: y, width: 10 + width * (2 * state), height: 10});
      rect.setAttribute('fill', colors[(state - 1) % colors.length]);
      g.appendChild(rect);
      y -= 10;
      colorId++;
    }
  }

  {
    const text = document.createElementNS(SVG_NS, 'text');
    text.setAttribute('x', 10);
    text.setAttribute('y', 20);
    text.appendChild(document.createTextNode(`${step / speedStep}手目`));
    g.appendChild(text);
  }
  elemSvg.appendChild(g);
}
