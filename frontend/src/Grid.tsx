import React, { useState, useCallback } from "react";
import styled from "styled-components";
import rangeInclusive from "range-inclusive";
import { SendMessage } from "react-use-websocket";
import { Freighter, Starship, LightCruiser, HeavyCruiser, Drydock } from "./Ships.styled";

export const GridContainer = styled.section`
  position: relative;
  padding-bottom: 100%;
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 10fr;
  grid-template-rows: 1fr 10fr;
  gap: 0;
  grid-template-areas:
    ". xlabels"
    "ylabels board";

  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
`;

export const Board = styled.div`
  display: grid;
  grid-area: board;
  background-color: gray;
  grid-template-columns: repeat(10, 1fr);
  grid-template-rows: repeat(10, 1fr);
  gap: 1px;
  border: 1px solid black;
  outline: 2px solid black;
  position: relative;
`;

export const Cell = styled.div<{ highlight: boolean }>`
  overflow: hidden;
  background-color: ${({ highlight }) => (highlight ? "whitesmoke" : "white")};
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const Label = styled.div`
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
  background-color: white;
`;

export const YLabels = styled.div`
  grid-area: ylabels;
  display: grid;
  gap: 1px;
  grid-template-rows: repeat(10, 1fr);
  border: 1px solid black;
  border-right: 0;
  background-color: gray;
`;

export const XLabels = styled.div`
  grid-area: xlabels;
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 1px;
  border: 1px solid black;
  border-bottom: 0;
  background-color: gray;
`;

const cells = [...new Array(100)];
const xlabels = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
const ylabels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

interface Props {
  sendMessage: SendMessage;
  myShips: { [key: string]: number[] };
}

export function GridComponent(props: Props) {
  const [hoveredCell, setHoveredCell] = useState(-1);

  const sendCellClick = useCallback(
    (index: number) => () => {
      fetch("/api/publish", {
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

  const getGridRowStart = ([cell]: number[]) => {
    return cell > -1 ? Math.ceil(cell / 10) : -1;
  };
  const getGridColumnStart = ([cell]: number[]) => {
    return cell > -1 ? (cell % 10) + 1 : -1;
  };
  const getShipIsVertical = ([cell, next]: number[]) => {
    return next - cell !== 1;
  };

  const activeRow = Math.floor(hoveredCell / 10);
  const activeColumn = hoveredCell % 10;

  const rowCells = hoveredCell > -1 ? rangeInclusive(activeRow * 10, activeRow * 10 + 9) : [hoveredCell];
  const columnCells = hoveredCell > -1 ? rangeInclusive(activeColumn, activeColumn + 90, 10) : [hoveredCell];

  return (
    <GridContainer>
      <Grid>
        <YLabels>
          {xlabels.map((label) => (
            <Label key={label}>{label}</Label>
          ))}
        </YLabels>

        <XLabels>
          {ylabels.map((label) => (
            <Label key={label}>{label}</Label>
          ))}
        </XLabels>
        <Board>
          {cells.map((cell, index) => {
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
