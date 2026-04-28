const apiUrl = window.location.origin;

const elements = {
  carsTable: document.querySelector('#carsTable tbody'),
  customersTable: document.querySelector('#customersTable tbody'),
  salesTable: document.querySelector('#salesTable tbody'),
  summaryCars: document.querySelector('#summaryCars'),
  summaryCustomers: document.querySelector('#summaryCustomers'),
  summarySales: document.querySelector('#summarySales'),
  summaryRevenue: document.querySelector('#summaryRevenue'),
  messageContainer: document.querySelector('#messageContainer'),
};

function createMessage(text, type) {
  const existing = document.querySelector('.message');
  if (existing) existing.remove();

  const message = document.createElement('div');
  message.className = `message ${type}`;
  message.innerHTML = `
    <span>${text}</span>
    <button onclick="this.parentElement.remove()">×</button>
  `;
  elements.messageContainer.appendChild(message);
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('pt-BR');
}

async function fetchJson(path, options = {}) {
  const response = await fetch(`${apiUrl}${path}`, options);
  const data = await response.json();
  if (!response.ok) {
    throw data;
  }
  return data;
}

async function loadSummary() {
  const [cars, customers, sales] = await Promise.all([
    fetchJson('/cars'),
    fetchJson('/customers'),
    fetchJson('/sales'),
  ]);
  elements.summaryCars.textContent = cars.length;
  elements.summaryCustomers.textContent = customers.length;
  elements.summarySales.textContent = sales.length;
  elements.summaryRevenue.textContent = formatCurrency(
    sales.reduce((sum, sale) => sum + Number(sale.price), 0)
  );
}

async function loadCars() {
  try {
    const cars = await fetchJson('/cars');
    elements.carsTable.innerHTML = '';
    cars.forEach(car => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${car.id}</td>
        <td><img src="${car.image || 'https://via.placeholder.com/120x80?text=Carro'}" alt="${car.model}" class="car-thumb"></td>
        <td>${car.model}</td>
        <td>${car.year}</td>
        <td>${formatCurrency(car.price)}</td>
        <td><button class="danger" onclick="deleteCar(${car.id})">Excluir</button></td>
      `;
      elements.carsTable.appendChild(row);
    });
    loadSummary();
  } catch (error) {
    console.error(error);
    createMessage('Erro ao carregar carros.', 'error');
  }
}

async function addCar(event) {
  event.preventDefault();
  const model = document.querySelector('#carModel').value.trim();
  const year = Number(document.querySelector('#carYear').value);
  const price = Number(document.querySelector('#carPrice').value);
  const image = document.querySelector('#carImage').value.trim();

  try {
    await fetchJson('/cars', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, year, price, image }),
    });
    event.target.reset();
    loadCars();
    createMessage('Carro adicionado com sucesso.', 'success');
  } catch (error) {
    createMessage(error.errors ? error.errors[0].msg : error.error || 'Erro ao adicionar carro.', 'error');
  }
}

async function deleteCar(id) {
  if (!confirm('Deseja realmente excluir este carro?')) return;
  try {
    await fetchJson(`/cars/${id}`, { method: 'DELETE' });
    loadCars();
    createMessage('Carro removido com sucesso.', 'success');
  } catch (error) {
    createMessage(error.error || 'Erro ao excluir carro.', 'error');
  }
}

async function loadCustomers() {
  try {
    const customers = await fetchJson('/customers');
    elements.customersTable.innerHTML = '';
    customers.forEach(customer => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${customer.id}</td>
        <td>${customer.name}</td>
        <td>${customer.email}</td>
        <td><button class="danger" onclick="deleteCustomer(${customer.id})">Excluir</button></td>
      `;
      elements.customersTable.appendChild(row);
    });
    loadSummary();
  } catch (error) {
    console.error(error);
    createMessage('Erro ao carregar clientes.', 'error');
  }
}

async function addCustomer(event) {
  event.preventDefault();
  const name = document.querySelector('#customerName').value.trim();
  const email = document.querySelector('#customerEmail').value.trim();

  try {
    await fetchJson('/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    });
    event.target.reset();
    loadCustomers();
    createMessage('Cliente adicionado com sucesso.', 'success');
  } catch (error) {
    createMessage(error.errors ? error.errors[0].msg : error.error || 'Erro ao adicionar cliente.', 'error');
  }
}

async function deleteCustomer(id) {
  if (!confirm('Deseja realmente excluir este cliente?')) return;
  try {
    await fetchJson(`/customers/${id}`, { method: 'DELETE' });
    loadCustomers();
    createMessage('Cliente removido com sucesso.', 'success');
  } catch (error) {
    createMessage(error.error || 'Erro ao excluir cliente.', 'error');
  }
}

async function loadSales() {
  try {
    const sales = await fetchJson('/sales');
    elements.salesTable.innerHTML = '';
    sales.forEach(sale => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${sale.id}</td>
        <td>${sale.carModel || sale.carId}</td>
        <td>${sale.customerName || sale.customerId}</td>
        <td>${formatDate(sale.date)}</td>
        <td>${formatCurrency(sale.price)}</td>
        <td><button class="danger" onclick="deleteSale(${sale.id})">Excluir</button></td>
      `;
      elements.salesTable.appendChild(row);
    });
    loadSummary();
  } catch (error) {
    console.error(error);
    createMessage('Erro ao carregar vendas.', 'error');
  }
}

async function addSale(event) {
  event.preventDefault();
  const carId = Number(document.querySelector('#saleCarId').value);
  const customerId = Number(document.querySelector('#saleCustomerId').value);
  const date = document.querySelector('#saleDate').value;
  const price = Number(document.querySelector('#salePrice').value);

  try {
    await fetchJson('/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ carId, customerId, date, price }),
    });
    event.target.reset();
    loadSales();
    createMessage('Venda registrada com sucesso.', 'success');
  } catch (error) {
    createMessage(error.errors ? error.errors[0].msg : error.error || 'Erro ao registrar venda.', 'error');
  }
}

async function deleteSale(id) {
  if (!confirm('Deseja realmente excluir esta venda?')) return;
  try {
    await fetchJson(`/sales/${id}`, { method: 'DELETE' });
    loadSales();
    createMessage('Venda removida com sucesso.', 'success');
  } catch (error) {
    createMessage(error.error || 'Erro ao excluir venda.', 'error');
  }
}

function bindEvents() {
  document.querySelector('#carForm').addEventListener('submit', addCar);
  document.querySelector('#customerForm').addEventListener('submit', addCustomer);
  document.querySelector('#saleForm').addEventListener('submit', addSale);
}

async function initialize() {
  bindEvents();
  await Promise.all([loadCars(), loadCustomers(), loadSales()]);
}

window.addEventListener('DOMContentLoaded', initialize);

window.deleteCar = deleteCar;
window.deleteCustomer = deleteCustomer;
window.deleteSale = deleteSale;
