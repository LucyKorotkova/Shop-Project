import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminHeader from "./components/AdminHeader";
import LoginPage from "./pages/LoginPage";
import ProductsListPage from "./pages/ProductsListPage";
import NewProductPage from "./pages/NewProductPage";
import EditProductPage from "./pages/EditProductPage";
import "./App.css";

export default function App() {

  const isAuth = true; 

  return (
    <BrowserRouter basename="/admin">
      <AdminHeader isAuth={isAuth} />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={isAuth ? <ProductsListPage /> : <Navigate to="/login" />} />
        <Route path="/new-product" element={isAuth ? <NewProductPage /> : <Navigate to="/login" />} />
        <Route path="/:id" element={isAuth ? <EditProductPage /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}