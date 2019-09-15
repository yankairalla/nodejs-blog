const express = require('express');
const { check, body } = require('express-validator/check');

const User = require('../models/user');

const authController = require('../controllers/auth');

const router = express.Router();

router.get('/login', authController.getLogin);

router.post(
  '/login',
  [
    body('email', 'Entre com um e-mail valido!.')
      .isEmail()
      .normalizeEmail()
      .trim(),
    body('password', 'Senha deve ter entre 5 a 12 caracteres.')
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim()
  ],
  authController.postLogin
);

router.get('/register', authController.getRegister);

router.post(
  '/register',
  [
    check('email')
      .isEmail()
      .withMessage('Não é um email valido!')
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then(userDoc => {
          if (userDoc) {
            return Promise.reject('E-mail já existe, por favor escolha outro!');
          }
        });
      }),
    body(
      'password',
      'Por favor digite uma senha alfanumerica entre 5 a 12 caracteres'
    )
      .isLength({ min: 5, max: 12 })
      .isAlphanumeric(),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Senhas devem ser iguais!');
      }
      return true;
    })
  ],
  authController.postRegister
);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getResetPassword);

router.post('/reset', authController.postResetPassword);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;
