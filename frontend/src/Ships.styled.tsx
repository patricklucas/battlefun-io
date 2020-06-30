import styled from "styled-components";

import freighterHorizontal from "./images/freighter-horizontal.png";
import starshipHorizontal from "./images/starship-horizontal.png";
import heavyCruiserHorizontal from "./images/heavy-cruiser-horizontal.png";
import lightCruiserHorizontal from "./images/light-cruiser-horizontal.png";
import drydockHorizontal from "./images/drydock-horizontal.png";

import freighterVertical from "./images/freighter-vertical.png";
import starshipVertical from "./images/starship-vertical.png";
import heavyCruiserVertical from "./images/heavy-cruiser-vertical.png";
import lightCruiserVertical from "./images/light-cruiser-vertical.png";
import drydockVertical from "./images/drydock-vertical.png";

const images: {
  [key: string]: {
    [key: string]: string;
  };
} = {
  vertical: {
    freighter: freighterVertical,
    starship: starshipVertical,
    heavyCruiser: heavyCruiserVertical,
    lightCruiser: lightCruiserVertical,
    drydock: drydockVertical,
  },
  horizontal: {
    freighter: freighterHorizontal,
    starship: starshipHorizontal,
    heavyCruiser: heavyCruiserHorizontal,
    lightCruiser: lightCruiserHorizontal,
    drydock: drydockHorizontal,
  },
};

interface Props {
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
`;

export const Freighter = styled(Spaceship)`
  grid-row-end: span ${(p) => (p.vertical ? 5 : 1)};
  grid-column-end: span ${(p) => (p.vertical ? 1 : 5)};
  background-image: url(${backgroundUrl("freighter")});
`;

export const Starship = styled(Spaceship)`
  grid-row-end: span ${(p) => (p.vertical ? 4 : 1)};
  grid-column-end: span ${(p) => (p.vertical ? 1 : 4)};
  background-image: url(${backgroundUrl("starship")});
`;

export const HeavyCruiser = styled(Spaceship)`
  grid-row-end: span ${(p) => (p.vertical ? 3 : 1)};
  grid-column-end: span ${(p) => (p.vertical ? 1 : 3)};
  background-image: url(${backgroundUrl("heavyCruiser")});
`;

export const LightCruiser = styled(Spaceship)`
  grid-row-end: span ${(p) => (p.vertical ? 3 : 1)};
  grid-column-end: span ${(p) => (p.vertical ? 1 : 3)};
  background-image: url(${backgroundUrl("lightCruiser")});
`;

export const Drydock = styled(Spaceship)`
  grid-row-end: span ${(p) => (p.vertical ? 2 : 1)};
  grid-column-end: span ${(p) => (p.vertical ? 1 : 2)};
  background-image: url(${backgroundUrl("drydock")});
`;
