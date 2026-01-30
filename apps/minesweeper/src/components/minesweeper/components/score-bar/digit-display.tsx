import React from 'react';
import {
  zero,
  one,
  two,
  three,
  four,
  five,
  six,
  seven,
  eight,
  nine,
  negative,
} from '@ms/assets/minesweeper/digits';

interface DigitDisplayProps {
  num: number;
}

const DigitDisplay: React.FC<DigitDisplayProps> = ({ num }) => {
  const digits: { [key: string]: string } = {
    '0': zero,
    '1': one,
    '2': two,
    '3': three,
    '4': four,
    '5': five,
    '6': six,
    '7': seven,
    '8': eight,
    '9': nine,
    '-': negative,
  };

  const getNumString = (num: number) => {
    if (num < 0) return `-${padPositiveNum(Math.abs(num), 2)}`;
    return `${padPositiveNum(num, 3)}`;
  };

  const padPositiveNum = (num: number, digits: number) => {
    digits = Math.max(Math.floor(digits), 0);
    let result = `${Math.min(Math.floor(num), Math.pow(10, digits) - 1)}`;
    while (result.length < digits) {
      result = `0${result}`;
    }
    return result;
  };

  return (
    <div className='flex'>
      {getNumString(num)
        .split('')
        .map((digit_str, index) => (
          <img src={digits[digit_str]} alt={digit_str} key={index} />
        ))}
    </div>
  );
};

export default DigitDisplay;
