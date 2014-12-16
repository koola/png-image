var fs = require('fs'),
    PNG = require('pngjs').PNG,
    Promise = require('promise');

/**
 * PNG-Image class
 *
 * @constructor
 * @class PNGImage
 * @param {object} options
 * @param {string} options.imagePath Path to in image file
 * @param {string} options.imageOutputPath Path to output image file
 * @param {object} [options.cropImage=null] Cropping for image (default: no cropping)
 * @param {int} [options.cropImage.x=0] Coordinate for left corner of cropping region
 * @param {int} [options.cropImage.y=0] Coordinate for top corner of cropping region
 * @param {int} [options.cropImage.width] Width of cropping region (default: Width that is left)
 * @param {int} [options.cropImage.height] Height of cropping region (default: Height that is left)
 *
 * @property {string} _imagePath
 * @property {string} _imageOutputPath
 * @property {object} _cropImage
 * @property {object} _image
 */
function PNGImage(options) {
    this._imagePath = options.imagePath;
    this._imageOutputPath = options.imageOutputPath;
    this._cropImage = options.cropImage;

    this._image = null;
}

PNGImage.prototype = {

    /**
     * Runs with a promise
     *
     * @method runWithPromise
     * @return {Promise}
     */
    runWithPromise: function () {
        return Promise.denodeify(this.run).call(this);
    },

    /**
     * Runs node-style
     *
     * @method run
     * @param {function} fn
     */
    run: function (fn) {
        this._loadImage(this._imagePath, function (err, image) {
            if (err) return fn(err);

            this._image = image;

            if (this._cropImage) {
                this._image = this._crop(this._cropImage);
            }
            this._writeImage(this._imageOutputPath, function () {
                fn(undefined);
            });
        }.bind(this));
    },

    /**
     * Crops the current image to the specified size
     *
     * @method crop
     * @param {object} rect
     * @property {int} x Starting x-coordinate
     * @property {int} y Starting y-coordinate
     * @property {int} width Width of area relative to starting coordinate
     * @property {int} height Height of area relative to starting coordinate
     * @return {PNG} image Cropped image
     * @private
     */
    _crop: function (rect) {

        var image,
            width,
            height;

        width = Math.min(rect.width, this._image.width - rect.x);
        height = Math.min(rect.height, this._image.height - rect.y);

        if ((width < 0) || (height < 0)) {
            throw new Error('Width and height cannot be negative.');
        }

        image = new PNG({
            width: width,
            height: height
        });

        this._image.bitblt(image, rect.x, rect.y, width, height, 0, 0);
        return image;
    },

    /**
     * Loads the image from path, stream or buffer
     *
     * @method _loadImage
     * @param {string|buffer} filename
     * @param {function} fn Callback
     * @private
     */
    _loadImage: function (filename, fn) {

        var image = new PNG();

        if (typeof filename === 'string') {
            fs.createReadStream(filename).pipe(image).once('error', fn).on('parsed', function () {
                fn(undefined, this);
            });
        } else if (filename instanceof Buffer) {
            image.parse(filename, function () {
                fn(undefined, image);
            });
        } else {
            fn(new Error('Expected a valid read path, stream or buffer.'));
        }
    },

    /**
     * Writes the image to the filesystem
     *
     * @method _writeImage
     * @param {string} filename Path to file
     * @param {function} fn Callback
     * @private
     */
    _writeImage: function (filename, fn) {

        this._image.pack().pipe(fs.createWriteStream(filename))
            .once('close', fn)
            .once('error', fn);
    }
};

module.exports = PNGImage;