import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const entrar = async () => {
    if (loading) return;

    setErro("");

    if (!email || !senha) {
      setErro("Preencha email e senha");
      return;
    }

    setLoading(true);

    try {
      const resp = await api.post("/auth/login", { email, senha });

      // Tolerante ao formato da API
      const data = resp?.data || {};
      const token = data.token || data?.resultado?.token || "";
      const usuario = data.usuario || data?.resultado?.usuario || {};

      // Salva infos mínimas para navbar/rotas
      localStorage.setItem("token", token);
      if (usuario?.perfil) localStorage.setItem("perfil", usuario.perfil);
      if (usuario?.nome) localStorage.setItem("nome", usuario.nome);
      localStorage.setItem("email", usuario?.email || email);

      // Notifica a app que o estado de auth mudou (opcional, mas útil)
      window.dispatchEvent(new Event("auth"));

      // ⚡ garante re-render geral já logado
      window.location.href = "/cardapio";
    } catch (err) {
      setErro(err?.response?.data?.erro || "Credenciais inválidas");
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") entrar();
  };

  return (
    <div className="center">
      <div
        style={{
          maxWidth: "400px",
          margin: "60px auto",
          padding: "40px",
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 style={{ fontSize: "48px", margin: "0 0 8px 0" }}>🍕</h1>
          <h2 style={{ margin: "0 0 8px 0" }}>Sarmelo Delivery</h2>
          <p className="small" style={{ color: "#666" }}>
            Faça login para continuar
          </p>
        </div>

        {erro && (
          <div
            className="alert"
            style={{
              background: "#fee",
              border: "1px solid #fcc",
              padding: "12px",
              borderRadius: "6px",
              marginBottom: "16px",
              textAlign: "center",
            }}
          >
            ❌ {erro}
          </div>
        )}

        <input
          placeholder="📧 Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          autoComplete="email"
          style={{ marginBottom: "12px" }}
        />

        <input
          placeholder="🔒 Senha"
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
          autoComplete="current-password"
          style={{ marginBottom: "20px" }}
        />

        <button
          onClick={entrar}
          disabled={loading}
          style={{
            width: "100%",
            background: "#0066ff",
            color: "#fff",
            fontSize: "16px",
            fontWeight: "bold",
            padding: "14px",
            marginBottom: "16px",
            opacity: loading ? 0.8 : 1,
            cursor: loading ? "not-allowed" : "pointer",
            border: "none",
            borderRadius: "6px",
          }}
        >
          {loading ? "Entrando..." : "🔑 Entrar"}
        </button>

        <div
          style={{
            textAlign: "center",
            padding: "16px",
            background: "#f9f9f9",
            borderRadius: "6px",
            marginBottom: "16px",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              color: "#666",
              marginBottom: "8px",
              fontWeight: "bold",
            }}
          >
            💡 Contas para teste:
          </p>
          <p style={{ fontSize: "12px", margin: "4px 0" }}>
            <strong>Cliente:</strong> cli@demo.com / 123
          </p>
          <p style={{ fontSize: "12px", margin: "4px 0" }}>
            <strong>Restaurante:</strong> rest@demo.com / 123
          </p>
        </div>

        <p style={{ textAlign: "center", fontSize: "14px" }}>
          Não tem conta?{" "}
          <a
            href="/register"
            style={{
              color: "#0066ff",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Criar conta
          </a>
        </p>
      </div>
    </div>
  );
}
