'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Transaction.init({
    sender: DataTypes.BIGINT,
    receiver: DataTypes.BIGINT,
    amount: DataTypes.DOUBLE,
    fee: DataTypes.DOUBLE,
    type: DataTypes.INTEGER,
    status: DataTypes.INTEGER,
    paid_at: DataTypes.DATE,
    tr_id: DataTypes.STRING,
    trx_id: DataTypes.STRING,
    code: DataTypes.STRING,
    hp: DataTypes.STRING,
    paid_amount: DataTypes.DOUBLE,
    note: DataTypes.TEXT,
    log: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Transaction',
  });

  Transaction.prototype.getPrice = function(pulsa_code, operator, type){

    axios
    .post('https://testprepaid.mobilepulsa.net/v1/legacy/index/'+type+'/'+operator, {
            commands: 'pricelist',
            username: "085737319000",
            sign: crypto.createHash('md5').update('0857373190009925e5b7c9e75827pl').digest("hex")
    })
    .then(result => {
        var listProducts = result.data.data

        var price = listProducts.filter(function(el) {
          return el.pulsa_code === pulsa_code;
        });

        return price
    })
    .catch(error => {
      return null
    })

  };

  Transaction.associate = function(models) {
    // associations can be defined here
    Transaction.belongsTo(models.User, {
      foreignKey: 'sender',
      as: 'pengirim'
    });

    Transaction.belongsTo(models.User, {
      foreignKey: 'receiver',
      as: 'penerima'
    });

    Transaction.belongsTo(models.Type, {
      foreignKey: 'type',
      as: 'tipe'
    });

  };
  return Transaction;
};