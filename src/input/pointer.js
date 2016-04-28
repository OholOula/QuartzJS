// Quartz.Input.Pointer
// require:core.util
// require:input.input


var Pointer = {},
    ButtonCode;

(function () {


    Pointer.TYPE = {
        DOWN: 'mousedown',
        UP: 'mouseup',
        CLICK: 'click',
        CONTEXTMENU: 'contextmenu',
        ENTER: 'mouseenter',
        LEAVE: 'mouseleave',
        WHEEL: 'wheel'
    };


    ButtonCode = qz.ButtonCode = {
        LEFT: 1,
        MIDDLE: 2,
        RIGHT: 3
    };

    /**
     * Yeni bir buton olayı tanımlar
     * Bütün opt seçenekleri(seçeneklerin açıklamarı aşağıda)
     * :code
     * :callback
     * :context
     * :enable
     * :type
     * :special
     * :preventMenu
     * :owner
     * @constructor
     */
    var Button = Input.Button = function (opt/*code*/ ,  a , b , c) {

        /**
         * new Input.Button(callback , special ,  capture);
         */
        if (Util.isFunction(opt)) {
            opt = {
                callback: opt,
                special: a,
                capture: b
            };
        /**
         * new Input.Button(code , callback , special , enable)
         */
        } else if (Util.isNumber(opt) || opt == null) {
            opt = {
                code: opt,
                callback: a,
                special: b ,
                enable: c
            };
        }

        opt = opt || {};

        /**
         * preventDefault,
         * @property
         */
        this.capture = opt.capture == null ? true : opt.capture;


        /**
         * olay gerçekleşince çağırılacak method
         * @property
         */
        this.callback = opt.callback;


        /**
         * olay gerçekleşince çağırılacak methodun contexti
         * @property
         */
        this.context = opt.context;


        /**
         * olay gerçekleşince callbackin çağrılması için gerekli etkinleştirme şartları
         * @type {Input.enable}
         */
        this.enable = new Input.enable(this);


        /**
         * down veya up olaylarından hangisinde çalışağı
         * @type {mousedown|mouseup}
         * @private
         */
        this._type = opt.type || Pointer.TYPE.DOWN;


        /**
         * Hangi ButtonCode a basılınca çalışağı
         */
        this._code = opt.code == null ? false : opt.code;

        /**
         * belirtilen şartlarda fareye basılı tutulma durumu
         * @type {boolean}
         * @private
         */
        this._pressed = false;


        /**
         * Özel tuş şartları (KeyCode  => shift , alt , ctrl gibi)
         */
        this._special = opt.special == null ? true : opt.special;

        /**
         * farenin sağ tuşuna tıklanınca , açılacak menüyü engeller
         * @type {boolean}
         * @private
         */
        this._preventMenu = opt.preventMenu == null ? true : opt.preventMenu;


        /**
         * elemanın sahibi nesne
         * @type {Object}
         * @private
         */
        this._owner = opt.owner;


        /**
         * pointer.click için
         * down eylemi gerçekleşince ektilenen elamanların idleri tutulur
         * up işlemi gerçekleşince etkilenen elemanları idleri ile down eylemindeki idler karşılaştırılır ve
         * aynı ise click işlemi gerçekleşmiştir
         * @type {{}}
         * @private
         */
        this._clickApi = {};


        if (opt.enable != null) {
            this.enable.add(opt.enable);
        }

    };

    Util.inherit(Button , Input);
    Util.createObjectType(Button , 'Button');


    Util.assign(Button.prototype , {

        /**
         * etkilenecek olaylar
         * olayAdi: nesnedeCagirilcakOlay
         */
        EVENTS: {
            global: {
                mouseup: 'globalMouseUp'
            },
            private: {
                mousedown: 'privateAndLocalMouseDown',
                mouseup: 'privateAndLocalMouseUp',
                contextmenu: 'privateAndLocalContextMenu'
            }
        },

        /**
         * [local]bölgesel tıklama
         * @private
         */
        _init: function () {
            if (this.query && this.query.phrases && this.query.phrases.local) {
                this.EVENTS = {
                    global: {
                        mouseup: 'globalMouseUp'
                    },
                    local: {
                        mousedown: 'privateAndLocalMouseDown',
                        mouseup: 'privateAndLocalMouseUp',
                        contextmenu: 'privateAndLocalContextMenu'
                    }
                };
            }
        },

        /**
         * olaya sahip nesneden olayı kaldırır
         */
        remove: Input.prototype._remove,

        /**
         * tuşa basılımı
         * @return {true|false}
         */
        isPressed: function () {
            return this._pressed;
        },

        /**
         * mevcut tipi geri döndürür
         * event gönderilirse mevcut tip ile event tipini karşılaştırır
         * @param event
         * @return {*}
         */
        type: function (event) {
            if (event) {
                return this._type == event.type;
            }
            return this._type;
        },

        /**
         * mevcut kodu geri döndürür
         * event gönderilirse mevcut kod ile event kodu karşılaştırılır
         * @param event
         * @return {*}
         */
        code: function (event) {
            if (event) {

                if (this._code != null && this._code !== false) {
                    return this._code == event.which;
                }
                return true;
            }
            return this._code;
        },


        /**
         * eğer aktif değilse ve basılı kaldıysa resetler
         * @return {*}
         * @private
         */
        _enable: function () {
            var value = this.enable.get();
            if (!value) this.reset();
            return value;
        },

        /**
         * Ekli olduğu elemana mousedown olayı gerçekleşince çalışır
         * @param event
         * @return {boolean}
         */
        privateAndLocalMouseDown: function (event) {

            /**
             * basılı ise resetler
             * kaldırıldı çünkü her patha 1 olay atnaıyor ve path içinde üst üste çok sayıda
             * eleman olabilir.bu gibi durumlarda [needle] etkinse down olayı için üst üste eleman sayısı kadar
             * method çalıştırlıyor bu nedenle her çalıştırma arasında resetliyor
             */
            //this.reset();

            if (this._enable()) {

                /**
                 * özel tuşları kontrol eder (ctrl|shift|alt gibi)
                 */
                if (!this.specialKeyControl(event)) {
                    return false;
                }


                /**
                 * kodu kontrol eder (LEFT|MIDDLE|RIGHT gibi)
                 */
                if (!this.code(event)) {
                    return false;
                }

                this._pressed = true;

                if (event.target && this._clickID(event.target)) {
                    this._clickApi[this._clickID(event.target)] = event.target;
                }


                if (this.type(event)) {

                    if (this.capture) {
                        event.preventDefault();
                    }

                    return this.dispatch(event);
                }


            }

        },

        /**
         * mouse basılı tutup ekranın herhangi bir yerinde ,
         * mouse tan elini çektinğinde isPressed() takılı kalmaması için
         */
        globalMouseUp: function () {
            this.reset();
        },

        /**
         * ekli olduğu elemana mouse up olayı olunca çalışır
         * @param event
         * @return {boolean}
         */
        privateAndLocalMouseUp: function (event) {
            if (this._enable()) {


                /*
                up olayı gerçekleşmeden elini özel tuşlardan şekilde soruna sebep oluyor.
                if (!Input._specialControl(event , this._special)) {
                    return false;
                }
                */


                if (!this.code(event)) {
                    return false;
                }

                this._pressed = false;

                if (event.target && this._clickApi[this._clickID(event.target)]) {
                    delete this._clickApi[this._clickID(event.target)];

                    if (this.type() == Pointer.TYPE.CLICK) {
                        if (this.capture) {
                            event.preventDefault();
                        }

                        return this.dispatch(event);
                    }
                }


                if (this.type(event)) {

                    if (this.capture) {
                        event.preventDefault();
                    }

                    return this.dispatch(event);
                }

            }

        },

        /**
         * elaman sağ click yapınca menü açılmadan önce tetiklenir
         * @param event
         */
        privateAndLocalContextMenu: function (event) {
            if (this.enable && this._preventMenu && this.code(event)) {
                if (this._type == Pointer.TYPE.DOWN)
                    return;
                event.preventDefault();
            }
        },

        /**
         * tuş basılı ise , tuşu basılı değil  yapar ve
         * ve aynı zamanda up olayı ise olayı yayar
         */
        reset: function () {

            if (this.isPressed()) {
                this._pressed = false;
                this._clickApi = {};

                if (this.type() == Pointer.TYPE.UP) {
                    this.dispatch();
                }

            }

        },


        _clickID: function (target) {
            if (target instanceof HTMLElement) {
                return -1;
            }
            return target.getElementId();
        }


    });

    Object.defineProperties(Button.prototype , {
        /**
         * enable etkilimi için durum
         */
        status: {
            get: function () {
                return this.isPressed();
            },
            set: function () {}
        },
        
        pressed: {
            get: function () {
                return this.isPressed();
            }
        }
    });



    var _wheelType = Util.wheelType();

    /**
     * mouse wheel olayı
     * :callback
     * :enable
     * :capture
     * @constructor
     */
    var Wheel = Input.Wheel = function (opt/*callback*/ , enable , capture) {
        var self = this;

        if (Util.isFunction(opt)) {
            opt = {
                callback: opt,
                capture: capture,
                enable: enable
            }
        }

        opt = opt || {};

        /**
         * preventDefault()
         */
        this.capture = opt.capture == null ? true : opt.capture;

        /**
         * wheel olayı gerçekleşince çağırılacak method
         */
        this.callback = opt.callback;


        /**
         * çağırılacak methoda ait context
         */
        this.context = opt.context;

        /**
         * wheel enable durumu
         * @type {Input.enable}
         */
        this.enable = new Input.enable(this);

        /**
         * olayın sahibi
         * @type {Object}
         * @private
         */
        this._owner = opt.owner;


        if (opt.enable != null) {
            this.enable.add(opt.enable);
        }

    };

    Util.inherit(Wheel , Input);
    Util.createObjectType(Wheel , 'Wheel');


    Util.assign(Wheel.prototype , {

        EVENTS: {
            private: {
                wheel: 'privateAndLocalWheel'
            }
        },

        /**
         * [local]bölgesel wheel
         * @private
         */
        _init: function () {
            if (this.query && this.query.phrases && this.query.phrases.local) {
                this.EVENTS = {
                    local: {
                        wheel: 'privateAndLocalWheel'
                    }
                };
            }
        },

        remove: Input.prototype._remove,

        /**
         *
         * @param event
         */
        privateAndLocalWheel: function (event) {
            if (this.enable.get()) {

                if (this.capture) {
                    event.preventDefault();
                }

                return this.dispatch(event);

            }

        }

    });


    Object.defineProperties(Wheel.prototype , {
        status: {
            get: function () {
                return true;
            },
            set: function () {}
        }
    });


    /**
     * mevcut elemanın üstünde mouse olup olmadını ve
     * mouse giriş ve çıkış yaptığı zaman olayları çalıştırır
     * :enterCallback
     * :leaveCallback
     * @type {Function}
     */
    var PointerOver = Input.PointerOver = function (opt/*enter*/ , leave) {


        if (Util.isFunction(opt)) {
            opt = {
                enter: opt,
                leave: leave
            }
        }

        opt = opt || {};

        /**
         * mouse giriş yapınca çalıştırılacak method
         * @type {Function}
         */
        this.cbMouseEnter = opt.enter;

        /**
         * mouse ayrılınca  çalıştırılacak method
         * @type {Function}
         */
        this.cbMouseLeave = opt.leave;

        /**
         * çalıştırılacak fonksiyonara ait context
         */
        this.context = opt.context;

        /**
         * olayın sahibi nesne
         * @type {Object}
         * @private
         */
        this._owner = opt.owner;


        /**
         * mouse nesne üzerinde olup olmadığını tutar
         * @type {boolean}
         * @private
         */
        this._isEntered = false;

        /**
         * son privateMouseMove eventi
         * bu sayade local privateMouseMove ile aynı ise
         * farenin halen elementin üstünde olduğu anlaşılıyor
         * @type {null}
         * @private
         */
        this._event = null;

    };

    Util.inherit(PointerOver , Input);
    Util.createObjectType(PointerOver , 'PointerOver');

    Util.assign(PointerOver.prototype , {

        EVENTS: {
            private: {
                mousemove: 'privateMouseMove'
            },
            local: {
                mousemove: 'localMouseMove'
            }
        },

        /**
         * [local]bölgesel mouse enter ve mouse leave
         * @private
         */
        _init: function () {
            if (this.query && this.query.phrases && this.query.phrases.local) {
                this.EVENTS = {
                    local: {
                        mouseenter: 'localMouseEnter',
                        mouseleave: 'localMouseLeave'
                    }
                };
            }
        },

        remove: Input.prototype._remove,

        /**
         *
         * @param event
         */
        privateMouseMove: function (event) {
            this._event = event;

            if (!this._isEntered) {
                this._isEntered = true;
                return this.dispatch(event , 'cbMouseEnter');
            }
        },

        /**
         *
         * @param event
         */
        localMouseMove: function (event) {
            //log(Util.now() , 'l:' , event.target);
            if (this._isEntered && this._event && this._event.originalEvent != event.originalEvent) {
                this._isEntered = false;
                this._event = null;
                return this.dispatch(event , 'cbMouseLeave');
            }
        },

        /**
         * çizim elemanına mouse giriş yaptığında çalışır
         * @param event
         */
        localMouseEnter: function (event) {
            this._isEntered = true;
            return this.dispatch(event , 'cbMouseEnter');
        },

        /**
         * çizim elemanından mouse çıkış yaptığında çalışır
         * @param event
         */
        localMouseLeave: function (event) {
            this._isEntered = false;
            return this.dispatch(event , 'cbMouseLeave');
        },

        /**
         * Mouse elemente giriş yapıp yapmadığı
         * @return {boolean}
         */
        isEntered: function () {
            return this._isEntered;
        }
    });

    Object.defineProperties(PointerOver.prototype , {
        status: {
            get: function () {
                return this._status;
            } ,
            set: function () {}
        }
    });


    /**
     * fare hareketi olayı
     * :callback
     * :enable
     * @constructor
     */
    var Drag = Input.Drag = function (opt/*callback*/ , enable) {
        var self = this;

        if (Util.isFunction(opt)) {
            opt = {
                callback: opt,
                enable: enable
            }
        }

        opt = opt || {};

        /**
         * fare hareketinde çağrılacak olay
         */
        this.callback = opt.callback;

        /**
         * method context
         */
        this.context = opt.context;

        /**
         * preventDefault()
         */
        this.capture = opt.capture == null ? true : opt.capture;

        /**
         * aktifleştirme
         * @type {Input.enable}
         */
        this.enable = new Input.enable(this);

        /**
         * olay sahibi nesne
         * @type {Object}
         * @private
         */
        this._owner = opt.owner;


        if (opt.enable != null) {
            this.enable.add(opt.enable);
        }


    };

    Util.inherit(Drag , Input);
    Util.createObjectType(Drag , 'Drag');


    Util.assign(Drag.prototype , {

        EVENTS: {
            private: {
                mousemove: 'mousemove'
            }
        },


        /**
         * [local] değerinde çizim alanındaki fare hareketini yakalar
         * @private
         */
        _init: function () {
            if (this.query && this.query.phrases && this.query.phrases.local) {
                this.EVENTS = {
                    local: {
                        mousemove: 'mousemove'
                    }
                };
            }
        },


        remove: Input.prototype._remove,

        mousemove: function (event) {
            if (this.enable.get()) {
                return this.dispatch(event)
            }
        }

    });

    Object.defineProperties(Drag.prototype , {
        status: {
            get: function () {
                return this.enable.get();
            } ,
            set: function () {}
        }
    });





})();