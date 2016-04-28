// Quartz.Loader.Loader


var Loader;

(function () {

    /**
     * Yükleyici
     * @type {qz.Loader}
     */
    Loader = qz.Loader = function (loadCallback , errorCallback) {

        /**
         * Yüklecinin sahibi olan paket
         * @private
         */
        this._owner = null;

        /**
         * verinin yüklenme durumu
         * @type {boolean}
         * @private
         */
        this._loaded = false;


        /**
         * Yüklenme tamamlanınca çalıştırılacak method
         * @type {Function}
         */
        this.loadCallback = loadCallback;


        /**
         * Hata durumunda çağırılacak method
         * @type {Function}
         */
        this.errorCallback = errorCallback;

        /**
         * Yüklemeye başlanma zamanı
         */
        this._startTime = Util.now();


        /**
         * Yüklenenme tamamlanma zamanı
         * hata verirse hata zamanı
         */
        this._endTime = 0;
    };

    Util.createObjectType(Loader , 'Loader');

    Util.assign(Loader.prototype , {

    });

    Object.defineProperties(Loader.prototype , {
        loaded: {
            get: function () {
                return this._loaded;
            }
        },
        /**
         * Yüklenmeye başladıktan sonra geçen zaman
         * Yüklendi ise yüklenme süresi
         */
        elapsedTime: {
            get: function () {
                return this._endTime ? this._endTime - this._startTime  : Util.now() - this._startTime;
            }
        }
    });

})();