const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient

var db
// sets up server and connects to database
MongoClient.connect('mongodb://demo:demo@ds125146.mlab.com:25146/savage', (err, database) => {
  if (err) return console.log(err)
  db = database
  app.listen(process.env.PORT || 3000, () => {
    console.log('listening on 3000')
  })
})
// ejs is the templating engine
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
// all static files (client side code) are in public folder
app.use(express.static('public'))

// Starts API running on server, sets up routes and endpoints
app.get('/', (req, res) => {
  // go to database, find collection called messages, find all docs and turn in to array
  db.collection('messages').find().toArray((err, result) => {
    // results holds array of documents
    if (err) return console.log(err)
    // renders html of index.ejs and pass in obj with property of messages... messages is the array of results
    res.render('index.ejs', {messages: result})
  })
})

app.post('/messages', (req, res) => {
  // goes into messages collection, pass in an object to save into the database
  // uses body parser to read body of contents input in the form submission
  db.collection('messages').save({name: req.body.name, msg: req.body.msg, thumbUp: 0, thumbDown:0}, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    res.redirect('/')
  })
})

app.put('/messages1', (req, res) => {
  db.collection('messages')
  .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
    $set: {
      thumbUp:req.body.thumbUp + 1
      // console.log(thumbDown);
    }
  }, {
    sort: {_id: -1},
    upsert: true
  }, (err, result) => {
    if (err) return res.send(err)
    res.send(result)
  })
})

app.put('/messages2', (req, res) => {
  db.collection('messages')
  .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
    $set: {
      // updating the thumbUp property in the database
      thumbUp:req.body.thumbUp - 1
      // console.log(thumbDown);
    }
  }, {
    sort: {_id: -1},
    upsert: true
  }, (err, result) => {
    if (err) return res.send(err)
    res.send(result)
  })
})

app.delete('/messages', (req, res) => {
  db.collection('messages').findOneAndDelete({name: req.body.name, msg: req.body.msg}, (err, result) => {
    if (err) return res.send(500, err)
    res.send('Message deleted!')
  })
})
