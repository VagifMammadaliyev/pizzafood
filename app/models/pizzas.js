const exc = require('../data/exceptions');

var pizzas = {};

// We will hardcode this models' instances
// into system for simplicity's sake
pizzas.Pizza = function (id, title, priceInUsd, stockCount) {
  this.id = id;
  this.title = title;
  this.priceInUsd = priceInUsd;
  this.stockCount = stockCount;

  this.toJson = function () {
    return {
      id: this.id,
      title: this.title,
      price: {
        amount: this.priceInUsd,
        currencyCode: 'USD',
        currencyDisplay: '$',
        display: `\$ ${this.priceInUsd}`,
      },
      stock: {
        count: this.stockCount,
        display: `Only ${this.stockCount} left.${
          this.stockCount < 3 ? ' Hurry Up' : ''
        }`,
      },
    };
  };
};

pizzas.db = [
  new pizzas.Pizza(1, 'Pepperoni Pizza', 23, 2),
  new pizzas.Pizza(2, 'Margherita Pizza', 12, 4),
  new pizzas.Pizza(3, 'Hawaiian Pizza', 16, 1),
  new pizzas.Pizza(4, 'Buffalo Pizza', 32, 3),
  new pizzas.Pizza(5, 'Meat Pizza', 44, 1),
  new pizzas.Pizza(6, 'Cheese Pizza', 9, 5),
];

pizzas.loadPizzas = function () {
  return new Promise((resolve, reject) => {
    resolve(pizzas.db);
  });
};

pizzas.loadById = function (id) {
  return new Promise((resolve, reject) => {
    pizzas
      .loadPizzas()
      .then((loadedPizzas) => {
        let foundPizza = null;
        for (const pizza of loadedPizzas) {
          if (pizza.id === id) {
            foundPizza = pizza;
            break;
          }
        }
        if (foundPizza) {
          resolve(foundPizza);
        } else {
          reject(new exc.DataError(`Cannot find pizza with id=${id}`));
        }
      })
      .catch(reject);
  });
};

pizzas.loadByIds = function (ids) {
  return new Promise((resolve, reject) => {
    if (!ids.length) {
      reject(new exc.DataError(`Emtpy ID array provided`));
    }
    let idsCount = ids.length;
    let loadedPizzas = [];
    for (const id of ids) {
      pizzas.loadById(id).then((pizza) => {
        loadedPizzas.push(pizza);
        if (idsCount === loadedPizzas.length) {
          resolve(loadedPizzas);
        }
      });
    }
  });
};

module.exports = pizzas;
