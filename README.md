# 🍕 Sarmelo Delivery

> Sistema completo de delivery com cardápio digital, gestão de pedidos e cálculo inteligente de frete.

[![Node.js](https://img.shields.io/badge/Node.js-v16+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![SQLite](https://img.shields.io/badge/SQLite-3-lightgrey.svg)](https://www.sqlite.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 📋 Sobre o Projeto

Sistema full-stack desenvolvido para o **Teste Técnico Trackland 2025**, que permite:

- 🔐 Autenticação com dois perfis (Cliente e Restaurante)
- 📱 Cardápio digital interativo com imagens
- 🛒 Carrinho de compras inteligente
- 📍 Integração com ViaCEP para preenchimento automático de endereço
- 🗺️ Cálculo de frete baseado em distância real (Positionstack API)
- 🎫 Sistema completo de cupons de desconto
- 📊 Painel administrativo para restaurantes
- 🚚 Acompanhamento de pedidos em tempo real

## 🚀 Tecnologias Utilizadas

### Backend
- **Node.js** + Express
- **SQLite** (banco de dados)
- **JWT** para autenticação
- **bcryptjs** para criptografia de senhas
- **axios** para requisições HTTP
- **dotenv** para variáveis de ambiente

### Frontend
- **React** 18.2
- **Vite** (bundler ultra-rápido)
- **React Router** para navegação
- **CSS3** (design responsivo)

### APIs Externas
- **ViaCEP** - Busca de endereços por CEP
- **Positionstack** - Geocoding e cálculo de distância

## 📦 Instalação

### Pré-requisitos
- Node.js v16 ou superior
- NPM ou Yarn

### Passo 1: Clone o repositório
```bash
git clone <url-do-repositorio>
cd sarmelo-delivery
```

### Passo 2: Configurar o Backend
```bash
cd backend
npm install
```

Crie um arquivo `.env` na pasta `backend`:
```env
PORT=3000
JWT_SECRET=seu_secret_aqui
POSITIONSTACK_KEY=a5f6d1767b6cf0c69efdf4d9e4399510
```

### Passo 3: Configurar o Frontend
```bash
cd frontend
npm install
```

Crie um arquivo `.env` na pasta `frontend`:
```env
VITE_API_URL=http://localhost:3000
```

## ▶️ Como Executar

### Iniciar o Backend (Terminal 1)
```bash
cd backend
npm start
```
O servidor estará rodando em `http://localhost:3000`

### Iniciar o Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```
O aplicativo estará disponível em `http://localhost:5173`

## 👥 Usuários Pré-cadastrados

Para testar o sistema, use:

**Restaurante:**
- Email: `rest@demo.com`
- Senha: `123`

**Cliente:**
- Email: `cli@demo.com`
- Senha: `123`

## 🎫 Cupons Disponíveis

Teste o sistema de cupons com os códigos:

| Código | Descrição | Tipo | Valor | Mínimo |
|--------|-----------|------|-------|--------|
| `PRIMEIRACOMPRA` | 10% de desconto | Percentual | 10% | R$ 30,00 |
| `FRETEGRATIS` | Frete grátis | Fixo | R$ 0,00 | R$ 50,00 |
| `DESCONTO5` | R$5 de desconto | Fixo | R$ 5,00 | R$ 20,00 |

## 📱 Funcionalidades

### Para Clientes

✅ **Navegar pelo Cardápio**
- Visualização de produtos por categoria
- Imagens, descrições e preços
- Filtros e busca

✅ **Fazer Pedidos**
- Adicionar itens ao carrinho
- Alterar quantidades
- Preencher endereço com ViaCEP
- Calcular frete automaticamente
- Aplicar cupons de desconto
- Finalizar pedido

✅ **Acompanhar Pedidos**
- Ver histórico completo
- Status em tempo real
- Detalhes de cada pedido

### Para Restaurantes

✅ **Gerenciar Cardápio**
- CRUD completo de categorias
- CRUD completo de itens
- Upload de imagens (URL)
- Controle de disponibilidade

✅ **Gerenciar Cupons**
- Criar cupons percentuais ou fixos
- Definir valor mínimo
- Ativar/desativar cupons

✅ **Gerenciar Pedidos**
- Visualizar todos os pedidos
- Filtrar por status
- Avançar status: Recebido → Em preparo → Saiu para entrega → Entregue
- Ver detalhes completos

## 🗂️ Estrutura do Projeto

```
sarmelo-delivery/
│
├── backend/
│   ├── server.js           # Servidor Express
│   ├── package.json        # Dependências do backend
│   ├── .env                # Variáveis de ambiente
│   └── data.sqlite         # Banco de dados (gerado automaticamente)
│
├── frontend/
│   ├── src/
│   │   ├── pages/          # Páginas da aplicação
│   │   │   ├── Menu.jsx
│   │   │   ├── Carrinho.jsx
│   │   │   ├── Checkout.jsx
│   │   │   ├── MeusPedidos.jsx
│   │   │   ├── PainelRestaurante.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── api.js          # Configuração Axios
│   │   ├── cart.js         # Lógica do carrinho
│   │   ├── main.jsx        # Entry point
│   │   └── index.css       # Estilos globais
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## 🔌 API Endpoints

### Autenticação
- `POST /auth/register` - Cadastrar usuário
- `POST /auth/login` - Fazer login
- `GET /me` - Dados do usuário logado

### Cardápio (Público)
- `GET /menu` - Listar itens disponíveis

### CEP e Frete
- `GET /viacep/:cep` - Buscar endereço por CEP
- `POST /frete` - Calcular frete por distância

### Cupons
- `POST /cupons/validar` - Validar cupom de desconto
- `GET /cupons` - Listar cupons (restaurante)
- `POST /cupons` - Criar cupom (restaurante)
- `DELETE /cupons/:id` - Excluir cupom (restaurante)

### Pedidos (Cliente)
- `POST /pedidos` - Criar pedido
- `GET /pedidos/meus` - Listar meus pedidos
- `GET /pedidos/:id` - Detalhes do pedido

### Pedidos (Restaurante)
- `GET /pedidos` - Listar todos os pedidos
- `POST /pedidos/:id/avancar` - Avançar status do pedido

### Categorias (Restaurante)
- `GET /categorias` - Listar categorias
- `POST /categorias` - Criar categoria
- `PUT /categorias/:id` - Editar categoria
- `DELETE /categorias/:id` - Excluir categoria

### Itens (Restaurante)
- `GET /itens` - Listar itens
- `POST /itens` - Criar item
- `PUT /itens/:id` - Editar item
- `DELETE /itens/:id` - Excluir item

## 🎨 Decisões Técnicas

### Por que SQLite?
- ✅ Zero configuração
- ✅ Portável (arquivo único)
- ✅ Perfeito para desenvolvimento e testes
- ✅ Fácil migração para PostgreSQL/MySQL em produção

### Por que Positionstack?
- ✅ API gratuita sem cartão de crédito
- ✅ 25.000 requisições/mês no plano free
- ✅ Alternativa viável ao Google Maps/Mapbox
- ✅ Documentação simples e clara

### Por que Vite?
- ✅ 10-100x mais rápido que Webpack
- ✅ Hot Module Replacement instantâneo
- ✅ Build otimizado para produção
- ✅ Configuração mínima

### Arquitetura de Autenticação
- JWT com expiração de 7 dias
- Senhas criptografadas com bcrypt (8 rounds)
- Middleware de autorização por perfil
- Tokens armazenados no localStorage (frontend)

### Sistema de Frete
1. Cliente insere CEP
2. ViaCEP retorna endereço completo
3. Positionstack converte endereço em coordenadas (lat/lon)
4. Fórmula Haversine calcula distância em km
5. Frete = R$ 5,00 (base) + R$ 1,00/km

## 🐛 Possíveis Melhorias Futuras

- [ ] Testes automatizados (Jest + React Testing Library)
- [ ] Upload real de imagens (Cloudinary/AWS S3)
- [ ] WebSockets para atualização em tempo real
- [ ] Notificações push
- [ ] Painel de entregadores com mapa
- [ ] Sistema de avaliações e comentários
- [ ] Histórico de uso de cupons
- [ ] Relatórios e dashboards
- [ ] Integração com gateway de pagamento
- [ ] Modo dark
- [ ] PWA (Progressive Web App)

## 📝 Licença

Este projeto está sob a licença MIT.

## 👨‍💻 Autor

Marcelo Roberto Fuhr de Campos

Desenvolvido para o **Teste Técnico Trackland 2025**