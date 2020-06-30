import React, { useState, useCallback, MouseEvent } from "react";
import rangeInclusive from "range-inclusive";
import { SendMessage } from "react-use-websocket";
import { YLabels, Label, Grid, Board, Cell, XLabels, GridContainer, Icon } from "./Grid.styled";
import { GameState } from "./Game";
import { Ships } from "./Ships";

export const game_state: GameState = {
  opponent_id: "some-guid",
  current_state: "IN_PROGRESS",
  your_turn: true, // only if IN_PROGRESS
  your_shots: [
    { cell: 13, hit: false },
    { cell: 77, hit: true },
    { cell: 99, hit: false },
  ],
  opponent_shots: [0, 12, 34], // ^ same as above
  destroyed_opponent_ships: ["carrier"],
  your_ships: {
    carrier: [0, 1, 2, 3, 4],
    battleship: [12, 13, 14, 15],
    destroyer: [23, 33, 43],
    submarine: [77, 78, 79],
    patrol_boat: [55, 65],
  },
};

const board = {
  cells: [...new Array(100)],
  letters: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"],
  numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
};

interface Props {
  sendMessage: SendMessage;
  gameState: GameState | null;
}

const stopClick = (e: MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
};

export function GridComponent(props: Props) {
  const { your_shots = [] } = props.gameState ?? {};

  const [hoveredCell, setHoveredCell] = useState(-1);

  const sendCellClick = useCallback(
    (index: number) => async () => {
      await fetch("http://localhost:8000/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: JSON.stringify({
            type: "game_state",
            game_state: {
              your_shots: [...your_shots, { cell: index, hit: Math.random() >= 0.5 }],
            },
          }),
        }),
      });
    },
    [your_shots]
  );

  const getGridProperties = ([cell, next]: number[]) => ({
    rowStart: cell > -1 ? Math.max(Math.ceil(cell / 10), 1) : -1,
    columnStart: cell > -1 ? Math.max(Math.min((cell % 10) + 1, 9), 1) : -1,
    vertical: next - cell !== 1,
  });

  const activeRow = Math.floor(hoveredCell / 10);
  const activeColumn = hoveredCell % 10;

  const rowCells = hoveredCell > -1 ? rangeInclusive(activeRow * 10, activeRow * 10 + 9) : [hoveredCell];
  const columnCells = hoveredCell > -1 ? rangeInclusive(activeColumn, activeColumn + 90, 10) : [hoveredCell];

  const letters = board.letters.map((label) => <Label key={label}>{label}</Label>);
  const numbers = board.numbers.map((label) => <Label key={label}>{label}</Label>);

  return (
    <GridContainer>
      <Grid>
        <YLabels>{letters}</YLabels>
        <XLabels>{numbers}</XLabels>
        <Board>
          {board.cells.map((cell, index) => {
            const highlight = [...rowCells, ...columnCells].includes(index);

            return (
              <Cell
                highlight={highlight}
                key={index}
                onMouseEnter={() => setHoveredCell(index)}
                onMouseLeave={() => setHoveredCell(-1)}
                onClick={sendCellClick(index)}
              ></Cell>
            );
          })}

          {props.gameState && (
            <>
              {props.gameState.your_turn ? (
                your_shots.map(({ cell, hit }) => {
                  const style = hit
                    ? ({
                        "--fa-primary-color": "red",
                        "--fa-secondary-color": "red",
                      } as React.CSSProperties)
                    : ({
                        "--fa-primary-color": "blue",
                        "--fa-secondary-color": "blue",
                      } as React.CSSProperties);

                  const iconName = hit ? "fa-crosshairs" : "fa-water";

                  return (
                    <Icon {...getGridProperties([cell])} onClick={stopClick}>
                      <i className={`fad ${iconName} fa-2x`} style={style}></i>
                    </Icon>
                  );
                })
              ) : (
                <Ships ships={game_state.your_ships} />
              )}
            </>
          )}
        </Board>
      </Grid>
    </GridContainer>
  );
}
