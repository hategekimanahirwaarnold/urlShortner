require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');
const mongoose = require('mongoose');

const dbURL = process.env.MONGO_URL;
mongoose.connect(dbURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

app.use(bodyParser.json());
//Body parsing middleware to parse URL - encoded data
app.use(bodyParser.urlencoded({ extended: true }));
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});
let number = 1;

const urlSchema = new mongoose.Schema({
  original_url: {
    type: String,
    required: true
  },
  short_url: {
    type: Number,
    required: true
  }
});

const Linkage = mongoose.model("Linkage", urlSchema);

function verifyURL(url, callback) {
  const { hostname } = new URL(url);
  dns.lookup(hostname, (err, data) => {
    if (err) {
      callback(false)
    } else {
      callback(true)
    }
  });
};

app.post("/api/shorturl", (req, res) => {
  let host = req.body.url;

  verifyURL(host, (isValid) => {
    if (isValid) {
      console.log("The URL IS valid", isValid)
      data = {
        original_url: host,
        short_url: number
      };
      res.json(data);
      //post new url in the database
        (async () => {
          try {
            // Check if URL already exists
            let existingUrl = await Linkage.findOne({ original_url: host });
            if (existingUrl) {
              console.log("URL already posted");
            } else {
              // Save new URL to the database
              let newUrl = new Linkage(data);
              await newUrl.save();
              console.log("New URL sent to the database");
            }
          } catch (err) {
            console.log(err);
            res.json({ error: "An error occurred" });
            return;
          }

        })
        //if it is not a valid url
      } else {
        console.log("The URL is invalid", isValid)
        res.json({
          error: "invalid url"
        });
        number++;
      }
    });

})

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
