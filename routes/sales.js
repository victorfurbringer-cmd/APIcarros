const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

const salesFile = path.join(__dirname, '..', 'sales.json');

// Helper to read sales
async function readSales() {
  try {
    const data = await fs.readFile(salesFile, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// Helper to write sales
async function writeSales(sales) {
  await fs.writeFile(salesFile, JSON.stringify(sales, null, 2));
}

// GET all sales
router.get('/', async (req, res) => {
  const sales = await readSales();
  res.json(sales);
});

// GET sale by id
router.get('/:id', async (req, res) => {
  const sales = await readSales();
  const sale = sales.find(s => s.id === parseInt(req.params.id));
  if (!sale) return res.status(404).json({ message: 'Venda não encontrada' });
  res.json(sale);
});

// POST new sale
router.post('/', async (req, res) => {
  const sales = await readSales();
  const newSale = {
    id: sales.length > 0 ? Math.max(...sales.map(s => s.id)) + 1 : 1,
    carId: req.body.carId,
    customerId: req.body.customerId,
    date: req.body.date || new Date().toISOString().split('T')[0],
    price: req.body.price
  };
  sales.push(newSale);
  await writeSales(sales);
  res.status(201).json(newSale);
});

// PUT update sale
router.put('/:id', async (req, res) => {
  const sales = await readSales();
  const sale = sales.find(s => s.id === parseInt(req.params.id));
  if (!sale) return res.status(404).json({ message: 'Venda não encontrada' });
  sale.carId = req.body.carId || sale.carId;
  sale.customerId = req.body.customerId || sale.customerId;
  sale.date = req.body.date || sale.date;
  sale.price = req.body.price || sale.price;
  await writeSales(sales);
  res.json(sale);
});

// DELETE sale
router.delete('/:id', async (req, res) => {
  const sales = await readSales();
  const index = sales.findIndex(s => s.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Venda não encontrada' });
  sales.splice(index, 1);
  await writeSales(sales);
  res.json({ message: 'Venda removida' });
});

module.exports = router;