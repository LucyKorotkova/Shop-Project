import { Link, useLocation } from "react-router-dom";

export default function AdminHeader({ isAuth }: { isAuth: boolean }) {
  const location = useLocation();
  const isLogin = location.pathname === "/login";
  return (
    <header style={{ padding: 16, background: "#f5f5f5", marginBottom: 24 }}>
      {!isLogin && isAuth && (
        <>
          <Link to="/">Список товаров</Link> |{" "}
          <Link to="/new-product">Add product</Link> |{" "}
          <button onClick={() => alert("Реализуй выход!")}>Выйти</button>
        </>
      )}
    </header>
  );
}
