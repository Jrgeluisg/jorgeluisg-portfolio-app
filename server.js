// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var mongo = require('mongodb');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var shortid = require('shortid');
var port = process.env.PORT || 5000;
require('dotenv').config();


//Mongoose.conection
mongoose.connect(process.env.DB_URI, {
  useNewUrlParser:true, 
  useUnifiedTopology:true
});




// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


// http://expressjs.com/en/starter/basic-routing.html
app.get("/timestamp", function (req, res) {
  res.sendFile(__dirname + '/views/timestamp.html');
});

app.get("/requestHeaderParser", function (req, res) {
  res.sendFile(__dirname + '/views/requestHeaderParser.html');
});

app.get("/urlShortenerMicroservice", function (req, res) {
  res.sendFile(__dirname + '/views/urlShortenerMicroservice.html');
});

// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  console.log({greeting: 'hello API'});
  res.json({greeting: 'hello API'});
});


/**
A request to /api/timestamp/:date? with a valid date should return a JSON object with a unix key that is a Unix timestamp of the input date in milliseconds
A request to /api/timestamp/:date? with a valid date should return a JSON object with a utc key that is a string of the input date in the format: Thu, 01 Jan 1970 00:00:00 GMT
A request to /api/timestamp/1451001600000 should return { unix: 1451001600000, utc: "Fri, 25 Dec 2015 00:00:00 GMT" } 
Your project can handle dates that can be successfully parsed by new Date(date_string)
An empty date parameter should return the current time in a JSON object with a unix key
An empty date parameter should return the current time in a JSON object with a utc key
*/
// Timestamp Project
app.get('/api/timestamp', (req, res) => {
  let now = new Date();
  res.json({
    "unix": now.getTime(),
    "utc": now.toUTCString()
  })
})

app.get('/api/timestamp/:date_string?', (req, res) => {
  let dateString = req.params.date_string;

  if (parseInt(dateString) > 10000) {
    let unixTime = new Date(parseInt(dateString));
    res.json(
      {
        "unix": unixTime.getTime(),
        "utc": unixTime.toUTCString()
      }
    );
  }

  let passedInValue = new Date(dateString);

  if (passedInValue == "Invalid Date") {
    res.json({"error":"Invalid Date"});
  } else {
    res.json(
      {
        "unix": passedInValue.getTime(),
        "utc": passedInValue.toUTCString()
      }
    );
  }  
});

// Header Requests
app.get('/api/whoami', (req, res) => {
  res.json(
    {
      // "value": Object.keys(req),
      "ipaddress": req.ip,
      "language": req.headers["accept-language"],
      "software": req.headers["user-agent"],
      // "req-headers": req.headers
    }
  );
});

// URLS Shortening Service

// Creating the URL Schema and model 
let urlSchema = new mongoose.Schema({
  original: {type: String, required: true},
  short: Number,
});

let Url = mongoose.model('URL', urlSchema); 

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));

let responseObject = {};

app.post('/api/shorturl/new', (request, response) => {
  let inputUrl = request.body.url;

  let urlRegex = new RegExp(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi);

  if (!inputUrl.match(urlRegex)) {
    response.json({error: 'InvalidUrl'});
    return
  }
  responseObject.original_url = inputUrl;
  // let inputShort = shortid.generate();
  let inputShort = 1;

  Url.findOne({})
  .sort({short:'desc'})
  .exec((error, result) => {
    if (!error && result != undefined) {
      inputShort = result.short + 1;
    }
    if (!error) {
      Url.findOneAndUpdate(
        {original: inputUrl},
        {original: inputUrl, short:inputShort},
        {new: true, upsert: true, useFindAndModify: false},
        (error, savedUrl) => {
          if(!error) {
            responseObject.short_url = savedUrl.short;
            response.json(responseObject);
          }
        }
      )
    }
  });

  app.get('/api/shorturl/:input', (request, response) => {
    let input = request.params.input;

    Url.findOne({short: input}, (error, result) => {
      if (!error && result != undefined) {
        response.redirect(result.original);
      } else {
        response.json({error: 'url not found'});
      }
    })
  });

  // response.json(responseObject);
});

// Build a schema and model to store saved URLS
// let ShortURl = mongoose.model('ShortURL', new mongoose.Schema({
//   short_url: String,
//   original_url: String,
//   suffix: String
// }));

/*
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));


app.post('/api/shorturl/new', (req, res) => {
  let client_requested_url = req.body.url;
  let suffix = shortid.generate();
  let newShortURL = suffix 

  let newUrl = new ShortURl({
    short_url: __dirname + '/api/shorturl/' + suffix,
    original_url: client_requested_url,
    suffix: suffix
  });

  newUrl.save( (err, doc) => {
    if (err) return console.error(err)
    console.log('Document inserted sucessfully');
    res.json({
      "saved": true,
      "short_url":newUrl.short_url,
      "original_url": newUrl.original_url,
      "suffix": newUrl.suffix
    });
  });
});

app.get('/api/shorturl/:short_url?', (req, res) => {
  let userGeneratedSuffix = req.params.suffix;
  ShortURl.find({suffix:userGeneratedSuffix}).then((foundUrls) => {
    let urlForRedirect = foundUrls[0];
    res.redirect(urlForRedirect.original_url);
  });
});
*/

// listen for requests :)
var listener = app.listen(port, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
