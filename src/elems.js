(function () {
  'use strict';

  if (typeof window !== 'undefined') {
    window.app = window.app || {};
    window.app.elems = {
      init,
    };
  }

  const elems = {
    svg: 'svg-board',
    speedInfo: 'speed-info',
    buttonReload: 'button-reload',
    buttonStart: 'button-start',
    buttonStop: 'button-stop',
    buttonSpeedDown: 'button-speeddown',
    buttonSpeedUp: 'button-speedup',
  };

  function init() {
    initElems(window.app.elems, elems);
    Object.freeze(window.app.elems);

    function initElems(obj, elems) {
      for (const key in elems) {
        const value = elems[key];
        if (typeof value === 'object') {
          obj[key] = {};
          initElems(obj[key], value);
        } else {
          obj[key] = document.getElementById(value);
          if (obj[key] === null) {
            console.error(`Elem not exist. [id=${value}]`);
          }
        }
      }
    }
  }
})();
