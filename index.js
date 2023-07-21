
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const dns = require('dns');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const port = process.env.PORT || 3000;

app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

let number = 1;
const urlMap = {}; // Store the URLs in an object

function verifyURL(url, callback) {
  const { hostname } = new URL(url);
  dns.lookup(hostname, (err, data) => {
    if (err) {
      callback(false);
    } else {
      callback(true);
    }
  });
}

app.post('/api/shorturl', (req, res) => {
  let host = req.body.url;

  verifyURL(host, (isValid) => {
    if (isValid) {
      console.log('The URL IS valid', isValid);
      const data = {
        original_url: host,
        short_url: number,
      };
      res.json(data);

      // Store the data in local storage
      urlMap[number] = data;
      number++;
    } else {
      console.log('The URL is invalid', isValid);
      res.json({
        error: 'invalid url',
      });
    }
  });
});

// Redirect shortened URLs to their original URLs
app.get('/api/shorturl/:short_url', (req, res) => {
  const { short_url } = req.params;
  const data = urlMap[parseInt(short_url)];

  if (data) {
    res.redirect(data.original_url);
  } else {
    res.json({ error: 'Short URL not found' });
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
