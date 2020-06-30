import React, { useState, useCallback } from "react";
import rangeInclusive from "range-inclusive";
import { SendMessage } from "react-use-websocket";
import { Freighter, Starship, LightCruiser, HeavyCruiser, Drydock } from "./Ships.styled";
import { YLabels, Label, Grid, Board, Cell, XLabels, GridContainer } from "./Grid.styled";

const board = {
  cells: [...new Array(100)],
  letters: ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"],
  numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
};

interface Props {
  sendMessage: SendMessage;
  myShips: { [key: string]: number[] };
}

export function GridComponent(props: Props) {
  const [hoveredCell, setHoveredCell] = useState(-1);

  const sendCellClick = useCallback(
    (index: number) => () => {
      fetch("http://localhost:8000/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "cell click: " + index }),
      });
    },
    []
  );

  const getGridProperties = ([cell, next]: number[]) => ({
    rowStart: cell > -1 ? Math.ceil(cell / 10) : -1,
    columnStart: cell > -1 ? (cell % 10) + 1 : -1,
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
            const ship = Object.values(props.myShips).flat().includes(index);

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
          <Freighter {...getGridProperties(props.myShips.freighter)}></Freighter>
          <Starship {...getGridProperties(props.myShips.starship)}></Starship>
          <HeavyCruiser {...getGridProperties(props.myShips.heavyCruiser)}></HeavyCruiser>
          <LightCruiser {...getGridProperties(props.myShips.lightCruiser)}></LightCruiser>
          <Drydock {...getGridProperties(props.myShips.drydock)}></Drydock>
        </Board>
      </Grid>
    </GridContainer>
  );
}
