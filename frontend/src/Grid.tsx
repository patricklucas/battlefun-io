import React, { useState, useCallback, MouseEvent } from "react";
import rangeInclusive from "range-inclusive";
import { SendMessage } from "react-use-websocket";
import { YLabels, Label, Grid, Board, Cell, XLabels, GridContainer, Icon } from "./Grid.styled";
import { GameState } from "./game/Game";
import { Ships } from "./Ships";
import { getApiHost } from "./utils/getApiHost";

const board = {
  cells: [...new Array(100)],
  letters: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"],
  numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
};

interface Props {
  sendMessage: SendMessage;
  gameState: GameState | null;
  showYourBoard: boolean;
  showEnemyBoard: boolean;
  takeShot: (cell: number) => (e: MouseEvent) => void;
}

const stopClick = (e: MouseEvent) => {
  e.preventDefault();
  e.stopPropagation();
};

export function GridComponent(props: Props) {
  const { your_shots = [], opponent_shots = [], your_ships = {} } = props.gameState ?? {};

  const [hoveredCell, setHoveredCell] = useState(-1);

  const sendCellClick = useCallback(
    (index: number) => async () => {
      await fetch(`${getApiHost()}/api/publish`, {
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
                highlight={!!props.gameState?.your_turn && highlight}
                key={index}
                onMouseEnter={() => setHoveredCell(index)}
                onMouseLeave={() => setHoveredCell(-1)}
                onClick={props.takeShot(index)}
              ></Cell>
            );
          })}

          {props.gameState && (
            <>
              {(props.gameState.your_turn || props.showYourBoard) && !props.showEnemyBoard && (
                <>
                  {props.gameState.your_shots.map(({ cell, hit }) => {
                    const style = hit
                      ? ({
                          "--fa-primary-color": "crimson",
                          "--fa-secondary-color": "red",
                        } as React.CSSProperties)
                      : ({
                          "--fa-primary-color": "dodgerblue",
                          "--fa-secondary-color": "dodgerblue",
                        } as React.CSSProperties);

                    const iconName = hit ? "fa-crosshairs" : "fa-water";

                    return (
                      <Icon key={cell} {...getGridProperties([cell])} onClick={stopClick}>
                        <i className={`fad ${iconName} fa-2x`} style={style}></i>
                      </Icon>
                    );
                  })}
                </>
              )}

              {(!props.gameState.your_turn || props.showEnemyBoard) && !props.showYourBoard && (
                <>
                  {opponent_shots.map((cell) => {
                    const hit = Object.values(your_ships).flat().includes(cell);
                    const style = hit
                      ? ({
                          "--fa-primary-color": "crimson",
                          "--fa-secondary-color": "red",
                        } as React.CSSProperties)
                      : ({
                          "--fa-primary-color": "dodgerblue",
                          "--fa-secondary-color": "dodgerblue",
                        } as React.CSSProperties);

                    const iconName = hit ? "fa-crosshairs" : "fa-water";

                    return (
                      <Icon key={cell} {...getGridProperties([cell])} onClick={stopClick}>
                        <i className={`fad ${iconName} fa-2x`} style={style}></i>
                      </Icon>
                    );
                  })}
                  <Ships ships={props.gameState.your_ships} />
                </>
              )}
            </>
          )}
        </Board>
      </Grid>
    </GridContainer>
  );
}
