// Quartz.Drawing.Texture

var Texture;

(function () {

    Texture = qz.Texture = function (image , sourceOffset , sourceSize , offset , size) {
        if (image instanceof Loader.Image)
            image = image.image;



        /**
         * Doku oluşturulacak resim
         */
        this.image = image;

        /**
         * Resimden alınacak parcanın x ve y kordinatları
         * https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
         * buradaki sx,sy
         */
        this.sourceOffset = Point(sourceOffset);

        /**
         * Resimden alınacak parçanın width ve height değerleri
         * https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
         * buradaki sWidth , sHeight
         */
        this.sourceSize = sourceSize ? Size(sourceSize) : Size(image).clone().sub(this.sourceOffset);


        /**
         * Çizime başlanacak x ve y kordinatları
         */
        this.offset = Point(offset);

        /**
         * Çizim yapılacak canvasın boyutu
         */
        this.size = size ? Size(size) : this.sourceSize.clone().sum(this.offset);

        /**
         * Kaplamanın tutulacağı canvas
         * @type {Element}
         * @private
         */
        this._canvas = document.createElement('canvas');

        /**
         * Kaplama Canvasının contexti
         * @type {CanvasRenderingContext2D}
         * @private
         */
        this._context = this._canvas.getContext('2d');


        this.update();
    };

    Util.assign(Texture.prototype , {
        /**
         * Dokuyu Canvasa Çizer
         */
        update: function () {
            var so = this.sourceOffset,
                ss = this.sourceSize,
                co = this.offset,
                cs = this.size,
                context = this._context,
                canvas = this._canvas,
                image = this.image instanceof Texture ? this.image.getBufferCanvas() : this.image;

            canvas.width = cs.width;
            canvas.height = cs.height;
            context.clearRect(0 , 0 , cs.width , cs.height);
            context.drawImage(image , so.x , so.y , ss.width , ss.height , co.x , co.y , ss.width , ss.height);

        } ,

        clone: function () {
            return new Texture(this.image);
        },

        getBufferCanvas: function () {
            return this._canvas;
        }
    });

})();