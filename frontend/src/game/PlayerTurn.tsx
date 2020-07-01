import React from "react";
import { EuiCallOut, EuiBadge } from "@elastic/eui";
import { GameState } from "./Game";
import styled from "styled-components";

interface Props {
  gameState: GameState | null;
}

const ships: {
  [key: string]: string;
} = {
  carrier: "Carrier",
  battleship: "Battleship",
  destroyer: "Destroyer",
  submarine: "Submarine",
  patrol_boat: "Patrol Boat",
};

const CallOut = styled(EuiCallOut)`
  margin-bottom: 16px;

  .euiText:empty {
    margin: 0;
  }
`;

const Badges = styled.div`
  display: flex;
  align-items: baseline;
`;

export function PlayerTurn(props: Props): JSX.Element | null {
  if (!props.gameState) {
    return null;
  }

  const { your_turn } = props.gameState;

  const color = your_turn ? "success" : "danger";
  const icon = your_turn ? "fa-user" : "fa-user-secret";
  const message = your_turn ? "Your Turn" : "Enemy Turn";

  const title = (
    <>
      <i className={`fad ${icon}`}></i>&nbsp; {message}
    </>
  );

  const badges = Object.entries(ships).map(([ship, name]) => (
    <EuiBadge
      key={ship}
      style={{ marginLeft: 4, marginBottom: 4 }}
      isDisabled={props.gameState?.destroyed_opponent_ships.includes(ship)}
      color="danger"
    >
      {name}
    </EuiBadge>
  ));

  return (
    <CallOut color={color} title={title}>
      {your_turn && <Badges>Enemy Ships: {badges}</Badges>}
    </CallOut>
  );
}
