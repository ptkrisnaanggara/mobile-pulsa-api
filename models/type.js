'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Type extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Type.init({
    name: DataTypes.STRING,
    status: DataTypes.INTEGER,
    margin: DataTypes.DOUBLE
  }, {
    sequelize,
    modelName: 'Type',
  });
  Type.associate = function(models) {
    // associations can be defined here
    Type.hasMany(models.Transaction, {
      foreignKey: 'type',
      as: 'trx',
    });
   
  };
  return Type;
};