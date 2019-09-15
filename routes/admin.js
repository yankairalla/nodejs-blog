const express = require('express');
const { body } = require('express-validator');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/create-post', isAuth, adminController.addPost);

/* 
    Dentro de cada "body('algumNome') contem o name vindo do form, e consigo validar os inputs
    passando metodos que tem caracteristicas para ser validado ( isEmail, isLength ...)
    caso falhe em algum desses requisitos, o controller é responsavel de enviar de volta para pagina com
    o erro para ser exibido na tela.
*/

router.post(
  '/create-post',
    [
    body(
      'title',
      'O titulo deve ser alfanumerico e conter de 3 a 30 caracteres!'
    )
      .isLength({ min: 3, max: 30 })
      .trim(),
    body('content')
      .isLength({ min: 5, max: 500 })
      .trim()
  ],
  isAuth,
  adminController.postAddPost
);

router.get('/edit-post/:postId', isAuth, adminController.getEditPost);

router.post(
  '/edit-post',
  [
    body(
      'title',
      'O titulo deve ser alfanumerico e conter de 3 a 30 caracteres!'
    )
      .isAlphanumeric()
      .isLength({ min: 3, max: 30 })
      .trim(),
    body('content', 'No minimo 5 e no maximo 500 caracteres.')
      .isLength({ min: 5, max: 500 })
      .trim()
  ],
  isAuth,
  adminController.postEditPost
);

router.get('/my-posts', isAuth, adminController.getMyPosts);

router.post('/delete-post', isAuth, adminController.postDeletePost);

module.exports = router;
