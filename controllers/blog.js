const Post = require("../models/post");
const User = require('../models/user');

exports.getPosts = (req, res, next) => {
  Post.find()
    .then(posts => {
      console.log(posts);
      res.render("blog/posts", {
        title: "Home Page",
        posts: posts
      });
    })
    .catch(console.error);
};

exports.getShowPost = (req, res, next) => {
  const postId = req.params.postId;

  Post.findOne({ _id: postId })
    .populate('userId')
    .exec()
    .then(post => {
      if (!post) {
        return res.redirect('/');
      }
      res.render('blog/show-post', {
        title: `Blog - ${post.title}`,
        post
      });
    })
    .catch(console.error);
};
