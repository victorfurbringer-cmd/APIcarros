const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

const carsFile = path.join(__dirname, '..', 'cars.json');

// Helper to read cars
async function readCars() {
  try {
    const data = await fs.readFile(carsFile, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

// Helper to write cars
async function writeCars(cars) {
  await fs.writeFile(carsFile, JSON.stringify(cars, null, 2));
}

// GET all cars
router.get('/', async (req, res) => {
  const cars = await readCars();
  res.json(cars);
});

// GET car by id
router.get('/:id', async (req, res) => {
  const cars = await readCars();
  const car = cars.find(c => c.id === parseInt(req.params.id));
  if (!car) return res.status(404).json({ message: 'Carro não encontrado' });
  res.json(car);
});

// POST new car
router.post('/', async (req, res) => {
  const cars = await readCars();
  const newCar = {
    id: cars.length > 0 ? Math.max(...cars.map(c => c.id)) + 1 : 1,
    model: req.body.model,
    year: req.body.year,
    price: req.body.price
  };
  cars.push(newCar);
  await writeCars(cars);
  res.status(201).json(newCar);
});

// PUT update car
router.put('/:id', async (req, res) => {
  const cars = await readCars();
  const car = cars.find(c => c.id === parseInt(req.params.id));
  if (!car) return res.status(404).json({ message: 'Carro não encontrado' });
  car.model = req.body.model || car.model;
  car.year = req.body.year || car.year;
  car.price = req.body.price || car.price;
  await writeCars(cars);
  res.json(car);
});

// DELETE car
router.delete('/:id', async (req, res) => {
  const cars = await readCars();
  const index = cars.findIndex(c => c.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ message: 'Carro não encontrado' });
  cars.splice(index, 1);
  await writeCars(cars);
  res.json({ message: 'Carro removido' });
});

module.exports = router;