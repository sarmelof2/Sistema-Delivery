export function getCart(){ try{ return JSON.parse(localStorage.getItem("cart")||"[]"); }catch{ return []; } }
export function setCart(c){ localStorage.setItem("cart", JSON.stringify(c)); }
export function addToCart(item){ const c=getCart(); const i=c.findIndex(x=>x.id===item.id); if(i>=0){ c[i].qtd+=item.qtd||1; } else { c.push({ id:item.id, nome:item.nome, preco:item.preco, qtd:item.qtd||1 }); } setCart(c); }
export function removeFromCart(id){ setCart(getCart().filter(x=>x.id!==id)); }
export function clearCart(){ setCart([]); }
