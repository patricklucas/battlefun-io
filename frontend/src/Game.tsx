import React, { useRef, useMemo, useState, useCallback } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { GridComponent } from "./Grid";

interface Props {
  user: string;
  token: string;
}

const connectionStatus = {
  [ReadyState.CONNECTING]: "Connecting",
  [ReadyState.OPEN]: "Open",
  [ReadyState.CLOSING]: "Closing",
  [ReadyState.CLOSED]: "Closed",
  [ReadyState.UNINSTANTIATED]: "Uninstantiated",
};

export function Game(props: Props) {
  const playerId = 1;
  const [socketUrl, setSocketUrl] = useState("wss://echo.websocket.org");
  // const [socketUrl, setSocketUrl] = useState("/ws");

  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl);

  // This will actually happen when the user logs in
  const handleClickChangeSocketUrl = useCallback(
    () => setSocketUrl(`/ws/${playerId}`),
    []
  );

  const messageHistory = useRef<MessageEvent[]>([]);

  messageHistory.current = useMemo(
    () => messageHistory.current.concat(lastMessage),
    [lastMessage]
  );

  return (
    <div className="App">
      <h2>Websocket: {connectionStatus[readyState]}</h2>
      <GridComponent sendMessage={sendMessage} />
    </div>
  );
}
