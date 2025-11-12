import { useEffect, useState } from "react";
import api, { authHeader } from "../api";

export default function MeusPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [pedidoSelecionado, setPedidoSelecionado] = useState(null);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarPedidos();
  }, []);

  const carregarPedidos = () => {
    api.get("/pedidos/meus", { headers: authHeader() })
      .then(r => setPedidos(r.data))
      .catch(() => setErro("Faça login como cliente para ver seus pedidos"));
  };

  const verDetalhes = async (id) => {
    setLoading(true);
    try {
      const response = await api.get(`/pedidos/${id}`, { headers: authHeader() });
      setPedidoSelecionado(response.data);
    } catch (err) {
      setErro("Erro ao carregar detalhes do pedido");
    } finally {
      setLoading(false);
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

  const getStatusEmoji = (status) => {
    switch (status) {
      case "Recebido": return "📥";
      case "Em preparo": return "👨‍🍳";
      case "Saiu para entrega": return "🚚";
      case "Entregue": return "✅";
      default: return "📦";
    }
  };

  return (
    <div className="center">
      <h2>📦 Meus Pedidos</h2>

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

      {pedidos.length === 0 ? (
        <div style={{ 
          textAlign: "center", 
          padding: "60px 20px",
          background: "#f9f9f9",
          borderRadius: "10px"
        }}>
          <p style={{ fontSize: "48px", marginBottom: "16px" }}>🛒</p>
          <h3 style={{ marginBottom: "8px" }}>Nenhum pedido ainda</h3>
          <p className="small">Faça seu primeiro pedido e acompanhe aqui!</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "16px" }}>
          {pedidos.map(p => (
            <div key={p.id} className="card" style={{ position: "relative" }}>
              {/* Cabeçalho do pedido */}
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                marginBottom: "16px"
              }}>
                <h3 style={{ margin: 0, fontSize: "20px" }}>
                  Pedido #{p.id}
                </h3>
                <span style={{
                  background: getStatusColor(p.status),
                  color: "#fff",
                  padding: "6px 16px",
                  borderRadius: "20px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}>
                  {getStatusEmoji(p.status)} {p.status}
                </span>
              </div>

              {/* Informações do pedido */}
              <div style={{ 
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginBottom: "12px",
                padding: "12px",
                background: "#f9f9f9",
                borderRadius: "6px"
              }}>
                <div>
                  <strong>Subtotal:</strong><br />
                  R$ {Number(p.subtotal).toFixed(2)}
                </div>
                <div>
                  <strong>Frete:</strong><br />
                  R$ {Number(p.frete).toFixed(2)}
                </div>
                {p.desconto > 0 && (
                  <>
                    <div style={{ color: "#28a745" }}>
                      <strong>Desconto:</strong><br />
                      - R$ {Number(p.desconto).toFixed(2)}
                    </div>
                    <div>
                      <strong>Cupom:</strong><br />
                      🎫 {p.cupom_usado}
                    </div>
                  </>
                )}
              </div>

              {/* Total */}
              <div style={{ 
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px",
                background: "#e7f3ff",
                borderRadius: "6px",
                marginBottom: "12px"
              }}>
                <strong style={{ fontSize: "18px" }}>TOTAL:</strong>
                <strong style={{ fontSize: "24px", color: "#0066ff" }}>
                  R$ {Number(p.total).toFixed(2)}
                </strong>
              </div>

              {/* Endereço */}
              <p style={{ 
                marginBottom: "12px",
                fontSize: "14px",
                color: "#666",
                display: "flex",
                gap: "8px"
              }}>
                <span>📍</span>
                <span>{p.endereco}</span>
              </p>

              {/* Data */}
              <p className="small" style={{ color: "#999", marginBottom: "12px" }}>
                🕒 {new Date(p.criado_em).toLocaleString("pt-BR")}
              </p>

              {/* Botão ver detalhes */}
              <button 
                onClick={() => verDetalhes(p.id)}
                disabled={loading}
                style={{ 
                  background: "#0066ff",
                  width: "100%"
                }}
              >
                {loading ? "Carregando..." : "👁️ Ver Itens do Pedido"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal de detalhes */}
      {pedidoSelecionado && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }}
        onClick={() => setPedidoSelecionado(null)}
        >
          <div 
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "24px",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "80vh",
              overflowY: "auto"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px"
            }}>
              <h2 style={{ margin: 0 }}>
                Pedido #{pedidoSelecionado.id}
              </h2>
              <button 
                onClick={() => setPedidoSelecionado(null)}
                style={{
                  background: "#dc3545",
                  padding: "8px 16px",
                  width: "auto",
                  margin: 0
                }}
              >
                ✖️ Fechar
              </button>
            </div>

            <h3 style={{ marginBottom: "12px" }}>🛒 Itens do Pedido:</h3>
            
            {pedidoSelecionado.itens && pedidoSelecionado.itens.length > 0 ? (
              <div style={{ marginBottom: "20px" }}>
                {pedidoSelecionado.itens.map((item, idx) => (
                  <div 
                    key={idx}
                    style={{
                      display: "flex",
                      gap: "12px",
                      padding: "12px",
                      background: "#f9f9f9",
                      borderRadius: "8px",
                      marginBottom: "8px",
                      alignItems: "center"
                    }}
                  >
                    {item.imagem_url && (
                      <img 
                        src={item.imagem_url} 
                        alt={item.nome}
                        style={{
                          width: "60px",
                          height: "60px",
                          objectFit: "cover",
                          borderRadius: "6px"
                        }}
                      />
                    )}
                    <div style={{ flex: 1 }}>
                      <strong>{item.nome}</strong><br />
                      <span className="small">
                        {item.qtd}x R$ {Number(item.preco_unit).toFixed(2)} = 
                        <strong> R$ {(item.qtd * item.preco_unit).toFixed(2)}</strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="small">Sem itens disponíveis</p>
            )}

            <div style={{
              padding: "16px",
              background: "#e7f3ff",
              borderRadius: "8px"
            }}>
              <div style={{ marginBottom: "8px" }}>
                <strong>Status:</strong>{" "}
                <span style={{
                  background: getStatusColor(pedidoSelecionado.status),
                  color: "#fff",
                  padding: "4px 12px",
                  borderRadius: "12px",
                  fontSize: "14px"
                }}>
                  {pedidoSelecionado.status}
                </span>
              </div>
              <div style={{ marginBottom: "8px" }}>
                <strong>Endereço:</strong> {pedidoSelecionado.endereco}
              </div>
              <div style={{ fontSize: "20px", marginTop: "12px" }}>
                <strong>Total:</strong>{" "}
                <span style={{ color: "#0066ff" }}>
                  R$ {Number(pedidoSelecionado.total).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}