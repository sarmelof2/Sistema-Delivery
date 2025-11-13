import { useEffect, useState } from "react";
import api, { authHeader } from "../api";

export default function PainelRestaurante() {
  const [categorias, setCategorias] = useState([]);
  const [itens, setItens] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [cupons, setCupons] = useState([]);
  
  const [formCat, setFormCat] = useState({ nome: "" });
  const [formItem, setFormItem] = useState({
    nome: "",
    descricao: "",
    preco: "",
    categoria_id: "",
    disponivel: true,
    imagem_url: ""
  });
  const [formCupom, setFormCupom] = useState({
    codigo: "",
    descricao: "",
    tipo: "percentual",
    valor: "",
    minimo: "",
    ativo: true
  });

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [abaAtiva, setAbaAtiva] = useState("pedidos");
  
  const [itensPorPedido, setItensPorPedido] = useState({});
  const [abertos, setAbertos] = useState({});
  const [loadingItens, setLoadingItens] = useState({});

  const steps = ["Recebido", "Em preparo", "Saiu para entrega", "Entregue"];

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const h = { headers: authHeader() };
      const [resCat, resItens, resPedidos, resCupons] = await Promise.all([
        api.get("/categorias", h),
        api.get("/itens", h),
        api.get("/pedidos", h),
        api.get("/cupons", h)
      ]);

      setCategorias(resCat.data || []);
      setItens(resItens.data || []);
      setPedidos(resPedidos.data || []);
      setCupons(resCupons.data || []);
    } catch (err) {
      setErro("Faça login como restaurante");
    }
  };

  // CATEGORIAS
  const salvarCategoria = async () => {
    if (!formCat.nome) {
      setErro("Digite o nome da categoria");
      return;
    }
    try {
      await api.post("/categorias", { nome: formCat.nome }, { headers: authHeader() });
      setFormCat({ nome: "" });
      setSucesso("✅ Categoria criada!");
      load();
      setTimeout(() => setSucesso(""), 2000);
    } catch (err) {
      setErro(err.response?.data?.erro || "Erro ao criar categoria");
    }
  };

  const excluirCategoria = async (id) => {
    if (!confirm("Excluir esta categoria?")) return;
    try {
      await api.delete("/categorias/" + id, { headers: authHeader() });
      setSucesso("✅ Categoria excluída!");
      load();
      setTimeout(() => setSucesso(""), 2000);
    } catch (err) {
      setErro(err.response?.data?.erro || "Erro ao excluir categoria");
    }
  };

  // ITENS
  const salvarItem = async () => {
    if (!formItem.nome || !formItem.preco) {
      setErro("Preencha nome e preço");
      return;
    }
    try {
      const body = {
        nome: formItem.nome,
        descricao: formItem.descricao,
        preco: Number(formItem.preco),
        categoria_id: formItem.categoria_id ? Number(formItem.categoria_id) : null,
        disponivel: !!formItem.disponivel,
        imagem_url: formItem.imagem_url || null
      };
      await api.post("/itens", body, { headers: authHeader() });
      setFormItem({
        nome: "",
        descricao: "",
        preco: "",
        categoria_id: "",
        disponivel: true,
        imagem_url: ""
      });
      setSucesso("✅ Item criado!");
      load();
      setTimeout(() => setSucesso(""), 2000);
    } catch (err) {
      setErro(err.response?.data?.erro || "Erro ao criar item");
    }
  };

  const excluirItem = async (id) => {
    if (!confirm("Excluir este item?")) return;
    try {
      await api.delete("/itens/" + id, { headers: authHeader() });
      setSucesso("✅ Item excluído!");
      load();
      setTimeout(() => setSucesso(""), 2000);
    } catch (err) {
      setErro(err.response?.data?.erro || "Erro ao excluir item");
    }
  };

  // CUPONS
  const salvarCupom = async () => {
    if (!formCupom.codigo || !formCupom.valor) {
      setErro("Preencha código e valor");
      return;
    }
    try {
      const body = {
        codigo: formCupom.codigo.toUpperCase(),
        descricao: formCupom.descricao,
        tipo: formCupom.tipo,
        valor: Number(formCupom.valor),
        minimo: Number(formCupom.minimo) || 0,
        ativo: !!formCupom.ativo
      };
      await api.post("/cupons", body, { headers: authHeader() });
      setFormCupom({
        codigo: "",
        descricao: "",
        tipo: "percentual",
        valor: "",
        minimo: "",
        ativo: true
      });
      setSucesso("✅ Cupom criado!");
      load();
      setTimeout(() => setSucesso(""), 2000);
    } catch (err) {
      setErro(err.response?.data?.erro || "Erro ao criar cupom");
    }
  };

  const excluirCupom = async (id) => {
    if (!confirm("Excluir este cupom?")) return;
    try {
      await api.delete("/cupons/" + id, { headers: authHeader() });
      setSucesso("✅ Cupom excluído!");
      load();
      setTimeout(() => setSucesso(""), 2000);
    } catch (err) {
      setErro(err.response?.data?.erro || "Erro ao excluir cupom");
    }
  };

  // PEDIDOS
  const toggleItens = async (id) => {
    setAbertos((prev) => ({ ...prev, [id]: !prev[id] }));
    if (itensPorPedido[id]) return;

    try {
      setLoadingItens((p) => ({ ...p, [id]: true }));
      const resp = await api.get(`/pedidos/${id}`, { headers: authHeader() });
      const itens = resp?.data?.itens || [];
      setItensPorPedido((prev) => ({ ...prev, [id]: itens }));
    } catch (e) {
      setErro("Não foi possível carregar os itens do pedido");
    } finally {
      setLoadingItens((p) => ({ ...p, [id]: false }));
    }
  };

  const avancarStatus = async (id) => {
    try {
      const r = await api.post(`/pedidos/${id}/avancar`, {}, { headers: authHeader() });
      setPedidos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: r.data?.status || p.status } : p))
      );
      setSucesso("✅ Status atualizado!");
      setTimeout(() => setSucesso(""), 2000);
    } catch {
      setErro("Erro ao avançar status");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Recebido": return "#ffc107";
      case "Em preparo": return "#17a2b8";
      case "Saiu para entrega": return "#ff9800";
      case "Entregue": return "#28a745";
      default: return "#6c757d";
    }
  };

  return (
    <div className="center">
      <h2>🍕 Painel do Restaurante</h2>

      {erro && (
        <div className="alert" style={{ 
          background: "#fee", 
          border: "1px solid #fcc", 
          padding: "10px", 
          borderRadius: "6px",
          marginBottom: "10px"
        }}>
          ❌ {erro}
        </div>
      )}

      {sucesso && (
        <div style={{ 
          background: "#efe", 
          border: "1px solid #cfc", 
          padding: "10px", 
          borderRadius: "6px",
          marginBottom: "10px",
          color: "#060"
        }}>
          {sucesso}
        </div>
      )}

      {/* ABAS */}
      <div style={{ 
        display: "flex", 
        gap: "10px", 
        marginBottom: "20px",
        borderBottom: "2px solid #ddd"
      }}>
        <button
          onClick={() => setAbaAtiva("pedidos")}
          style={{
            background: abaAtiva === "pedidos" ? "#0066ff" : "#f5f5f5",
            color: abaAtiva === "pedidos" ? "#fff" : "#333",
            border: "none",
            padding: "10px 20px",
            borderRadius: "6px 6px 0 0",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          📦 Pedidos ({pedidos.length})
        </button>
        
        <button
          onClick={() => setAbaAtiva("cardapio")}
          style={{
            background: abaAtiva === "cardapio" ? "#0066ff" : "#f5f5f5",
            color: abaAtiva === "cardapio" ? "#fff" : "#333",
            border: "none",
            padding: "10px 20px",
            borderRadius: "6px 6px 0 0",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          🍽️ Cardápio ({itens.length})
        </button>
        
        <button
          onClick={() => setAbaAtiva("cupons")}
          style={{
            background: abaAtiva === "cupons" ? "#0066ff" : "#f5f5f5",
            color: abaAtiva === "cupons" ? "#fff" : "#333",
            border: "none",
            padding: "10px 20px",
            borderRadius: "6px 6px 0 0",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          🎫 Cupons ({cupons.length})
        </button>
      </div>

      {/* ABA PEDIDOS */}
      {abaAtiva === "pedidos" && (
        <div>
          <h3>📦 Pedidos Recentes</h3>
          {pedidos.length === 0 ? (
            <p className="small">Nenhum pedido ainda</p>
          ) : (
            pedidos.map(p => (
              <div key={p.id} className="card" style={{ marginBottom: "15px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ margin: "0 0 10px 0" }}>Pedido #{p.id}</h4>
                  <span style={{
                    background: getStatusColor(p.status),
                    color: "#fff",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "bold"
                  }}>
                    {p.status}
                  </span>
                </div>

                <p className="small" style={{ marginBottom: "8px" }}>
                  👤 Cliente: {p.user_id}
                </p>
                <p style={{ marginBottom: "8px" }}>
                  📍 {p.endereco}
                </p>

                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "1fr 1fr 1fr 1fr", 
                  gap: "10px",
                  marginBottom: "10px",
                  fontSize: "14px"
                }}>
                  <div><strong>Subtotal:</strong><br />R$ {Number(p.subtotal).toFixed(2)}</div>
                  <div><strong>Frete:</strong><br />R$ {Number(p.frete).toFixed(2)}</div>
                  <div><strong>Desconto:</strong><br />- R$ {Number(p.desconto).toFixed(2)}</div>
                  <div><strong>Total:</strong><br /><span style={{ fontSize: "16px", fontWeight: "bold", color: "#0066ff" }}>R$ {Number(p.total).toFixed(2)}</span></div>
                </div>

                {p.cupom_usado && (
                  <p style={{ 
                    background: "#fff3cd", 
                    padding: "6px", 
                    borderRadius: "4px",
                    fontSize: "13px",
                    marginBottom: "10px"
                  }}>
                    🎫 Cupom: <strong>{p.cupom_usado}</strong>
                  </p>
                )}

                <p className="small" style={{ color: "#666", marginBottom: "10px" }}>
                  🕒 {new Date(p.criado_em).toLocaleString("pt-BR")}
                </p>

                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => toggleItens(p.id)} style={{ background: "#0d6efd" }}>
                    {abertos[p.id] ? "✖️ Fechar itens" : "👀 Ver itens"}
                  </button>
                  {p.status !== "Entregue" && (
                    <button onClick={() => avancarStatus(p.id)} style={{ background: "#28a745" }}>
                      ➡️ Avançar status
                    </button>
                  )}
                </div>

                {abertos[p.id] && (
                  <div style={{ marginTop: "12px" }}>
                    <h4 style={{ margin: "8px 0" }}>🛒 Itens do Pedido</h4>
                    {loadingItens[p.id] ? (
                      <p className="small">Carregando...</p>
                    ) : (itensPorPedido[p.id] || []).length === 0 ? (
                      <p className="small">Sem itens</p>
                    ) : (
                      <div style={{ display: "grid", gap: "8px" }}>
                        {itensPorPedido[p.id].map((it, idx) => (
                          <div key={idx} style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            padding: "12px",
                            background: "#f9f9f9",
                            borderRadius: "8px"
                          }}>
                            {it.imagem_url && (
                              <img src={it.imagem_url} alt={it.nome} style={{
                                width: "60px",
                                height: "60px",
                                objectFit: "cover",
                                borderRadius: "6px"
                              }} />
                            )}
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: "bold" }}>{it.nome}</div>
                              <div className="small">Qtd: {it.qtd} • R$ {Number(it.preco_unit).toFixed(2)}</div>
                            </div>
                            <div><strong>R$ {(it.qtd * it.preco_unit).toFixed(2)}</strong></div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ABA CARDÁPIO */}
      {abaAtiva === "cardapio" && (
        <div>
          <h3>📁 Categorias</h3>
          <div className="row" style={{ marginBottom: "20px" }}>
            <div style={{ flex: 2 }}>
              <input placeholder="Nome da categoria" value={formCat.nome} onChange={e => setFormCat({ nome: e.target.value })} />
            </div>
            <div style={{ flex: 1 }}>
              <button onClick={salvarCategoria} style={{ width: "100%" }}>➕ Criar</button>
            </div>
          </div>
          <div className="grid" style={{ marginBottom: "30px" }}>
            {categorias.map(c => (
              <div key={c.id} className="card">
                <b>{c.nome}</b>
                <button onClick={() => excluirCategoria(c.id)} style={{ background: "#dc3545", marginTop: "8px" }}>
                  🗑️ Excluir
                </button>
              </div>
            ))}
          </div>

          <hr />

          <h3>🍽️ Itens</h3>
          <div className="row" style={{ marginBottom: "20px" }}>
            <div className="half">
              <input placeholder="Nome *" value={formItem.nome} onChange={e => setFormItem({ ...formItem, nome: e.target.value })} />
              <textarea placeholder="Descrição" value={formItem.descricao} onChange={e => setFormItem({ ...formItem, descricao: e.target.value })} rows={3} />
              <input placeholder="Preço *" type="number" step="0.01" value={formItem.preco} onChange={e => setFormItem({ ...formItem, preco: e.target.value })} />
            </div>
            <div className="half">
              <input placeholder="URL da imagem" value={formItem.imagem_url} onChange={e => setFormItem({ ...formItem, imagem_url: e.target.value })} />
              <select value={formItem.categoria_id} onChange={e => setFormItem({ ...formItem, categoria_id: e.target.value })}>
                <option value="">Sem categoria</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
              <label style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                <input type="checkbox" checked={formItem.disponivel} onChange={e => setFormItem({ ...formItem, disponivel: e.target.checked })} style={{ width: "auto", margin: 0 }} />
                <span>Disponível</span>
              </label>
              <button onClick={salvarItem} style={{ marginTop: "10px", width: "100%" }}>➕ Criar Item</button>
            </div>
          </div>
          <div className="grid">
            {itens.map(i => (
              <div key={i.id} className="card">
                {i.imagem_url && <img src={i.imagem_url} alt={i.nome} style={{ width: "100%", borderRadius: "6px", marginBottom: "8px" }} />}
                <h4 style={{ margin: "0 0 4px 0" }}>{i.nome}</h4>
                <p className="small">{i.descricao}</p>
                <p style={{ fontSize: "18px", fontWeight: "bold", color: "#28a745" }}>R$ {Number(i.preco).toFixed(2)}</p>
                <button onClick={() => excluirItem(i.id)} style={{ background: "#dc3545" }}>🗑️ Excluir</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA CUPONS */}
      {abaAtiva === "cupons" && (
        <div>
          <h3>🎫 Cupons de Desconto</h3>
          <div className="row" style={{ marginBottom: "20px" }}>
            <div className="half">
              <input placeholder="Código *" value={formCupom.codigo} onChange={e => setFormCupom({ ...formCupom, codigo: e.target.value.toUpperCase() })} style={{ textTransform: "uppercase" }} />
              <input placeholder="Descrição" value={formCupom.descricao} onChange={e => setFormCupom({ ...formCupom, descricao: e.target.value })} />
            </div>
            <div className="half">
              <select value={formCupom.tipo} onChange={e => setFormCupom({ ...formCupom, tipo: e.target.value })}>
                <option value="percentual">Percentual (%)</option>
                <option value="fixo">Valor Fixo (R$)</option>
              </select>
              <input placeholder={formCupom.tipo === "percentual" ? "Valor (%)" : "Valor (R$)"} type="number" step="0.01" value={formCupom.valor} onChange={e => setFormCupom({ ...formCupom, valor: e.target.value })} />
              <input placeholder="Mínimo" type="number" step="0.01" value={formCupom.minimo} onChange={e => setFormCupom({ ...formCupom, minimo: e.target.value })} />
              <label style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                <input type="checkbox" checked={formCupom.ativo} onChange={e => setFormCupom({ ...formCupom, ativo: e.target.checked })} style={{ width: "auto", margin: 0 }} />
                <span>Ativo</span>
              </label>
              <button onClick={salvarCupom} style={{ marginTop: "10px", width: "100%", background: "#ff9800" }}>➕ Criar Cupom</button>
            </div>
          </div>
          <div className="grid">
            {cupons.map(c => (
              <div key={c.id} className="card" style={{ border: c.ativo ? "2px solid #ff9800" : "1px solid #ddd" }}>
                <h4 style={{ margin: "0 0 8px 0" }}>{c.codigo}</h4>
                <p className="small">{c.descricao}</p>
                <div><strong>Desconto:</strong> {c.tipo === "percentual" ? `${c.valor}%` : `R$ ${Number(c.valor).toFixed(2)}`}</div>
                <div><strong>Mínimo:</strong> R$ {Number(c.minimo).toFixed(2)}</div>
                <p className="badge" style={{ background: c.ativo ? "#28a745" : "#dc3545", color: "#fff", display: "inline-block", marginTop: "8px" }}>
                  {c.ativo ? "Ativo" : "Inativo"}
                </p>
                <button onClick={() => excluirCupom(c.id)} style={{ background: "#dc3545", marginTop: "8px" }}>🗑️ Excluir</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}