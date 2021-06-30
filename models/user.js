'use strict';
const {
  Model
} = require('sequelize');
var crypto = require('crypto');
const axios = require('axios')
var jwt = require('jsonwebtoken');
var secret = require('../config').secret;

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };

  // User.methods.validPassword = function(password) {
  //   var hash = crypto.pbkdf2Sync(password, this.salt, 10000, 512, 'sha512').toString('hex');
  //   return this.hash === hash;
  // };

  User.init({
    sponsor: DataTypes.BIGINT,
    name: DataTypes.STRING,
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
    apikey: DataTypes.STRING,
    password: DataTypes.TEXT,
    image: DataTypes.TEXT,
    referral_key: DataTypes.STRING,
    status: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'User',
  });
  User.prototype.instanceMethod = function (params) {
    // Do something with params
  }
  User.prototype.generateJWT = function() {
    var today = new Date();
    var exp = new Date(today);
    exp.setDate(today.getDate() + 60);
  
    return jwt.sign({
      id: this.id,
      email: this.email,
      name: this.name,
      exp: parseInt(exp.getTime() / 1000),
    }, secret);
  };
  
  User.prototype.toAuthJSON = function(){
    return {
      name: this.name,
      phone: this.phone,
      email: this.email,
      token: this.generateJWT(),
    };
  };

  

  User.associate = function(models) {
    // associations can be defined here
    User.hasMany(models.Transaction, {
      foreignKey: 'sender',
      as: 'trxout',
    });
    User.hasMany(models.Transaction, {
      foreignKey: 'receiver',
      as: 'trxin',
    });
    User.hasMany(models.Otp, {
      foreignKey: 'user_id',
      as: 'otp',
    });
  };
  return User;
};