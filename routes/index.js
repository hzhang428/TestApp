var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var assert = require('assert');

var url = 'mongodb://localhost:27017/test';

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
  var results = [];
  mongo.connect(url, function(err, db) {
    if (err) {
        req.session.errors = true;
    } else {
        req.session.errors = true;
    }
    var cursor = db.collection('user-data').find();
    cursor.forEach(function(doc, err) {
      assert.equal(null, err);
      results.push(doc);
    }, function() {
      db.close();
      res.render('index', {items: results});
    });
  });
});

router.post('/insert', function(req, res, next) {
  var item = {
    title: req.body.title,
    content: req.body.content,
    author: req.body.author
  };

  mongo.connect(url, function(err, db) {
    assert.equal(null, err);
    db.collection('user-data').insertOne(item, function(err, result) {
      assert.equal(null, err);
      db.close();
    });
  });

  res.redirect('/');
});

router.post('/update', function(req, res, next) {
  console.log(req.body);
  var item = {
    id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    author: req.body.author
  };
  mongo.connect(url, function(err, db) {
    assert.equal(null, err);
    db.collection('user-data').updateOne({ _id : new mongo.ObjectID(item.id) },
        { $set: {title: item.title, content: item.content, author: item.author} }, function(err, r) {
      assert.equal(null, err);
      assert.equal(1, r.result.n);
      assert.equal(1, r.result.nModified);
      db.close();
    });
  });

  res.redirect('/');
});

router.post('/delete', function(req, res, next) {
  var id = req.body.id;
  mongo.connect(url, function(err, db) {
    assert.equal(null, err);
    db.collection('user-data').deleteOne({ _id : new mongo.ObjectID(id) }, function(err, r) {
      assert.equal(null, err);
      assert.equal(1, r.result.n);
      db.close();
    });
  });

  res.redirect('/');
});

module.exports = router;
