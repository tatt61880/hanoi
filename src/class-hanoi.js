(function () {
  'use strict';

  class Hanoi {
    static minDisks = 2;
    static maxDisks = 14;

    constructor(num) {
      if (
        !Number.isInteger(num) ||
        num < Hanoi.minDisks ||
        num > Hanoi.maxDisks
      ) {
        throw new RangeError('円盤の枚数が範囲外です。');
      }
      this.num = num;
      this.step = 0;
      this.moves = [];
      this.towers = [Array.from({ length: num }, (_, i) => num - i), [], []];

      const addMoves = (disk, from, to, via) => {
        if (disk === 0) return;
        addMoves(disk - 1, from, via, to);
        this.moves.push({ disk, from, to });
        addMoves(disk - 1, via, to, from);
      };
      addMoves(num, 0, 2, 1);
    }

    get total() {
      return this.moves.length;
    }

    seek(target) {
      if (!Number.isInteger(target) || target < 0 || target > this.total) {
        throw new RangeError('手数が範囲外です。');
      }
      while (this.step < target) {
        const { from, to } = this.moves[this.step];
        this.towers[to].push(this.towers[from].pop());
        this.step++;
      }
      while (this.step > target) {
        this.step--;
        const { from, to } = this.moves[this.step];
        this.towers[from].push(this.towers[to].pop());
      }
    }
  }

  if (typeof window !== 'undefined') {
    window.app = window.app || {};
    window.app.Hanoi = Hanoi;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Hanoi;
  }
})();
