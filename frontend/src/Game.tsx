import React, { useRef, useMemo, useState, useCallback, useContext, useEffect } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { GridComponent } from "./Grid";
import { User } from "./UserProvider";

interface Props {}

const connectionStatus = {
  [ReadyState.CONNECTING]: "Connecting",
  [ReadyState.OPEN]: "Open",
  [ReadyState.CLOSING]: "Closing",
  [ReadyState.CLOSED]: "Closed",
  [ReadyState.UNINSTANTIATED]: "Uninstantiated",
};

export function Game(props: Props) {
  const { player_id, token } = useContext(User);
  const { sendMessage, lastMessage, readyState } = useWebSocket(`ws://localhost:8000/ws/${player_id}`);
  const [authenticated, setAuthenticated] = useState(false);

  const messageHistory = useRef<MessageEvent[]>([]);

  messageHistory.current = useMemo(() => messageHistory.current.concat(lastMessage), [lastMessage]);

  useEffect(() => {
    if (readyState === 1 && !authenticated) {
      // sendMessage(JSON.stringify({ type: "authentication", token }));
    }
  }, [readyState, token, authenticated, sendMessage]);

  useEffect(() => {
    console.log({ lastMessage });
  }, [lastMessage]);

  return (
    <div className="App">
      <h2>Websocket: {connectionStatus[readyState]}</h2>
      <GridComponent sendMessage={sendMessage} />
    </div>
  );
}
