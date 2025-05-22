'use client';

import { useState } from 'react';
import styles from './page.module.css';

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
