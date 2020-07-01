import styled from "styled-components";

import carrierHorizontal from "./images/carrier-horizontal.png";
import battleshipHorizontal from "./images/battleship-horizontal.png";
import destroyerHorizontal from "./images/destroyer-horizontal.png";
import submarineHorizontal from "./images/submarine-horizontal.png";
import patrolBoatHorizontal from "./images/patrol-boat-horizontal.png";

import carrierVertical from "./images/carrier-vertical.png";
import battleshipVertical from "./images/battleship-vertical.png";
import destroyerVertical from "./images/destroyer-vertical.png";
import submarineVertical from "./images/submarine-vertical.png";
import patrolBoatVertical from "./images/patrol-boat-vertical.png";

const images: {
  [key: string]: {
    [key: string]: string;
  };
} = {
  vertical: {
    carrier: carrierVertical,
    battleship: battleshipVertical,
    destroyer: destroyerVertical,
    submarine: submarineVertical,
    patrolBoat: patrolBoatVertical,
  },
  horizontal: {
    carrier: carrierHorizontal,
    battleship: battleshipHorizontal,
    destroyer: destroyerHorizontal,
    submarine: submarineHorizontal,
    patrolBoat: patrolBoatHorizontal,
  },
};

export interface Props {
  rowStart: number;
  columnStart: number;
  vertical: boolean;
}

const backgroundUrl = (name: string) => (props: Props) => {
  const or = props.vertical ? "vertical" : "horizontal";
  return images[or][name];
};

const Spaceship = styled.div<Props>`
  grid-row-start: ${(p) => p.rowStart};
  grid-column-start: ${(p) => p.columnStart};
  content: " ";
  z-index: 1;
  position: absolute;
  width: 100%;
  height: 100%;
  background-size: cover;
  pointer-events: none;
  opacity: 0.8;
`;

export const Carrier = styled(Spaceship)`
  grid-row-end: span ${(p) => (p.vertical ? 5 : 1)};
  grid-column-end: span ${(p) => (p.vertical ? 1 : 5)};
  background-image: url(${backgroundUrl("carrier")});
`;

export const Battleship = styled(Spaceship)`
  grid-row-end: span ${(p) => (p.vertical ? 4 : 1)};
  grid-column-end: span ${(p) => (p.vertical ? 1 : 4)};
  background-image: url(${backgroundUrl("battleship")});
`;

export const Destroyer = styled(Spaceship)`
  grid-row-end: span ${(p) => (p.vertical ? 3 : 1)};
  grid-column-end: span ${(p) => (p.vertical ? 1 : 3)};
  background-image: url(${backgroundUrl("destroyer")});
`;

export const Submarine = styled(Spaceship)`
  grid-row-end: span ${(p) => (p.vertical ? 3 : 1)};
  grid-column-end: span ${(p) => (p.vertical ? 1 : 3)};
  background-image: url(${backgroundUrl("submarine")});
`;

export const PatrolBoat = styled(Spaceship)`
  grid-row-end: span ${(p) => (p.vertical ? 2 : 1)};
  grid-column-end: span ${(p) => (p.vertical ? 1 : 2)};
  background-image: url(${backgroundUrl("patrolBoat")});
`;
