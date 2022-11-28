'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Pizzas extends Model {
    static associate(models) {
      Pizzas.hasMany(models.Toppings_to_pizzas, {
        foreignKey: `pizza_id`
      })
    }
  }
  Pizzas.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Pizzas',
  });
  return Pizzas;
};