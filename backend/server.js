const path = require("path");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sqlite3 = require("sqlite3").verbose();
const axios = require("axios");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_2025";
const POSITIONSTACK_KEY = process.env.POSITIONSTACK_KEY || "a5f6d1767b6cf0c69efdf4d9e4399510";

app.use(cors());
app.use(express.json());

// ============================================
// CONFIGURAÇÃO DO BANCO DE DADOS
// ============================================
const db = new sqlite3.Database(path.join(__dirname, "data.sqlite"));
db.serialize(() => {
  db.run("PRAGMA foreign_keys = ON");

  // Tabela de usuários
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    perfil TEXT NOT NULL CHECK (perfil IN ('cliente','restaurante'))
  )`);

  // Tabela de categorias
  db.run(`CREATE TABLE IF NOT EXISTS categorias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL
  )`);

  // Tabela de itens do cardápio
  db.run(`CREATE TABLE IF NOT EXISTS itens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    categoria_id INTEGER,
    nome TEXT NOT NULL,
    descricao TEXT,
    preco REAL NOT NULL,
    disponivel INTEGER NOT NULL DEFAULT 1,
    imagem_url TEXT,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id)
  )`);

  // Tabela de pedidos
  db.run(`CREATE TABLE IF NOT EXISTS pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    endereco TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Recebido',
    subtotal REAL NOT NULL,
    frete REAL NOT NULL DEFAULT 0,
    desconto REAL NOT NULL DEFAULT 0,
    total REAL NOT NULL,
    cupom_usado TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  // Tabela de itens do pedido
  db.run(`CREATE TABLE IF NOT EXISTS pedido_itens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pedido_id INTEGER NOT NULL,
    item_id INTEGER NOT NULL,
    qtd INTEGER NOT NULL,
    preco_unit REAL NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
    FOREIGN KEY (item_id) REFERENCES itens(id)
  )`);

  // ⭐ NOVA: Tabela de cupons de desconto
  db.run(`CREATE TABLE IF NOT EXISTS cupons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT UNIQUE NOT NULL,
    descricao TEXT,
    tipo TEXT NOT NULL CHECK (tipo IN ('percentual','fixo')),
    valor REAL NOT NULL,
    minimo REAL DEFAULT 0,
    ativo INTEGER NOT NULL DEFAULT 1,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  seed();
});

// ============================================
// SEED: DADOS INICIAIS
// ============================================
function seed() {
  // Criar usuários padrão
  db.get(`SELECT COUNT(*) n FROM users`, (_, r) => {
    if ((r && r.n) === 0) {
      const s1 = bcrypt.hashSync("123", 8);
      const s2 = bcrypt.hashSync("123", 8);
      db.run(`INSERT INTO users (nome,email,senha,perfil) VALUES (?,?,?,?)`,
        ["Restaurante Sarmelo", "rest@demo.com", s1, "restaurante"]);
      db.run(`INSERT INTO users (nome,email,senha,perfil) VALUES (?,?,?,?)`,
        ["Cliente Demo", "cli@demo.com", s2, "cliente"]);
      console.log("✅ Usuários criados");
    }
  });

  // Criar categorias
  db.get(`SELECT COUNT(*) n FROM categorias`, (_, r) => {
    if ((r && r.n) === 0) {
      db.run(`INSERT INTO categorias (nome) VALUES ('Pizzas')`);
      db.run(`INSERT INTO categorias (nome) VALUES ('Bebidas')`);
      console.log("✅ Categorias criadas");
    }
  });

  // Criar itens do cardápio
  db.get(`SELECT COUNT(*) n FROM itens`, (_, r) => {
    if ((r && r.n) === 0) {
      db.all(`SELECT id,nome FROM categorias`, (e, rows) => {
        if (e) return;
        const idPizzas  = rows.find(x => x.nome === "Pizzas")?.id || null;
        const idBebidas = rows.find(x => x.nome === "Bebidas")?.id || null;

        // Pizzas
        addItem(idPizzas, "Pizza 4 Queijos", "Mussarela, parmesão, provolone, gorgonzola", 49.90, 1, 
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRi3zvuArMZ0vrnz43QUcK8GW2KU4eBdzS6Cw&s");
        addItem(idPizzas, "Pizza Strogonoff de Carne", "Molho strogonoff caseiro", 54.90, 1,
          "https://beatoven.com.br/wp-content/uploads/2024/11/sq-strogonoff.jpg.webp");
        addItem(idPizzas, "Pizza Calabresa", "Calabresa + cebola", 44.90, 1,
          "https://beatoven.com.br/wp-content/uploads/2025/02/pizza-calabresa-fermentacao-lenta.png");

        // Bebidas
        addItem(idBebidas, "Coca-Cola 2L", "Refrigerante Coca-Cola 2L", 12.90, 1,
          "https://superprix.vteximg.com.br/arquivos/ids/210608-600-600/BMo6Zlso.png");
        addItem(idBebidas, "Coca-Cola Zero 2L", "Refrigerante Coca-Cola Zero 2L", 12.90, 1,
          "https://muffatosupermercados.vtexassets.com/arquivos/ids/368302-800-auto");
        addItem(idBebidas, "Guaraná Antarctica 2L", "Refrigerante Guaraná 2L", 9.90, 1,
          "https://io.convertiez.com.br/m/superpaguemenos/shop/products/images/14062/medium/refrigerante-antarctica-guarana-2l_18875.png");
        
        console.log("✅ Itens do cardápio criados");
      });
    }
  });

  // ⭐ Criar cupons de exemplo
  db.get(`SELECT COUNT(*) n FROM cupons`, (_, r) => {
    if ((r && r.n) === 0) {
      db.run(`INSERT INTO cupons (codigo, descricao, tipo, valor, minimo, ativo) VALUES (?,?,?,?,?,?)`,
        ["PRIMEIRACOMPRA", "10% de desconto na primeira compra", "percentual", 10, 30, 1]);
      db.run(`INSERT INTO cupons (codigo, descricao, tipo, valor, minimo, ativo) VALUES (?,?,?,?,?,?)`,
        ["FRETEGRATIS", "Frete grátis em pedidos acima de R$50", "fixo", 0, 50, 1]);
      db.run(`INSERT INTO cupons (codigo, descricao, tipo, valor, minimo, ativo) VALUES (?,?,?,?,?,?)`,
        ["DESCONTO5", "R$5 de desconto", "fixo", 5, 20, 1]);
      console.log("✅ Cupons de desconto criados");
    }
  });
}

function addItem(categoria_id, nome, descricao, preco, disponivel, imagem_url) {
  const st = db.prepare(`INSERT INTO itens (categoria_id,nome,descricao,preco,disponivel,imagem_url)
                         VALUES (?,?,?,?,?,?)`);
  st.run([categoria_id, nome, descricao, preco, disponivel ? 1 : 0, imagem_url || null]);
}

// ============================================
// MIDDLEWARES DE AUTENTICAÇÃO
// ============================================
function auth(req, res, next) {
  const h = req.headers.authorization || "";
  const tok = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!tok) return res.status(401).json({ erro: "Token não fornecido" });
  try {
    req.user = jwt.verify(tok, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ erro: "Token inválido ou expirado" });
  }
}

const only = (perfil) => (req, res, next) => {
  if (!req.user || req.user.perfil !== perfil) {
    return res.status(403).json({ erro: "Sem permissão. Perfil necessário: " + perfil });
  }
  next();
};

// ============================================
// ROTAS DE HEALTH CHECK
// ============================================
app.get("/ping", (req, res) => res.json({ 
  ok: true, 
  time: new Date().toISOString(),
  message: "Servidor online! 🚀" 
}));

// ============================================
// ROTAS DE AUTENTICAÇÃO
// ============================================
app.post("/auth/register", (req, res) => {
  const { nome, email, senha, perfil } = req.body || {};
  
  // Validações
  if (!nome || !email || !senha) {
    return res.status(400).json({ erro: "Preencha nome, email e senha" });
  }
  if (!['cliente','restaurante'].includes(perfil)) {
    return res.status(400).json({ erro: "Perfil deve ser 'cliente' ou 'restaurante'" });
  }
  if (senha.length < 3) {
    return res.status(400).json({ erro: "Senha deve ter no mínimo 3 caracteres" });
  }

  const hash = bcrypt.hashSync(senha, 8);
  const st = db.prepare("INSERT INTO users (nome,email,senha,perfil) VALUES (?,?,?,?)");
  
  st.run([nome, email, hash, perfil], function (err) {
    if (err) {
      if (String(err).includes("UNIQUE")) {
        return res.status(400).json({ erro: "Email já cadastrado" });
      }
      return res.status(500).json({ erro: "Erro ao registrar usuário" });
    }
    
    const token = jwt.sign(
      { id: this.lastID, nome, email, perfil }, 
      JWT_SECRET, 
      { expiresIn: "7d" }
    );
    
    res.status(201).json({ 
      token, 
      usuario: { id: this.lastID, nome, email, perfil },
      mensagem: "Cadastro realizado com sucesso! 🎉"
    });
  });
});

app.post("/auth/login", (req, res) => {
  const { email, senha } = req.body || {};
  
  if (!email || !senha) {
    return res.status(400).json({ erro: "Preencha email e senha" });
  }

  db.get("SELECT * FROM users WHERE email=?", [email], (e, row) => {
    if (e) return res.status(500).json({ erro: "Erro no servidor" });
    if (!row) return res.status(401).json({ erro: "Credenciais inválidas" });
    
    if (!bcrypt.compareSync(senha, row.senha)) {
      return res.status(401).json({ erro: "Credenciais inválidas" });
    }

    const token = jwt.sign(
      { id: row.id, nome: row.nome, email: row.email, perfil: row.perfil }, 
      JWT_SECRET, 
      { expiresIn: "7d" }
    );
    
    res.json({ 
      token, 
      usuario: { id: row.id, nome: row.nome, email: row.email, perfil: row.perfil },
      mensagem: `Bem-vindo(a), ${row.nome}! 👋`
    });
  });
});

app.get("/me", auth, (req, res) => res.json(req.user));

// ============================================
// INTEGRAÇÃO COM VIACEP
// ============================================
app.get("/viacep/:cep", async (req, res) => {
  try {
    const cep = String(req.params.cep || "").replace(/\D/g, "");
    
    if (cep.length !== 8) {
      return res.status(400).json({ erro: "CEP inválido. Digite 8 dígitos." });
    }

    const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
    
    if (response.data.erro) {
      return res.status(404).json({ erro: "CEP não encontrado" });
    }

    res.json(response.data);
  } catch (err) {
    console.error("Erro ViaCEP:", err.message);
    res.status(500).json({ erro: "Falha ao buscar CEP no ViaCEP" });
  }
});

// ============================================
// GEOCODING E CÁLCULO DE FRETE
// ============================================

// Função Haversine para calcular distância entre coordenadas
const toRad = d => d * Math.PI / 180;

function haversineKm(a, b) {
  const R = 6371; // Raio da Terra em km
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  
  const h = Math.sin(dLat / 2) ** 2 + 
            Math.cos(lat1) * Math.cos(lat2) * 
            Math.sin(dLon / 2) ** 2;
  
  return 2 * R * Math.asin(Math.sqrt(h));
}

// ⭐ GEOCODING COM POSITIONSTACK (alternativa gratuita ao Google Maps/Mapbox)
async function geocodePositionstack(endereco) {
  if (!POSITIONSTACK_KEY) {
    // Fallback para OSM se não tiver chave
    return geocodeOSM(endereco);
  }

  try {
    const url = `http://api.positionstack.com/v1/forward`;
    const response = await axios.get(url, {
      params: {
        access_key: POSITIONSTACK_KEY,
        query: endereco,
        limit: 1
      }
    });

    const data = response.data.data;
    if (!data || data.length === 0) {
      throw new Error("Endereço não encontrado");
    }

    return {
      lat: data[0].latitude,
      lon: data[0].longitude,
      fonte: "positionstack"
    };
  } catch (err) {
    console.error("Erro Positionstack:", err.message);
    // Fallback para OSM
    return geocodeOSM(endereco);
  }
}

// Fallback: OpenStreetMap (sempre funciona, mas é bom mencionar que usou alternativa)
async function geocodeOSM(endereco) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(endereco)}`;
  const response = await axios.get(url, {
    headers: { "User-Agent": "sarmelo-delivery/1.0" }
  });
  
  const arr = response.data || [];
  if (!arr.length) throw new Error("Endereço não encontrado");
  
  return {
    lat: parseFloat(arr[0].lat),
    lon: parseFloat(arr[0].lon),
    fonte: "osm"
  };
}

app.post("/frete", async (req, res) => {
  try {
    const { enderecoCliente, enderecoRestaurante } = req.body || {};
    
    if (!enderecoCliente || !enderecoRestaurante) {
      return res.status(400).json({ 
        erro: "Informe enderecoCliente e enderecoRestaurante" 
      });
    }

    // Geocoding dos dois endereços
    const cli = await geocodePositionstack(enderecoCliente);
    const rest = await geocodePositionstack(enderecoRestaurante);

    // Calcular distância
    const km = haversineKm(
      { lat: cli.lat, lon: cli.lon },
      { lat: rest.lat, lon: rest.lon }
    );

    // Fórmula de frete: R$5 base + R$1 por km
    const frete = Math.round((5 + 1 * km) * 100) / 100;

    res.json({ 
      km: Math.round(km * 10) / 10, 
      frete,
      fonte: cli.fonte,
      observacao: cli.fonte === "osm" ? 
        "Usando OpenStreetMap como fallback (configure POSITIONSTACK_KEY para melhorar)" : 
        "Geocoding via Positionstack"
    });
  } catch (err) {
    console.error("Erro ao calcular frete:", err.message);
    res.status(500).json({ 
      erro: "Não foi possível calcular o frete",
      detalhes: err.message
    });
  }
});

// ============================================
// CARDÁPIO PÚBLICO
// ============================================
app.get("/menu", (req, res) => {
  const sql = `
    SELECT 
      i.id, i.nome, i.descricao, i.preco, i.disponivel, i.imagem_url,
      c.nome AS categoria
    FROM itens i 
    LEFT JOIN categorias c ON c.id = i.categoria_id
    WHERE i.disponivel = 1
    ORDER BY c.nome, i.nome
  `;
  
  db.all(sql, [], (e, rows) => {
    if (e) return res.status(500).json({ erro: "Erro ao buscar cardápio" });
    res.json(rows || []);
  });
});

// ============================================
// GERENCIAMENTO DE CATEGORIAS (RESTAURANTE)
// ============================================
app.get("/categorias", auth, only("restaurante"), (req, res) => {
  db.all("SELECT * FROM categorias ORDER BY nome", [], (e, rows) => {
    if (e) return res.status(500).json({ erro: "Erro ao buscar categorias" });
    res.json(rows || []);
  });
});

app.post("/categorias", auth, only("restaurante"), (req, res) => {
  const { nome } = req.body || {};
  
  if (!nome || nome.trim() === "") {
    return res.status(400).json({ erro: "Nome da categoria é obrigatório" });
  }

  db.run("INSERT INTO categorias (nome) VALUES (?)", [nome.trim()], function(e) {
    if (e) return res.status(500).json({ erro: "Erro ao criar categoria" });
    res.status(201).json({ id: this.lastID, nome: nome.trim() });
  });
});

app.put("/categorias/:id", auth, only("restaurante"), (req, res) => {
  const id = +req.params.id;
  const { nome } = req.body || {};
  
  if (!nome || nome.trim() === "") {
    return res.status(400).json({ erro: "Nome da categoria é obrigatório" });
  }

  db.run("UPDATE categorias SET nome=? WHERE id=?", [nome.trim(), id], function(e) {
    if (e) return res.status(500).json({ erro: "Erro ao atualizar categoria" });
    if (this.changes === 0) return res.status(404).json({ erro: "Categoria não encontrada" });
    res.json({ id, nome: nome.trim() });
  });
});

app.delete("/categorias/:id", auth, only("restaurante"), (req, res) => {
  const id = +req.params.id;
  
  db.run("DELETE FROM categorias WHERE id=?", [id], function(e) {
    if (e) return res.status(500).json({ erro: "Erro ao excluir categoria" });
    if (this.changes === 0) return res.status(404).json({ erro: "Categoria não encontrada" });
    res.json({ ok: true, mensagem: "Categoria excluída" });
  });
});

// ============================================
// GERENCIAMENTO DE ITENS (RESTAURANTE)
// ============================================
app.get("/itens", auth, only("restaurante"), (req, res) => {
  db.all("SELECT * FROM itens ORDER BY id DESC", [], (e, rows) => {
    if (e) return res.status(500).json({ erro: "Erro ao buscar itens" });
    res.json(rows || []);
  });
});

app.post("/itens", auth, only("restaurante"), (req, res) => {
  const { categoria_id, nome, descricao, preco, disponivel, imagem_url } = req.body || {};
  
  if (!nome || typeof preco !== "number") {
    return res.status(400).json({ erro: "Nome e preço são obrigatórios" });
  }
  if (preco < 0) {
    return res.status(400).json({ erro: "Preço não pode ser negativo" });
  }

  const st = db.prepare(`
    INSERT INTO itens (categoria_id, nome, descricao, preco, disponivel, imagem_url) 
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  st.run([
    categoria_id || null, 
    nome, 
    descricao || "", 
    preco, 
    disponivel ? 1 : 0, 
    imagem_url || null
  ], function(e) {
    if (e) return res.status(500).json({ erro: "Erro ao criar item" });
    res.status(201).json({ id: this.lastID, mensagem: "Item criado com sucesso" });
  });
});

app.put("/itens/:id", auth, only("restaurante"), (req, res) => {
  const id = +req.params.id;
  const { categoria_id, nome, descricao, preco, disponivel, imagem_url } = req.body || {};

  db.get("SELECT * FROM itens WHERE id=?", [id], (e, row) => {
    if (e) return res.status(500).json({ erro: "Erro no servidor" });
    if (!row) return res.status(404).json({ erro: "Item não encontrado" });

    const st = db.prepare(`
      UPDATE itens 
      SET categoria_id=?, nome=?, descricao=?, preco=?, disponivel=?, imagem_url=? 
      WHERE id=?
    `);
    
    st.run([
      categoria_id ?? row.categoria_id,
      nome ?? row.nome,
      descricao ?? row.descricao,
      typeof preco === "number" ? preco : row.preco,
      typeof disponivel === "boolean" ? (disponivel ? 1 : 0) : row.disponivel,
      imagem_url ?? row.imagem_url,
      id
    ], function(e2) {
      if (e2) return res.status(500).json({ erro: "Erro ao atualizar item" });
      res.json({ ok: true, mensagem: "Item atualizado" });
    });
  });
});

app.delete("/itens/:id", auth, only("restaurante"), (req, res) => {
  const id = +req.params.id;
  
  db.run("DELETE FROM itens WHERE id=?", [id], function(e) {
    if (e) return res.status(500).json({ erro: "Erro ao excluir item" });
    if (this.changes === 0) return res.status(404).json({ erro: "Item não encontrado" });
    res.json({ ok: true, mensagem: "Item excluído" });
  });
});

// ============================================
// ⭐ SISTEMA DE CUPONS (RESTAURANTE)
// ============================================
app.get("/cupons", auth, only("restaurante"), (req, res) => {
  db.all("SELECT * FROM cupons ORDER BY criado_em DESC", [], (e, rows) => {
    if (e) return res.status(500).json({ erro: "Erro ao buscar cupons" });
    res.json(rows || []);
  });
});

app.post("/cupons", auth, only("restaurante"), (req, res) => {
  const { codigo, descricao, tipo, valor, minimo, ativo } = req.body || {};
  
  if (!codigo || !tipo || typeof valor !== "number") {
    return res.status(400).json({ 
      erro: "Código, tipo e valor são obrigatórios" 
    });
  }
  
  if (!['percentual', 'fixo'].includes(tipo)) {
    return res.status(400).json({ 
      erro: "Tipo deve ser 'percentual' ou 'fixo'" 
    });
  }

  const st = db.prepare(`
    INSERT INTO cupons (codigo, descricao, tipo, valor, minimo, ativo) 
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  
  st.run([
    codigo.toUpperCase(), 
    descricao || "", 
    tipo, 
    valor, 
    minimo || 0, 
    ativo ? 1 : 0
  ], function(e) {
    if (e) {
      if (String(e).includes("UNIQUE")) {
        return res.status(400).json({ erro: "Código de cupom já existe" });
      }
      return res.status(500).json({ erro: "Erro ao criar cupom" });
    }
    res.status(201).json({ id: this.lastID, mensagem: "Cupom criado" });
  });
});

app.delete("/cupons/:id", auth, only("restaurante"), (req, res) => {
  const id = +req.params.id;
  
  db.run("DELETE FROM cupons WHERE id=?", [id], function(e) {
    if (e) return res.status(500).json({ erro: "Erro ao excluir cupom" });
    if (this.changes === 0) return res.status(404).json({ erro: "Cupom não encontrado" });
    res.json({ ok: true, mensagem: "Cupom excluído" });
  });
});

// ⭐ VALIDAR CUPOM (CLIENTE)
app.post("/cupons/validar", auth, only("cliente"), (req, res) => {
  const { codigo, subtotal } = req.body || {};
  
  if (!codigo) {
    return res.status(400).json({ erro: "Informe o código do cupom" });
  }

  db.get(
    "SELECT * FROM cupons WHERE codigo=? AND ativo=1", 
    [codigo.toUpperCase()], 
    (e, cupom) => {
      if (e) return res.status(500).json({ erro: "Erro no servidor" });
      if (!cupom) return res.status(404).json({ erro: "Cupom inválido ou inativo" });

      // Validar valor mínimo
      if (subtotal < cupom.minimo) {
        return res.status(400).json({ 
          erro: `Cupom válido apenas para pedidos acima de R$ ${cupom.minimo.toFixed(2)}` 
        });
      }

      // Calcular desconto
      let desconto = 0;
      if (cupom.tipo === "percentual") {
        desconto = (subtotal * cupom.valor) / 100;
      } else {
        desconto = cupom.valor;
      }

      desconto = Math.round(desconto * 100) / 100;

      res.json({
        valido: true,
        cupom: {
          codigo: cupom.codigo,
          descricao: cupom.descricao,
          tipo: cupom.tipo,
          valor: cupom.valor
        },
        desconto,
        mensagem: `Cupom aplicado! Desconto de R$ ${desconto.toFixed(2)}`
      });
    }
  );
});

// ============================================
// SISTEMA DE PEDIDOS
// ============================================
const STEPS = ["Recebido", "Em preparo", "Saiu para entrega", "Entregue"];

app.post("/pedidos", auth, only("cliente"), (req, res) => {
  const { itens, endereco, frete, cupom } = req.body || {};
  
  // Validações
  if (!Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({ erro: "Adicione itens ao carrinho" });
  }
  if (!endereco) {
    return res.status(400).json({ erro: "Informe o endereço de entrega" });
  }
  if (typeof frete !== "number" || frete < 0) {
    return res.status(400).json({ erro: "Calcule o frete primeiro" });
  }

  // Validar IDs dos itens
  const ids = itens.map(i => +i.id).filter(Boolean);
  if (ids.length !== itens.length) {
    return res.status(400).json({ erro: "Itens inválidos no carrinho" });
  }

  // Buscar preços dos itens no banco
  const placeholders = ids.map(() => "?").join(",");
  db.all(
    `SELECT id, preco FROM itens WHERE id IN (${placeholders})`, 
    ids, 
    (e, rows) => {
      if (e) return res.status(500).json({ erro: "Erro ao buscar itens" });

      const precoMap = new Map(rows.map(r => [r.id, r.preco]));
      let subtotal = 0;

      // Calcular subtotal
      for (const item of itens) {
        const preco = precoMap.get(+item.id);
        if (preco == null) {
          return res.status(400).json({ 
            erro: `Item ${item.id} não encontrado` 
          });
        }
        const qtd = Math.max(1, +item.qtd || 1);
        subtotal += preco * qtd;
      }

      subtotal = Math.round(subtotal * 100) / 100;

      // Validar cupom se fornecido
      const processarPedido = (desconto = 0, codigoCupom = null) => {
        const total = Math.round((subtotal + frete - desconto) * 100) / 100;

        // Inserir pedido
        db.run(
          `INSERT INTO pedidos (user_id, endereco, status, subtotal, frete, desconto, total, cupom_usado) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [req.user.id, endereco, STEPS[0], subtotal, frete, desconto, total, codigoCupom],
          function(e2) {
            if (e2) return res.status(500).json({ erro: "Erro ao criar pedido" });

            const pedidoId = this.lastID;

            // Inserir itens do pedido
            const st = db.prepare(`
              INSERT INTO pedido_itens (pedido_id, item_id, qtd, preco_unit) 
              VALUES (?, ?, ?, ?)
            `);

            for (const item of itens) {
              const qtd = Math.max(1, +item.qtd || 1);
              const preco = precoMap.get(+item.id);
              st.run([pedidoId, +item.id, qtd, preco]);
            }

            st.finalize(() => {
              res.status(201).json({
                id: pedidoId,
                subtotal,
                frete,
                desconto,
                total,
                status: STEPS[0],
                mensagem: "Pedido realizado com sucesso! 🎉"
              });
            });
          }
        );
      };

      // Se tem cupom, validar
      if (cupom) {
        db.get(
          "SELECT * FROM cupons WHERE UPPER(codigo)=? AND ativo=1",
          [cupom.toUpperCase()],
          (e3, cupomData) => {
            if (e3 || !cupomData) {
              return processarPedido(0, null);
            }

            // Validar valor mínimo
            if (subtotal < cupomData.minimo) {
              return processarPedido(0, null);
            }

            // Calcular desconto
            let desconto = 0;
            if (cupomData.tipo === "percentual") {
              desconto = (subtotal * cupomData.valor) / 100;
            } else if (cupomData.tipo === "fixo") {
              desconto = cupomData.valor;
            }
            
            // Garantir que desconto não seja maior que o subtotal
            desconto = Math.min(desconto, subtotal);
            desconto = Math.round(desconto * 100) / 100;

            processarPedido(desconto, cupomData.codigo);
          }
        );
      } else {
        processarPedido(0, null);
      }
    }
  );
});

// Listar pedidos do cliente
app.get("/pedidos/meus", auth, only("cliente"), (req, res) => {
  db.all(
    `SELECT id, endereco, status, subtotal, frete, desconto, total, cupom_usado, criado_em 
     FROM pedidos 
     WHERE user_id=? 
     ORDER BY id DESC`,
    [req.user.id],
    (e, rows) => {
      if (e) return res.status(500).json({ erro: "Erro ao buscar pedidos" });
      res.json(rows || []);
    }
  );
});

// Listar todos os pedidos (restaurante)
app.get("/pedidos", auth, only("restaurante"), (req, res) => {
  const sql = `
    SELECT 
      p.id, p.user_id, p.endereco, p.status, 
      p.subtotal, p.frete, p.desconto, p.total, 
      p.cupom_usado, p.criado_em,
      u.nome as cliente_nome
    FROM pedidos p
    LEFT JOIN users u ON u.id = p.user_id
    ORDER BY p.id DESC
  `;
  
  db.all(sql, [], (e, rows) => {
    if (e) return res.status(500).json({ erro: "Erro ao buscar pedidos" });
    res.json(rows || []);
  });
});

// Avançar status do pedido
app.post("/pedidos/:id/avancar", auth, only("restaurante"), (req, res) => {
  const id = +req.params.id;
  
  db.get("SELECT status FROM pedidos WHERE id=?", [id], (e, row) => {
    if (e) return res.status(500).json({ erro: "Erro no servidor" });
    if (!row) return res.status(404).json({ erro: "Pedido não encontrado" });

    const idx = STEPS.indexOf(row.status);
    const proximoStatus = idx < 0 || idx >= STEPS.length - 1 
      ? STEPS[STEPS.length - 1] 
      : STEPS[idx + 1];

    db.run("UPDATE pedidos SET status=? WHERE id=?", [proximoStatus, id], function(e2) {
      if (e2) return res.status(500).json({ erro: "Erro ao atualizar status" });
      
      res.json({
        id,
        status: proximoStatus,
        mensagem: `Status atualizado para: ${proximoStatus}`
      });
    });
  });
});

// ⭐ DETALHES DO PEDIDO (com itens)
app.get("/pedidos/:id", auth, (req, res) => {
  const id = +req.params.id;
  
  // Buscar pedido
  db.get(
    `SELECT p.*, u.nome as cliente_nome 
     FROM pedidos p 
     LEFT JOIN users u ON u.id = p.user_id 
     WHERE p.id=?`,
    [id],
    (e, pedido) => {
      if (e) return res.status(500).json({ erro: "Erro no servidor" });
      if (!pedido) return res.status(404).json({ erro: "Pedido não encontrado" });

      // Verificar permissão
      if (req.user.perfil === "cliente" && pedido.user_id !== req.user.id) {
        return res.status(403).json({ erro: "Sem permissão" });
      }

      // Buscar itens do pedido
      db.all(
        `SELECT pi.*, i.nome, i.imagem_url 
         FROM pedido_itens pi 
         LEFT JOIN itens i ON i.id = pi.item_id 
         WHERE pi.pedido_id=?`,
        [id],
        (e2, itens) => {
          if (e2) return res.status(500).json({ erro: "Erro ao buscar itens" });
          
          res.json({
            ...pedido,
            itens: itens || []
          });
        }
      );
    }
  );
});

// ============================================
// INICIAR SERVIDOR
// ============================================
app.listen(PORT, () => {
  console.log("╔══════════════════════════════════════╗");
  console.log("║   🚀 SARMELO DELIVERY - BACKEND     ║");
  console.log("╚══════════════════════════════════════╝");
  console.log(`📡 Servidor rodando na porta ${PORT}`);
  console.log(`🌐 http://localhost:${PORT}`);
  console.log(`📍 Geocoding: ${POSITIONSTACK_KEY ? 'Positionstack' : 'OSM (fallback)'}`);
  console.log("╔══════════════════════════════════════╗");
  console.log("║   Logins padrão:                     ║");
  console.log("║   🍕 rest@demo.com / 123             ║");
  console.log("║   👤 cli@demo.com / 123              ║");
  console.log("╚══════════════════════════════════════╝");
});