import { useState } from "react";
import api, { authHeader } from "../api";
import { getCart, clearCart } from "../cart";

export default function Checkout() {
  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState({ 
    logradouro: "", 
    bairro: "", 
    localidade: "", 
    uf: "", 
    numero: "" 
  });
  const [frete, setFrete] = useState(null);
  const [cupom, setCupom] = useState("");
  const [cupomAplicado, setCupomAplicado] = useState(null);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [loading, setLoading] = useState(false);

  const carrinho = getCart();
  const subtotal = carrinho.reduce((s, x) => s + x.preco * x.qtd, 0);
  const valorFrete = frete?.frete || 0;
  const desconto = cupomAplicado?.desconto || 0;
  const total = (subtotal + valorFrete - desconto).toFixed(2);

  // ============================================
  // BUSCAR CEP NO VIACEP
  // ============================================
  const buscarCEP = async () => {
    setErro("");
    setSucesso("");

    if (!cep || cep.replace(/\D/g, "").length !== 8) {
      setErro("Digite um CEP válido com 8 dígitos");
      return;
    }

    setLoading(true);
    
    try {
      const response = await api.get("/viacep/" + cep);
      
      if (response.data.erro) {
        setErro("CEP não encontrado");
        return;
      }

      setEndereco(e => ({
        ...e,
        logradouro: response.data.logradouro || "",
        bairro: response.data.bairro || "",
        localidade: response.data.localidade || "",
        uf: response.data.uf || ""
      }));

      setSucesso("✅ Endereço encontrado!");
    } catch (err) {
      setErro("Erro ao buscar CEP. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // CALCULAR FRETE
  // ============================================
  const calcularFrete = async () => {
    setErro("");
    setSucesso("");

    // Validações
    if (!endereco.logradouro || !endereco.localidade || !endereco.uf) {
      setErro("Preencha o endereço completo");
      return;
    }

    if (!endereco.numero) {
      setErro("Informe o número do endereço");
      return;
    }

    setLoading(true);

    try {
      const enderecoCliente = `${endereco.logradouro}, ${endereco.numero} - ${endereco.bairro}, ${endereco.localidade} - ${endereco.uf}`;
      const enderecoRestaurante = "Rua 14 de Julho, 1000 - Centro, Campo Grande - MS";

      const response = await api.post("/frete", {
        enderecoCliente,
        enderecoRestaurante
      });

      setFrete(response.data);
      setSucesso(`✅ Frete calculado: ${response.data.km.toFixed(1)} km`);
    } catch (err) {
      setErro("Não foi possível calcular o frete. Verifique o endereço.");
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // VALIDAR CUPOM
  // ============================================
  const validarCupom = async () => {
    setErro("");
    setSucesso("");

    if (!cupom) {
      setErro("Digite um código de cupom");
      return;
    }

    const token = localStorage.getItem("token");
    const perfil = localStorage.getItem("perfil");

    if (!token || perfil !== "cliente") {
      setErro("Faça login como cliente para usar cupons");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/cupons/validar", {
        codigo: cupom,
        subtotal
      }, {
        headers: authHeader()
      });

      setCupomAplicado(response.data);
      setSucesso(`🎉 ${response.data.mensagem}`);
    } catch (err) {
      const msg = err.response?.data?.erro || "Cupom inválido";
      setErro(msg);
      setCupomAplicado(null);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // REMOVER CUPOM
  // ============================================
  const removerCupom = () => {
    setCupomAplicado(null);
    setCupom("");
    setSucesso("Cupom removido");
  };

  // ============================================
  // FINALIZAR PEDIDO
  // ============================================
  const finalizar = async () => {
    setErro("");
    setSucesso("");

    // Validações
    const token = localStorage.getItem("token");
    const perfil = localStorage.getItem("perfil");

    if (!token || perfil !== "cliente") {
      setErro("Faça login como cliente para finalizar o pedido");
      return;
    }

    if (carrinho.length === 0) {
      setErro("Seu carrinho está vazio");
      return;
    }

    if (!frete) {
      setErro("Calcule o frete primeiro");
      return;
    }

    if (!endereco.numero) {
      setErro("Informe o número do endereço");
      return;
    }

    setLoading(true);

    try {
      const enderecoCompleto = `${endereco.logradouro}, ${endereco.numero} - ${endereco.bairro}, ${endereco.localidade} - ${endereco.uf}`;
      const itens = carrinho.map(x => ({ id: x.id, qtd: x.qtd }));

      const response = await api.post("/pedidos", {
        itens,
        endereco: enderecoCompleto,
        frete: valorFrete,
        cupom: cupomAplicado?.cupom?.codigo || null
      }, {
        headers: authHeader()
      });

      // Limpar carrinho
      clearCart();

      // Mostrar mensagem de sucesso
      alert(`✅ Pedido #${response.data.id} realizado com sucesso!\n\nTotal: R$ ${response.data.total.toFixed(2)}\nStatus: ${response.data.status}`);

      // Redirecionar para "Meus Pedidos"
      window.location.href = "/meus";
    } catch (err) {
      const msg = err.response?.data?.erro || "Erro ao finalizar pedido";
      setErro(msg);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // RENDERIZAÇÃO
  // ============================================
  return (
    <div className="center">
      <h2>🛒 Checkout</h2>

      {/* Mensagens de erro/sucesso */}
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

      <div className="row">
        {/* COLUNA 1: ENDEREÇO */}
        <div className="half">
          <h3>📍 Endereço de Entrega</h3>
          
          <div className="row">
            <div style={{ flex: 2 }}>
              <input 
                placeholder="CEP (apenas números)" 
                value={cep} 
                onChange={e => setCep(e.target.value)}
                maxLength={9}
              />
            </div>
            <div style={{ flex: 1 }}>
              <button 
                onClick={buscarCEP} 
                disabled={loading}
                style={{ width: "100%" }}
              >
                {loading ? "..." : "Buscar"}
              </button>
            </div>
          </div>

          <input 
            placeholder="Logradouro" 
            value={endereco.logradouro} 
            onChange={e => setEndereco({ ...endereco, logradouro: e.target.value })}
          />
          
          <input 
            placeholder="Número *" 
            value={endereco.numero} 
            onChange={e => setEndereco({ ...endereco, numero: e.target.value })}
          />
          
          <input 
            placeholder="Bairro" 
            value={endereco.bairro} 
            onChange={e => setEndereco({ ...endereco, bairro: e.target.value })}
          />
          
          <div className="row">
            <div style={{ flex: 2 }}>
              <input 
                placeholder="Cidade" 
                value={endereco.localidade} 
                onChange={e => setEndereco({ ...endereco, localidade: e.target.value })}
              />
            </div>
            <div style={{ flex: 1 }}>
              <input 
                placeholder="UF" 
                value={endereco.uf} 
                onChange={e => setEndereco({ ...endereco, uf: e.target.value })}
                maxLength={2}
              />
            </div>
          </div>

          <button 
            onClick={calcularFrete} 
            disabled={loading}
            style={{ 
              background: "#28a745", 
              marginTop: "10px" 
            }}
          >
            {loading ? "Calculando..." : "🚚 Calcular Frete"}
          </button>

          {frete && (
            <div style={{ 
              background: "#e7f3ff", 
              padding: "10px", 
              borderRadius: "6px", 
              marginTop: "10px",
              fontSize: "14px"
            }}>
              <strong>📦 Informações de Entrega:</strong><br />
              Distância: {frete.km.toFixed(1)} km<br />
              Frete: R$ {frete.frete.toFixed(2)}<br />
              <span className="small" style={{ color: "#666" }}>
                {frete.observacao || ""}
              </span>
            </div>
          )}
        </div>

        {/* COLUNA 2: RESUMO */}
        <div className="half">
          <h3>📋 Resumo do Pedido</h3>

          {/* Itens do carrinho */}
          <div style={{ 
            maxHeight: "200px", 
            overflowY: "auto", 
            marginBottom: "10px" 
          }}>
            {carrinho.length === 0 ? (
              <p className="small">Carrinho vazio</p>
            ) : (
              <ul style={{ paddingLeft: "20px" }}>
                {carrinho.map(x => (
                  <li key={x.id} style={{ marginBottom: "8px" }}>
                    <strong>{x.qtd}x</strong> {x.nome}
                    <br />
                    <span className="small">
                      R$ {x.preco.toFixed(2)} cada = R$ {(x.preco * x.qtd).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <hr />

          {/* Cupom de desconto */}
          <h4 style={{ fontSize: "16px", marginBottom: "8px" }}>
            🎫 Cupom de Desconto
          </h4>

          {!cupomAplicado ? (
            <div className="row">
              <div style={{ flex: 2 }}>
                <input 
                  placeholder="Digite o código" 
                  value={cupom} 
                  onChange={e => setCupom(e.target.value.toUpperCase())}
                  style={{ textTransform: "uppercase" }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <button 
                  onClick={validarCupom} 
                  disabled={loading}
                  style={{ 
                    width: "100%",
                    background: "#ff9800"
                  }}
                >
                  {loading ? "..." : "Aplicar"}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ 
              background: "#fff3cd", 
              border: "1px solid #ffc107",
              padding: "10px", 
              borderRadius: "6px",
              marginBottom: "10px"
            }}>
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div>
                  <strong>{cupomAplicado.cupom.codigo}</strong><br />
                  <span className="small">{cupomAplicado.cupom.descricao}</span>
                </div>
                <button 
                  onClick={removerCupom}
                  style={{ 
                    background: "#dc3545",
                    padding: "5px 10px",
                    fontSize: "12px"
                  }}
                >
                  Remover
                </button>
              </div>
            </div>
          )}

          <p className="small" style={{ color: "#666", marginTop: "5px" }}>
            💡 Cupons disponíveis: PRIMEIRACOMPRA, FRETEGRATIS, DESCONTO5
          </p>

          <hr />

          {/* Valores */}
          <div style={{ fontSize: "16px" }}>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between",
              marginBottom: "8px"
            }}>
              <span>Subtotal:</span>
              <span>R$ {subtotal.toFixed(2)}</span>
            </div>

            <div style={{ 
              display: "flex", 
              justifyContent: "space-between",
              marginBottom: "8px"
            }}>
              <span>Frete:</span>
              <span>R$ {valorFrete.toFixed(2)}</span>
            </div>

            {desconto > 0 && (
              <div style={{ 
                display: "flex", 
                justifyContent: "space-between",
                marginBottom: "8px",
                color: "#28a745"
              }}>
                <span>Desconto:</span>
                <span>- R$ {desconto.toFixed(2)}</span>
              </div>
            )}

            <hr />

            <div style={{ 
              display: "flex", 
              justifyContent: "space-between",
              fontSize: "20px",
              fontWeight: "bold",
              marginBottom: "16px"
            }}>
              <span>TOTAL:</span>
              <span>R$ {total}</span>
            </div>
          </div>

          {/* Botão finalizar */}
          <button 
            onClick={finalizar} 
            disabled={loading || !frete || carrinho.length === 0}
            style={{ 
              background: "#007bff",
              fontSize: "18px",
              fontWeight: "bold",
              padding: "12px"
            }}
          >
            {loading ? "Processando..." : "✅ Finalizar Pedido"}
          </button>
        </div>
      </div>
    </div>
  );
}