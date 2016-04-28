// Quartz.Color.RGBA
// require:drawing.scene
// require:core.util


var RGBA = null;

(function () {

    // renklerin kontrol edilece�i canvas
    var util = qz.Util,
        tContext = (new Scene({
        width: 1,
        height: 1
    })).getContext(),
    // renk ve opakl���n u� de�erleri
        MIN_ALPHA = 0,
        MAX_ALPHA = 1,
        DEF_ALPHA = 1,
        MAX_COLOR = 255,
        MIN_COLOR = 0,
        DEF_COLOR = 0,
    // renk paleti.
    // daha �nce renk de�erleri bulunmu� renklerin tutulaca�� yer
        palette = {};


    // RGBA renk s�n�f� (detaylar RGBA.control a��klamas�nda)
    RGBA = qz.RGBA = function (r , g , b , a) {
        if (r instanceof RGBA) return r;
        if (!(this instanceof RGBA)) return new RGBA(r , g , b , a);

        this.color = RGBA.control(r , g , b ,a);
    };

    // renk ve opakl�k s�n�rlar�
    // renk 0 - 255
    // opakl�k 0 - 1
    RGBA.limit = function (val , type) {

        val = Number(val);
        if (isNaN(val))
            val = null;


        if (!Util.isNumber(val))
            val = null;

        if (val == null) return type == 'alpha' ?  DEF_ALPHA : DEF_COLOR;


        type = type || 'color';
        var max = type == 'color' ? MAX_COLOR : MAX_ALPHA,
            min = type == 'color' ? MIN_COLOR : MIN_ALPHA;

        return Math.min(Math.max(val , min) , max);
    };

    RGBA.alpha = function (val) {
        return RGBA.limit(val , 'alpha');
    };


    // palete yeni renk ekler
    RGBA.setPalette = function (key , val) {
        palette[key] = RGBA.control(val);
    };

    // paletteki mevcut rengi d�nd�r�r
    RGBA.getPalette = function (key) {
        return palette[key] ? palette[key].slice() : null;
    };

    // palette rengin olup olmad���na bakar
    RGBA.hasPalette = function (key) {
        return palette[key];
    };


    // renk de�erleri kontrol� ve tespiti
    // RGBA.control(255 , 0 , 0 , 0.5); [255 , 0 , 0 , 0.5] dizisini olu�turur
    // RGBA.control(255 , 0 , 0); [255 , 0 , 0 , 1] dizisini olu�turur
    // RGBA.control({r:255 , g:0 , b:0 , a: 0.7}); [255 , 0 , 0 , 0.7] dizisini olu�turur
    // RGBA.control({red:255 , green:0 , blue:0 , alpha: 0.7}); [255 , 0 , 0 , 0.7] dizisini olu�turur
    // RGBA.control('red'); [255 , 0 , 0 , 1] dizisini olu�turur
    // RGBA.control('red' , 0.3); [255 , 0 , 0 , 0.3] dizisini olu�turur
    RGBA.control = function (r , g , b , a) {
        var color = [0 , 0 , 0 , 1];

        if (r == null && g == null && b == null) {
            return color;
        }


        if (Util.isNumber(r) && g == null && b == null) {
            color[0] = (r & 0xFF0000) >>> 16;
            color[1] = (r & 0x00FF00) >>> 8;
            color[2] = (r & 0x0000FF) >>> 0;
            return color;
        }

        // de�erler say�lardan olu�uyorsa
        if (Util.isNumber(r) || Util.isNumber(g) || Util.isNumber(b)) {
            color[0] = r == null ? DEF_COLOR : r;
            color[1] = g == null ? DEF_COLOR : g;
            color[2] = b == null ? DEF_COLOR : b;
            color[3] = a == null ? DEF_ALPHA : a;
            return color;
        }

        // de�erler string ise
        // #FFFFFF gibi
        // red gibi
        if (typeof r == 'string') {
            if (RGBA.hasPalette(r)) {
                return RGBA.getPalette(r);
            }

            var k;

            // i�lem s�resi yakla��k 0.6 - 1ms
            // bu nedenle palet kullan�m� �ok �nemli
            // fillStyle �zelli�ine de�er atand���nda i�lem yap�p sonucu
            // #RRGGBB format�na veya RGBA(0 , 0 , 0 , 0) format�nda veriyor
            // tek sonu� olsun diye boyay�p boyan�n de�eri al�n�r
            tContext.fillStyle = r;
            tContext.fillRect(0 , 0 , 1 , 1);

            k = tContext.getImageData(0 , 0 , 1 , 1);
            color[0] = k.data[0];
            color[1] = k.data[1];
            color[2] = k.data[2];


            RGBA.setPalette(r , color);

            if (g != null && typeof g == 'number') {
                color[3] = g;
            }

            return color;
        }

        // de�erler dizinin i�indeyse
        if (util.isArray(r) && r.length > 0) {
            color[0] = r[0] == null ? DEF_COLOR : r[0];
            color[1] = r[1] == null ? DEF_COLOR : r[1];
            color[2] = r[2] == null ? DEF_COLOR : r[2];
            color[3] = r[3] == null ? DEF_ALPHA : r[3];
        }

        // de�erler nesnenin i�indeyse
        if (util.isObject(r)) {
            if (r.r != null) color[0] = r.r;
            if (r.g != null) color[1] = r.g;
            if (r.b != null) color[2] = r.b;
            if (r.a != null) color[3] = r.a;

            if (r.red != null) color[0] = r.red;
            if (r.green != null) color[1] = r.green;
            if (r.blue != null) color[2] = r.blue;
            if (r.alpha != null) color[3] = r.alpha;

            return color;
        }

        // varsay�lan
        return color;

    };

    // dizideki renk de�erlerini canvas i�in uygun hale d�n��t�r
    RGBA.prototype.toCanvas = RGBA.prototype.toString = function () {
        var c = this.color;
        return 'RGBA(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + c[3] + ')';
    };

    RGBA.prototype.setVal = function (key , value) {
        this.color[key] = RGBA.limit(value);
    };


    // renk de�erlerini d�zenler
    RGBA.prototype.set = function (r , g , b , a) {
        var c = RGBA.control(r , g , b , a);
        this.color[0] = c[0];
        this.color[1] = c[1];
        this.color[2] = c[2];
        this.color[3] = c[3];
    };

    // renk de�erlerini d�nd�r�r
    RGBA.prototype.get = function () {
        return this.color;
    };

    // RGBA nesnesini kopyalar
    RGBA.prototype.clone = function () {
      return new RGBA(this.color[0] , this.color[1] , this.color[2] , this.color[3]);
    };

    // RGBA de�erlerini kopyalar
    RGBA.prototype.copy = function () {
        return this.color.slice();
    };

    RGBA.prototype.num = function (num) {
        if (Util.isNumber(num)) {
            this.color[0] = (num & 0xFF0000) >>> 16;
            this.color[1] = (num & 0x00FF00) >>> 8;
            this.color[2] = (num & 0x0000FF) >>> 0;
        } else {
            return this.color[0] << 16 + this.color[1] << 8 + this.color[2] << 0;
        }
    };

    RGBA.prototype.equals = function (obj , alpha) {
        var list = obj instanceof RGBA ? obj.get() : (Util.isArray(obj) ? obj : null),
            color = this.get();

        if (list && color[0] == list[0] && color[1] == list[1] && color[2] == list[2]) {
            return !(alpha && color[3] != list[3])
        }

        return false;
    };


    RGBA.prototype.random = function () {
        this.set(Math.ceil(Math.random() * 255) , Math.ceil(Math.random() * 255) , Math.ceil(Math.random() * 255));
    };

    var getter = function (key) {
        return function () {
            return this.color[key];
        }
    }, setter = function (key) {
        return function (val) {
            this.color[key] = key == 3 ? RGBA.limit(val , 'alpha') : RGBA.limit(val);
        }
    };



    Object.defineProperties(RGBA.prototype , {
        // RGBAObj.red = 125
        red: {
            get: getter(0) ,
            set: setter(0)
        } ,
        green: {
            get: getter(1) ,
            set: setter(1)
        } ,
        blue: {
            get: getter(2) ,
            set: setter(2)
        } ,
        alpha: {
            get: getter(3) ,
            set: setter(3)
        }
    });


})();