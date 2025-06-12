'use client';

import { useCallback, useEffect, useState } from 'react';
import styles from './page.module.css';

interface BoardDimensions {
  rows: number;
  cols: number;
}

const difficultySettings = {
  easy: { boardDimensions: { rows: 9, cols: 9 }, bombCount: 10 },
  normal: { boardDimensions: { rows: 16, cols: 16 }, bombCount: 40 },
  hard: { boardDimensions: { rows: 16, cols: 30 }, bombCount: 99 },
};

export default function Home() {
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard' | 'custom'>('easy');
  const [boardDimensions, setBoardDimensions] = useState<BoardDimensions>({ rows: 9, cols: 9 });
  const [bombCount, setBombCount] = useState(10);

  const createEmptyBoard = useCallback(
    (): number[][] =>
      Array.from({ length: boardDimensions.rows }).map(() =>
        Array<number>(boardDimensions.cols).fill(0),
      ),
    [boardDimensions.rows, boardDimensions.cols],
  );

  const resetGame = useCallback(() => {
    setUserInput(createEmptyBoard());
    setBombMap(createEmptyBoard());
    setTimeCount(0);
  }, [createEmptyBoard]);

  useEffect(() => {
    if (difficulty !== 'custom') {
      const setting = difficultySettings[difficulty];
      setBoardDimensions(setting.boardDimensions);
      setBombCount(setting.bombCount);
      resetGame();
    }
  }, [difficulty, resetGame]);

  const placeBombs = (firstX: number, firstY: number): number[][] => {
    const board = createEmptyBoard();
    let bombsPlaced = 0;

    while (bombsPlaced < bombCount) {
      const x = Math.floor(Math.random() * boardDimensions.cols);
      const y = Math.floor(Math.random() * boardDimensions.rows);

      if (board[y][x] === 9 || (x === firstX && y === firstY)) continue;

      board[y][x] = 9;
      bombsPlaced++;
    }

    return board;
  };
  const [userInput, setUserInput] = useState<number[][] | null>(null);
  const [bombMap, setBombMap] = useState<number[][] | null>(null);
  const [timeCount, setTimeCount] = useState(0);
  const dx = [-1, -1, -1, 0, 0, 1, 1, 1];
  const dy = [-1, 0, 1, -1, 1, -1, 0, 1];

  const calculateNumbers = (board: number[][]): number[][] => {
    const result = board.map((row) => [...row]);

    for (let y = 0; y < boardDimensions.rows; y++) {
      for (let x = 0; x < boardDimensions.cols; x++) {
        if (board[y][x] === 9) continue;

        let count = 0;
        for (let i = 0; i < 8; i++) {
          const ny = y + dy[i];
          const nx = x + dx[i];
          if (ny >= 0 && ny < boardDimensions.rows && nx >= 0 && nx < boardDimensions.cols) {
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
    if (x < 0 || x >= boardDimensions.cols || y < 0 || y >= boardDimensions.rows) return;
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
    if (!userInput) return false;
    return userInput.some((row, y) =>
      row.some((cell, x) => cell === 1 && bombMap && bombMap[y][x] === 9),
    );
  }, [userInput, bombMap]);

  const checkGameClear = useCallback((): boolean => {
    if (!userInput || !bombMap) return false;
    for (let y = 0; y < boardDimensions.rows; y++) {
      for (let x = 0; x < boardDimensions.cols; x++) {
        if (bombMap[y][x] !== 9 && userInput[y][x] !== 1) {
          return false;
        }
      }
    }
    return true;
  }, [userInput, bombMap, boardDimensions.rows, boardDimensions.cols]);

  const isBombsPlaced = bombMap?.flat().some((cell) => cell !== 0);
  const flagLeft = bombCount - (userInput?.flat().filter((cell) => cell === 2).length || 0);

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
    if (checkGameClear() || checkGameOver() || !userInput) return;

    const flagCount = userInput.flat().filter((cell) => cell === 2).length;
    const newUserInput = structuredClone(userInput);
    if (userInput[y][x] === 0) {
      if (flagCount < bombCount) {
        newUserInput[y][x] = 2;
      }
    } else if (newUserInput[y][x] === 2) {
      newUserInput[y][x] = 3;
    } else if (userInput[y][x] === 3) {
      newUserInput[y][x] = 0;
    }
    setUserInput(newUserInput);
  };

  const clickHandler = (x: number, y: number) => {
    if (!userInput || !bombMap) return;
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
          { length: boardDimensions.rows },
          () => Array(boardDimensions.cols).fill(false) as boolean[],
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
      for (let j = 0; j < boardDimensions.rows; j++) {
        for (let i = 0; i < boardDimensions.cols; i++) {
          if (bombMap[j][i] === 9) {
            newUserInput[j][i] = 1;
          }
        }
      }
      newUserInput[y][x] = 4;
      setUserInput(newUserInput);
      return;
    }

    if (bombMap[y][x] === 0) {
      const visited: boolean[][] = Array.from(
        { length: boardDimensions.rows },
        () => Array(boardDimensions.cols).fill(false) as boolean[],
      );
      revealZero(x, y, newUserInput, bombMap, visited);
    } else {
      newUserInput[y][x] = 1;
    }

    setUserInput(newUserInput);
  };

  if (!userInput || !bombMap) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading Board...</div>
      </div>
    );
  }

  const cellSize = 30;
  const boardBorderWidth = 5;
  const onBoardBorderWidth = 5;

  const calculatedBoardWidth = boardDimensions.cols * cellSize + boardBorderWidth * 2;
  const calculatedBoardHeight = boardDimensions.rows * cellSize + boardBorderWidth * 2;
  const minTimeboardInnerWidth = 280;
  const timeboardBorderWidth = 5;
  const calculatedMinTimeboardWidth = minTimeboardInnerWidth + timeboardBorderWidth * 2;
  const actualTimeboardWidth = Math.max(calculatedBoardWidth, calculatedMinTimeboardWidth);
  const calculateOnBoardWidth = actualTimeboardWidth + onBoardBorderWidth * 2;
  Math.max(calculatedBoardWidth, calculatedMinTimeboardWidth) + onBoardBorderWidth * 2;

  return (
    <div className={styles.container}>
      <div className={styles.settings}>
        <label>
          難易度:
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}
          >
            <option value="easy">初級</option>
            <option value="normal">中級</option>
            <option value="hard">上級</option>
            <option value="custom">カスタム</option>
          </select>
        </label>

        {difficulty === 'custom' && (
          <>
            <label>
              縦:
              <input
                type="number"
                min={5}
                max={50}
                value={boardDimensions.rows}
                onChange={(e) =>
                  setBoardDimensions((prev) => ({ ...prev, rows: Number(e.target.value) }))
                }
              />
            </label>
            <label>
              横:
              <input
                type="number"
                min={5}
                max={50}
                value={boardDimensions.cols}
                onChange={(e) =>
                  setBoardDimensions((prev) => ({ ...prev, cols: Number(e.target.value) }))
                }
              />
            </label>
            <button onClick={resetGame}>設定して開始</button>
          </>
        )}
      </div>
      <div className={styles.onBoard}>
        <div className={styles.timeboard} onClick={resetGame}>
          <div className={styles.flagCount}>
            <div className={styles.timeNumber}>
              {String(flagLeft)
                .padStart(3, '0')
                .split('')
                .map((digit, idx) => (
                  <div
                    key={idx}
                    className={styles.digit}
                    style={{ backgroundPosition: `${-parseInt(digit) * 70.0}px 0px` }}
                  />
                ))}
            </div>
          </div>

          <div
            className={styles.resetButton}
            style={{
              backgroundPosition: checkGameOver()
                ? '-390px'
                : checkGameClear()
                  ? '-360px'
                  : '-330px',
            }}
            onClick={resetGame}
          />
          <div className={styles.time}>
            <div className={styles.timeNumber}>
              {String(timeCount)
                .padStart(3, '0')
                .split('')
                .map((digit, idx) => (
                  <div
                    key={idx}
                    className={styles.digit}
                    style={{ backgroundPosition: `${-parseInt(digit) * 70.0}px 0px` }}
                  />
                ))}
            </div>
          </div>
        </div>
        <div
          className={styles.board}
          style={
            {
              '--grid-rows': boardDimensions.rows,
              '--grid-cols': boardDimensions.cols,
              width: `${calculateOnBoardWidth}px`,
              height: `${calculatedBoardHeight}px`,
            } as React.CSSProperties
          }
        >
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
