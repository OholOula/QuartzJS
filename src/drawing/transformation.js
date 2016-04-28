// Quartz.Scene.Transform
// require:core.point
// require:core.transform

var Transformation = null;

(function () {

    /**
     * Genelleştirilmiş transform işlemleri
     * @constructor
     */
    Transformation = qz.Transformation = function (opt) {

        opt = opt || {};

        /**
         * Genel ölçeklendirme
         * @property
         * @default
         */
        this.scale = opt.scale || 1;

        /**
         * Yatay ölçeklendirme.
         * Genel ölçeklendirme ile çarpılır (realScaleX = scale * scaleX)
         * @property
         * @default
         */
        this.scaleX = opt.scaleX || 1;

        /**
         * Dikey ölçeklendirme.
         * Genel ölçeklendirme ile çarpılır (realScaleY = scale * scaleY)
         * @property {Number}
         * @default
         */
        this.scaleY = opt.scaleY || 1;

        /**
         * Yatay konumlandırma çıkıntısı
         * @property {Number}
         * @default
         */
        this.offsetX = opt.offsetX || 0;

        /**
         * Dikey konumlandırma çıkıntısı
         * @property {Number}
         * @default
         */
        this.offsetY = opt.offsetY || 0;

        if (opt.offset) {
            this.offset = opt.offset;
        }

        /**
         * Eğme yatay(x) değeri
         * @property {Number}
         * @default
         */
        this.skewX = opt.skewX || 0;

        /**
         * Eğme dikey(y) değeri
         * @property {Number}
         * @default
         */
        this.skewY = opt.skewY || 0;

        /**
         * Açısal döndürme değeri
         * @property [Number}
         */
        this.rotate = opt.rotate || 0;

        /**
         * Ölçeklendirme ve Döndürme yatay(x) değeri
         * @property {Number}
         * @default
         */
        this.originX = opt.originX || 0;

        /**
         * Ölçeklendirme ve Döndürme dikey(y) değeri
         * @property {Number}
         * @default
         */
        this.originY = opt.originY || 0;

        /**
         * Origin ataması
         */
        opt.origin && (this.origin = opt.origin);

        /**
         * Offset ataması
         */
        opt.offset && (this.offset = opt.offset);

    };

    Transformation.PROPERTIES = Object.keys(new Transformation);


    Util.assign(Transformation.prototype , {

        /**
         * Mevcut Konumlandırma , Ölçeklendirme , Eğme değerlerine göre transformu hesaplar
         * @returns {Transform}
         */
        calculateTransformation: function () {

            var transform = new Transform;


            /**
             * Konumlandırma
             */
            if (this.offsetX !== 0 || this.offsetY !== 0)
                transform.translate(this.offsetX , this.offsetY);

            /**
             * Döndürme
             */
            if (this.rotate !== 0) {
                transform.rotate(Util.getRadian(this.rotate) , this.originX , this.originY);
            }

            /**
             * Eğme
             */
            if (this.skewX !== 0 || this.skewY !== 0)
                transform.skew(this.skewX , this.skewY);


            /**
             * Ölçeklendirme
             */

            if (this.scale !== 1) {
                transform.scale(this.scale , this.scale , this.originX , this.originY);
            }
            if (this.scaleX !== 1 || this.scaleY !== 1) {
                transform.scale(this.scaleX , this.scaleY , this.originX , this.originY);
            }



            return transform;
        },

        getTransformation: function () {
            return this.calculateTransformation();
        },


        getScaleX: function () {
            return this.scale * this.scaleX;
        },

        getScaleY: function () {
            return this.scale * this.scaleY;
        },

        getScale: function () {
            return this.scale;
        },

        /**
         * Kendi kopyasını üretir
         * @returns {Transformation}
         */
        clone: function () {
            return new Transformation(this);
        } ,

        /**
         * Mevcut Transformation bilgilerini dışarı aktarır
         * @returns {Object}
         */
        exportTransformation: function () {
            var obj = {},
                i = 0,
                length = Transformation.PROPERTIES.length;
            for ( ; i < length ; i++) {
                obj[Transformation.PROPERTIES[i]] = this[Transformation.PROPERTIES[i]];
            }
            return obj;
        } ,

        /**
         * Transformation bilgilerini içeri aktarır
         * @param {Object} obj Transformation verisi
         */
        importTransformation: function (obj) {
            Transformation.call(this , obj);
        }

    });


    Object.defineProperties(Transformation.prototype , {
        /**
         * İkili değer atamak için
         * transformation.offset = [x , y] | Point  //Point Types
         * @property
         */
        offset: {
            set: function (point) {
                point = Point(point);
                this.offsetX = point.x;
                this.offsetY = point.y;
            },
            get: function () {
                return new Point(this.offsetX , this.offsetY);
            }
        } ,
        /**
         * İkili değer atamak için
         * transformation.origin = [x , y] | Point  //Point Types
         * @property
         */
        origin: {
            set: function (point) {
                point = Point(point);
                this.originX = point.x;
                this.originY = point.y;
            },
            get: function () {
                return new Point(this.originX , this.originY);
            }
        }
    });

})();