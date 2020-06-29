import React, { useState } from "react";
import styled from "styled-components";
import rangeInclusive from "range-inclusive";
import { SendMessage } from "react-use-websocket";

export const GridContainer = styled.section`
  position: relative;
  padding-bottom: 100%;
  border: 2px solid black;
  margin-top: 10%;
`;

export const Grid = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  overflow: hidden;
`;

export const Cell = styled.div<{ highlight: boolean }>`
  flex: 0 0 10%;
  border-right: 1px solid gray;
  border-bottom: 1px solid gray;
  overflow: hidden;
  background-color: ${({ highlight }) => (highlight ? "whitesmoke" : null)};

  &:nth-child(10n) {
    border-right: 0;
  }

  &:nth-child(n + 91) {
    border-bottom: 0;
  }
`;

export const YLabels = styled.div`
  width: 10%;
  position: absolute;
  right: 100%;
  margin-right: 2px;
  top: 0;
  bottom: 0;
  background-color: lightblue;
  display: flex;
  flex-direction: column;
`;

export const XLabels = styled.div`
  height: 10%;
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  background-color: lightgreen;
  display: flex;
  flex-direction: row;
  margin-bottom: 2px;
`;

export const Label = styled.div`
  flex: 0 0 10%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
`;

const cells = [...new Array(100)];
const xlabels = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"];
const ylabels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

interface Props {
  sendMessage: SendMessage;
}

export function GridComponent(props: Props) {
  const [hoveredCell, setHoveredCell] = useState(-1);

  const sendCellClick = (index: number) => () =>
    props.sendMessage(
      JSON.stringify({ type: "player_click", message: `cell: ${index}` })
    );

  const activeRow = Math.floor(hoveredCell / 10);
  const activeColumn = hoveredCell % 10;

  const rowCells =
    hoveredCell > -1
      ? rangeInclusive(activeRow * 10, activeRow * 10 + 9)
      : [hoveredCell];

  const columnCells =
    hoveredCell > -1
      ? rangeInclusive(activeColumn, activeColumn + 90, 10)
      : [hoveredCell];

  return (
    <GridContainer>
      <Grid>
        {cells.map((cell, index) => {
          const highlight = [...rowCells, ...columnCells].includes(index);

          return (
            <Cell
              highlight={highlight}
              key={index}
              onMouseEnter={() => setHoveredCell(index)}
              onMouseLeave={() => setHoveredCell(-1)}
              onClick={sendCellClick(index)}
            />
          );
        })}
      </Grid>
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
    </GridContainer>
  );
}
