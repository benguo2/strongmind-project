'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Toppings extends Model {
    static associate(models) {
      Toppings.hasMany(models.Toppings_to_pizzas, {
        foreignKey: `topping_id`
      })
    }
  }
  Toppings.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Toppings',
  });
  return Toppings;
};