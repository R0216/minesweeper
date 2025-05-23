'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function Home() {
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

  const calculateNumbers = (board: number[][]): number[][] => {
    const dx = [-1, -1, -1, 0, 0, 1, 1, 1];
    const dy = [-1, 0, 1, -1, 1, -1, 0, 1];
    const result = board.map((row) => [...row]);

    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        if (board[y][x] === 9) continue;

        let count = 0;
        for (let i = 0; i < 8; i++) {
          const ny = y + dy[i];
          const nx = x + dx[i];
          if (ny >= 0 && ny < BOARD_SIZE && nx >= 0 && nx < BOARD_SIZE) {
            if (board[ny][nx] === 9) count++;
          }
        }
        result[y][x] = count;
      }
    }
    return result;
  };
  const [userInput, setUserInput] = useState(createEmptyBoard());
  const [bombMap, setBombMap] = useState(createEmptyBoard());
  const [isBombsPlaced, setIsBombsPlaced] = useState(false);

  const clickHandler = (x: number, y: number) => {
    console.log(x, y);
    if (!isBombsPlaced) {
      const bombsOnly = placeBombs(x, y);
      const withNumbers = calculateNumbers(bombsOnly);
      setBombMap(withNumbers);
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
              {userInput[y][x] === 1 && (
                <>
                  {bombMap[y][x] === 9 ? (
                    <div className={styles.sampleCell} style={{ backgroundPosition: `-300px` }} />
                  ) : bombMap[y][x] > 0 ? (
                    <div
                      className={styles.sampleCell}
                      style={{ backgroundPosition: `${bombMap[y][x] * -30 + 30}px` }}
                    />
                  ) : null}
                </>
              )}
            </div>
          )),
        )}
      </div>
    </div>
  );
}
