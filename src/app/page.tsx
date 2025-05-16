'use client';

import { useState } from 'react';
import styles from './page.module.css';

const calcTotalPoint = (arr: number[], counter: number) => {
  let x = 0;
  for (const i of arr) {
    x += i;
  }
  return x + counter;
};

const down = (n: number) => {
  if (n < 0) {
    return;
  } else {
    console.log(n);
    down(n - 1);
  }
};
down(10);

const sum1 = (n: number): number => {
  if (n === 0) return 0;
  return n + sum1(n - 1);
};
console.log(sum1(10));

const sum2 = (x: number, y: number): number => {
  return x > y ? 0 : y + sum2(x, y - 1);
};
console.log(sum2(4, 10));

const sum3 = (x: number, y: number): number => {
  return ((x + y) * (y - x + 1)) / 2;
};
console.log(sum3(4, 10));

export default function Home() {
  const [samplePoints, setSamplePoints] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  console.log(samplePoints);
  const [sampleCounter, setSampleCounter] = useState(0);
  console.log(sampleCounter);
  const clickHandler = () => {
    const newSamplePoints = structuredClone(samplePoints);
    newSamplePoints[sampleCounter] += 1;
    setSamplePoints(newSamplePoints);
    setSampleCounter((sampleCounter + 1) % 14);
  };
  const totalPoint = calcTotalPoint(samplePoints, sampleCounter);

  console.log(totalPoint);
  return (
    <div className={styles.container}>
      <div
        className={styles.sampleCell}
        style={{ backgroundPosition: `${sampleCounter * -30}px` }}
      />
      <button onClick={clickHandler}>クリック</button>
    </div>
  );
}
