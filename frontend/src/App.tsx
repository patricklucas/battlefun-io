import React, { useContext, useState, useEffect } from "react";
import { Welcome } from "./Welcome";
import { Game } from "./game";
import { User } from "./UserProvider";
import { EuiHeader, EuiHeaderSection, EuiHeaderSectionItem, EuiHeaderLogo, EuiButton, EuiPanel } from "@elastic/eui";
import { ReadyState } from "react-use-websocket";
import { MaxWidthSection } from "./utils/breakpoints";
import styled from "styled-components";

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

function App() {
  const { token, player_id, logout, name } = useContext(User);
  const [connection, setConnection] = useState<ReadyState>(ReadyState.UNINSTANTIATED);
  useEffect(() => {
    if (!!connection && !player_id) {
      setConnection(ReadyState.UNINSTANTIATED);
    }
  }, [player_id, connection]);

  useEffect(() => {
    if (connection === ReadyState.CLOSED) {
      logout();
    }
  }, [connection]);

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
                {status[connection]}
                {name && <span> as {name} </span>}
              </small>
              <i className={`fad ${icons[connection]}`}></i>
            </EuiHeaderSectionItem>
          </EuiHeaderSection>
        </HeaderMaxWidth>
      </Header>
      <Content>{!token || !player_id ? <Welcome /> : <Game setConnection={setConnection} />}</Content>
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
