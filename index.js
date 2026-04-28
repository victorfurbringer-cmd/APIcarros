const express = require('express');
const app = express();
const port = 3001;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Routes
const carRoutes = require('./routes/cars');
const customerRoutes = require('./routes/customers');
const saleRoutes = require('./routes/sales');

app.use('/cars', carRoutes);
app.use('/customers', customerRoutes);
app.use('/sales', saleRoutes);

app.listen(port, () => {
  console.log(`API de Loja de Carros rodando em http://localhost:${port}`);
});