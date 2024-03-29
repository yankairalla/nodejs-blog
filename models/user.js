const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  resetToken: String,
  resetTokenExpiration: Date,
  posts: [
    {
      postId: {
        type: Schema.Types.ObjectId,
        ref: "Post"
      }
    }
  ]
});

module.exports = mongoose.model("User", userSchema);
