import React, { useContext, useState, useEffect, useCallback } from "react";
import { Welcome } from "./Welcome";
import { Game } from "./game";
import { User } from "./UserProvider";
import { EuiHeader, EuiHeaderSection, EuiHeaderSectionItem, EuiHeaderLogo, EuiButton, EuiPanel } from "@elastic/eui";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { MaxWidthSection } from "./utils/breakpoints";
import styled from "styled-components";
import { getApiHost } from "./utils/getApiHost";
import { GameState } from "./game/Game";
import { mergeDeep } from "./utils/mergeDeep";
import { fakeGameState } from "./utils/fakeGameState";

const HeaderMaxWidth = styled(MaxWidthSection)`
  display: flex;
  justify-content: space-between;
`;

const Header = styled(EuiHeader)`
  padding: 0;

  h1 {
    padding-left: 0;
  }
`;

const Container = styled.main`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas: "header" "content" "footer";
  width: 100vw;
  height: 100vh;
  overflow: hidden;

  & > section {
    overflow-x: hidden;
    overflow-y: auto;
  }
`;

const Content = styled(MaxWidthSection)`
  grid-area: content;
  padding-top: 32px;
`;

const Footer = styled(EuiHeader)`
  border-top: 1px solid #cdd3df;
  border-bottom: 0;
  box-shadow: none;
  padding: 8px 0 16px;
  height: auto;
`;

const icons: {
  [key in ReadyState]: string;
} = {
  [ReadyState.CONNECTING]: "fa-siren-on",
  [ReadyState.OPEN]: "fa-siren",
  [ReadyState.CLOSING]: "",
  [ReadyState.CLOSED]: "",
  [ReadyState.UNINSTANTIATED]: "fa-siren-on",
};

const status: {
  [key in ReadyState]: string;
} = {
  [ReadyState.CONNECTING]: "connecting",
  [ReadyState.OPEN]: "connected",
  [ReadyState.CLOSING]: "disconnecting",
  [ReadyState.CLOSED]: "closed",
  [ReadyState.UNINSTANTIATED]: "disconnected",
};

const useApp = () => {
  const { token, player_id, logout, name } = useContext(User);
  const [connect, setConnect] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(fakeGameState);
  const { lastJsonMessage, readyState, sendJsonMessage } = useWebSocket(
    `${getApiHost("ws")}/ws/${player_id}`,
    {},
    connect
  );

  useEffect(() => {
    if (player_id) {
      setConnect(true);
    }
  }, [player_id, setConnect]);

  useEffect(() => {
    if (readyState === ReadyState.CLOSED) {
      logout();
    }
  }, [readyState]);

  useEffect(() => {
    if (readyState === 1 && !authenticated) {
      sendJsonMessage({ type: "authentication", token });
    }
  }, [readyState, token, authenticated, sendJsonMessage]);

  useEffect(() => {
    const data = lastJsonMessage?.data || {};
    switch (data.type) {
      case "authentication_response":
        setAuthenticated(data.success);
        if (!data.success) {
          logout();
        }
        break;
      case "game_state":
        const newState = mergeDeep<GameState>({}, gameState, data.game_state);
        setGameState(newState);
        break;
      default:
        console.log({ data });
        break;
    }
  }, [lastJsonMessage]);

  return { readyState, gameState, name, logout, token, player_id, setGameState };
};

function App() {
  const { readyState, gameState, name, logout, token, player_id, setGameState } = useApp();

  return (
    <Container>
      <Header>
        <HeaderMaxWidth>
          <EuiHeaderSection grow={false}>
            <EuiHeaderSectionItem border="right">
              <h1 className="euiHeaderLogo__text">
                <i className="fad fa-ship fa-lg" style={{ marginRight: ".5em" }}></i>
                Battlefun
              </h1>
            </EuiHeaderSectionItem>
          </EuiHeaderSection>

          <EuiHeaderSection side="right">
            <EuiHeaderSectionItem>
              <small style={{ marginRight: ".5em" }}>
                {status[readyState]}
                {name && <span> as {name} </span>}
              </small>
              <i className={`fad ${icons[readyState]}`}></i>
            </EuiHeaderSectionItem>
          </EuiHeaderSection>
        </HeaderMaxWidth>
      </Header>
      <Content>
        {!token || !player_id ? <Welcome /> : <Game gameState={gameState} token={token} setGameState={setGameState} />}
      </Content>
      <Footer>
        <HeaderMaxWidth>
          <EuiHeaderSection>
            <EuiHeaderSectionItem>
              <EuiButton onClick={logout}>Logout</EuiButton>
            </EuiHeaderSectionItem>
          </EuiHeaderSection>
        </HeaderMaxWidth>
      </Footer>
    </Container>
  );
}

export default App;
