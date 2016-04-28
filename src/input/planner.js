// Quartz.Input.Planner
// require:core.util
// require:input.keyboard


(function () {


    var Planner = function (opt){

        opt = opt || {};

        /**
         * Planlanacak olayların listesi
         * @type {Array}
         * @private
         */
        this._list = [];

        /**
         * Html elemanında meydana gelecek olayların dinlenme durumu
         * @property
         * @type {boolean}
         * @private
         */
        this._listening = false;

        /**
         * Planlayıcının sahibi ve oluşacak olay kontrol edicisi
         * @type {Path.Main}
         * @private
         */
        this._owner = opt.owner;
    };

    Util.assign(Planner.prototype , {
        /**
         * Olay nesnesinin listedeki index numarasını döndürür
         * @param obj - Herhangi bir Pointer nesnesi
         * @returns {number}
         */
        search: function (obj) {
            return this._list.indexOf(obj);
        },

        /**
         * Olay nesnesinin listede varolup olmadığını kontrole eder
         * @param obj - Herhangi bir Pointer nesnesi
         * @returns {boolean}  var ise true değilse false
         */
        has: function (obj) {
            return this.search(obj) > -1;
        },

        /**
         * Liste ye işlenecek olay nesnesini ekler
         * @param obj - Herhangi bir olay nesnesi
         * @returns {boolean} daha önce yoksa ve eklenirse true değilse false
         */
        add: function (obj) {
            if (!this.has(obj)) {
                this._list.push(obj);
                return true;
            }
            return false;
        },

        /**
         * Liste den Olay nesnesini kaldırır
         * @param obj - Herhangi bir Pointer nesnesi
         * @param remove - Olay nesnesinin remove methodunu çağırır
         * @returns {boolean} - başarılı ise true değilse false
         */
        remove: function (obj , remove) {
            var index = this.search(obj);
            if (index > -1) {
                this._list.splice(index , 1);
                if (remove === true && obj.remove) {
                    obj.remove();
                }
                return true;
            }
            return false;
        },

        /**
         * @returns {Array}
         */
        getList: function () {
            return this._list;
        } ,

        /**
         * olaylar listesinin uzunluğunu döndürür
         * @return {Number}
         */
        getListLength: function () {
            return this._list.length;
        } ,

        isListening: function () {
            return this._listening;
        }


    });

    /**
     * Pointer Olay Planlayıcısı (Pointer olaylarını çizime göre işler)
     * Bütün pointer olaylarını dinler ve olaylar meydana gelince olayları işler
     * Amac sahnedeki hangi elemana tıklandığını tesbit edebilecek yapı oluşturabilmek
     * @class
     * @param {Object} opt - Planlayıcı ayarları
     * @constructor
     */
    Pointer.Planner = function (opt) {
        Planner.call(this , opt);

        /**
         * dinlenilecek html eleman
         * @private
         * @readonly
         */
        this._element = opt.element;


        /**
         * Son gerçekleşen olayların nesnesi
         * @type {Event}
         * @private
         */
        this._lastEvent = null;
        this._lastGlobalEvent = null;
        this._lastLocalEvent = null;
        this._lastPrivateEvent = null;


        /**
         * Dinleyicileri tutacak nesne
         * @type {{}}
         * @private
         */
        this._listeners = {
            global: {},
            privateAndLocal: {}
        };



        /**
         * olaylar dinlenmeye başlar
         */
        this.start();
    };


    Util.inherit(Pointer.Planner , Planner);

    var _prepare = function (event , name) {
        return {
            event: event || PointerEvent,
            name: name || void 0
        }
    };

    Pointer.Planner.EVENTS = {
        /**
         * sayfanın tamamında çalışan olaylar
         */
        global: {
            mousedown: _prepare(),
            mouseup: _prepare(),
            contextmenu: _prepare(),
            wheel: _prepare(WheelEvent , Util.wheelType()),
            mousemove: _prepare()
        } ,
        /**
         * canvasdaki qz.Element da çalışak olaylar
         */
        privateAndLocal: {
            mouseenter: _prepare(),
            mouseleave: _prepare(),
            mousedown: _prepare(),
            mouseup: _prepare(),
            contextmenu: _prepare(),
            wheel: _prepare(WheelEvent , Util.wheelType()),
            mousemove: _prepare()
        }
    };

    Util.assign(Pointer.Planner.prototype , {
        /**
         * Olayları dinlemeye başlar
         * @function
         */
        start: function () {
            if (this._element && !this.isListening()) {

                this._listeners = {};

                var events = Pointer.Planner.EVENTS,
                    listeners = this._listeners,
                    callbackNames = {
                        global: 'anyEvent',
                        /**
                         * local eventlar aynı olması için private fonksiyonunda çağrılacak
                         */
                        //local: 'globalAndLocalEvent',
                        privateAndLocal: 'privateAndLocalEvent'
                    },
                    self = this,
                    list = {
                        global: window,
                        privateAndLocal: this._element
                    },
                    key, event, listener, name, element;


                for (name in list) {
                    element = list[name];

                    listener = listeners[name] = {};
                    for (key in events[name]) {
                        event = events[name][key];

                        (function (name , key) {
                            listener[key] = function (e) {
                                self[callbackNames[name]](new event.event(e) , name , key);
                            };
                        })(name , key);

                        element.addEventListener(event.name || key , listener[key]);
                    }

                }


                this._listening = true;

            }
        },

        /**
         * Olayları dinlemeyi durdur
         * @function
         */
        stop: function () {
            if (this._element && this.isListening()) {
                var list = {
                        privateAndLocal: this._element,
                        global: window
                    },
                    listeners = this._listeners,
                    key, listener, name;


                for (key in listeners) {
                    listener = listeners[key];

                    for (name in listener) {
                        list[key].removeEventListener(name , listener[name]);
                    }


                }

                this._listeners = {
                    global: {},
                    local: {},
                    private: {}
                };

                this._listening = false;

            }
        },

        /**
         * herhangi olayı işler olayları işler
         * @param event - Oluşan event nesnesi
         * @param type - global|local|private
         * @param evtName - mousedown , mousemove gibi
         */
        anyEvent: function (event , type , evtName) {
            this._lastEvent = event;
            if (type == 'local') {
                this._lastLocalEvent = event;
            } else if (type == 'global') {
                this._lastGlobalEvent = event;
            }
            if (this._owner &&  event && this.getListLength() > 0) {

                var list = this._list,
                    i = 0,
                    element;

                if (list.length > 0) {
                    for ( ; i < list.length ; i++) {
                        element = list[i];
                        if (element.EVENTS && element.EVENTS[type] && element.EVENTS[type][evtName]) {
                            element[element.EVENTS[type][evtName]](event , type , evtName);
                        }
                    }
                }

            }

        },


        /**
         * Herhangi bir özel Pointer olayında çalışıp olayın element ile olan ilişkisi bulur,
         * aynı zamanda local olaylarıda çağırır
         * @function
         */
        privateAndLocalEvent: function (orgEvent , type , evtName) {

            /**
             * private olayları çağır
             */
            if (this._owner && orgEvent && this.getListLength()) {
                var path = this._owner,
                    allElements = path.search(Path.SELECTOR.element),
                    length = allElements.length,
                    i = 0,
                    list = [],
                    elementFirst = true,
                    /**
                     * [needle] kullanılınca en üst katmadanki elemenetten en alt katmana doğru
                     * sırasıyla bütün olaylar çalışır.
                     * Olaylardan biri false döndürürse tetiklenme zinciri bozulur ve tetiklenmez
                     * @type {boolean}
                     */
                    reject = false,
                    pathFirst = true,
                    privateEvent = orgEvent.clone(),
                    element, events, event, j, evtType, originalTarget, parent;


                evtType = orgEvent.type;


                /**
                 * Çizim sırasına göre arama yaptığı için
                 * Noktayı kapsayan elemanların en son içizileni listenin sonuna denk gelir
                 */
                for ( ; i < length ; i++) {
                    element = allElements[i].element;
                    if (element.enableHit) {
                        if (element.containsPoint && element.containsPoint(orgEvent.offsetX , orgEvent.offsetY)) {
                            list.push(element);
                        }
                    }
                }

                i = list.length;
                
                if (i) {
                    this._lastPrivateEvent = orgEvent;
                    originalTarget = list[i - 1];
                    privateEvent.targets = orgEvent.targets = list.length ? list : void 0;


                    /**
                     * local olayda aynı event nesnesini kullandığı için
                     * herhangi bir local mouse olayında private tarafından taranıp
                     * noktayıp kapsayan en üst katmanda yer alan elamanı target ve originalTarget yapar
                     */
                    Input.Handler(privateEvent , originalTarget , originalTarget);
                    Input.Handler(orgEvent , originalTarget , originalTarget);

                    while (i--) {
                        element = list[i];

                        /**
                         * her elemanın Input Event varmı diye bakar,
                         * var ise her event ın ilgili olayı çağrıır
                         */
                        if (element.getInputEventsLength() > 0) {
                            events = element.getInputEvents();
                            j = events.length;

                            while (j--) {
                                event = events[j];
                                if (elementFirst || (event.query && event.query.getPhrase('needle'))) {
                                    if (event.EVENTS && event.EVENTS.private && event.EVENTS.private[evtType]) {
                                        if (event[event.EVENTS.private[evtType]](Input.Handler(privateEvent , element)) === false) {
                                            break;
                                        }
                                    }
                                }

                            }
                        }

                        elementFirst = false;

                        /**
                         * her elamanın üst pathlerine bakılır
                         */

                        parent = element;

                        while (parent = parent.getParent()) {

                            if (parent.getInputEventsLength()) {
                                events = parent.getInputEvents();
                                j = events.length;

                                while (j--) {
                                    event = events[j];
                                    if (pathFirst || (event.query && event.query.getPhrase('needle'))) {
                                        if (event.EVENTS && event.EVENTS.private && event.EVENTS.private[evtType]) {
                                            if (event[event.EVENTS.private[evtType]](Input.Handler(privateEvent , element)) === false) {
                                                break;
                                            }
                                        }
                                    }

                                }

                            }
                        }

                        pathFirst = false;

                    }
                    
                }



            }


            /**
             * local olayları çağırır
             */
            this.anyEvent(orgEvent , 'local' , evtName);
        }

    });


    Object.defineProperties(Pointer.Planner.prototype , {
        lastEvent: {
            get: function () {
                return this._lastEvent;
            }
        },
        lastGlobalEvent: {
            get: function () {
                return this._lastGlobalEvent;
            }
        },
        lastLocalEvent: {
            get: function () {
                return this._lastLocalEvent;
            }
        },
        lastPrivateEvent: {
            get: function () {
                return this._lastPrivateEvent;
            }
        },
        
    });


    /**
     * Klavye olay planlayıcısı
     * Klavyedeki olayları dinler
     * @constructor
     */
    Keyboard.Planner = function () {
        Planner.call(this);

        /**
         * olay dinleyici methodlar
         * @private
         */
        this._listeners = {};

        /**
         * Son klavye olayı
         * @type {null}
         * @private
         */
        this._lastEvent = null;

        this.start();
    };

    Util.inherit(Keyboard.Planner , Planner);

    Keyboard.Planner.EVENTS = {
        keydown: _prepare(KeyboardEvent),
        keyup: _prepare(KeyboardEvent),
        blur: _prepare(InputEvent)
    };

    Util.assign(Keyboard.Planner.prototype , {

        /**
         * klavye olaylarını dinlemeye başlar
         */
        start: function () {

            if (!this.isListening()) {

                var events = Keyboard.Planner.EVENTS,
                    self = this,
                    listeners = this._listeners,
                    key;

                for (key in events) {

                    (function (key) {
                        listeners[key] = function (event) {
                            self.anyEvent(event , key);
                        };
                    })(events[key].name || key);

                    window.addEventListener(key , listeners[key]);

                }


                this._listening = true;

            }

        },


        /**
         * klavye olaylarını dinlemeyi sonlandırır
         */
        stop: function () {

            if (this.isListening()) {

                var events = Keyboard.Planner.EVENTS,
                    listeners = this._listeners,
                    key;

                for (key in events) {
                    window.removeEventListener(key , listeners[key]);
                }


                this._listeners = {};
                this._listening = false;

            }

        },


        /**
         * olayları dağıtır
         * @param event
         * @param key
         */
        anyEvent: function (event , key) {

            this._lastEvent = event;

            if (this.getListLength()) {
                var list = this.getList(),
                    i = list.length,
                    item;

                while (i--) {
                    item = list[i];
                    if (item.EVENTS && item.EVENTS[key]) {
                        item[item.EVENTS[key]](event);
                    }
                }

            }

        }

    });
    
    Object.defineProperties(Keyboard.Planner.prototype , {
        lastEvent: {
            get: function () {
                return this._lastEvent;
            }
        }
    });



})();