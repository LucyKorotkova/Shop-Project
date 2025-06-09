import { useState } from "react";

export default function LoginPage() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    alert(`Логин: ${login}, Пароль: ${password}`);
  }

  return (
    <div>
      <h2>Вход в админку</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Логин"
          value={login}
          onChange={e => setLogin(e.target.value)}
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button type="submit">Войти</button>
      </form>
    </div>
  );
}
