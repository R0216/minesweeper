'use client';

import { useCallback, useEffect, useState } from 'react';
import styles from './page.module.css';

export default function Home() {
  const BOARD_SIZE = 9;
  const BOMB_COUNT = 10;

  const createEmptyBoard = (): number[][] =>
    Array.from({ length: BOARD_SIZE }).map(() => Array<number>(BOARD_SIZE).fill(0));

  const placeBombs = (firstX: number, firstY: number): number[][] => {
    const board = createEmptyBoard();
    let bombsPlaced = 0;

    while (bombsPlaced < BOMB_COUNT) {
      const x = Math.floor(Math.random() * BOARD_SIZE);
      const y = Math.floor(Math.random() * BOARD_SIZE);

      if (board[y][x] === 9 || (x === firstX && y === firstY)) continue;

      board[y][x] = 9;
      bombsPlaced++;
    }

    return board;
  };
  const [userInput, setUserInput] = useState(createEmptyBoard());
  const [bombMap, setBombMap] = useState(createEmptyBoard());
  const [timeCount, setTimeCount] = useState(0);
  const dx = [-1, -1, -1, 0, 0, 1, 1, 1];
  const dy = [-1, 0, 1, -1, 1, -1, 0, 1];

  const calculateNumbers = (board: number[][]): number[][] => {
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

  const revealZero = (
    x: number,
    y: number,
    userBoard: number[][],
    bombBoard: number[][],
    visited: boolean[][],
  ) => {
    if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE) return;
    if (visited[y][x] || userBoard[y][x] === 1) return;

    visited[y][x] = true;
    userBoard[y][x] = 1;

    if (bombBoard[y][x] === 0) {
      for (let i = 0; i < 8; i++) {
        const nx = x + dx[i];
        const ny = y + dy[i];
        revealZero(nx, ny, userBoard, bombBoard, visited);
      }
    }
  };
  const checkGameOver = useCallback((): boolean => {
    return userInput.some((row, y) => row.some((cell, x) => cell === 1 && bombMap[y][x] === 9));
  }, [userInput, bombMap]);

  const checkGameClear = useCallback((): boolean => {
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        if (bombMap[y][x] !== 9 && userInput[y][x] !== 1) {
          return false;
        }
      }
    }
    return true;
  }, [userInput, bombMap]);

  const isBombsPlaced = bombMap.flat().some((cell) => cell !== 0);

  useEffect(() => {
    if (!isBombsPlaced) return;
    if (checkGameClear() || checkGameOver()) return;

    const timer = setInterval(() => {
      setTimeCount((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isBombsPlaced, userInput, checkGameClear, checkGameOver]);

  const rightClickHandler = (e: React.MouseEvent, x: number, y: number) => {
    e.preventDefault();

    const newUserInput = structuredClone(userInput);
    if (userInput[y][x] === 0) {
      newUserInput[y][x] = 2;
    } else if (newUserInput[y][x] === 2) {
      newUserInput[y][x] = 3;
    } else if (userInput[y][x] === 3) {
      newUserInput[y][x] = 0;
    }
    setUserInput(newUserInput);
  };

  const clickHandler = (x: number, y: number) => {
    if (userInput[y][x] === 2 || userInput[y][x] === 3) return;
    if (checkGameOver() || checkGameClear()) return;

    let newUserInput = structuredClone(userInput);

    if (!isBombsPlaced) {
      const bombsOnly = placeBombs(x, y);
      const withNumbers = calculateNumbers(bombsOnly);
      setBombMap(withNumbers);

      newUserInput = structuredClone(createEmptyBoard());

      if (withNumbers[y][x] === 0) {
        const visited: boolean[][] = Array.from(
          { length: BOARD_SIZE },
          () => Array(BOARD_SIZE).fill(false) as boolean[],
        );
        revealZero(x, y, newUserInput, withNumbers, visited);
      } else {
        newUserInput[y][x] = 1;
      }

      setUserInput(newUserInput);
      return;
    }

    if (bombMap[y][x] === 9) {
      const newUserInput = structuredClone(userInput);
      for (let j = 0; j < BOARD_SIZE; j++) {
        for (let i = 0; i < BOARD_SIZE; i++) {
          if (bombMap[j][i] === 9) {
            newUserInput[j][i] = 1; // ← 爆弾マスすべて開く
          }
        }
      }
      newUserInput[y][x] = 4;
      setUserInput(newUserInput);
      return;
    }

    if (bombMap[y][x] === 0) {
      const visited: boolean[][] = Array.from(
        { length: BOARD_SIZE },
        () => Array(BOARD_SIZE).fill(false) as boolean[],
      );
      revealZero(x, y, newUserInput, bombMap, visited);
    } else {
      newUserInput[y][x] = 1;
    }

    setUserInput(newUserInput);
  };

  const resetGame = () => {
    setUserInput(createEmptyBoard());
    setBombMap(createEmptyBoard());
    setTimeCount(0);
  };

  return (
    <div className={styles.container}>
      <div className={styles.onBoard}>
        <div className={styles.timeboard} onClick={resetGame}>
          <div className={styles.flagCount} />
          <div className={styles.resetButton} onClick={resetGame} />
          <div className={styles.time}>{timeCount}</div>
        </div>
        <div className={styles.board}>
          {userInput.map((row, y) =>
            row.map((cellState, x) => {
              // 状態に応じたクラスと style を設定
              let className = styles.cell;
              let style = {};
              if (cellState === 4) {
                className = styles.clickedBomb;
              }
              if (cellState === 1) {
                if (bombMap[y][x] === 9) {
                  className = styles.sampleCell;
                  style = { backgroundPosition: '-300px' };
                } else if (bombMap[y][x] > 0) {
                  className = styles.sampleCell;
                  style = { backgroundPosition: `${bombMap[y][x] * -30 + 30}px` };
                } else {
                  className = styles.zero;
                }
              } else if (cellState === 2) {
                className = styles.flag;
              } else if (cellState === 3) {
                className = styles.question;
              }

              return (
                <div
                  key={`${x}-${y}`}
                  className={className}
                  style={style}
                  onClick={() => clickHandler(x, y)}
                  onContextMenu={(e) => rightClickHandler(e, x, y)}
                />
              );
            }),
          )}
        </div>
      </div>
    </div>
  );
}
