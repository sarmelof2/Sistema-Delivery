🍕 Sarmelo Delivery

Versão Final — Projeto desenvolvido para o Teste Técnico da Trackland 2025

O Sarmelo Delivery é um sistema completo de delivery com dois perfis de usuários (Cliente e Restaurante), incluindo cardápio digital, carrinho, checkout, cálculo automático de frete por distância real, gerenciamento de pedidos em tempo real e sistema de cupons de desconto.

🚀 Tecnologias Utilizadas
Frontend

React + Vite

React Router DOM

Axios

CSS responsivo

LocalStorage para autenticação

Backend

Node.js + Express

SQLite (banco local)

JWT para autenticação

bcrypt para criptografia de senhas

dotenv para variáveis de ambiente

CORS

Integrações Externas

ViaCEP → preenchimento automático do endereço pelo CEP

Positionstack API → geocoding (endereço → latitude/longitude)

Fórmula de Haversine → cálculo da distância real entre cliente e restaurante

📦 Funcionalidades Principais
👤 Cliente

Login e registro

Visualização completa do cardápio

Adicionar itens ao carrinho

Alterar quantidades

Checkout com:

Busca automática de endereço pelo CEP

Cálculo de frete por distância real

Aplicação de cupom de desconto

Finalização de pedido

Acompanhamento do status do pedido em tempo real

Visualização detalhada dos itens que pediu

🏪 Restaurante

Login exclusivo

Painel administrativo com 3 abas:

Pedidos → visualizar e avançar status

Cardápio → CRUD completo de produtos

Cupons → criar e gerenciar cupons

Visualização completa dos itens pedidos por cada cliente

Gerenciamento completo de produtos e cupons

🔐 Logins de Teste
Perfil	Email	Senha
Cliente	cli@demo.com
	123
Restaurante	rest@demo.com
	123
Outros dados úteis:

CEP para teste: 79002-011 (5089) (Camelódromo - CG/MS)

Cupom de teste: PRIMEIRACOMPRA (10% de desconto)

🛠️ Instalação e Execução
1️⃣ Clonar o repositório
git clone https://github.com/sarmelof2/Sistema-Delivery.git
cd Sistema-Delivery

⚙️ Backend
📁 Entrar na pasta do backend
cd backend
npm install

🔑 Criar arquivo .env

Crie um arquivo .env na pasta backend com:

JWT_SECRET=seu_token_secreto


Obs: O backend usa SQLite, então não precisa configurar banco.

▶️ Rodar backend
npm start


Backend ficará disponível em:

http://localhost:3000

💻 Frontend
📁 Entrar na pasta do frontend
cd ../frontend
npm install

▶️ Rodar frontend
npm run dev


Frontend ficará disponível em:

http://localhost:5173

📁 Estrutura do Projeto
Sistema-Delivery/
├── backend/
│   ├── server.js
│   ├── data.sqlite
│   ├── package.json
│   └── .env
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   ├── api.js
    │   ├── cart.js
    │   └── main.jsx
    ├── index.html
    └── package.json

🧠 Como o cálculo de frete funciona?

O cliente informa o CEP

O sistema consulta a ViaCEP para buscar o endereço completo

Converte o endereço para coordenadas usando Positionstack

Calcula distância em linha reta usando Haversine

Fórmula final:

Frete = 5.00 + (1.00 * km)

📡 Status do Pedido (Fluxo Completo)

Recebido

Em preparo

Saiu para entrega

Entregue

O restaurante avança o status e o cliente vê tudo em tempo real.

📜 Licença

Projeto de uso acadêmico/desafio técnico.
Você pode modificar, estudar e usar como quiser.

👨‍💻 Autor

Marcelo Roberto Fuhr de Campos
