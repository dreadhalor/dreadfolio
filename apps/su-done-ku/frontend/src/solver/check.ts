/**
 * How many solutions a puzzle (81 digits, 0 for blanks) has, counting no further than `limit`:
 * plain backtracking, fewest options first. For checking a puzzle someone types in.
 */
export function countSolutions(puzzle: readonly number[], limit = 2): number {
  const v = puzzle.slice();
  const taken = (s: number) => {
    const r = Math.floor(s / 9), c = s % 9, br = r - (r % 3), bc = c - (c % 3);
    let m = 0;
    for (let i = 0; i < 9; i++) m |= (1 << v[r * 9 + i]!) | (1 << v[i * 9 + c]!) | (1 << v[(br + Math.floor(i / 3)) * 9 + bc + (i % 3)]!);
    return m;
  };
  let found = 0;
  const search = (): void => {
    let best = -1, options = 0, fewest = 10;
    for (let s = 0; s < 81; s++) {
      if (v[s]) continue;
      const free = ~taken(s) & 0x3fe;
      let n = 0;
      for (let m = free; m; m &= m - 1) n++;
      if (n === 0) return;
      if (n < fewest) [best, options, fewest] = [s, free, n];
    }
    if (best < 0) {
      found++;
      return;
    }
    for (let d = 1; d <= 9 && found < limit; d++) {
      if (!(options & (1 << d))) continue;
      v[best] = d;
      search();
    }
    v[best] = 0;
  };
  search();
  return found;
}
