// Quartz.Util

var Util = qz.Util = {};

(function () {
    
    // 1000 dan itirabaren benzersiz kimlik döndürür
    var _uniqueID = 1000;
    Util.getUniqueID = function () {
        return _uniqueID++;
    };

    // sayfa yüklenmesinden bu zamana kadar geçen zaman
    Util.getElapsed = performance ? function (floor) {
            return floor ? Math.floor(performance.now()) : performance.now();
        } : (function () {
            var e = Date.now();
            return function () {
                return Date.now() - e;
            }
        })();

    Util.now = Util.getElapsed;

    // nesnemi ?
    Util.isObject = function (obj) {
        return obj && Object.prototype.toString.call(obj) == '[object Object]';
    };


    // nesnenin {} , new Object ten türetilip türetilmediğini kontrol eder
    Util.isBasicObject = function (obj) {
        return obj && obj.__proto__ ? obj.__proto__ === Object.prototype : false;
    };

    // dizi olup olmadığını kontrol eder
    Util.isArray = Array.isArray;

    // string mi ?
    Util.isString = function (val) {
        return typeof val === 'string';
    };


    // sayı olup olmadığını kontrol eder
    Util.isNumber = function (val) {
        return typeof val === 'number';
    };

    // undefined olup olmadığını kontrol eder
    Util.isUndefined = function (val) {
        return val === undefined;
    };

    // null olup olmadığını kontrol eder
    Util.isNull = function (val) {
        return val === null;
    };

    // null veya undefined olup olmadığını kontrol eder
    Util.isNullOrUndefined = function (val) {
        return val == null;
    };

    // function olup olmadığını kontrol eder
    Util.isFunction = function (val) {
        return typeof val === 'function';
    };

    Util.isBoolean = function (val) {
        return typeof val === 'boolean'
    };

    // array slice
    Util.slice = function (array , begin , end) {
        return Array.prototype.slice.call(array , begin , end);
    };

    // bir objeye diğer objelerden atama yapar
    // except: array türünde değerler alır , objeler bu değerlerde key lere sahipse
    // o keyler atanmaz
    // eğer tek bir object girilirse kendisine atar
    // obj.assign({
    //      fn: 'test'
    // });
    // obj.fn => test
    // Util.assign({a:'b'} , {c:'d'}) => {a:'b' , c:'d'}
    // Util.assign(['a' , 'b'] , {/*devralacak*/} , {a:'b' , c:'d'}) => {c:'d'}
    // deep == true ise Util.clone ile nesneler kopyalanır
    Util.assign = function (deep , except) {
        var length = arguments.length,
            i = 1,
            key, obj, item;


        if (deep === true) {
            i++;
        } else {
            except = deep;
        }

        except = Array.isArray(except) ? except : false;

        if (except) i++;

        if (length - i == 0) {
            obj = this;
            i--;
        } else {
            obj = arguments[i - 1];
        }


        for ( ; i < length ; i++) {

            for (key in arguments[i]) {
                if (except && except.indexOf(key) > -1) continue;

                item = arguments[i][key];

                if (deep === true && Util.isObject(item)) {
                    obj[key] = Util.clone(item);
                    continue;
                }
                obj[key] = item;

            }

        }

        return obj;
    };


    // nesneleri ve dizileri kopyalar
    Util.clone = function (obj) {
        var copy = null,
            key = null;


        if (Util.isArray(obj)) {
            copy = [];
            for (key = 0; key < obj.length ; key++) {
                copy[key] = typeof obj[key] == 'object' ? Util.clone(obj[key]) : obj[key];
            }

            return copy;
        }

        if (Util.isBasicObject(obj)) {
            copy = {};
            for (key in obj) {
                copy[key] = typeof obj[key] == 'object' ? Util.clone(obj[key]) : obj[key];
            }

            return copy;
        }



        return obj;
    };

    Util.copyObject = function (obj) {
        var copy = {},
            i;
        for (i in obj) {
            copy[i] = obj[i];
        }
        return copy;
    };

    // nesne ve dizinin elemanlarını fonksiyona gönderir
    Util.each = function (obj , callback , context) {
        var key = null;
        context = context || obj;

        for (key in obj) {
            callback.call(context , obj[key] , key);
        }

    };

    // protoyu  , devralacak prototipe dahil eder(kopyalar)
    Util.include = function (assign , proto , overwrite) {
        var keys, i, key, _temp;

        if (Util.isFunction(assign)) assign = assign.prototype;
        if (Util.isFunction(proto)) proto = proto.prototype;

        _temp = proto;

        while (_temp && _temp !== Object.prototype) {
            keys = Object.getOwnPropertyNames(_temp);
            i = keys.length;
            while (i--) {
                key = keys[i];
                if (key === 'constructor') continue;
                if (assign.hasOwnProperty(key) && overwrite === false) continue;
                Object.defineProperty(assign , key , Object.getOwnPropertyDescriptor(_temp , key));
            }
            _temp = _temp.__proto__;
        }

    };

    Util._cloneProperty = function (source , assign , key , rename) {
        var status = true;
        if (!source.hasOwnProperty(key)) {
            status = false;
            while (source.__proto__ && source.__proto__ != Object.prototype) {
                source = source.__proto__;
                if (source.hasOwnProperty(key)) {
                    status = true;
                    break;
                }
            }
        }

        if (status)
            Object.defineProperty(assign , rename || key , Object.getOwnPropertyDescriptor(source , key));
    };

    Util.cloneProperty = function (source , assign , keys , rename) {
        if (!keys) return false;

        if (Util.isFunction(source)) source = source.prototype;
        if (Util.isFunction(assign)) assign = assign.prototype;

        var i;

        if (Util.isString(keys)) {
            Util._cloneProperty(source, assign, keys, rename || keys)
        } else if (Util.isBasicObject(keys)) {
            for (i in keys) {
                Util._cloneProperty(source , assign , i , keys[i]);
            }
        } else {
            for (i = 0 ; i < keys.length ; i++) {
                Util._cloneProperty(source , assign , keys[i] , rename ? rename[i] || keys[i] : keys[i]);
            }
        }
    };


    // kalıtım yapar.
    // a ve b birer fonksiyon olsun
    // ultil.inherits(a , b)
    // a artık b ile kalıtılmıştır ve b nin özelliklerini taşır
    Util.inherit = function (child , parent) {
        var _ref = child.prototype;
        child.prototype = Object.create(parent.prototype);
        child.prototype.constructor = child;
        // Önceden olan özelliklerini dahil eder
        Util.include(child.prototype , _ref);
    };


    // _ ile başlıyanları okunamaz yapar
    Util.doNotEnumerable = function (obj) {
        var keys = Object.keys(obj),
            i = keys.length,
            prop = {enumerable: false},
            key;

        while (i--) {
            key = keys[i];
            if (key[0] == '_' && key[1] == '_') {
                Object.defineProperty(obj , key , prop);
            }
        }

    };


    // belirtilen açıyı radyana çevirir
    Util.getRadian = function (angle) {
        return angle * Math.PI / 180;
    };

    // belirtilen radyanı açıya çevirir
    Util.getAngle = function (radian) {
        return radian * 100 / Math.PI;
    };



    // right = 1 , center = 0.5 , left = 0
    Util.positionToNumber = function (h , v) {
        h = h || 0.5;
        if (Util.isString(h)) {
            if (h == 'right') h = 1;
            else if (h == 'center') h = 0.5;
            else h = 0.5;
        }

        v = v || 0.5;
        if (Util.isString(v)) {
            if (v == 'bottom') v = 1;
            else if (v == 'center') v = 0.5;
            else v = 0.5;
        }

        return {
            h: h,
            v: v
        }
    };


    var _toStringOfObjectType = function () {
        return this._objectType;
    };


    Util.createObjectType = function (obj , type) {
        if (Util.isFunction(obj)) obj = obj.prototype;
        obj._objectType = obj._objectType ? obj._objectType + '.' + type : qz.NAMESPACE + '.' + type;
        obj.toString = _toStringOfObjectType;
    };

    Util.getObjectType = function (obj) {
        if (Util.isFunction(obj)) obj = obj.prototype;
        return obj._objectType;
    };

    Util.setObjectType = function (obj , type) {
        if (Util.isFunction(obj)) obj = obj.prototype;
        if (!obj._objectType) return false;
        obj._objectType = obj._objectType.split('.');
        obj._objectType[obj._objectType.length - 1] = type;
        obj._objectType = obj._objectType.join('.');
    };


    Util.keyOfValue = function (obj , value) {
        for (var key in obj) {
            if (obj[key] == value) {
                return key;
            }
        }

        return false;
    };

    Util.repeater = function (fn , length , status) {

        if (status === false) return true;

        if (length) {
            var time = Util.getElapsed();
            for (var i = 0 ; i < length ; i++) {
                fn();
            }
            time = Util.getElapsed() - time;
            log(time / length , time);
        } else {
            var time = Util.getElapsed();
            fn();
            time = Util.getElapsed() - time;
            log(time);
        }

    };

    // ilk onwheel idi ama chromede 100 değerini verdi.
    // bu şekilde çalışıyor
    var _wheelType = 'onmousewheel' in window ? 'mousewheel' : 'onwheel' in window ? 'wheel' : 'DOMMouseScroll';
    Util.wheelType = function () {
        return _wheelType;
    };


    Util.timeToValue = function (time , value) {
        return time * value / 1000;
    };

    Util.sleep = function (ms) {
        var time = Util.now() + ms;
        while (time - Util.now() > 0) {
        }
    };

    Util.clamp = function (val , min , max) {
        if (!Util.isNumber(val)) return min;
        return Math.min(Math.max(val , min) , max);
    };
    
    
})();