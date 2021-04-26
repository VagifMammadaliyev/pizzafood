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

module.exports = pizzas;
