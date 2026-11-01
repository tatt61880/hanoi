const assert = require('node:assert/strict');
const test = require('node:test');
const Hanoi = require('../src/class-hanoi.js');

function checkTowers(hanoi) {
  const disks = hanoi.towers.flat();
  assert.equal(disks.length, hanoi.num);
  assert.equal(new Set(disks).size, hanoi.num);
  for (const tower of hanoi.towers) {
    for (let i = 1; i < tower.length; i++) {
      assert.ok(
        tower[i - 1] > tower[i],
        '大きい円盤を小さい円盤の上に置かない'
      );
    }
  }
}

for (let num = 2; num <= 14; num++) {
  test(`${num}枚：全手順を合法に往復し、最短手数で完成する`, () => {
    const hanoi = new Hanoi(num);
    const stack = Array.from({ length: num }, (_, i) => num - i);
    assert.equal(hanoi.total, 2 ** num - 1);
    assert.deepEqual(hanoi.towers, [stack, [], []]);
    for (let step = 1; step <= hanoi.total; step++) {
      const before = hanoi.towers.map((tower) => [...tower]);
      hanoi.seek(step);
      checkTowers(hanoi);
      // 1手では一番上の円盤1枚だけが別の棒へ移る。
      const changed = before.map(
        (tower, i) => tower.length - hanoi.towers[i].length
      );
      assert.deepEqual([...changed].sort(), [-1, 0, 1]);
      const from = changed.indexOf(1);
      const to = changed.indexOf(-1);
      assert.equal(before[from].at(-1), hanoi.towers[to].at(-1));
      assert.deepEqual(before[from].slice(0, -1), hanoi.towers[from]);
      assert.deepEqual(before[to], hanoi.towers[to].slice(0, -1));
    }
    assert.deepEqual(hanoi.towers, [[], [], stack]);
    for (let step = hanoi.total - 1; step >= 0; step--) {
      hanoi.seek(step);
      checkTowers(hanoi);
    }
    assert.deepEqual(hanoi.towers, [stack, [], []]);
    assert.equal(hanoi.step, 0);
  });
}

test('任意の位置への移動と方向の切り替えでも状態が一致する', () => {
  const hanoi = new Hanoi(14);
  for (const target of [
    8191, 1, 16383, 12000, 12000, 17, 8192, 0, 16382, 4095,
  ]) {
    hanoi.seek(target);
    checkTowers(hanoi);
    const expected = [[], [], []];
    // 各円盤の移動回数と向きから、再帰手順とは独立に位置を求める。
    for (let disk = hanoi.num; disk >= 1; disk--) {
      const moves = Math.floor((target + 2 ** (disk - 1)) / 2 ** disk);
      let direction = 1;
      if ((hanoi.num + disk) % 2 === 0) direction = -1;
      const position = (((moves * direction) % 3) + 3) % 3;
      expected[position].push(disk);
    }
    assert.equal(hanoi.step, target);
    assert.deepEqual(hanoi.towers, expected);
  }
});

test('不正な枚数や手数は状態を壊さずに拒否する', () => {
  for (const num of [0, 1, 15, 2.5, NaN, Infinity, '3']) {
    assert.throws(() => new Hanoi(num), RangeError);
  }
  const hanoi = new Hanoi(3);
  hanoi.seek(4);
  const before = structuredClone(hanoi.towers);
  for (const target of [-1, 8, 0.5, NaN, Infinity, '2']) {
    assert.throws(() => hanoi.seek(target), RangeError);
    assert.equal(hanoi.step, 4);
    assert.deepEqual(hanoi.towers, before);
  }
});
