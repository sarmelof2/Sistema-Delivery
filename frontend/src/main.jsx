import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import "./index.css";
import Menu from "./pages/Menu.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Carrinho from "./pages/Carrinho.jsx";
import Checkout from "./pages/Checkout.jsx";
import MeusPedidos from "./pages/MeusPedidos.jsx";
import PainelRestaurante from "./pages/PainelRestaurante.jsx";

function Topbar() {
  const [auth, setAuth] = React.useState(() => ({
    token: localStorage.getItem("token"),
    perfil: localStorage.getItem("perfil"),
    nome: localStorage.getItem("nome") || "Usuário",
  }));

  React.useEffect(() => {
    const sync = () => {
      setAuth({
        token: localStorage.getItem("token"),
        perfil: localStorage.getItem("perfil"),
        nome: localStorage.getItem("nome") || "Usuário",
      });
    };
    window.addEventListener("auth", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("auth", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const sair = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const { token, perfil, nome } = auth;
  const destinoLogo = !token ? "/login" : (perfil === "restaurante" ? "/restaurante" : "/cardapio");

  return (
    <div className="topbar">
      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "20px", fontWeight: "bold" }}>
        <span>🍕</span>
        <Link to={destinoLogo} style={{ textDecoration: "none", color: "#fff" }}>
          Sarmelo Delivery
        </Link>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {token ? (
          <>
            {/* Cliente vê Cardápio/Carrinho/Meus; Restaurante NÃO vê */}
            {perfil !== "restaurante" && (
              <>
                <Link to="/cardapio" style={{ display: "flex", alignItems: "center", gap: "6px", textDecoration: "none", color: "#fff" }}>
                  <span>🍽️</span> Cardápio
                </Link>
                <Link to="/carrinho" style={{ display: "flex", alignItems: "center", gap: "6px", textDecoration: "none", color: "#fff" }}>
                  <span>🛒</span> Carrinho
                </Link>
              </>
            )}

            {perfil === "cliente" && (
              <Link to="/meus" style={{ display: "flex", alignItems: "center", gap: "6px", textDecoration: "none", color: "#fff" }}>
                <span>📦</span> Meus Pedidos
              </Link>
            )}

            {perfil === "restaurante" && (
              <Link to="/restaurante" style={{ display: "flex", alignItems: "center", gap: "6px", textDecoration: "none", color: "#fff" }}>
                <span>⚙️</span> Painel
              </Link>
            )}

            <div style={{ borderLeft: "1px solid rgba(255,255,255,0.3)", paddingLeft: "16px", display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "14px" }}>👤 {nome}</span>
              <button onClick={sair} style={{ background: "#dc3545", padding: "6px 16px", fontSize: "14px", margin: 0, width: "auto" }}>
                🚪 Sair
              </button>
            </div>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: "#fff", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>🔑</span> Login
            </Link>
            <Link to="/register" style={{ color: "#fff", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>📝</span> Registrar
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/cardapio" element={<ProtectedRoute><Menu /></ProtectedRoute>} />
      <Route path="/carrinho" element={<ProtectedRoute><Carrinho /></ProtectedRoute>} />
      <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
      <Route path="/meus" element={<ProtectedRoute><MeusPedidos /></ProtectedRoute>} />
      <Route path="/restaurante" element={<ProtectedRoute><PainelRestaurante /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Topbar />
    <AppRoutes />
  </BrowserRouter>
);
