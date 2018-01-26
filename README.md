PNG-Image
==========

Crop and save PNGs

## Installation

Install this module locally with the following command:
```shell
npm install png-image
```

Save to dependencies or dev-dependencies:
```shell
npm install --save png-image
npm install --save-dev png-image
```

## Usage

Can run node-style (callbacks) or with promises as below.

**Example:**
```javascript
const PNGImage = require('png-image')

let pngImage = new PNGImage({
    imagePath: './imageA.png',
    imageOutputPath: "./imageB.png",
    cropImage: {x: 0, y: 0, width: 40, height: 40}
});

pngImage.run(err => {
    console.log((err ? err : 'success'));
});

pngImage.runWithPromise().then(() => console.log("OK"));
```

## Parameters:

* ```imagePath``` Defines path of the image input file.
* ```imageOutputPath``` Defines path of the image output file.
* ```imageCrop``` Cropping object for image (default: none).

## License

Licensed under the MIT license.

Copyright (c) 2018 Koola.
