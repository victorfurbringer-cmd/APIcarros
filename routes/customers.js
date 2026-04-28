const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db');
const router = express.Router();

// Validation rules
const customerValidation = [
  body('name').isString().notEmpty().withMessage('Nome é obrigatório'),
  body('email').isEmail().withMessage('Email inválido')
];

// GET all customers
router.get('/', (req, res) => {
  db.all("SELECT * FROM customers", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    res.json(rows);
  });
});

// GET customer by id
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM customers WHERE id = ?", [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    if (!row) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }
    res.json(row);
  });
});

// POST new customer
router.post('/', customerValidation, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email } = req.body;
  db.run("INSERT INTO customers (name, email) VALUES (?, ?)", [name, email], function(err) {
    if (err) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }
      return res.status(500).json({ error: 'Erro ao criar cliente' });
    }
    res.status(201).json({ id: this.lastID, name, email });
  });
});

// PUT update customer
router.put('/:id', customerValidation, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { name, email } = req.body;
  db.run("UPDATE customers SET name = ?, email = ? WHERE id = ?", [name, email, id], function(err) {
    if (err) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }
      return res.status(500).json({ error: 'Erro ao atualizar cliente' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }
    res.json({ id: parseInt(id), name, email });
  });
});

// DELETE customer
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM customers WHERE id = ?", [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao deletar cliente' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Cliente não encontrado' });
    }
    res.json({ message: 'Cliente removido' });
  });
});

module.exports = router;