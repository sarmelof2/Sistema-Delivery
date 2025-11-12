import { useState } from "react";
import api from "../api";

export default function Register(){
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [perfil, setPerfil] = useState("cliente");
  const [msg, setMsg] = useState("");

  const enviar = async () => {
    setMsg("");
    await api.post("/auth/register", { nome, email, senha, perfil });
    setMsg("Cadastro realizado. Vá para o login.");
  };

  return (
    <div className="center">
      <h2>Registrar</h2>
      <input placeholder="Nome" value={nome} onChange={e=>setNome(e.target.value)} />
      <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input placeholder="Senha" type="password" value={senha} onChange={e=>setSenha(e.target.value)} />
      <select value={perfil} onChange={e=>setPerfil(e.target.value)}>
        <option value="cliente">Cliente</option>
        <option value="restaurante">Restaurante</option>
      </select>
      <button onClick={enviar}>Cadastrar</button>
      {msg && <p className="badge">{msg}</p>}
    </div>
  );
}
