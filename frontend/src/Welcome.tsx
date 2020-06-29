import React, { useCallback, FormEvent } from "react";

export function Welcome() {
  const registerUser = useCallback((event: FormEvent) => {
    debugger;

    fetch("/register", {
      method: "POST",
      body: "",
    });
  }, []);

  return (
    <>
      <div>Welcome</div>
      <form onSubmit={registerUser}>
        <label>username</label>
        <input name="username" />
      </form>
    </>
  );
}
