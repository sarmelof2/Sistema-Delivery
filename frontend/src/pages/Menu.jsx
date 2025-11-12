import { useEffect, useState } from "react";
import api from "../api";
import { addToCart } from "../cart";

export default function Menu() {
  const [itens, setItens] = useState([]);
  const [mensagem, setMensagem] = useState("");
  const [itemAdicionado, setItemAdicionado] = useState(null);

  useEffect(() => {
    api.get("/menu").then(r => setItens(r.data));
  }, []);

  const add = (it) => {
    addToCart({ id: it.id, nome: it.nome, preco: it.preco, qtd: 1 });
    
    // Mostrar mensagem com animação
    setItemAdicionado(it.id);
    setMensagem(`✅ ${it.nome} adicionado ao carrinho!`);
    
    // Remover mensagem após 2 segundos
    setTimeout(() => {
      setMensagem("");
      setItemAdicionado(null);
    }, 2000);
  };

  return (
    <div className="center">
      <h2>🍕 Cardápio</h2>
      
      {/* Mensagem de sucesso flutuante */}
      {mensagem && (
        <div style={{
          position: "fixed",
          top: "80px",
          right: "20px",
          background: "#28a745",
          color: "#fff",
          padding: "16px 24px",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          zIndex: 1000,
          animation: "slideIn 0.3s ease-out",
          fontWeight: "bold"
        }}>
          {mensagem}
        </div>
      )}

      <div className="grid">
        {itens.map(it => (
          <div 
            key={it.id} 
            className="card"
            style={{
              transition: "transform 0.2s",
              cursor: "pointer"
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            {/* Imagem com altura fixa */}
            {it.imagem_url && (
              <div style={{
                width: "100%",
                height: "200px",
                overflow: "hidden",
                borderRadius: "6px",
                marginBottom: "12px",
                background: "#f5f5f5"
              }}>
                <img 
                  src={it.imagem_url} 
                  alt={it.nome}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover"
                  }}
                />
              </div>
            )}
            
            <h3 style={{ 
              margin: "0 0 8px 0",
              fontSize: "18px",
              minHeight: "48px",
              display: "flex",
              alignItems: "center"
            }}>
              {it.nome}
            </h3>
            
            <p className="small" style={{ 
              color: "#666",
              marginBottom: "8px",
              minHeight: "20px"
            }}>
              {it.categoria}
            </p>
            
            <p style={{ 
              color: "#333",
              marginBottom: "12px",
              minHeight: "60px",
              fontSize: "14px"
            }}>
              {it.descricao}
            </p>
            
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px"
            }}>
              <strong style={{ 
                fontSize: "22px",
                color: "#28a745"
              }}>
                R$ {Number(it.preco).toFixed(2)}
              </strong>
            </div>
            
            <button 
              onClick={() => add(it)}
              style={{
                background: itemAdicionado === it.id ? "#28a745" : "#0066ff",
                transition: "all 0.3s",
                transform: itemAdicionado === it.id ? "scale(0.95)" : "scale(1)",
                fontWeight: "bold"
              }}
            >
              {itemAdicionado === it.id ? "✅ Adicionado!" : "🛒 Adicionar"}
            </button>
          </div>
        ))}
      </div>
      
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}