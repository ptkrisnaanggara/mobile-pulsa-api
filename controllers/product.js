const Type = require('../models').Type;
const User = require('../models').User;
// const http = require('http')
const axios = require('axios')
const crypto = require('crypto')
const { Op, Transaction } = require("sequelize");


module.exports = {

  async listProduct(req, res){
    //cek margin
    var marginType;
    // console.log('paylod', req.payload)
    await Type.findOne({
        where: {
          key: req.body.type
        }
    })
    .then((margin) => {
        // console.log(margin)
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
  },

  async checkProduct(req, res){
    var endpoint = 'https://testprepaid.mobilepulsa.net/v1/legacy/index'

    if(req.params.req == 'pln') {
        var commands = 'inquiry_pln'
        var hash = crypto.createHash('md5').update('0857373190009925e5b7c9e75827'+req.body.hp).digest("hex")

    } else {
        var commands = 'check-game-id'
        var hash = crypto.createHash('md5').update('0857373190009925e5b7c9e75827'+req.body.game_code).digest("hex")
    }


    await axios
    .post(endpoint, {
            commands: commands,
            username: "085737319000",
            hp: req.body.hp,
            game_code: req.body.game_code || '',
            sign: hash
    })
    .then(result => {

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
  }

  
};