import React, { useRef, useMemo, useState, useCallback, useContext, useEffect } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { GridComponent, game_state } from "./Grid";
import { User } from "./UserProvider";
import { mergeDeep } from "./utils/mergeDeep";

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

interface Props {}

const connectionStatus = {
  [ReadyState.CONNECTING]: "Connecting",
  [ReadyState.OPEN]: "Open",
  [ReadyState.CLOSING]: "Closing",
  [ReadyState.CLOSED]: "Closed",
  [ReadyState.UNINSTANTIATED]: "Uninstantiated",
};

const myShips = {
  freighter: [3, 4, 5, 6, 7],
  starship: [12, 13, 14, 15],
  heavyCruiser: [23, 33, 43],
  lightCruiser: [77, 78, 79],
  drydock: [55, 65],
};

export function Game(props: Props) {
  const { player_id, token, logout } = useContext(User);
  const { sendMessage, lastMessage, readyState } = useWebSocket(`ws://localhost:8000/ws/${player_id}`);
  const [authenticated, setAuthenticated] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(game_state);

  const messageHistory = useRef<MessageEvent[]>([]);

  messageHistory.current = useMemo(() => messageHistory.current.concat(lastMessage), [lastMessage]);

  useEffect(() => {
    if (readyState === 1 && !authenticated) {
      sendMessage(JSON.stringify({ type: "authentication", token }));
    }
  }, [readyState, token, authenticated, sendMessage]);

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
    <div className="App">
      <h2>Websocket: {connectionStatus[readyState]}</h2>
      <GridComponent sendMessage={sendMessage} myShips={myShips} gameState={gameState} />
      <button onClick={logout}>Logout</button>
    </div>
  );
}
