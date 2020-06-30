import React, { useRef, useMemo, useState, useContext, useEffect, MouseEvent } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { GridComponent, game_state } from "./Grid";
import { User } from "./UserProvider";
import { mergeDeep } from "./utils/mergeDeep";
import { EuiPanel, EuiBadge, EuiCallOut, EuiButton } from "@elastic/eui";
import styled from "styled-components";

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

  return (
    <>
      {gameState && (
        <EuiCallOut
          color={gameState.your_turn ? "success" : "danger"}
          title={
            gameState.your_turn ? (
              <>
                <i className="fad fa-user"></i>&nbsp; Your Turn
              </>
            ) : (
              <>
                <i className="fad fa-user-secret"></i>&nbsp; Enemy Turn
              </>
            )
          }
        ></EuiCallOut>
      )}
      <br />
      <EuiPanel paddingSize="l">
        <GridComponent
          sendMessage={sendMessage}
          gameState={gameState}
          showYourBoard={showYourBoard}
          showEnemyBoard={showEnemyBoard}
        />
      </EuiPanel>

      {gameState && (
        <>
          <br />
          <div style={{ margin: "-4px 0" }}>
            {Object.entries(ships).map(([ship, name]) => (
              <EuiBadge
                style={{ marginLeft: 4, marginBottom: 4 }}
                isDisabled={gameState.destroyed_opponent_ships.includes(ship)}
                color="danger"
              >
                {name}
              </EuiBadge>
            ))}
          </div>
          <br />
          <ButtonGroup>
            <EuiButton
              onMouseDown={() => setShowYourBoard(true)}
              onMouseUp={() => setShowYourBoard(false)}
              isDisabled={gameState.your_turn}
            >
              Show Your Attacks
            </EuiButton>
            <EuiButton
              onMouseDown={() => setShowEnemyBoard(true)}
              onMouseUp={() => setShowEnemyBoard(false)}
              isDisabled={!gameState.your_turn}
            >
              Show Enemy Attacks
            </EuiButton>
          </ButtonGroup>
        </>
      )}
    </>
  );
}
