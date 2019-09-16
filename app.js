const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDbSession = require('connect-mongodb-session')(session);
const flash = require('connect-flash');
const multer = require('multer');

const app = express();

const MONGODB_URI = 'mongodb://localhost/prjblog';

//Utilizada para poder gravar session no mongodb
const store = new MongoDbSession({
  uri: MONGODB_URI,
  collection: 'sessions'
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString().replace(/:/g,'-') + '-' + file.originalname);
  }
});

const blogRoutes = require('./routes/blog');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');

// User Model
const User = require('./models/user');

//seta a engine usada no view
app.set('view engine', 'ejs');
app.set('views', 'views');

//middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(multer({ storage, fileFilter }).single('image'));
app.use(
  session({
    secret: 'AstringisAtest',
    resave: false,
    saveUninitialized: false,
    store: store
  })
);

app.use(flash());

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }

  User.findById(req.session.user._id)
    .then(user => {
      req.user = user;
      next();
    })
    .catch(console.error);
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLogged;
  next();
});
//Set Routes
app.use(blogRoutes);
app.use(adminRoutes);
app.use(authRoutes);

//Set the Mongodb(mongoose)
mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true })
  .then(result => {
    console.log('Connected!!');
    app.listen('3000', () =>
      console.log('Connected to the Server! on port 3000 ')
    );
  })
  .catch(err => console.error(err));
