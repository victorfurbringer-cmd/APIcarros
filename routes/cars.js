const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db');
const router = express.Router();

// Validation rules
const carValidation = [
  body('model').isString().notEmpty().withMessage('Modelo é obrigatório'),
  body('year').isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Ano inválido'),
  body('price').isFloat({ min: 0 }).withMessage('Preço deve ser positivo')
];

// GET all cars
router.get('/', (req, res) => {
  db.all("SELECT * FROM cars", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    res.json(rows);
  });
});

// GET car by id
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.get("SELECT * FROM cars WHERE id = ?", [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
    if (!row) {
      return res.status(404).json({ message: 'Carro não encontrado' });
    }
    res.json(row);
  });
});

// POST new car
router.post('/', carValidation, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { model, year, price } = req.body;
  db.run("INSERT INTO cars (model, year, price) VALUES (?, ?, ?)", [model, year, price], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao criar carro' });
    }
    res.status(201).json({ id: this.lastID, model, year, price });
  });
});

// PUT update car
router.put('/:id', carValidation, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { model, year, price } = req.body;
  db.run("UPDATE cars SET model = ?, year = ?, price = ? WHERE id = ?", [model, year, price, id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao atualizar carro' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Carro não encontrado' });
    }
    res.json({ id: parseInt(id), model, year, price });
  });
});

// DELETE car
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM cars WHERE id = ?", [id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Erro ao deletar carro' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: 'Carro não encontrado' });
    }
    res.json({ message: 'Carro removido' });
  });
});

module.exports = router;