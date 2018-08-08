const puppeteer = require('puppeteer');

module.exports = exports = async function(url, size, encoding, scale) {
	// Default to a reasonably large viewport for full page screenshots.
  const viewport = {
    width: 1280,
    height: 1024,
    deviceScaleFactor: Number(scale)
	};

	// let fullPage = true;

  if (size) {
    const [width, height] = size.split(',').map(item => Number(item));
    if (!(isFinite(width) && isFinite(height))) {
      return response.status(400).send(
        'Malformed size parameter. Example: ?size=800,600');
    }
    viewport.width = width;
		viewport.height = height;

		// remove fullPage if size is set
    // fullPage = false;
	}

	const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});

	try {
    const page = await browser.newPage();
    await page.setViewport(viewport);
		await page.goto(url, {waitUntil: 'networkidle0'});

		// Full Page Screenshot Fix
		const bodyHandle = await page.$('body');
		const { width, height } = await bodyHandle.boundingBox();
		viewport.width = width;
		viewport.height = height;

    const opts = {
			// fullPage,
			encoding,
      type: "jpeg"
      // omitBackground: true
		};

    // if (!fullPage) {
    //   opts.clip = {
    //     x: 0,
    //     y: 0,
    //     width: viewport.width,
    //     height: viewport.height
    //   };
		// }
		  opts.clip = {
        x: 0,
        y: 0,
        width: viewport.width,
        height: viewport.height
      };

		const buffer = await page.screenshot(opts);

		await browser.close();
		return buffer;

  } catch (err) {
		await browser.close();
		throw err;
  }

}
