// Quartz.Loader.Image
// require:loader.loader
// require:loader.pack

(function () {
    /**
     * Yeni Resim Yükler
     * @param src -  Resim kaynağı
     * @param loadCallback - Resim yüklenince çağırılacak method
     * @param errorCallback -  Resim yüklenirken hata ile karşılaşınca çalışacak olay
     * @constructor
     */
    Loader.Image = function (src , loadCallback , errorCallback) {
        Loader.call(this , loadCallback , errorCallback);

        var self = this;


        /**
         * Yeni resim objesi
         */
        this._image = new Image;

        /**
         * Yüklemesi için kaynak
         */
        this._image.src = src;


        /**
         * Resim yüklenince çalışacak method
         * @param e
         * @private
         */
        this._load = function (e) {
            self._loaded = true;
            self._endTime = Util.now();
            self._owner && self._owner._load(self , e);
            self.loadCallback && self.loadCallback.call(self , e);
            self.removeListener();
        };


        /**
         * Resim yüklenirken hata ile karışılaşınca çalışacak method
         * @param e
         * @private
         */
        this._error = function (e) {
            self._endTime = Util.now();
            self._owner && self._owner._error(self , e);
            self.errorCallback && self.errorCallback.call(self , e);
            self.removeListener();
        };

        /**
         * olaylar eklendi
         */
        this._image.addEventListener('load' , this._load);
        this._image.addEventListener('error' , this._error);

    };


    Util.inherit(Loader.Image , Loader);

    Util.createObjectType(Loader.Image , 'Image');

    Util.assign(Loader.Image.prototype , {
        /**
         * Resim olaylarını dinlemeyi bırakır
         */
        removeListener: function () {
            this._image.removeEventListener('load' , this._load);
            this._image.removeEventListener('error' , this._error);
        }
    });

    Object.defineProperties(Loader.Image.prototype , {
        src: {
            get: function () {
                return this._image.src;
            }
        },
        width: {
            get: function () {
                return this._image.width;
            }
        },
        height: {
            get: function () {
                return this._image.height;
            }
        },
        image: {
            get: function () {
                return this._image;
            }
        },
        _get: {
            get: function () {
                return this._image;
            }
        },
        loaded: {
            get: function () {
                return this._loaded;
            }
        }
    });



    Loader.Pack.TYPES.image = Loader.Image;

})();