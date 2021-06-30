"use strict";
var crypto = require('crypto');
const axios = require('axios')

 module.exports.getPrice = async function getPrice(pulsa_code, type, operator) {
    // process.stdout.write(input);
    // return 'OK';
    await axios
    .post('https://testprepaid.mobilepulsa.net/v1/legacy/index/'+type+'/'+operator, {
            commands: 'pricelist',
            username: "085122000123",
            sign: crypto.createHash('md5').update('0851220001239925e5b7c9e75827pl').digest("hex")
    })
    .then(result => {
        var listProducts = result.data.data
        console.log('hel');
        return true;
        return listProducts.filter(function(el) {
          return el.pulsa_code === pulsa_code;
        });
        console.log(price)
        return price
    })
    .catch(error => {
      return 'error'
    })
}