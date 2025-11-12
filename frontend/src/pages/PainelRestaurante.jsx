import { useEffect, useState } from "react";
import api, { authHeader } from "../api";

export default function PainelRestaurante() {
  const [aba, setAba] = useState("pedidos"); // 'pedidos' | 'cardapio' | 'cupons'
  const [erro, setErro] = useState("");

  // ===== PEDIDOS =====
  const [pedidos, setPedidos] = useState([]);
  const [itensPorPedido, setItensPorPedido] = useState({});
  const [abertos, setAbertos] = useState({});
  const [loadingPedidos, setLoadingPedidos] = useState(false);
  const [loadingItens, setLoadingItens] = useState({});

  // ===== CARDÁPIO =====
  const [produtos, setProdutos] = useState([]);
  const [loadingProds, setLoadingProds] = useState(false);
  const [formProd, setFormProd] = useState({ id: null, nome: "", preco: "", descricao: "", ativo: true });

  // ===== CUPONS =====
  const [cupons, setCupons] = useState([]);
  const [loadingCupons, setLoadingCupons] = useState(false);
  const [formCupom, setFormCupom] = useState({ id: null, codigo: "", tipo: "percentual", valor: "" });

  // ---------- HELPERS ----------
  const fmt = (v) => `R$ ${Number(v || 0).toFixed(2)}`;
  const corStatus = (s) => s === "Recebido" ? "#17a2b8" : s === "Em preparo" ? "#ffc107" : s === "Saiu para entrega" ? "#6f42c1" : s === "Entregue" ? "#28a745" : "#6c757d";

  // tenta um endpoint e, se falhar, tenta o fallback
  const tryGet = async (url1, url2) => {
    try { return await api.get(url1, { headers: authHeader() }); }
    catch { if (url2) return await api.get(url2, { headers: authHeader() }); throw new Error("GET falhou"); }
  };
  const tryPost = async (url1, url2, body) => {
    try { return await api.post(url1, body, { headers: authHeader() }); }
    catch { if (url2) return await api.post(url2, body, { headers: authHeader() }); throw new Error("POST falhou"); }
  };
  const tryPut = async (url1, url2, body) => {
    try { return await api.put(url1, body, { headers: authHeader() }); }
    catch { if (url2) return await api.put(url2, body, { headers: authHeader() }); throw new Error("PUT falhou"); }
  };
  const tryDel = async (url1, url2) => {
    try { return await api.delete(url1, { headers: authHeader() }); }
    catch { if (url2) return await api.delete(url2, { headers: authHeader() }); throw new Error("DELETE falhou"); }
  };

  // ---------- LOAD POR ABA ----------
  useEffect(() => {
    setErro("");
    if (aba === "pedidos") carregarPedidos();
    if (aba === "cardapio") carregarProdutos();
    if (aba === "cupons") carregarCupons();
    // eslint-disable-next-line
  }, [aba]);

  // ---------- PEDIDOS ----------
  const carregarPedidos = async () => {
    setLoadingPedidos(true);
    try {
      const r = await tryGet("/pedidos");
      setPedidos(r.data || []);
    } catch {
      setErro("Faça login como restaurante para ver os pedidos");
    } finally {
      setLoadingPedidos(false);
    }
  };

  const toggleItens = async (id) => {
    setAbertos((p) => ({ ...p, [id]: !p[id] }));
    if (itensPorPedido[id]) return;

    const pedido = pedidos.find((p) => p.id === id);
    if (pedido && Array.isArray(pedido.itens) && pedido.itens.length) {
      setItensPorPedido((prev) => ({ ...prev, [id]: pedido.itens }));
      return;
    }

    try {
      setLoadingItens((p) => ({ ...p, [id]: true }));
      const r = await tryGet(`/pedidos/${id}`);
      const itens = r?.data?.itens || r?.data?.items || r?.data?.produtos || [];
      setItensPorPedido((prev) => ({ ...prev, [id]: itens }));
    } catch {
      setErro("Não foi possível carregar os itens do pedido");
    } finally {
      setLoadingItens((p) => ({ ...p, [id]: false }));
    }
  };

  const avancarStatus = async (id) => {
    try {
      const r = await api.post(`/pedidos/${id}/avancar`, {}, { headers: authHeader() });
      setPedidos((prev) => prev.map((p) => (p.id === id ? { ...p, status: r.data?.status || p.status } : p)));
    } catch {
      setErro("Erro ao avançar status");
    }
  };

  // ---------- CARDÁPIO ----------
  const mapProduto = (x) => ({
    id: x.id ?? x._id ?? x.produto_id ?? x.codigo,
    nome: x.nome ?? x.titulo ?? x.descricao ?? "Item",
    preco: Number(x.preco ?? x.preco_unit ?? x.valor ?? x.precoUnitario ?? 0),
    descricao: x.descricao ?? x.detalhes ?? "",
    ativo: x.ativo ?? (x.status === "ativo" || x.status === true) ?? true,
  });

  const carregarProdutos = async () => {
    setLoadingProds(true);
    try {
      const r = await tryGet("/produtos", "/cardapio");
      const lista = Array.isArray(r.data) ? r.data : (r.data?.itens || r.data?.produtos || []);
      setProdutos((lista || []).map(mapProduto));
    } catch {
      setErro("Não foi possível carregar o cardápio");
    } finally {
      setLoadingProds(false);
    }
  };

  const salvarProduto = async (e) => {
    e.preventDefault();
    const body = {
      nome: formProd.nome,
      preco: Number(formProd.preco),
      descricao: formProd.descricao,
      ativo: !!formProd.ativo,
    };

    try {
      if (formProd.id) {
        await tryPut(`/produtos/${formProd.id}`, `/cardapio/${formProd.id}`, body);
      } else {
        await tryPost("/produtos", "/cardapio", body);
      }
      setFormProd({ id: null, nome: "", preco: "", descricao: "", ativo: true });
      carregarProdutos();
    } catch {
      setErro("Não foi possível salvar o produto");
    }
  };

  const editarProduto = (p) => setFormProd({ id: p.id, nome: p.nome, preco: p.preco, descricao: p.descricao, ativo: p.ativo });
  const excluirProduto = async (id) => {
    if (!confirm("Excluir este produto?")) return;
    try {
      await tryDel(`/produtos/${id}`, `/cardapio/${id}`);
      carregarProdutos();
    } catch {
      setErro("Não foi possível excluir o produto");
    }
  };

  // ---------- CUPONS ----------
  const mapCupom = (c) => ({
    id: c.id ?? c._id ?? c.cupom_id ?? c.codigo,
    codigo: c.codigo ?? c.code ?? c.nome ?? "",
    tipo: c.tipo ?? (c.percentual ? "percentual" : "fixo"),
    valor: Number(c.valor ?? c.desconto ?? c.percentual ?? 0),
  });

  const carregarCupons = async () => {
    setLoadingCupons(true);
    try {
      const r = await tryGet("/cupons", "/coupons");
      const lista = Array.isArray(r.data) ? r.data : (r.data?.cupons || r.data?.items || []);
      setCupons((lista || []).map(mapCupom));
    } catch {
      setErro("Não foi possível carregar os cupons");
    } finally {
      setLoadingCupons(false);
    }
  };

  const salvarCupom = async (e) => {
    e.preventDefault();
    const body = {
      codigo: formCupom.codigo,
      tipo: formCupom.tipo, // 'percentual' | 'fixo'
      valor: Number(formCupom.valor),
    };

    try {
      if (formCupom.id) {
        await tryPut(`/cupons/${formCupom.id}`, `/coupons/${formCupom.id}`, body);
      } else {
        await tryPost("/cupons", "/coupons", body);
      }
      setFormCupom({ id: null, codigo: "", tipo: "percentual", valor: "" });
      carregarCupons();
    } catch {
      setErro("Não foi possível salvar o cupom");
    }
  };

  const editarCupom = (c) => setFormCupom({ id: c.id, codigo: c.codigo, tipo: c.tipo, valor: c.valor });
  const excluirCupom = async (id) => {
    if (!confirm("Excluir este cupom?")) return;
    try {
      await tryDel(`/cupons/${id}`, `/coupons/${id}`);
      carregarCupons();
    } catch {
      setErro("Não foi possível excluir o cupom");
    }
  };

  // ---------- UI ----------
  const Aba = ({ id, label, count }) => (
    <button
      onClick={() => setAba(id)}
      className={aba === id ? "tab active" : "tab"}
      style={{
        padding: "10px 12px",
        borderRadius: 8,
        border: "none",
        background: aba === id ? "#e7f3ff" : "#f5f5f5",
        fontWeight: aba === id ? "bold" : "normal",
        cursor: "pointer",
      }}
    >
      {label} {typeof count === "number" ? `(${count})` : ""}
    </button>
  );

  return (
    <div className="container">
      <h2 style={{ marginBottom: 16 }}>🍕 Painel do Restaurante</h2>

      {erro && (
        <div className="alert" style={{ background: "#fee", border: "1px solid #fcc", padding: 12, borderRadius: 6, marginBottom: 10 }}>
          ❌ {erro}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
        <Aba id="pedidos" label="📦 Pedidos" count={pedidos.length} />
        <Aba id="cardapio" label="🍽️ Cardápio" />
        <Aba id="cupons" label="🏷️ Cupons" />
      </div>

      {/* ======= PEDIDOS ======= */}
      {aba === "pedidos" && (
        <>
          <h3 style={{ marginBottom: 12 }}>📰 Pedidos Recentes</h3>
          {loadingPedidos ? (
            <p>Carregando...</p>
          ) : pedidos.length === 0 ? (
            <div style={{ textAlign: "center", padding: "50px 20px", background: "#f9f9f9", borderRadius: 10 }}>
              <p style={{ fontSize: 48, marginBottom: 10 }}>🗒️</p>
              <p>Nenhum pedido no momento</p>
            </div>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {pedidos.map((p) => (
                <div key={p.id} className="card" style={{ position: "relative" }}>
                  <span style={{ position: "absolute", right: 12, top: 12, background: corStatus(p.status), color: "#fff", borderRadius: 999, padding: "6px 10px", fontSize: 12 }}>
                    {p.status}
                  </span>

                  <h3 style={{ margin: 0, marginBottom: 4 }}>Pedido #{p.id}</h3>
                  <p className="small" style={{ color: "#666", marginTop: 0, marginBottom: 8 }}>
                    👤 Cliente: {p.cliente_nome || "Cliente Demo"}
                  </p>

                  <p style={{ margin: "6px 0" }}>
                    <span>📍</span> <span>{p.endereco}</span>
                  </p>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, margin: "8px 0" }}>
                    <div>Subtotal:<br /><strong>{fmt(p.subtotal)}</strong></div>
                    <div>Frete:<br /><strong>{fmt(p.frete)}</strong></div>
                    <div>Desconto:<br /><strong>- {fmt(p.desconto)}</strong></div>
                    <div>Total:<br /><strong style={{ color: "#0066ff" }}>{fmt(p.total)}</strong></div>
                  </div>

                  {p.cupom_usado && (
                    <div style={{ background: "#fff7e6", border: "1px solid #ffe2a8", padding: 8, borderRadius: 6, marginBottom: 8 }}>
                      🏷️ Cupom usado: <strong>{p.cupom_usado}</strong>
                    </div>
                  )}

                  <p className="small" style={{ color: "#999", marginBottom: 12 }}>
                    🕒 {new Date(p.criado_em).toLocaleString("pt-BR")}
                  </p>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button onClick={() => toggleItens(p.id)} style={{ background: "#0d6efd" }}>
                      {abertos[p.id] ? "✖️ Fechar itens" : "👀 Ver itens"}
                    </button>
                    {p.status !== "Entregue" && (
                      <button onClick={() => avancarStatus(p.id)} style={{ background: "#198754" }}>
                        ✅ Avançar status
                      </button>
                    )}
                  </div>

                  {abertos[p.id] && (
                    <div style={{ marginTop: 12 }}>
                      <h4 style={{ margin: "8px 0" }}>🛒 Itens do Pedido</h4>
                      {loadingItens[p.id] ? (
                        <p className="small">Carregando itens...</p>
                      ) : (itensPorPedido[p.id] || []).length === 0 ? (
                        <p className="small">Sem itens disponíveis</p>
                      ) : (
                        <div style={{ display: "grid", gap: 8 }}>
                          {itensPorPedido[p.id].map((it, idx) => {
                            const nome = it.nome || it.titulo || it.descricao || "Item";
                            const qtd = it.qtd ?? it.quantidade ?? 1;
                            const preco_unit = it.preco_unit ?? it.preco ?? it.valor_unit ?? 0;
                            const img = it.imagem_url || it.imagem || it.foto;
                            return (
                              <div key={idx} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, background: "#f9f9f9", borderRadius: 8 }}>
                                {img && <img src={img} alt={nome} style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 6, border: "1px solid #eee" }} />}
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontWeight: "bold" }}>{nome}</div>
                                  <div className="small" style={{ color: "#666" }}>Quantidade: {qtd} • Preço unit: {fmt(preco_unit)}</div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                  <div className="small" style={{ color: "#666" }}>Subtotal</div>
                                  <div style={{ fontWeight: "bold" }}>{fmt(Number(qtd) * Number(preco_unit))}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ======= CARDÁPIO ======= */}
      {aba === "cardapio" && (
        <>
          <h3 style={{ marginBottom: 12 }}>🍽️ Cardápio</h3>

          <form onSubmit={salvarProduto} style={{ display: "grid", gap: 8, marginBottom: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 8 }}>
              <input placeholder="Nome do produto" value={formProd.nome} onChange={(e) => setFormProd((f) => ({ ...f, nome: e.target.value }))} required />
              <input type="number" step="0.01" placeholder="Preço" value={formProd.preco} onChange={(e) => setFormProd((f) => ({ ...f, preco: e.target.value }))} required />
            </div>
            <textarea placeholder="Descrição (opcional)" value={formProd.descricao} onChange={(e) => setFormProd((f) => ({ ...f, descricao: e.target.value }))} />
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input type="checkbox" checked={!!formProd.ativo} onChange={(e) => setFormProd((f) => ({ ...f, ativo: e.target.checked }))} />
              Ativo
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit" style={{ background: "#0d6efd" }}>{formProd.id ? "💾 Atualizar" : "➕ Adicionar"}</button>
              {formProd.id && <button type="button" onClick={() => setFormProd({ id: null, nome: "", preco: "", descricao: "", ativo: true })}>Cancelar</button>}
            </div>
          </form>

          {loadingProds ? (
            <p>Carregando cardápio...</p>
          ) : produtos.length === 0 ? (
            <p>Nenhum item cadastrado.</p>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {produtos.map((p) => (
                <div key={p.id} className="card" style={{ display: "grid", gridTemplateColumns: "1fr auto auto", alignItems: "center", gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: "bold" }}>{p.nome}</div>
                    <div className="small" style={{ color: "#666" }}>{p.descricao}</div>
                    <div className="small">Preço: <strong>{fmt(p.preco)}</strong> {p.ativo ? "• Ativo" : "• Inativo"}</div>
                  </div>
                  <button onClick={() => editarProduto(p)} style={{ background: "#ffc107" }}>✏️ Editar</button>
                  <button onClick={() => excluirProduto(p.id)} style={{ background: "#dc3545" }}>🗑️ Excluir</button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ======= CUPONS ======= */}
      {aba === "cupons" && (
        <>
          <h3 style={{ marginBottom: 12 }}>🏷️ Cupons</h3>

          <form onSubmit={salvarCupom} style={{ display: "grid", gap: 8, marginBottom: 16 }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 8 }}>
              <input placeholder="Código do cupom" value={formCupom.codigo} onChange={(e) => setFormCupom((f) => ({ ...f, codigo: e.target.value.toUpperCase() }))} required />
              <select value={formCupom.tipo} onChange={(e) => setFormCupom((f) => ({ ...f, tipo: e.target.value }))}>
                <option value="percentual">% Desconto</option>
                <option value="fixo">R$ Desconto</option>
              </select>
              <input type="number" step="0.01" placeholder={formCupom.tipo === "percentual" ? "% (0-100)" : "Valor (R$)"} value={formCupom.valor} onChange={(e) => setFormCupom((f) => ({ ...f, valor: e.target.value }))} required />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="submit" style={{ background: "#0d6efd" }}>{formCupom.id ? "💾 Atualizar" : "➕ Adicionar"}</button>
              {formCupom.id && <button type="button" onClick={() => setFormCupom({ id: null, codigo: "", tipo: "percentual", valor: "" })}>Cancelar</button>}
            </div>
          </form>

          {loadingCupons ? (
            <p>Carregando cupons...</p>
          ) : cupons.length === 0 ? (
            <p>Nenhum cupom cadastrado.</p>
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {cupons.map((c) => (
                <div key={c.id} className="card" style={{ display: "grid", gridTemplateColumns: "1fr auto auto", alignItems: "center", gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: "bold" }}>{c.codigo}</div>
                    <div className="small" style={{ color: "#666" }}>
                      {c.tipo === "percentual" ? `% ${c.valor}` : `R$ ${Number(c.valor).toFixed(2)}`}
                    </div>
                  </div>
                  <button onClick={() => editarCupom(c)} style={{ background: "#ffc107" }}>✏️ Editar</button>
                  <button onClick={() => excluirCupom(c.id)} style={{ background: "#dc3545" }}>🗑️ Excluir</button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
