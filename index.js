require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const db = require('./db');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(morgan('combined'));
app.use(cors());
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