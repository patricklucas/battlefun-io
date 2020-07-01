import React, { FC, FormEvent, useCallback } from "react";
import ReactDOM from "react-dom";
import useLocalStorage from "react-use-localstorage";
import { getApiHost } from "./utils/getApiHost";

interface User {
  name: string;
  token: string;
  player_id: string;
}

const defaultState = {
  name: "",
  token: "",
  player_id: "",
  registerUser: (e: FormEvent) => {},
  setName: (name: string) => {},
  logout: () => {},
};

const makeBody = (user: User): string => {
  const data = Object.entries(user).reduce((prev: { [key: string]: string }, [key, value]) => {
    prev[key] = value || null;
    return prev;
  }, {});
  return JSON.stringify(data);
};

export const User = React.createContext(defaultState);

export const UserProvider: FC = (props) => {
  const [name, setName] = useLocalStorage("user", defaultState.name);
  const [token, setToken] = useLocalStorage("token", defaultState.token);
  const [player_id, setPlayerId] = useLocalStorage("player_id", defaultState.player_id);

  const registerUser = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      const makeRequest = async () => {
        const response = await fetch(`${getApiHost()}/api/register`, {
          method: "POST",
          body: makeBody({ name, token, player_id }),
          headers: { "Content-Type": "application/json" },
        }).then((r) => {
          if (!r.ok) {
            throw new Error(r.statusText);
          }
          return r.json() as Promise<User>;
        });

        ReactDOM.unstable_batchedUpdates(() => {
          if (response.name) {
            setName(response.name);
          }
          setToken(response.token);
          setPlayerId(response.player_id);
        });
      };
      makeRequest();
    },
    [name, token, player_id, setName, setPlayerId, setToken]
  );

  const logout = useCallback(() => {
    ReactDOM.unstable_batchedUpdates(() => {
      setToken(defaultState.token);
      setPlayerId(defaultState.player_id);
    });
  }, []);

  return (
    <User.Provider value={{ name, token, player_id, registerUser, setName, logout }}>{props.children}</User.Provider>
  );
};
