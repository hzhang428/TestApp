var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var assert = require('assert');

mongoose.connect('localhost:27017/test');

var db = mongoose.connection;
var Schema = mongoose.Schema;

var url = 'mongodb://localhost:27017/test';

var bookSchema = new Schema ({
    title: {type: String, required: true},
    content: String,
    author: String
});

var Book = mongoose.model('Book', bookSchema);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Form Validation',
    success: req.session.success,
    errors: req.session.errors
  });

  req.session.errors = null;
});

router.post('/submit', function(req, res, next) {
  req.check('email', 'Please enter a valid email').isEmail();
  req.check('password', 'Password does not meet the requirement').isLength({ min: 4 }).equals(req.body.confirmPassword);

  var errors = req.validationErrors();
  if (errors) {
    req.session.errors = errors;
    req.session.success = false;
  } else {
    req.session.success = true;
  }
  res.redirect('/');
});

router.get('/get-data', function(req, res, next) {
  Book.find().then(function(doc) {
    res.render('index', {items: doc});
  });
});

router.post('/insert', function(req, res, next) {
  var item = new Book({
      title: req.body.title,
      content: req.body.content,
      author: req.body.author
  });
  item.save();

  res.redirect('/')
});

router.post('/update', function(req, res, next) {
  var item = {
    title: req.body.title,
    content: req.body.content,
    author: req.body.author
  };

  Book.update({ _id: req.body.id }, item, function(err, raw) {
    if (err) {
      console.log(err);
    } else {
      console.log(raw);
    }
  });

  res.redirect('/');
});

router.post('/delete', function(req, res, next) {
  Book.remove({ _id: req.body.id }, function(err) {
    if (err) {
      console.log(err);
    }
  });

  res.redirect('/');
});

module.exports = router;
