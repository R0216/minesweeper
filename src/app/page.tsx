'use client';

import { useState } from 'react';
import styles from './page.module.css';

// const calcTotalPoint = (arr: number[], counter: number) => {
//   let x = 0;
//   for (const i of arr) {
//     x += i;
//   }
//   return x + counter;
// };

// const down = (n: number) => {
//   if (n < 0) {
//     return;
//   } else {
//     console.log(n);
//     down(n - 1);
//   }
// };
// down(10);

// const sum1 = (n: number): number => {
//   if (n === 0) return 0;
//   return n + sum1(n - 1);
// };
// console.log(sum1(10));

// const sum2 = (x: number, y: number): number => {
//   return x > y ? 0 : y + sum2(x, y - 1);
// };
// console.log(sum2(4, 10));

// const sum3 = (x: number, y: number): number => {
//   return ((x + y) * (y - x + 1)) / 2;
// };
// console.log(sum3(4, 10));

export default function Home() {
  const [startBoard, setStartBoard] = useState([
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
  ]);

  const [userInput, setUserInput] = useState(startBoard);

  const [bombMap, setBombMap] = useState(startBoard);

  const board = calcBoard(userInput, bombMap);

  const clickHandler = (x: number, y: number) => {
    console.log(x, y);
    const newUserInput = structuredClone(userInput);

    if (userInput[y][x] === 0) {
      newUserInput[y][x] = 1;
    }
    setUserInput(newUserInput);
  };

  return (
    <div className={styles.container}>
      <div className={styles.board}>
        {userInput.map((row, y) =>
          row.map((color, x) => (
            <div className={styles.cell} key={`${x}-${y}`} onClick={() => clickHandler(x, y)}>
              {color === 1 && (
                <div
                  className={styles.sampleCell}
                  style={{ backgroundPosition: `${color * -30}px` }}
                />
              )}
            </div>
          )),
        )}
      </div>
      {/* <button onClick={clickHandler}>
        <div
          className={styles.sampleCell}
          style={{ backgroundPosition: `${sampleCounter * -30}px` }}
        />
      </button> */}
    </div>
  );
}
