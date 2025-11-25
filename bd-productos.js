/* global use, db */
// MongoDB Playground
// To disable this template go to Settings | MongoDB | Use Default Template For Playground.
// Make sure you are connected to enable completions and to be able to run a playground.
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.
// The result of the last command run in a playground is shown on the results panel.
// By default the first 20 documents will be returned with a cursor.
// Use 'console.log()' to print to the debug output.
// For more documentation on playgrounds please refer to
// https://www.mongodb.com/docs/mongodb-vscode/playgrounds/

// Select the database to use.
use('beanrush');

// Insert a few documents into the sales collection.
db.products.insertMany([
  { id: 8, name: 'Agua Mineral', price: 25, category: 'bebidas' },
  { id: 10, name: 'Bagel con Queso Crema', price: 45, category: 'comida' },
  { id: 17, name: 'Brownie', price: 35, category: 'postres' },
  { id: 2, name: 'Capuchino', price: 60, category: 'bebidas' },
  { id: 18, name: 'Cheesecake', price: 55, category: 'postres' },
  { id: 6, name: 'Chocolate Caliente', price: 55, category: 'bebidas' },
  { id: 11, name: 'Croissant de Jamón', price: 40, category: 'comida' },
  { id: 12, name: 'Ensalada César', price: 75, category: 'comida' },
  { id: 19, name: 'Flan', price: 40, category: 'postres' },
  { id: 14, name: 'Galleta de Chocolate', price: 15, category: 'postres' },
  { id: 20, name: 'Helado de Vainilla', price: 35, category: 'postres' },
  { id: 7, name: 'Jugo de Naranja Natural', price: 40, category: 'bebidas' },
  { id: 1, name: 'Café Americano', price: 55, category: 'bebidas' },
  { id: 3, name: 'Latte', price: 65, category: 'bebidas' },
  { id: 4, name: 'Mocha', price: 70, category: 'bebidas' },
  { id: 15, name: 'Muffin de Arándanos', price: 30, category: 'postres' },
  { id: 16, name: 'Pastel de Zanahoria', price: 45, category: 'postres' },
  { id: 13, name: 'Quiche de Espinacas', price: 60, category: 'comida' },
  { id: 9, name: 'Sandwich de Jamón y Queso', price: 50, category: 'comida' },
  { id: 5, name: 'Té Verde', price: 45, category: 'bebidas' }
]);

// Run a find command to view items sold on April 4th, 2014.
const salesOnApril4th = db.getCollection('sales').find({
  date: { $gte: new Date('2014-04-04'), $lt: new Date('2014-04-05') }
}).count();

// Print a message to the output window.
console.log(`${salesOnApril4th} sales occurred in 2014.`);

// Here we run an aggregation and open a cursor to the results.
// Use '.toArray()' to exhaust the cursor to return the whole result set.
// You can use '.hasNext()/.next()' to iterate through the cursor page by page.
db.getCollection('sales').aggregate([
  // Find all of the sales that occurred in 2014.
  { $match: { date: { $gte: new Date('2014-01-01'), $lt: new Date('2015-01-01') } } },
  // Group the total sales for each product.
  { $group: { _id: '$item', totalSaleAmount: { $sum: { $multiply: [ '$price', '$quantity' ] } } } }
]);
