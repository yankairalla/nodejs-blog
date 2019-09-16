const express = require('express');
const router = express.Router();

const blogController = require('../controllers/blog');

router.get('/', blogController.getPosts);

router.get('/post/:postId', blogController.getShowPost);

module.exports = router;