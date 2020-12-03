// server.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var port = process.env.PORT || 5000;

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
An empty date parameter should return the current time in a JSON object with a utc key */

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

app.get('/api/whoami', (req, res) => {
  res.json(
    {
      // "value": Object.keys(req),
      "ipaddress": req.ip,
      "language": req.headers["accept-language"],
      "sotfware": req.headers["user-agent"],
      // "req-headers": req.headers
    }
  )
});

// listen for requests :)
var listener = app.listen(port, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
