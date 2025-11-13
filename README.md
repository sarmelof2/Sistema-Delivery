# 🍕 Sarmelo Delivery

Sistema completo de delivery desenvolvido para o **Teste Técnico Trackland 2025**.

## 📌 O que o sistema faz

- Cliente visualiza o cardápio e faz pedidos  
- Sistema calcula frete automaticamente baseado na distância real  
- Cliente pode usar cupons de desconto  
- Restaurante gerencia pedidos e avança os status  
- Acompanhamento em tempo real do status do pedido  

---

## 🛠️ Tecnologias

**Backend:**
- Node.js + Express  
- SQLite (banco de dados local)  
- JWT para autenticação  
- bcryptjs para senhas  
- Axios para consumo de APIs externas  

**Frontend:**
- React 18  
- Vite  
- React Router  
- Axios para comunicação com a API  
- CSS3  

**APIs Externas:**
- **ViaCEP** – busca endereço por CEP  
- **Positionstack** – geocoding (endereço → latitude/longitude)  
- Distância calculada no backend usando **fórmula de Haversine**  

---

## ⚙️ Como rodar

### Pré-requisitos
- Node.js 16 ou superior instalado  
- NPM (vem junto com o Node.js)

### Instalação

**1. Clone o repositório**
```bash
git clone https://github.com/sarmelof2/Sistema-Delivery.git
cd Sistema-Delivery

------------------------------------------------------------------------------

2. Backend

cd backend
npm install

------------------------------------------------------------------------------

Crie o arquivo .env na pasta backend:

PORT=3000
JWT_SECRET=sarmelo_delivery_secret_2025
POSITIONSTACK_KEY=a5f6d1767b6cf0c69efdf4d9e4399510

-----------------------------------------------------------------------------

3. Frontend
(na raiz do projeto, em outro terminal ou após voltar com cd ..)

cd frontend
npm install

------------------------------------------------------------------------------

▶️ Executar

Abra dois terminais na pasta raiz do projeto (Sistema-Delivery):

Terminal 1 – Backend:

cd backend
npm start

------------------------------------------------------------------------------

Aguarde aparecer: Servidor rodando na porta 3000

Terminal 2 – Frontend:

cd frontend
npm run dev


Acesse: http://localhost:5173

-----------------------------------------------------------------------------

👤 Contas para teste

Cliente:

Email: cli@demo.com

Senha: 123

Restaurante:

Email: rest@demo.com

Senha: 123

----------------------------------------------------------------------------

🎫 Cupons disponíveis

| Código           | Descrição             | Desconto     | Mínimo   |
| ---------------- | --------------------- | ------------ | -------- |
| `PRIMEIRACOMPRA` | 10% de desconto       | 10%          | R$ 30,00 |
| `TESTE`          | desconto fixo         | R$ 30,00     | R$ 80,00 |
| `CLIENTE`        | Desconto fixo         | R$ 25,00     | R$ 50,00 |

----------------------------------------------------------------------------

✅ Funcionalidades implementadas
Obrigatórias (todas completas)

✅ Autenticação com dois perfis (Cliente e Restaurante)

✅ CRUD completo de categorias e itens do cardápio

✅ Visualização pública do cardápio

✅ Integração com ViaCEP para buscar endereço

✅ Cálculo de frete por distância usando Positionstack + Haversine

✅ Sistema de pedidos completo

✅ Status do pedido: Recebido → Em preparo → Saiu para entrega → Entregue

✅ Histórico de pedidos para cliente e restaurante

----------------------------------------------------------------------------

Diferenciais implementados

✅ Sistema completo de cupons de desconto (percentual e fixo)

✅ Taxas dinâmicas de frete baseadas em distância real

✅ Interface moderna e responsiva

✅ Animações e feedback visual

✅ Validações robustas de formulário e regras de negócio

----------------------------------------------------------------------------

📱 Como usar (fluxo completo)
Como Cliente:

Faça login com cli@demo.com / 123

Navegue pelo cardápio e adicione itens ao carrinho

Vá para o checkout

Preencha seu CEP (use um CEP real do Brasil)

O sistema busca seu endereço automaticamente via ViaCEP

Complete o número do endereço

Clique em “Calcular Frete” (distância é calculada em tempo real)

(Opcional) aplique um cupom de desconto

Finalize o pedido

Acompanhe o status em “Meus Pedidos”

----------------------------------------------------------------------------

Como Restaurante:

Faça login com rest@demo.com / 123

Veja todos os pedidos recebidos na aba Pedidos

Clique em “Ver itens” para ver os detalhes do pedido

Clique em “Avançar status” para mudar:

Recebido → Em preparo → Saiu para entrega → Entregue

O cliente vê a atualização em tempo real na tela de pedidos dele

----------------------------------------------------------------------------

🗂️ Estrutura do projeto
Sistema-Delivery/
├── backend/
│   ├── server.js          # API REST completa
│   ├── package.json       # Dependências
│   ├── .env               # Configurações sensíveis
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

----------------------------------------------------------------------------

🔌 Principais endpoints da API (resumo)

Autenticação:

POST /auth/register – Cadastrar usuário

POST /auth/login – Login

Cardápio:

GET /menu – Listar itens (público)

CEP e Frete (internos ao backend):

Consumo da API ViaCEP para /ws/:cep/json

POST /frete – Calcular frete a partir do endereço

Cupons:

POST /cupons/validar – Validar cupom

Pedidos (Cliente):

POST /pedidos – Criar pedido

GET /pedidos/meus – Meus pedidos

GET /pedidos/:id – Detalhes de um pedido

Pedidos (Restaurante):

GET /pedidos – Todos os pedidos

POST /pedidos/:id/avancar – Avançar status do pedido

----------------------------------------------------------------------------

💡 Decisões técnicas

Por que SQLite?

Zero configuração necessária

Arquivo único, fácil de transportar

Perfeito para desenvolvimento e MVP

Pode ser migrado futuramente para PostgreSQL/MySQL sem grande esforço

Por que Positionstack?

Alternativa gratuita ao Google Maps/Mapbox

Plano free com boa quantidade de requisições

Não exige cartão de crédito

Ótima para geocoding básico de endereços

Cálculo de frete:

Positionstack converte endereços em coordenadas (latitude/longitude)

Fórmula de Haversine calcula distância em linha reta entre cliente e restaurante

Fórmula aplicada:

Frete = R$ 5,00 (taxa base) + R$ 1,00 por km

----------------------------------------------------------------------------

Sistema de cupons:

Suporta desconto percentual ou valor fixo

Validação de valor mínimo do pedido

Desconto nunca excede o subtotal

Cupom usado fica registrado no pedido

----------------------------------------------------------------------------

🐛 Troubleshooting

Backend não inicia:

Verifique se a porta 3000 está livre

Confirme que o arquivo .env foi criado corretamente

Rode npm install novamente

Frontend não conecta:

Certifique-se de que o backend está rodando

Verifique se não há erros no terminal do backend

Limpe o cache do navegador (Ctrl + Shift + R)

Erro ao calcular frete:

Use CEPs válidos do Brasil (por exemplo, um CEP real da sua cidade)

Verifique sua conexão com a internet

Lembre que a API Positionstack tem limite mensal no plano gratuito

----------------------------------------------------------------------------

🚀 Melhorias futuras

Sistema de avaliações e comentários

Upload real de imagens (Cloudinary/AWS S3)

WebSockets para atualização em tempo real

Painel de entregadores com mapa

Notificações push

Testes automatizados (unitários e de integração)

Integração com gateway de pagamento

Relatórios e dashboards gerenciais

📄 Licença

MIT

Desenvolvido para o Teste Técnico Trackland 2025
