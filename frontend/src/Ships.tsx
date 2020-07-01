import React, { ReactElement } from "react";
import { GameState } from "./game/Game";
import { Carrier, Battleship, Destroyer, Submarine, PatrolBoat } from "./Ships.styled";

interface Props {
  ships: GameState["your_ships"];
}

const getOffsets = ([cell, next]: number[]) => ({
  rowStart: cell > -1 ? Math.max(Math.ceil(cell / 10), 1) : -1,
  columnStart: cell > -1 ? Math.max(Math.min((cell % 10) + 1, 9), 1) : -1,
  vertical: next - cell !== 1,
});

export function Ships(props: Props): ReactElement {
  return (
    <>
      <Carrier {...getOffsets(props.ships.carrier)}></Carrier>
      <Battleship {...getOffsets(props.ships.battleship)}></Battleship>
      <Destroyer {...getOffsets(props.ships.destroyer)}></Destroyer>
      <Submarine {...getOffsets(props.ships.submarine)}></Submarine>
      <PatrolBoat {...getOffsets(props.ships.patrol_boat)}></PatrolBoat>
    </>
  );
}
