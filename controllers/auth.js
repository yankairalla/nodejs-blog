const crypto = require('crypto');

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const { validationResult } = require('express-validator/check');

const User = require('../models/user');

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        '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'
    }
  })
);

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  console.log(message);
  res.render('auth/login', {
    title: 'Login',
    errorMessage: message,
    oldInput: {
      email: '',
      password: ''
    }
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('auth/login', {
      title: 'Login',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email,
        password
      }
    });
  }

  User.findOne({ email })
    .then(user => {
      if (!user) {
        return res.status(422).render('auth/login', {
          title: 'Login',
          errorMessage:'Invalid email or password!',
          oldInput: {
            email,
            password
          }
        });
      }
      // transforma a senha passada em hash e compara com a vinda do banco de dados
      bcrypt
        .compare(password, user.password)
        .then(match => {
          if (match) {
            req.session.isLogged = true;
            req.session.user = user;
            return req.session.save(err => {
              console.error(err);
              return res.redirect('/');
            });
          }
          res.status(422).render('auth/login', {
            title: 'Login',
            errorMessage:'Invalid email or password!',
            oldInput: {
              email,
              password
            }
          });
        })
        .catch(err => {
          console.error(err);
          res.redirect('/');
        });
    })
    .catch(console.error);
};

exports.getRegister = (req, res, next) => {
  res.render('auth/register', {
    title: 'Register',
    errorMessage: null,
    oldInput: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });
};

exports.postRegister = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render('auth/register', {
      title: 'Register',
      errorMessage: errors.array()[0].msg,
      oldInput: {
        name,
        email,
        password,
        confirmPassword: req.body.confirmPassword
      }
    });
  }
  //create a hash based on text that is passed  - Cria um hash beseado em uma palavra passada por parâmetro
  bcrypt
    .hash(password, 12)
    .then(hashPassword => {
      const user = new User({
        name: name,
        email: email,
        password: hashPassword,
        posts: [],
        errorMessage: errors
      });
      console.log(user);
      return user.save();
    })
    .then(result => {
      res.redirect('/');
      return transporter.sendMail({
        to: email,
        from: 'blogPost@blogger.com',
        subject: 'SignUp Succeeded!',
        html: '<h1>Você foi cadastrado corretamente!!</h1>'
      });
    })
    .catch(console.error);
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.error(err);
    res.redirect('/');
  });
};

exports.getResetPassword = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/reset', {
    title: 'Reset Password',
    errorMessage: message
  });
};

exports.postResetPassword = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect('/reset');
    }

    const token = buffer.toString('hex');

    User.findOne({ email: req.body.email })
      .then(user => {
        if (!user) {
          req.flash('error', 'Não existe esse email cadastrado');
          return res.redirect('/reset');
        }
        console.log(user);
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then(result => {
        res.redirect('/');
        transporter.sendMail({
          to: req.body.email,
          from: 'blogPost@blogger.com',
          subject: 'password reset',
          html: `<p>Você requisitou um reset de senha</p>
            <p>Click this <a href="http://localhost:3000/reset/${token}">Link</a> to set a new password!</p>
          `
        });
      })
      .catch(console.error);
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  console.log(token);
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: Date.now() }
  })
    .then(user => {
      let message = req.flash('error');
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      console.log(user);
      res.render('auth/new-password', {
        title: 'New Password',
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token
      });
    })
    .catch(console.error);
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId
  })
    .then(user => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then(hashedPassword => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = null;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then(result => {
      res.redirect('/login');
    })
    .catch(console.log);
};
