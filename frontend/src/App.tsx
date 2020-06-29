import React, { useState, useEffect } from "react";
import "./App.css";
import useLocalStorage from "react-use-localstorage";
import { Welcome } from "./Welcome";
import { Game } from "./Game";

function App() {
  const [name, setName] = useLocalStorage("name", "");
  const [token, setToken] = useLocalStorage("token", "");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const makeRequest = async () => {
      const response = await fetch("/register", {
        method: "POST",
        body: JSON.stringify({ name, token }),
      }).then((r) => r.json());
      debugger;
    };
    makeRequest();
  }, [name, token]);

  if ((!name || !token) && loading) {
    return <Welcome />;
  }

  return <Game user={name} token={token} />;
}

export default App;
