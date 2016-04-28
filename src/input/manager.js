// Quartz.Input.Manager
// require:core.event
// require:input.pointer
// require:input.query

(function () {

    /**
     * Herhangi bir nesneye kalıtılığında ,
     * Nesnenin  Input işlemlerini yönetir
     * @param opt - Seçenekler
     * @constructor
     */
    Input.Manager = function (opt) {

        /**
         * Nesne için dinlenicek input olayları
         * @type {Array}
         * @private
         */
        this._inputEvents = [];


        /**
         * Pointer tarafından olaylardan etkilenip etkilenmiyeceği
         * @type {boolean}
         */
        this.enableHit = opt ? !(opt.enableHit === false) : true;

        /**
         * Nesnenin Event Sınıfı ile kalıtıp kalıtılmadığı
         * @type {boolean}
         * @private
         */
        this._hasEventClass = !!this._events;


        this.on('addedToPath:after' , this._mAdded.bind(this));
        this.on('removedFromPath:before' , this._mRemoved.bind(this));
    };


    Util.assign(Input.Manager.prototype , {
        _mAdded: function () {
            if (this.getInputEventsLength()) {
                var main = this.getMain(),
                    i = 0,
                    length = this.getInputEventsLength(),
                    events = this.getInputEvents();
                if (main && main.pointerPlanner) {
                    for ( ; i < length ; i++) {
                        main.pointerPlanner.add(events[i]);
                    }
                }
            }
        },

        _mRemoved: function () {
            if (this.getInputEventsLength()) {
                var main = this.getMain(),
                    i = 0,
                    length = this.getInputEventsLength(),
                    events = this.getInputEvents();
                if (main && main.pointerPlanner) {
                    for ( ; i < length ; i++) {
                        main.pointerPlanner.remove(events[i]);
                    }
                }
            }
        },

        /**
         * Mevcut dinlenen olayları döndürür
         * @return {Array}
         */
        getInputEvents: function () {
            return this._inputEvents;
        },

        /**
         * Mevcut dinlenen olayların adedini döndürür
         * @return {number}
         */
        getInputEventsLength: function () {
            return this._inputEvents.length;
        },

        /**
         * Mevcut Input Events da olayları arar
         * @param obj - Herhangi bir Pointer nesnesi
         * @returns {number}
         */
        searchInputEvent: function (obj) {
            return this._inputEvents.indexOf(obj);
        },

        /**
         * Belirtilen ekli olup olmadığını döndürür
         * @param obj
         */
        has: function (obj) {
            if (Util.isObject(obj)) {
                return this.searchInputEvent(obj) > -1;
            }

            if (this.getInputEventsLength()) {
                var i = this.getInputEventsLength(),
                    events = this.getInputEvents();
                while (i--) {
                    if (events[i].query.key == key) {
                        return true;
                    }
                }
            }

            if (this._hasEventClass) {
                return Event.prototype.has.call(this , obj);
            }

            return false;
        },


        /**
         * Input elemanlarını siler.
         * query yok ise hepsini siler
         * @param query
         */
        off: function (key , obj) {
            var main = this.getMain(),
                index;
            if (Util.isObject(obj)) {
                index = this.searchInputEvent(obj);
                if (index > -1 && (key ? obj.query.key == key : true)) {
                    this._inputEvents.splice(index , 1);
                    if (obj.remove) {
                        obj.remove(true);
                        if (main && main.pointerPlanner) {
                            main.pointerPlanner.remove(obj);
                        }
                    }
                    return this;
                }
            }

            if (key && this.getInputEventsLength()) {
                var i = this.getInputEventsLength(),
                    events = this.getInputEvents(),
                    control = false,
                    event;

                log(this.getInputEvents() , i);

                while (i--) {
                    event = events[i];
                    if (event.query.key == key) {
                        events.splice(i , 1);
                        if (event.remove) {
                            event.remove(true);
                            if (main && main.pointerPlanner) {
                                main.pointerPlanner.remove(event);
                            }
                        }
                        control = true;
                    }
                }
                if (control)
                    return this;
            }

            if (this._hasEventClass) {
                return Event.prototype.off.call(this , key , obj);
            }

            return false;
        },

        /**
         * Nesneye pointer olaylarını ekler
         * @param query
         */
        on: function (query , a ,b ,c ,d ,e) {

            var main = this.getMain(),
                properties = {
                    _owner: this,
                    context: this
                },
                constructor, obj, phrases;

            query = properties.query = new Input.Query(query);
            phrases = query.phrases;

            if (query.getPhrase('local') && !this._mainPath) {
                delete phrases.local;
            }

            if (query.name == 'key' && !this._mainPath) {
                throw new Error('Key Event is useable only on main path');
            }

            if (query.name == 'key') {
                obj = new Input.Key(a , b , c , d ,e);

                switch (query.property) {
                    case 'down':
                    case '':
                    default:
                        properties.type = Keyboard.TYPE.DOWN;
                        break;
                    case 'up':
                        properties.type = Keyboard.TYPE.UP;
                        break;
                }


                if (query.getPhrase('key') && KeyCode[query.getValue('key').toUpperCase()]) {
                    properties.key = KeyCode[query.getValue('key').toUpperCase()];
                }

                if (query.getPhrase('capture') && query.equals('capture' , false , true)) {
                    properties.capture = false;
                }

                if (query.getPhrase('special') && KeyCode[query.getValue('special').toUpperCase()]) {
                    properties._special = KeyCode[query.getValue('special').toUpperCase()];
                }

                if (query.getPhrase('type') && Keyboard.TYPE[query.getValue('type').toUpperCase()]) {
                    properties.type = Key.TYPE[query.getValue('type').toUpperCase()];
                }

                obj.init(properties);

                this.keyboardPlanner.add(obj);
                return obj;
            }

            if (query.name == 'pointer') {

                switch (query.property) {
                    case 'down':
                        constructor = Input.Button;
                        properties._type = Pointer.TYPE.DOWN;
                        break;
                    case 'click':
                    case '':
                    default:
                        constructor = Input.Button;
                        properties._type = Pointer.TYPE.CLICK;
                        break;
                    case 'up':
                        constructor = Input.Button;
                        properties._type = Pointer.TYPE.UP;
                        break;
                    case 'over':
                        constructor = Input.PointerOver;
                        break;
                    case 'wheel':
                        constructor = Input.Wheel;
                        break;
                    case 'drag':
                        constructor = Input.Drag;
                        break;
                }

                if (query.getPhrase('capture') && query.equals('capture' , false , true)) {
                    properties.capture = false;
                }

                if (query.getPhrase('type') && Pointer.TYPE[query.getValue('type').toUpperCase()]) {
                    properties._type = Pointer.TYPE[query.getValue('type').toUpperCase()];
                }

                obj = new constructor(a , b , c ,d);
                obj.init(properties);

                this._inputEvents.push(obj);


                if (main && main.pointerPlanner) {
                    main.pointerPlanner.add(obj);
                }

                return obj;
            }

            if (this._hasEventClass) {
                Event.prototype.on.apply(this , arguments);
            }
        }



    });

})();