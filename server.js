const express = require('express');
const puppeteer = require('puppeteer');

const PORT = process.env.PORT || 9000;

const app = express();

app.get('/screenshot', async (request, response) => {
  const url = request.query.url;
  console.log(url);

	if (!url) {
    return response.status(400).send(
      'Please provide a URL. Example: ?url=https://example.com');
	}

	// Default to a reasonably large viewport for full page screenshots.
  const viewport = {
    width: 1280,
    height: 1024,
    deviceScaleFactor: 1
	};

	let fullPage = true;
  const size = request.query.size;
  if (size) {
    const [width, height] = size.split(',').map(item => Number(item));
    if (!(isFinite(width) && isFinite(height))) {
      return response.status(400).send(
        'Malformed size parameter. Example: ?size=800,600');
    }
    viewport.width = width;
    viewport.height = height;

    fullPage = false;
	}

	const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});

	try {
    const page = await browser.newPage();
    await page.setViewport(viewport);
    await page.goto(url, {waitUntil: 'networkidle0'});

    const opts = {
      fullPage,
      // omitBackground: true
		};

    if (!fullPage) {
      opts.clip = {
        x: 0,
        y: 0,
        width: viewport.width,
        height: viewport.height
      };
    }

    const buffer = await page.screenshot(opts);
    response.type('image/png').send(buffer);
  } catch (err) {
    response.status(500).send(err.toString());
  }

  await browser.close();

});

app.listen(PORT, function() {
  console.log(`App is listening on port ${PORT}`);
});
