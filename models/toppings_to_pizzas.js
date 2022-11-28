'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Toppings_to_pizzas extends Model {
    static associate(models) {
      Toppings_to_pizzas.belongsTo(models.Toppings, {
        foreignKey: `topping_id`
      })
      Toppings_to_pizzas.belongsTo(models.Pizzas, {
        foreignKey: `pizza_id`
      })
    }
  }
  Toppings_to_pizzas.init({
    pizza_id: DataTypes.INTEGER,
    topping_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Toppings_to_pizzas',
  });
  return Toppings_to_pizzas;
};