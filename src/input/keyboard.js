// Quartz.Input.Keyboard
// require:core.util
// require:input.input


var Keyboard = {},
    KeyCode,
    Key;

(function () {


    Keyboard.TYPE = {
        DOWN: 'keydown',
        UP: 'keyup'
    };

    /**
     * Yeni bir tuş olayı oluşturur
     * :code
     * :callback
     * :context
     * :enable
     * :special
     * :capture
     * @type {Function}
     */
    Key = Input.Key = function (opt , callback , enable , special , capture) {
        var self = this;

        if (Util.isNumber(opt) || opt == null) {
            opt = {
                key: opt,
                callback: callback,
                enable: enable,
                special: special,
                capture: capture
            };
        } else if (Util.isFunction(opt)){
            opt = {
                callback: opt,
                enable: callback,
                special: enable,
                capture: special
            };
        }

        opt = opt || {};

        /**
         * Hangi tuşa basılınca/çekilince olayın çalışacağı
         * null ise her tuşa basınca çalışır
         * @type {null}
         * @default - null
         */
        this.key = opt.key || null;

        /**
         * Tuşa basmamı tuştan çekme olayımı
         * @type {Key.TYPE.DOWN|Key.TYPE.UP}
         * @default - Key.TYPE.DOWN
         */
        this.type = opt.type || Keyboard.TYPE.DOWN;

        /**
         * preventDefault()
         */
        this.capture = opt.capture == null ? true : opt.capture;

        /**
         * olay gerçekleşince çağırılacak method
         * @type {*|null}
         */
        this.callback = opt.callback || null;

        /**
         * method context
         * @type {*|null}
         */
        this.context = opt.context || null;

        /**
         * etkinleştirme
         * @type {Input.enable}
         */
        this.enable = new Input.enable(this);

        /**
         * tuşa basılı olup olmadığı
         * @type {boolean}
         * @private
         */
        this._pressed = false;

        /**
         * özel tuşlar
         * @type {SHIFT|AlT|CTRL}
         */
        this._special = opt.special == null ? true : opt.special;

        /**
         * olay sahibi
         * @type {*|path}
         * @private
         */
        this._owner = opt.owner;

        if (opt.enable != null) {
            this.enable.add(opt.enable);
        }

    };

    Util.inherit(Key , Input);
    Util.createObjectType(Input.Key , 'Key');


    Util.assign(Key.prototype , {
        EVENTS: {
            keydown: 'keydown',
            keyup: 'keyup',
            blur: 'blur'
        },

        remove: Input.prototype._remove,


        /**
         * tuşa basılımı
         * @return {boolean}
         */
        isPressed: function () {
            return this._pressed;
        },

        /**
         * klavye dinleniyormu
         * @return {*}
         */
        isListening: function () {
            return this._listening;
        },

        /**
         * ektinlentirme kontrolü
         * eğer etkin değilse ve tuşa basılıysa reset atar ve keyup methodu çağırılır
         * @return {*}
         * @private
         */
        _enable: function () {
            var value = this.enable.get();
            if (!value) this.reset();
            return value;
        },

        /**
         * tuşa basılma olayı
         * @param event
         */
        keydown: function (event) {

            if (this.specialKeyControl(event) && this._enable()) {

                if (this.key && this.key !== event.keyCode) {
                    return;
                }

                if (this.capture && this.type == event.type) {
                    event.preventDefault();
                }

                if (!this.isPressed()) {
                    this._pressed = true;
                    if (this.type == event.type)
                        this.dispatch(event);
                }

            }
        },

        /**
         * tuştan çekilme olayı
         * @param event
         */
        keyup: function (event) {

            if (this._enable()) {

                if (this.key && this.key !== event.keyCode) {
                    return;
                }



                /**
                 * down ise özel tuşu kontrol etmiyor
                 * önce özel tuştan elini çekme ihtimaline karşın
                 */
                if (this.type == Keyboard.TYPE.DOWN) {
                    this._pressed = false;
                    return;
                }


                if (!this.specialKeyControl(event)) {
                    return;
                }

                if (this.capture && this.type == event.type) {
                    event.preventDefault();
                }

                if (this.isPressed()) {
                    this._pressed = false;
                    if (this.type == event.type)
                        this.dispatch(event)
                }

            }
        },

        /**
         * tuş basılıken sekme değiştirme vs durumlardaki odak kaybı
         */
        blur: function () {
            this.reset();
        },


        /**
         * basılı ise resetler ve UP olayını çalıştırır
         */
        reset: function () {
            if (this.isPressed()) {
                this._pressed = false;
                if (this.type == Keyboard.TYPE.UP) {
                    this.dispatch();
                }
            }
        }


    });


    Object.defineProperties(Key.prototype , {
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


    //https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode
    KeyCode = qz.KeyCode = {};

    var code = 0,
        words = ['ZERO' , 'ONE' , 'TWO' , 'THREE' , 'FOUR' , 'FIVE' , 'SIX' , 'SEVEN' , 'EIGHT' , 'NINE'];

    //harfler
    for (code = 65 ; code < 91 ; code++) {
        KeyCode[String.fromCharCode(code)] = code;
    }

    //rakamlar
    for (code = 48 ; code < 58 ; code++) {
        KeyCode[words[code - 48]] = code;
    }

    //numpad rakamları
    for (code = 96 ; code < 105 ; code++) {
        KeyCode['NP_' + words[code - 96]] = code;
    }

    //f tuşları
    for (code = 112 ; code < 124 ; code++) {
        KeyCode['F' + (code - 111)] = code;
    }

    // diğer tuşlar
    Util.assign(KeyCode , {
        ENTER: 13,
        SPACE: 32,
        TAB: 9,
        DELETE: 46,
        END: 35,
        ESCAPE: 27,
        NUMLOCK: 144,

        //yön tuşları
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40,

        //special
        SHIFT: 16,
        CONTROL: 17,
        ALT: 18
    });



})();