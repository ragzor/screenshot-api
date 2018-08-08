const express = require('express');
const screenshot = require('./screenshot');

const PORT = process.env.PORT || 9000;

const app = express();

app.get('/screenshot', async (request, response) => {

  // Get URL & Size from get request
  const url = request.query.url; // http://example.com
  const size = request.query.size; // 600,800
  const encoding = request.query.encoding || 'binary'; // binary/base64
  const scale = request.query.scale || '1';

  // return 400 if url is incorrect
	if (!url) {
    return response.status(400).send(
      'Please provide a URL. Example: ?url=https://example.com');
  }

  screenshot(url, size, encoding, scale)
  .then(buffer => {

    // Return JSON if base64
    if (encoding === 'base64') {
      response.type('application/json').send(buffer);
    } else {
      // Return image if binary
      response.type('image/jpeg').send(buffer);
    }

  })
  .catch((err) => {
    response.status(500).send(err.toString());
  });

});

app.listen(PORT, function() {
  console.log(`App is listening on port ${PORT}`);
});
