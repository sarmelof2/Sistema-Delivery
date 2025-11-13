# 🍕 Sarmelo Delivery

Sistema completo de delivery desenvolvido para o **Teste Técnico Trackland 2025**.

## 📌 O que o sistema faz

- Cliente visualiza o cardápio e faz pedidos
- Sistema calcula frete automaticamente baseado na distância real
- Cliente pode usar cupons de desconto
- Restaurante gerencia pedidos e avança os status
- Acompanhamento em tempo real do status do pedido

## 🛠️ Tecnologias

**Backend:**
- Node.js + Express
- SQLite (banco de dados local)
- JWT para autenticação
- bcryptjs para senhas
- Axios para APIs externas

**Frontend:**
- React 18
- Vite
- React Router
- CSS3

**APIs Externas:**
- **ViaCEP** - busca endereço por CEP
- **Positionstack** - geocoding e cálculo de distância

## ⚙️ Como rodar

### Pré-requisitos
- Node.js 16 ou superior instalado
- NPM (vem junto com o Node.js)

### Instalação

**1. Clone o repositório**
```bash
git clone <url-do-seu-repositorio>
cd sarmelo-delivery-final-v3
```

**2. Backend**
```bash
cd backend
npm install
```

Crie o arquivo `.env` na pasta `backend`:
```env
PORT=3000
JWT_SECRET=sarmelo_delivery_secret_2025
POSITIONSTACK_KEY=a5f6d1767b6cf0c69efdf4d9e4399510
```

**3. Frontend**
```bash
cd frontend
npm install
```

### Executar

Abra **dois terminais**:

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```
Aguarde aparecer: "Servidor rodando na porta 3000"

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Acesse: **http://localhost:5173**

## 👤 Contas para teste

**Cliente:**
- Email: `cli@demo.com`
- Senha: `123`

**Restaurante:**
- Email: `rest@demo.com`
- Senha: `123`

## 🎫 Cupons disponíveis

| Código | Descrição | Desconto | Mínimo |
|--------|-----------|----------|---------|
| `PRIMEIRACOMPRA` | 10% de desconto | 10% | R$ 30,00 |
| `FRETEGRATIS` | Zera o valor do frete | Frete grátis | R$ 50,00 |
| `DESCONTO5` | Desconto fixo | R$ 5,00 | R$ 20,00 |

## ✅ Funcionalidades implementadas

### Obrigatórias (todas completas)
- ✅ Autenticação com dois perfis (Cliente e Restaurante)
- ✅ CRUD completo de categorias e itens do cardápio
- ✅ Visualização pública do cardápio
- ✅ Integração com ViaCEP para buscar endereço
- ✅ Cálculo de frete por distância usando Positionstack
- ✅ Sistema de pedidos completo
- ✅ Status do pedido: Recebido → Em preparo → Saiu para entrega → Entregue
- ✅ Histórico de pedidos para cliente e restaurante

### Diferenciais implementados
- ✅ Sistema completo de cupons de desconto (percentual e fixo)
- ✅ Taxas dinâmicas de frete baseadas em distância real
- ✅ Interface moderna e responsiva
- ✅ Animações e feedback visual
- ✅ Validações robustas

## 📱 Como usar (fluxo completo)

### Como Cliente:
1. Faça login com `cli@demo.com / 123`
2. Navegue pelo cardápio e adicione itens ao carrinho
3. Vá para o checkout
4. Preencha seu CEP (use um CEP real do Brasil)
5. O sistema busca seu endereço automaticamente
6. Complete o número do endereço
7. Clique em "Calcular Frete" (distância é calculada em tempo real)
8. Opcional: aplique um cupom de desconto
9. Finalize o pedido
10. Acompanhe o status em "Meus Pedidos"

### Como Restaurante:
1. Faça login com `rest@demo.com / 123`
2. Veja todos os pedidos recebidos
3. Clique em "Ver itens" para ver detalhes
4. Clique em "Avançar status" para mudar: Recebido → Em preparo → Saiu para entrega → Entregue
5. O cliente vê a atualização em tempo real

## 🗂️ Estrutura do projeto

```
sarmelo-delivery-final-v3/
├── backend/
│   ├── server.js          # API REST completa
│   ├── package.json       # Dependências
│   ├── .env               # Configurações
│   └── data.sqlite        # Banco (gerado automaticamente)
│
├── frontend/
│   ├── src/
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── api.js         # Config do Axios
│   │   ├── cart.js        # Lógica do carrinho
│   │   └── main.jsx       # Entrada da aplicação
│   └── package.json
│
└── README.md
```

## 🔌 Principais endpoints da API

**Autenticação:**
- `POST /auth/register` - Cadastrar
- `POST /auth/login` - Login

**Cardápio:**
- `GET /menu` - Listar itens (público)

**CEP e Frete:**
- `GET /viacep/:cep` - Buscar endereço
- `POST /frete` - Calcular frete

**Cupons:**
- `POST /cupons/validar` - Validar cupom

**Pedidos (Cliente):**
- `POST /pedidos` - Criar pedido
- `GET /pedidos/meus` - Meus pedidos
- `GET /pedidos/:id` - Detalhes

**Pedidos (Restaurante):**
- `GET /pedidos` - Todos os pedidos
- `POST /pedidos/:id/avancar` - Avançar status

## 💡 Decisões técnicas

**Por que SQLite?**
- Zero configuração necessária
- Arquivo único, fácil de transportar
- Perfeito para desenvolvimento e MVP
- Pode ser migrado facilmente para PostgreSQL/MySQL

**Por que Positionstack?**
- Alternativa gratuita ao Google Maps/Mapbox
- 25.000 requisições/mês no plano free
- Não exige cartão de crédito
- Funciona bem para geocoding básico

**Cálculo de frete:**
1. Positionstack converte endereços em coordenadas (latitude/longitude)
2. Fórmula Haversine calcula distância em linha reta
3. Fórmula aplicada: R$ 5,00 (taxa base) + R$ 1,00 por km

**Sistema de cupons:**
- Suporta desconto percentual ou valor fixo
- Validação de valor mínimo do pedido
- Desconto nunca excede o valor do subtotal
- Cupom é registrado no pedido

## 🐛 Troubleshooting

**Backend não inicia:**
- Verifique se a porta 3000 está livre
- Confirme que o arquivo `.env` foi criado
- Rode `npm install` novamente

**Frontend não conecta:**
- Certifique-se que o backend está rodando
- Verifique se não há erro no terminal do backend
- Limpe o cache do navegador (Ctrl + Shift + R)

**Erro ao calcular frete:**
- Use CEPs válidos do Brasil (ex: 79002-073)
- Verifique sua conexão com a internet
- A API Positionstack tem limite de 25k requests/mês

## 🚀 Melhorias futuras

Se fosse continuar o desenvolvimento, implementaria:
- Sistema de avaliações e comentários
- Upload real de imagens (Cloudinary/AWS S3)
- WebSockets para atualização em tempo real
- Painel de entregadores com mapa
- Notificações push
- Testes automatizados
- Integração com gateway de pagamento
- Relatórios e dashboards

## 📄 Licença

MIT

---

**Desenvolvido para o Teste Técnico Trackland 2025**