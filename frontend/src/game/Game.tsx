import React, { useRef, useMemo, useState, useContext, useEffect, MouseEvent, useCallback } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { GridComponent } from "../Grid";
import { User } from "../UserProvider";
import { mergeDeep } from "../utils/mergeDeep";
import { EuiPanel, EuiBadge, EuiCallOut, EuiButton } from "@elastic/eui";
import styled from "styled-components";
import { PlayerTurn } from "./";

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

export const game_state: GameState = {
  opponent_id: "some-guid",
  current_state: "IN_PROGRESS",
  your_turn: true, // only if IN_PROGRESS
  your_shots: [
    { cell: 13, hit: false },
    { cell: 35, hit: false },
    { cell: 50, hit: false },
    { cell: 67, hit: true },
    { cell: 77, hit: true },
    { cell: 87, hit: true },
    { cell: 88, hit: false },
  ],
  opponent_shots: [12, 13, 34, 55, 62, 65, 88], // ^ same as above
  destroyed_opponent_ships: ["destroyer"],
  your_ships: {
    carrier: [0, 1, 2, 3, 4],
    battleship: [12, 13, 14, 15],
    destroyer: [23, 33, 43],
    submarine: [77, 78, 79],
    patrol_boat: [55, 65],
  },
};

export interface GameState {
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
  setConnection: React.Dispatch<React.SetStateAction<ReadyState>>;
}

export function Game(props: Props) {
  const { setConnection } = props;
  const { player_id, token } = useContext(User);
  const { sendMessage, lastMessage, readyState } = useWebSocket(`ws://localhost:8000/ws/${player_id}`);
  const [authenticated, setAuthenticated] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(game_state);
  const [showYourBoard, setShowYourBoard] = useState<boolean>(false);
  const [showEnemyBoard, setShowEnemyBoard] = useState<boolean>(false);
  const messageHistory = useRef<MessageEvent[]>([]);
  messageHistory.current = useMemo(() => messageHistory.current.concat(lastMessage), [lastMessage]);

  useEffect(() => {
    if (readyState === 1 && !authenticated) {
      sendMessage(JSON.stringify({ type: "authentication", token }));
    }

    setConnection(readyState);
  }, [readyState, token, authenticated, sendMessage, setConnection]);

  useEffect(() => {
    const data = JSON.parse(lastMessage?.data || "{}");
    switch (data.type) {
      case "authentication_response":
        setAuthenticated(data.success);
        break;
      case "game_state":
        const newState = mergeDeep<GameState>({}, gameState, data.game_state);

        setGameState(newState);
        break;
      default:
        console.log({ data });
        break;
    }
  }, [lastMessage]);

  const destroyed_ships = Object.entries(gameState?.your_ships ?? {}).reduce((prev, [name, ship]) => {
    if (ship.every((cell) => gameState?.opponent_shots.includes(cell))) {
      return prev.concat(name);
    }
    return prev;
  }, [] as GameState["destroyed_opponent_ships"]);

  // Debug
  const { your_turn } = gameState ?? {};
  const changeTurn = useCallback(() => {
    fetch("http://localhost:8000/api/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
      <PlayerTurn gameState={gameState} />
      <EuiPanel paddingSize="l">
        <GridComponent
          sendMessage={sendMessage}
          gameState={gameState}
          showYourBoard={showYourBoard}
          showEnemyBoard={showEnemyBoard}
        />
      </EuiPanel>
      <br />
      <div style={{ display: "flex", alignItems: "baseline" }}>
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
