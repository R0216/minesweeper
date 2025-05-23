'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function Home() {
  // const [startBoard, setStartBoard] = useState([
  //   [0, 0, 0, 0, 0, 0, 0, 0, 0],
  //   [0, 0, 0, 0, 0, 0, 0, 0, 0],
  //   [0, 0, 0, 0, 0, 0, 0, 0, 0],
  //   [0, 0, 0, 0, 0, 0, 0, 0, 0],
  //   [0, 0, 0, 0, 0, 0, 0, 0, 0],
  //   [0, 0, 0, 0, 0, 0, 0, 0, 0],
  //   [0, 0, 0, 0, 0, 0, 0, 0, 0],
  //   [0, 0, 0, 0, 0, 0, 0, 0, 0],
  //   [0, 0, 0, 0, 0, 0, 0, 0, 0],
  // ]);

  const BOARD_SIZE = 9;
  const BOMB_COUNT = 10;

  const createEmptyBoard = (): number[][] =>
    Array.from({ length: BOARD_SIZE }).map(() => Array<number>(BOARD_SIZE).fill(0));

  const placeBombs = (excludeX: number, excludeY: number): number[][] => {
    const board = createEmptyBoard();
    let bombsPlaced = 0;

    while (bombsPlaced < BOMB_COUNT) {
      const x = Math.floor(Math.random() * BOARD_SIZE);
      const y = Math.floor(Math.random() * BOARD_SIZE);

      if (board[y][x] === 9 || (x === excludeX && y === excludeY)) continue;

      board[y][x] = 9;
      bombsPlaced++;
    }

    return board;
  };
  const [userInput, setUserInput] = useState(createEmptyBoard());
  const [bombMap, setBombMap] = useState(createEmptyBoard());
  const [isBombsPlaced, setIsBombsPlaced] = useState(false);

  const clickHandler = (x: number, y: number) => {
    console.log(x, y);
    if (!isBombsPlaced) {
      const newBombMap = placeBombs(x, y);
      setBombMap(newBombMap);
      setIsBombsPlaced(true);
    }

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
              {userInput[y][x] === 1 && bombMap[y][x] !== 0 && (
                <div
                  className={styles.sampleCell}
                  style={{ backgroundPosition: `${bombMap[y][x] * -30}px ` }}
                />
              )}
            </div>
          )),
        )}
      </div>
    </div>
  );
}
{
  /* <button onClick={clickHandler}>
        <div
          className={styles.sampleCell}
          style={{ backgroundPosition: `${sampleCounter * -30}px` }}
        />
      </button> */
}
