import React, { useState, MouseEvent, useCallback } from "react";

import { GridComponent } from "../Grid";

import { EuiPanel, EuiBadge, EuiButton } from "@elastic/eui";
import styled from "styled-components";
import { PlayerTurn } from "./";
import { PlaceShips } from "./PlaceShips";
import { getApiHost } from "../utils/getApiHost";

const ButtonGroup = styled.div`
  display: flex;
  justify-content: stretch;
  align-items: center;
  width: 100%;

  button {
    flex: 1 1 50%;

    + button {
      margin-left: 8px;
    }
  }
`;

const ships: {
  [key: string]: string;
} = {
  carrier: "Carrier",
  battleship: "Battleship",
  destroyer: "Destroyer",
  submarine: "Submarine",
  patrol_boat: "Patrol Boat",
};

export interface GameState {
  game_id: string;
  current_state: "IN_PROGRESS" | "WIN" | "LOSS";
  destroyed_opponent_ships: string[];
  opponent_id: string;
  opponent_shots: number[];
  your_ships: { [ship: string]: number[] };
  your_shots: Array<{
    cell: number;
    hit: boolean;
  }>;
  your_turn: boolean;
}

interface Props {
  gameState: GameState | null;
  token: string;
  setGameState: React.Dispatch<React.SetStateAction<GameState | null>>;
}

export function Game(props: Props) {
  const { gameState, token } = props;
  const [showYourBoard, setShowYourBoard] = useState<boolean>(false);
  const [showEnemyBoard, setShowEnemyBoard] = useState<boolean>(false);
  const [shipPlacements, setShipPlacements] = useState<GameState["your_ships"] | null>(null);

  const takeShot = useCallback(
    (cell) => async (e: MouseEvent) => {
      fetch(`${getApiHost()}/api/game/5363db8b-1bee-488c-bd7c-acaa590c6a8f`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cell }),
      });
    },
    []
  );

  const destroyed_ships = Object.entries(gameState?.your_ships ?? {}).reduce((prev, [name, ship]) => {
    if (ship.every((cell) => gameState?.opponent_shots.includes(cell))) {
      return prev.concat(name);
    }
    return prev;
  }, [] as GameState["destroyed_opponent_ships"]);

  // Debug
  const { your_turn } = gameState ?? {};
  const changeTurn = useCallback(() => {
    fetch(`${getApiHost()}/api/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        message: JSON.stringify({
          type: "game_state",
          game_state: { your_turn: !your_turn },
        }),
      }),
    }).then();
  }, [your_turn]);

  return (
    <>
      {!gameState && <PlaceShips shipPlacements={shipPlacements} setShipPlacements={setShipPlacements} />}
      <PlayerTurn gameState={gameState} />
      <EuiPanel paddingSize="l">
        <GridComponent
          gameState={gameState}
          shipPlacements={shipPlacements}
          showYourBoard={showYourBoard}
          showEnemyBoard={showEnemyBoard}
          takeShot={takeShot}
        />
      </EuiPanel>
      <br />
      <div style={{ display: "flex", alignItems: "baseline", flexWrap: "wrap" }}>
        Your Ships:{" "}
        {Object.entries(ships).map(([ship, name]) => (
          <EuiBadge
            key={ship}
            style={{ marginLeft: 4, marginBottom: 4 }}
            isDisabled={destroyed_ships.includes(ship)}
            color="primary"
          >
            {name}
          </EuiBadge>
        ))}
      </div>

      {gameState && (
        <>
          <br />
          <ButtonGroup>
            <EuiButton
              onTouchStart={() => setShowYourBoard(true)}
              onTouchEnd={() => setShowYourBoard(false)}
              onMouseDown={() => setShowYourBoard(true)}
              onMouseUp={() => setShowYourBoard(false)}
              isDisabled={gameState.your_turn}
            >
              Show Your Attacks
            </EuiButton>
            <EuiButton
              onTouchStart={() => setShowEnemyBoard(true)}
              onTouchEnd={() => setShowEnemyBoard(false)}
              onMouseDown={() => setShowEnemyBoard(true)}
              onMouseUp={() => setShowEnemyBoard(false)}
              isDisabled={!gameState.your_turn}
            >
              Show Enemy Attacks
            </EuiButton>
          </ButtonGroup>
        </>
      )}

      <div
        style={{
          padding: 8,
          border: "1px lightpink dashed",
          marginTop: 16,
        }}
      >
        <EuiButton onClick={changeTurn}>Change Turn</EuiButton>
      </div>
    </>
  );
}
