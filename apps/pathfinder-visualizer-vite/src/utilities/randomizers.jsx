import { shuffle } from 'lodash';

export const diceRoll = (sides) => Math.floor(Math.random() * sides) + 1;
export const coinFlips = (n) => {
  let total = 0;
  for (let i = 0; i < n; i++) total += diceRoll(2) - 1;
  return total;
};
export const pickN = (list, n) => {
  let m = list.length;
  let options = [];
  for (let i = 0; i < m; i++) options.push(i);
  options = shuffle(options);
  let choices = options.slice(0, n);
  return choices.map((index) => list[index]);
};
