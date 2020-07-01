import React, { useContext } from "react";
import { EuiButton } from "@elastic/eui";
import { getApiHost } from "../utils/getApiHost";
import { User } from "../UserProvider";

export function PlaceShips(): JSX.Element | null {
  const { token } = useContext(User);

  return (
    <EuiButton
      onClick={() => {
        fetch(`${getApiHost()}/api/game`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ships: {
              carrier: [0, 1, 2, 3, 4],
              battleship: [12, 13, 14, 15],
              destroyer: [23, 33, 43],
              submarine: [77, 78, 79],
              patrol_boat: [55, 65],
            },
          }),
        }).then();
      }}
    >
      Place Ships
    </EuiButton>
  );
}
