import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Register() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [perfil, setPerfil] = useState("cliente");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const enviar = async () => {
    setErro("");

    // Validações
    if (!nome || !email || !senha) {
      setErro("Preencha todos os campos");
      return;
    }

    if (senha.length < 3) {
      setErro("Senha deve ter no mínimo 3 caracteres");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/register", { 
        nome, 
        email, 
        senha, 
        perfil 
      });

      // Salvar dados no localStorage
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("perfil", response.data.usuario.perfil);
      localStorage.setItem("nome", response.data.usuario.nome);
      localStorage.setItem("email", response.data.usuario.email);

      // Redirecionar
      if (response.data.usuario.perfil === "restaurante") {
        navigate("/restaurante");
      } else {
        navigate("/cardapio");
      }
    } catch (err) {
      const msg = err.response?.data?.erro || "Erro ao cadastrar";
      setErro(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      enviar();
    }
  };

  return (
    <div className="center">
      <div style={{
        maxWidth: "400px",
        margin: "60px auto",
        padding: "40px",
        background: "#fff",
        borderRadius: "12px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)"
      }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1 style={{ fontSize: "48px", margin: "0 0 8px 0" }}>🍕</h1>
          <h2 style={{ margin: "0 0 8px 0" }}>Criar Conta</h2>
          <p className="small" style={{ color: "#666" }}>
            Cadastre-se para fazer pedidos
          </p>
        </div>

        {erro && (
          <div className="alert" style={{ 
            background: "#fee", 
            border: "1px solid #fcc", 
            padding: "12px", 
            borderRadius: "6px",
            marginBottom: "16px",
            textAlign: "center"
          }}>
            ❌ {erro}
          </div>
        )}

        <input 
          placeholder="👤 Nome completo" 
          value={nome} 
          onChange={e => setNome(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
          style={{ marginBottom: "12px" }}
        />

        <input 
          placeholder="📧 Email" 
          type="email"
          value={email} 
          onChange={e => setEmail(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
          style={{ marginBottom: "12px" }}
        />
        
        <input 
          placeholder="🔒 Senha (mínimo 3 caracteres)" 
          type="password" 
          value={senha} 
          onChange={e => setSenha(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
          style={{ marginBottom: "12px" }}
        />
        
        <select 
          value={perfil} 
          onChange={e => setPerfil(e.target.value)}
          disabled={loading}
          style={{ marginBottom: "20px" }}
        >
          <option value="cliente">👤 Cliente (fazer pedidos)</option>
          <option value="restaurante">🍕 Restaurante (gerenciar)</option>
        </select>
        
        <button 
          onClick={enviar}
          disabled={loading}
          style={{
            width: "100%",
            background: "#28a745",
            fontSize: "16px",
            fontWeight: "bold",
            padding: "14px",
            marginBottom: "16px"
          }}
        >
          {loading ? "Cadastrando..." : "✅ Cadastrar"}
        </button>

        <p style={{ textAlign: "center", fontSize: "14px" }}>
          Já tem conta?{" "}
          <a 
            href="/login" 
            style={{ 
              color: "#0066ff",
              textDecoration: "none",
              fontWeight: "bold"
            }}
          >
            Fazer login
          </a>
        </p>
      </div>
    </div>
  );
}