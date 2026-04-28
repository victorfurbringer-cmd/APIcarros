# API de Loja de Venda de Carros

Esta é uma API REST simples para gerenciar uma loja de venda de carros, construída com Node.js e Express, incluindo um front-end básico.

## Instalação

1. Instale as dependências:
   ```
   npm install
   ```

2. Inicie o servidor:
   ```
   npm start
   ```

O servidor rodará em `http://localhost:3001`.

## Persistência de Dados

Os dados são salvos em arquivos JSON (`cars.json`, `customers.json`, `sales.json`) e persistem entre reinicializações do servidor.

## Front-end

Acesse `http://localhost:3000` no navegador para usar a interface web para gerenciar carros, clientes e vendas.

## Endpoints da API

### Carros
- `GET /cars` - Lista todos os carros
- `GET /cars/:id` - Obtém um carro por ID
- `POST /cars` - Adiciona um novo carro (body: {model, year, price})
- `PUT /cars/:id` - Atualiza um carro
- `DELETE /cars/:id` - Remove um carro

### Clientes
- `GET /customers` - Lista todos os clientes
- `GET /customers/:id` - Obtém um cliente por ID
- `POST /customers` - Adiciona um novo cliente (body: {name, email})
- `PUT /customers/:id` - Atualiza um cliente
- `DELETE /customers/:id` - Remove um cliente

### Vendas
- `GET /sales` - Lista todas as vendas
- `GET /sales/:id` - Obtém uma venda por ID
- `POST /sales` - Adiciona uma nova venda (body: {carId, customerId, date, price})
- `PUT /sales/:id` - Atualiza uma venda
- `DELETE /sales/:id` - Remove uma venda

## Dados

Os dados são armazenados em memória, então serão perdidos ao reiniciar o servidor.