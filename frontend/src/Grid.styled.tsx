import styled from "styled-components";

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