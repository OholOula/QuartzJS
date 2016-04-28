// Quartz.Loader.Pack
// require:loader.loader

(function () {

    /**
     * Çoklu veri yüklenmesini sağlar
     * @param data
     * @param loadCallback - Bütün veriler yüklenince çağırılacak method
     * @param errorCallback -  Herhangi bir veri yüklenirken hata meydana geldiğin de çağırılacak method
     * @example
     * {
     *      image: {
     *          key: luffy.jpg,
     *          key: [luffy.jpg , onLoad , onError]
     *      }
     * }
     * @constructor
     */
    Loader.Pack = function (data) {
        Event.call(this);

        data = data || {};

        /**
         * mevcut yükleme bilgisi
         * @private
         */
        this._data = data;

        /**
         * Sahip olunan yükleyiciler
         * @type {Array}
         * @private
         */
        this._loaders = {};

        /**
         * Sahip olunan yükleyici sayısı
         * @type {number}
         * @private
         */
        this._loadersLength = 0;


        /**
         * Sahip olunan yükleyicilerden kaç tanesinin yüklendiği
         * @type {number}
         * @private
         */
        this._loadedLength = 0;


        /**
         * Yüklenmeye başlama zamanı
         * @type {number}
         * @private
         */
        this._startTime = 0;

        /**
         * Yüklenme bitiş zamanı
         * @type {number}
         * @private
         */
        this._endTime = 0;

        /**
         * verilerin yüklenme durumu
         * @type {boolean}
         * @private
         */
        this._loaded = false;

        if (data.autoload !== false) {
            var self = this;
            setTimeout(function () {
                self.load();
            } , 10);
        }


    };

    Util.include(Loader.Pack.prototype , Event);
    Util.createObjectType(Loader.Pack , 'Loader.Pack');

    Util.assign(Loader.Pack.prototype , {
        /**
         * Verileri yüklemeye başlar
         */
        load: function () {

            var data = this._data,
                key , constructor , item , element, name;

            if (data) {

                this._startTime = Util.now();

                for (key in data) {
                    if ((constructor = Loader.Pack.TYPES[key]) && Util.isBasicObject(data[key])) {
                        for (name in data[key]) {
                            item = data[key][name];
                            if (Util.isArray(item)) {
                                element = new (constructor.bind.apply(constructor , [null].concat(item)));
                            } else {
                                element = new constructor(item);
                            }
                            // image.luffy gibi
                            this._loaders[key + '.' + name] = element;
                            this._loadersLength++;
                            element._owner = this;
                        }
                    }
                }

            }
        },

        /**
         * Yükleyicilerinden herhangi biri yüklenince çalışır
         * büyün yükleyiciler yüklendi ise onLoad eventi cağırılır
         * @private
         */
        _load: function () {
            this._loadedLength++;
            /**
             * Yükleyicilerden herhangi biri yüklenince
             */
            this.emit('load' , this._loadedLength , this._loadersLength);


            if (this._loadedLength == this._loadersLength) {
                this._loaded = true;
                this._endTime = Util.now();
                /**
                 * bütün yükleyiciler yüklenince
                 */
                this.emit('complete' , this._loadersLength);
            }
        } ,

        /**
         * Yüklenme sırasında herhangi bir hata olunca onError eventı çağırılır
         * @private
         */
        _error: function () {
            this.emit('error');
        } ,

        /**
         * Anahtara göre isteninen yükleyiciyi döndürür
         * @param key
         * @returns {*}
         */
        get: function (key , self) {

            if (this._loaders[key]) {
                return this._loaders[key]._get && !self ? this._loaders[key]._get : this._loaders[key];
            }

            return false;
        },

        
        on: function (key , callback) {
            if (key == 'complete' && this._loaded && Util.isFunction(callback)) {
                callback();
            }
            Event.prototype.on.call(this , key , callback);
        }

    });


    Object.defineProperties(Loader.Pack.prototype , {
        /**
         * dosyaların yüklenme yüzdesi
         */
        progress: {
            get: function () {
                return Math.round(this._loadersLength && this._loadedLength * 100 / this._loadersLength);
            }
        },

        /**
         * Yüklenmeye başladıktan sonra geçen zaman
         */
        elapsedTime: {
            get: function () {
                return this._endTime || Util.now() - this._startTime;
            }
        },

        /**
         * Bütün dosyaların yüklenme durumu
         */
        loaded: {
            get: function () {
                return this._loaded;
            }
        }
    });

    /**
     * Çoklu yüklemedeki paket isimleri ve oluşturulacak nesne
     * image: Loader.Image
     * gibi
     * @type {{}}
     */
    Loader.Pack.TYPES = {};

})();