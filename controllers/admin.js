const { validationResult } = require('express-validator');
const fileHelper = require('../util/file');

const Post = require('../models/post');

exports.addPost = (req, res, next) => {
  res.render('blog/create-post', {
    title: 'Create Post',
    editMode: false,
    hasError: false,
    errorMessage: null
  });
};

exports.postAddPost = (req, res, next) => {
  const title = req.body.title;
  const content = req.body.content;
  const image = req.file;
  const errors = validationResult(req);
  console.log(image);
  if (!image) {
    return res.status(422).render('blog/create-post', {
      title: 'Edit Post',
      editMode: false,
      hasError: true,
      post: {
        title,
        image,
        content
      },
      errorMessage: 'Arquivo anexado não é uma imagem!'
    });
  }

  if (!errors.isEmpty()) {
    return res.status(422).render('blog/create-post', {
      title: 'Edit Post',
      editMode: false,
      hasError: true,
      post: {
        title,
        image,
        content
      },
      errorMessage: errors.array()[0].msg
    });
  }
  const imageUrl = image.path;

  const post = new Post({
    title,
    imageUrl,
    content,
    userId: req.user
  });
  post
    .save()
    .then(() => {
      console.log('Post Created!');
      res.redirect('/');
    })
    .catch(err => console.error(err));
};

exports.getEditPost = (req, res, next) => {
  const editMode = req.query.edit; // .query pega values passado pela url;
  if (!editMode) {
    return res.redirect('/');
  }

  const postId = req.params.postId;
  console.log(postId);
  Post.findById(postId)
    .then(post => {
      if (!post) {
        return res.redirect('/');
      }
      if (post.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }

      res.render('blog/create-post', {
        title: 'Edit Post',
        editMode,
        post,
        hasError: false,
        errorMessage: null
      });
    })
    .catch(console.error);
};

exports.postEditPost = (req, res, next) => {
  const updatedTitle = req.body.title;
  const image = req.file;
  const updatedContent = req.body.content;
  const postId = req.body.postId;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('blog/create-post', {
      title: 'Edit Post',
      editMode: true,
      hasError: true,
      post: {
        title: updatedTitle,
        imageUrl: updatedImageUrl,
        content: updatedContent
      },
      errorMessage: errors.array()[0].msg
    });
  }
  Post.findById(postId)
    .then(post => {
      if (post.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }
      post.title = updatedTitle;
      post.content = updatedContent;
      if (image) {
        fileHelper.deleteFile(post.imageUrl);
        product.imageUrl = image.path;
      }

      return post.save().then(() => {
        console.log('product updated!');
        return res.redirect('/');
      });
    })
    .catch(console.error);
};

exports.getMyPosts = (req, res, next) => {
  Post.find({ userId: req.user._id })
    .then(posts => {
      res.render('blog/my-posts', {
        title: 'Meus Posts',
        posts
      });
    })
    .catch(console.error);
};

exports.postDeletePost = (req, res, next) => {
  const postId = req.body.postId;

  Post.deleteOne({ _id: postId, userId: req.user._id })
    .then(post => {
      if (!post) {
        return res.redirect('/');
      }
      console.log('post Deleted!');
      return res.redirect('/my-posts');
    })
    .catch(console.error);
};
