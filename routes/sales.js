const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db');
const router = express.Router();

// Validation rules
const saleValidation = [
  body('carId').isInt({ min: 1 }).withMessage('ID do carro inválido'),
  body('customerId').isInt({ min: 1 }).withMessage('ID do cliente inválido'),
  body('date').isISO8601().withMessage('Data inválida'),
  body('price').isFloat({ min: 0 }).withMessage('Preço deve ser positivo')
];

// GET all sales
router.get('/', (req, res) => {
  const query = `
    SELECT
      sales.id,
      sales.carId,
      sales.customerId,
      sales.date,
      sales.price,
      cars.model AS carModel,
      customers.name AS customerName
    FROM sales
    JOIN cars ON sales.carId = cars.id
    JOIN customers ON sales.customerId = customers.id
    ORDER BY sales.date DESC
  `;

  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    res.json(rows);
  });
});

// GET sale by id
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM sales WHERE id = ?", [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    if (!row) {
      return res.status(404).json({ message: 'Venda não encontrada' });
    }
    res.json(row);
  });
});

// POST new sale
router.post('/', saleValidation, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { carId, customerId, date, price } = req.body;

  // Check if car and customer exist
  db.get("SELECT id FROM cars WHERE id = ?", [carId], (err, car) => {
    if (err || !car) {
      return res.status(400).json({ error: 'Carro não encontrado' });
    }
    db.get("SELECT id FROM customers WHERE id = ?", [customerId], (err, customer) => {
      if (err || !customer) {
        return res.status(400).json({ error: 'Cliente não encontrado' });
      }
      db.run("INSERT INTO sales (carId, customerId, date, price) VALUES (?, ?, ?, ?)", [carId, customerId, date, price], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Erro ao criar venda' });
        }
        res.status(201).json({ id: this.lastID, carId, customerId, date, price });
      });
    });
  });
});

// PUT update sale
router.put('/:id', saleValidation, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { carId, customerId, date, price } = req.body;

  // Check if car and customer exist
  db.get("SELECT id FROM cars WHERE id = ?", [carId], (err, car) => {
    if (err || !car) {
      return res.status(400).json({ error: 'Carro não encontrado' });
    }
    db.get("SELECT id FROM customers WHERE id = ?", [customerId], (err, customer) => {
      if (err || !customer) {
        return res.status(400).json({ error: 'Cliente não encontrado' });
      }
      db.run("UPDATE sales SET carId = ?, customerId = ?, date = ?, price = ? WHERE id = ?", [carId, customerId, date, price, id], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Erro ao atualizar venda' });
        }
        if (this.changes === 0) {
          return res.status(404).json({ message: 'Venda não encontrada' });
        }
        res.json({ id: parseInt(id), carId, customerId, date, price });
      });
    });
  });
});

// DELETE sale
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM sales WHERE id = ?", [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao deletar venda' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Venda não encontrada' });
    }
    res.json({ message: 'Venda removida' });
  });
});

module.exports = router;