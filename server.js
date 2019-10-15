'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var dns = require('dns');
var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGOLAB_URI);

app.use(cors());

/** this project needs to parse POST bodies **/
// Mounting bodyParser
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
app.use(urlencodedParser);
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

//Create model for url////////////////////////////////////////////////////////
  //Create Schema
  var schema = new mongoose.Schema({
    url : {
      type: String,
      required: true,
      unique: true
    },
    shortUrl: {
      type: Number,      
      unique: true,
      //required: true
    }
  });
  var Urlmodel = mongoose.model('Urlmodel', schema);

 /*
//Delete everything in database//////////////////////////////////////////////////////
app.post("/api/shorturl/new", function (req, res) {
  let filter = {
    url: {$ne: null}
  };
  Urlmodel.deleteMany(filter, function(err) {
    return res.json({Message: "Everything in database is cleared!"});
  });
});
 */


// /*
// Route POST request/////////////////////////////////////////////////////////////
app.post("/api/shorturl/new", function (req, res) {
  let urlPost = req.body.url;
  //dns lookup the inputted url to see if it requires shortening or is a valid url
  let filteredUrl = urlPost.replace(/^https:\/\//, "");
  let findHttps = urlPost.match(/^https:\/\//);
  dns.lookup(filteredUrl, function(err) {
    if (err || findHttps == null){
      return res.json({error: "invalid URL"});
    } else {
  //Search db for matching query
      let condition = {
        url: urlPost,
        shortUrl: {$ne: null}
      };
      Urlmodel.findOne(condition, function(err, result) {
        if (err) {
          return res.json({error: "Cannot find specified document in database"});
        };
        //saves new entry and then returns result if no search result is found
        if (result == null) {
          Urlmodel.estimatedDocumentCount(function(err, count){
            if (err) {
              return res.json({error: "Cannot count document"});
            };
            let saveDoc = new Urlmodel({
              url: urlPost,
              shortUrl: count
            });
            saveDoc.save(function (err, product) {
              if (err) {
                return res.json({error: "Cannot save document. Maybe refresh and try again!"});
              };
              return res.json({
                url: product.url,
                shortUrl: product.shortUrl
              });
            });
          });
          //returns res.json({error: "Cannot save document. Maybe refresh and try again!"});
        } else {
          //returns result immediately if search result is not null
          return res.json({
            original_url: urlPost,
            short_url: result.shortUrl
          });
        }
      });
    }
  });  
});
// */ 

//Route GET request//////////////////////////////////////////////////////////////////
app.get("/api/shorturl/:new", function(res, req) {
  //find the entered short_url in database
  let shortU = res.params.new;
  let condition = {shortUrl: shortU};
  Urlmodel.findOne(condition, function(error, result){
    if (error) {return req.send("Error trying to initiate find()")};
    //Send error message if no search result is found
    if (result == null) {
      return req.send("Cannot find the shortUrl in the database! Please try with a valid short Url.");
    } else {
      //Redirects to the corresponding URL if result is found
      return req.redirect(result.url);
    }
  });      
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});