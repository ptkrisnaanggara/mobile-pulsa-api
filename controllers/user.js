
const Computer = require('../models').Computer;
const User = require('../models').User;
const bcrypt = require('bcrypt');
const { Op, Transaction } = require("sequelize");
const { uuid } = require('uuidv4');

module.exports = {
  list(req, res) {
    return User
      .findAll({
        include: [],
        order: [
          ['createdAt', 'DESC'],
        ],
      })
      .then((users) => res.status(200).send(users))
      .catch((error) => { res.status(400).send(error); });
  },

  getById(req, res) {
    return User
      .findByPk(req.params.id, {
        include: [{
          model: Computer,
          as: 'computer'
        }],
      })
      .then((user) => {
        if (!user) {
          return res.status(404).send({
            message: 'User Not Found',
          });
        }
        return res.status(200).send(user);
      })
      .catch((error) => res.status(400).send(error));
  },

  generataPassword(password){
    let salt = crypto.randomBytes(16).toString('hex');
    return crypto.pbkdf2Sync(password, salt, 10000, 512, 'sha512').toString('hex');
  },

  async register(req, res){
    if(!req.body.email){
        return res.status(422).json({errors: {email: "can't be blank"}});
    }
    
    if(!req.body.name){
    return res.status(422).json({errors: {name: "can't be blank"}});
    }

    if(!req.body.password){
    return res.status(422).json({errors: {password: "can't be blank"}});
    }

    let user = await User.findOne({
        where: {
            [Op.or]: [
              { email: req.body.email },
              { phone: req.body.phone }
            ]
        },
    });
    // console.log(user.lenght);
    if (user) {
        return res.status(400).json({
            status: 400,
            message: "User Already Exists"
        });
    } else {
        const salt = '$2b$10$PZZJqckNsO6hpYC5VO9S1u'
        console.log(salt);
        const password = await bcrypt.hash(req.body.password, salt);

        return User
        .create({
          name: req.body.name,
          phone: req.body.phone,
          email: req.body.email,
          apikey: await uuid(),
          password: password,
          image: req.body.image || '-',
          referral_key: Math.random().toString(36).substring(7),
          status: 1
        })
        .then((user) => res.status(201).send(user))
        .catch((error) => res.status(400).send(error));
    }

   
  },

//   login(req, res, next) {
//     if(!req.body.email){
//         return res.status(422).json({errors: {email: "can't be blank"}});
//       }
    
//       if(!req.body.password){
//         return res.status(422).json({errors: {password: "can't be blank"}});
//       }
    
//       passport.authenticate('local', {session: false}, function(err, user, info){
//         if(err){ return next(err); }
    
//         if(user){
//           user.token = user.generateJWT();
//           return res.json({user: user.toAuthJSON()});
//         } else {
//           return res.status(422).json(info);
//         }
//       })(req, res, next);
//   },

  add(req, res) {
    return User
      .create({
        sponsor: req.body.sponsor,
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        apikey: req.body.sponsor,
        password: req.body.password,
        image: req.body.image,
        referral_key: req.body.sponsor,
        status: 1
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
