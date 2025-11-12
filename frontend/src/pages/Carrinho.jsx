import { useEffect, useState } from "react";
import { getCart, setCart, removeFromCart } from "../cart";
import { Link } from "react-router-dom";

export default function Carrinho(){
  const [carrinho, setCarrinho] = useState([]);
  useEffect(()=>{ setCarrinho(getCart()); }, []);

  const alterarQtd = (id, qtd) => {
    const c = getCart().map(x => x.id === id ? { ...x, qtd: Math.max(1, Number(qtd)||1) } : x);
    setCart(c); setCarrinho(c);
  };

  const total = carrinho.reduce((s,x)=> s + x.preco * x.qtd, 0);

  return (
    <div className="center">
      <h2>Carrinho</h2>
      {carrinho.map(it => (
        <div key={it.id} className="card">
          <b>{it.nome}</b>
          <div className="row">
            <div className="half">R$ {Number(it.preco).toFixed(2)}</div>
            <div className="half">
              <input type="number" min="1" value={it.qtd} onChange={e=>alterarQtd(it.id, e.target.value)} />
            </div>
          </div>
          <button onClick={()=>{ removeFromCart(it.id); setCarrinho(getCart()); }}>Remover</button>
        </div>
      ))}
      <h3>Total: R$ {total.toFixed(2)}</h3>
      <Link to="/checkout"><button>Ir para Checkout</button></Link>
    </div>
  );
}
