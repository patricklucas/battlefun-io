import React, { useContext } from "react";
import "./App.css";
import { Welcome } from "./Welcome";
import { Game } from "./Game";
import { User } from "./UserProvider";

function App() {
  const { token, player_id } = useContext(User);

  if (!token || !player_id) {
    return <Welcome />;
  }

  return <Game />;
}

export default App;
