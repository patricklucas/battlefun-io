import React, { useCallback, FormEvent, useState, useContext } from "react";
import { User } from "./UserProvider";

export function Welcome() {
  const user = useContext(User);

  return (
    <>
      <div>Welcome</div>
      <form onSubmit={user.registerUser}>
        <label>username</label>
        <input name="name" value={user.name} onChange={(e) => user.setName(e.target.value)} />
      </form>
    </>
  );
}
