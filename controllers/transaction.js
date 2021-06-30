const Type = require('../models').Type;
const User = require('../models').User;
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const helper = require("../helper/index.js");
const db = {};
const Transactions = require('../models').Transaction;
// const http = require('http')
const axios = require('axios')
// const sequelize = require('sequelize');
const crypto = require('crypto')
const { Op, Transaction, Sequelize } = require("sequelize");
const { uuid } = require('uuidv4');



module.exports = {

  listTransaction(req, res) {
    return Transactions
      .findAll({
        where: {
            [Op.or]: [
              { sender: 12 },
              { receiver: 13 }
            ]
        },
        include: [],
        order: [
          ['createdAt', 'DESC'],
        ],
      })
      .then((trx) => res.status(200).send(trx))
      .catch((error) => { res.status(400).send(error); });
  },

  async inquiryProduct(req, res){
    //cek margin
    var marginType;

    await Type.findOne({
        where: {
          key: req.body.type
        }
    })
    .then((margin) => {
        console.log(margin)
        if(margin.length < 1) {
            return res.status(404).send({
                status: 404,
                message: 'Type not found'
            });
        }

        marginType = margin

    })
    .catch(error => {return res.status(400).send(error)});

    //inquiry product
    if(req.params.req == 'prepaid') {
        var endpoint = 'https://testprepaid.mobilepulsa.net/v1/legacy/index/' + req.body.type + '/' + req.body.operator
        var commands = 'pricelist'
    } else {
        var endpoint = 'https://testpostpaid.mobilepulsa.net/api/v1/bill/check/' + req.body.type
        var commands = 'pricelist-pasca'
    }
    let hash = crypto.createHash('md5').update('0857373190009925e5b7c9e75827pl').digest("hex")

    await axios
    .post(endpoint, {
            commands: commands,
            username: "085737319000",
            sign: hash
    })
    .then(result => {
        var listProducts = result.data.data

        Object.keys(listProducts).forEach(function(key) {
            listProducts[key]['pulsa_price'] = listProducts[key]['pulsa_price']+marginType['margin']
        })

        return res.status(200).send({
            status: 200,
            message: 'success',
            data: listProducts
        });
    })
    .catch(error => {
        return res.status(500).send({
            status: 500,
            message: error.message,
        });
    })
    
    // axios.get('/user', {
    //     params: {
    //       ID: 12345
    //     }
    //   })
    //   .then(function (response) {
    //     console.log(response);
    //   })
    //   .catch(function (error) {
    //     console.log(error);
    //   })
    //   .then(function () {
    //     // always executed
    //   });  
   
  },

  async commitTransaction(req, res) {

    if(req.params.req == 'prepaid') {
        var endpoint = 'https://testprepaid.mobilepulsa.net/v1/legacy/index/'
        var commands = 'topup'
    } else {
        var endpoint = 'https://testpostpaid.mobilepulsa.net/api/v1/bill/check/'
        var commands = 'pay-pasca'
    }

    var ref = await uuid();
    let hash = crypto.createHash('md5').update('0857373190009925e5b7c9e75827'+ref).digest("hex")

    var marginType;
    await Type.findOne({
        where: {
          key: req.body.type
        }
    })
    .then((margin) => {
        if(margin.length < 1) {
            return res.status(404).send({
                status: 404,
                message: 'Type not found'
            });
        }
        marginType = margin
    })
    .catch(error => {return res.status(400).send(error)});

    let sequelize;

    if (config.use_env_variable) {
        sequelize = new Sequelize(process.env[config.use_env_variable], config);
    } else {
        sequelize = new Sequelize(config.database, config.username, config.password, config);
    }

    const t = await sequelize.transaction();

    try {
    
    var total;
    var trx;
    await axios
    .post('https://testprepaid.mobilepulsa.net/v1/legacy/index/'+req.body.type+'/'+req.body.operator, {
            commands: 'pricelist',
            username: "085737319000",
            sign: crypto.createHash('md5').update('0857373190009925e5b7c9e75827pl').digest("hex")
    })
    .then(async result => {
        var listProducts = result.data.data
        // return true;
        var price =  listProducts.filter(function(el) {
          return el.pulsa_code === req.body.pulsa_code;
        });
        // console.log(price[0].pulsa_price)
        total = price[0].pulsa_price+marginType.margin

        trx = await Transactions.create({
            sender: req.payload.id,
            receiver: 1,
            amount: total,
            fee: 0,
            hp: req.body.hp,
            code: req.body.pulsa_code,
            type: marginType.id,
            note:  req.params.req.replace(/(^\w|\s\w)/g, m => m.toUpperCase()) + ' ' + marginType.name + ' ' + req.body.pulsa_code.toUpperCase() + ' ' + req.body.hp,
            log: '-',
        }, { transaction: t });
    
        await t.commit();
    })
    .catch(error => {
        // await t.rollback();
        return res.status(500).send({
            status: 500,
            message: error.message,
        });
    })
    
    await axios
        .post(endpoint, {
                commands: commands,
                username: "085737319000",
                ref_id: ref,
                hp: req.body.hp,
                pulsa_code: req.body.pulsa_code,
                sign: hash
        })
        .then(result => {

            if(result.data.data.status == 0) {
                Transactions
                .findByPk(trx.id)      
                .then(trx => {
                    if (!trx) {
                        return res.status(404).send({
                            message: 'Trx Not Found',
                        });
                    }
                    trx
                    .update({
                        tr_id: result.data.data.tr_id,
                        log: JSON.stringify(result.data.data),
                    });
                })
                .catch((error) => res.status(400).send(error));
                
            }
    
            return res.status(200).send({
                status: 200,
                message: 'success',
                data: result.data.data
            });
        })
        .catch(error => {
            return res.status(500).send({
                status: 500,
                message: error.message,
            });
        })

    } catch (errors) {
        await t.rollback();

        return res.status(500).send({
            status: 500,
            message: errors.message,
        });
    }
   
  },

  detailTransaction(req, res) {
    return Transaction
      .findByPk(req.params.id, {
        include: [
            {
                model: User,
                as: 'penerima'
            },
            {
                model: User,
                as: 'pengirim'
            }
        ],
      })
      .then((trx) => {
        if (!trx) {
          return res.status(404).send({
            message: 'Trx Not Found',
          });
        }
        return res.status(200).send(trx);
      })
      .catch((error) => res.status(400).send(error));
  },

  add(req, res) {
    return User
      .create({
        id: req.body.id,
        name: req.body.name,
        nik: req.body.nik,
        department_id: req.body.department_id,
      })
      .then((user) => res.status(201).send(user))
      .catch((error) => res.status(400).send(error));
  },

  update(req, res) {
    return User
      .findByPk(req.params.id)      
      .then(user => {
        if (!user) {
          return res.status(404).send({
            message: 'User Not Found',
          });
        }
        return user
          .update({
            name: req.body.name || user.name,
            nik: req.body.nik || user.nik,
            department_id: req.body.department_id || user.department_id,
          })
          .then(() => res.status(200).send(user))
          .catch((error) => res.status(400).send(error));
      })
      .catch((error) => res.status(400).send(error));
  },

  delete(req, res) {
    return User
      .findByPk(req.params.id)
      .then(user => {
        if (!user) {
          return res.status(400).send({
            message: 'User Not Found',
          });
        }
        return user
          .destroy()
          .then(() => res.status(204).send())
          .catch((error) => res.status(400).send(error));
      })
      .catch((error) => res.status(400).send(error));
  },
};