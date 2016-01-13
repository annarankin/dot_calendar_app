var express = require('express');
var app = express();
var ejs = require('ejs');
var bodyParser = require('body-parser')
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var mongoUrl = 'mongodb://localhost:27017/dot'
var db;
MongoClient.connect(mongoUrl, function(err, database) {
  if (err) {
    console.log(err)
  }
  db = database;
  process.on('exit', db.close);
});

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({
  extended: false
}));
app.set('view engine', 'ejs');

app.use(function(req, res, next) {
  console.log(req.method, req.originalUrl);
  console.log('params:', req.params);
  console.log('body:', req.body);
  next();
});

app.get('/', function(req, res) {
  res.render('index')
});
app.get('/calendar', function(req, res) {
  res.render('calendar');
});
app.get('/events', function(req, res) {
  db.collection('events').find({}).toArray(function(err, data) {
    if (err) {
      console.log(err)
    }
    res.json(data);
  })
});

// app.post('/events/', function(req, res) {
//   db.collection('events').update(
//     { _id: req.body._id }, 
//     { $set: {  } }, 
//     function(err, data) {

//     });
// });

// FIND AND MODIFY DOESN'T GIVE BACK MODIFED RECORD. UGH.
// app.post('/rsvps', function(req, res) {
//   var rsvp = {
//     name: req.body.name,
//     email: req.body.email
//   }
//   db.collection('events').findAndModify(
//     {_id: ObjectId(req.body._id)}, 
//     {}, 
//     { $push: {rsvps: rsvp} }, 
//     function(err,data, ok) {
//       console.log('err', err)
//       console.log('data', data)
//       res.json(data.value);
//   });
// });
app.post('/rsvps', function(req, res) {
  var rsvp = {
    name: req.body.name,
    email: req.body.email
  }
  db.collection('events').update({_id: ObjectId(req.body._id)}, 
    { $push: 
      {rsvps: rsvp}
    }, function(err, data) {
    if (err) {
      console.log(err);
    };
    db.collection('events').findOne({_id: ObjectId(req.body._id)}, function(err, data) {
      res.json(data);
    })
  });
});

app.post('/comments', function(req, res) {
  var comment = {
    name: req.body.name,
    comment: req.body.comment
  }
  db.collection('events').update(
    {_id: ObjectId(req.body._id)},
    {$push: {comments: comment}},
    function(err, data) {
      db.collection('events').findOne({_id: ObjectId(req.body._id)}, function(err, data) {
        res.json(data)
      });
  });
});

app.delete('/comments', function(req, res) {
  var comment = {
    name: req.body.name,
    comment: req.body.comment
  }
  db.collection('events').remove(
    {_id: ObjectId(req.body._id)},
    {$pull: {comments: comment}},
    function(err, data) {
      db.collection('events').findOne({_id: ObjectId(req.body._id)}, function(err, data) {
        res.json(data)
      });
  });
});

app.patch('/comments', function(req, res) {

})

app.listen(3000, function() {
  console.log("I'M LISTENING");
});
