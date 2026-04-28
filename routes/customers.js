const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

const customersFile = path.join(__dirname, '..', 'customers.json');

// Helper to read customers
async function readCustomers() {
  try {
    const data = await fs.readFile(customersFile, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// Helper to write customers
async function writeCustomers(customers) {
  await fs.writeFile(customersFile, JSON.stringify(customers, null, 2));
}

// GET all customers
router.get('/', async (req, res) => {
  const customers = await readCustomers();
  res.json(customers);
});

// GET customer by id
router.get('/:id', async (req, res) => {
  const customers = await readCustomers();
  const customer = customers.find(c => c.id === parseInt(req.params.id));
  if (!customer) return res.status(404).json({ message: 'Cliente não encontrado' });
  res.json(customer);
});

// POST new customer
router.post('/', async (req, res) => {
  const customers = await readCustomers();
  const newCustomer = {
    id: customers.length > 0 ? Math.max(...customers.map(c => c.id)) + 1 : 1,
    name: req.body.name,
    email: req.body.email
  };
  customers.push(newCustomer);
  await writeCustomers(customers);
  res.status(201).json(newCustomer);
});

// PUT update customer
router.put('/:id', async (req, res) => {
  const customers = await readCustomers();
  const customer = customers.find(c => c.id === parseInt(req.params.id));
  if (!customer) return res.status(404).json({ message: 'Cliente não encontrado' });
  customer.name = req.body.name || customer.name;
  customer.email = req.body.email || customer.email;
  await writeCustomers(customers);
  res.json(customer);
});

// DELETE customer
router.delete('/:id', async (req, res) => {
  const customers = await readCustomers();
  const index = customers.findIndex(c => c.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Cliente não encontrado' });
  customers.splice(index, 1);
  await writeCustomers(customers);
  res.json({ message: 'Cliente removido' });
});

module.exports = router;