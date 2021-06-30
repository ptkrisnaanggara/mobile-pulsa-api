'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Otp extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Otp.init({
    user_id: DataTypes.BIGINT,
    otp: DataTypes.TEXT,
    status: DataTypes.INTEGER,
    verified_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Otp',
  });
  Otp.associate = function(models) {
    // associations can be defined here
    Otp.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };
  return Otp;
};