var pizzas = {};

// We will hardcode this models' instances
// into system for simplicity's sake
pizzas.Pizza = function (title, priceInUsd, stockCount) {
  this.title = title;
  this.priceInUsd = priceInUsd;
  this.stockCount = stockCount;

  this.toJson = function () {
    return {
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

pizzas.db = [];
pizzas.loadPizzas = function () {
  return new Promise((resolve, reject) => {
    if (pizzas.db.length === 0) {
      pizzas.db = [
        new pizzas.Pizza('Pepperoni Pizza', 23, 2),
        new pizzas.Pizza('Margherita Pizza', 12, 4),
        new pizzas.Pizza('Hawaiian Pizza', 16, 1),
        new pizzas.Pizza('Buffalo Pizza', 32, 3),
        new pizzas.Pizza('Meat Pizza', 44, 1),
        new pizzas.Pizza('Cheese Pizza', 9, 5),
      ];
    }
    resolve(pizzas.db);
  });
};

module.exports = pizzas;
