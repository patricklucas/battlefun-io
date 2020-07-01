import React, { useContext, useCallback } from "react";
import { EuiButton } from "@elastic/eui";
import { getApiHost } from "../utils/getApiHost";
import { User } from "../UserProvider";
import { GameState } from "./Game";

interface Props {
  setShipPlacements: React.Dispatch<React.SetStateAction<GameState["your_ships"] | null>>;
  shipPlacements: GameState["your_ships"] | null;
}

const shipLengths = {
  carrier: 5,
  battleship: 4,
  destroyer: 3,
  submarine: 3,
  patrol_boat: 2,
} as const;

type ShipType = keyof typeof shipLengths;

export interface ShipPlacement {
  type: ShipType;
  cells: number[];
}

function getRowIndex(cellIndex: number): number {
  return Math.floor(cellIndex / 10);
}

function getColumnIndex(cellIndex: number): number {
  return cellIndex % 10;
}

function getRandomPlacement(shipType: ShipType, shipLength: number): ShipPlacement {
  const startCellIndex = Math.floor(1 + 99 * Math.random()) - 1;
  const vertical = Math.random() <= 0.5;
  const cells = new Array(shipLengths[shipType]).fill(undefined).map((_, idx) => {
    return vertical ? startCellIndex + 10 * idx : startCellIndex + idx;
  });

  return { type: shipType, cells: cells };
}

function doesCollide(first: ShipPlacement, second: ShipPlacement): boolean {
  return first.cells.some((firstCell) => second.cells.includes(firstCell));
}

function isValidPlacement(placement: ShipPlacement, placements: ShipPlacement[]): boolean {
  // Placement would wrap lines
  const rowIndices = new Set<number>(placement.cells.map(getRowIndex));
  if (rowIndices.size !== 1 && rowIndices.size !== placement.cells.length) {
    return false;
  }

  // Placement would leave the board
  if (getRowIndex(placement.cells[placement.cells.length - 1]) >= 10) {
    return false;
  }

  return placements.every((other) => !doesCollide(placement, other));
}

export function PlaceShips(props: Props): JSX.Element | null {
  const { token } = useContext(User);

  const placeShips = () => {
    const placements: ShipPlacement[] = [];
    Object.entries(shipLengths).map(([shipType, shipLength]) => {
      let attempts = 0;
      let placement: ShipPlacement;
      do {
        if (attempts++ >= 20) {
          throw new Error(`Fuck.`);
        }

        placement = getRandomPlacement(shipType as ShipType, shipLength);
      } while (!isValidPlacement(placement, Array.from(placements.values())));

      placements.push(placement);
    });

    props.setShipPlacements(
      placements
        .map((placement) => {
          return { [placement.type]: placement.cells };
        })
        .reduce((a, b) => {
          return { ...a, ...b };
        }, {})
    );
  };

  const submitPlacement = useCallback(() => {
    fetch(`${getApiHost()}/api/game`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ships: props.shipPlacements,
      }),
    }).then();
  }, [props.shipPlacements]);

  return (
    <>
      <EuiButton onClick={placeShips}>Randomize Ships</EuiButton>
      &nbsp;
      <EuiButton onClick={submitPlacement} disabled={!props.shipPlacements}>
        Start Game
      </EuiButton>
    </>
  );
}
