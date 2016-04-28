// Quartz.Input.Input
// require:core.util
// require:input.event

var Input;

(function () {



    Input = qz.Input = function () {

    };

    Util.createObjectType(Input , 'Input');


    Util.assign(Input.prototype , {
        init: function (obj) {
            if (Util.isObject(obj)) {
                Util.assign(this , obj);
                if (this._init) {
                    this._init();
                }
            }
        } ,
        specialKeyControl: function (event) {
            var special = this._special;
            // özel tuş önemsenmiyor
            if (special === true) {
                return true;
            }

            // özel tuş var ise basılı olup olmadığı kontrol edilir
            if (special) {
                return event.shiftKey && special == KeyCode.SHIFT ||
                    event.altKey && special == KeyCode.ALT ||
                    event.ctrlKey && special == KeyCode.CONTROL;
            }

            // özel tuş yok ise herhangi bir özel tuşa basılıp basılmadığını kontrol eder
            // basılı ise false , değilse true döner
            return !(event.shiftKey || event.altKey || event.ctrlKey);
        },
        dispatch: function (event , name) {

            if (this.query) {
                var phrases = this.query.phrases;
                if (phrases) {
                    /**
                     * [event] ifadesi  event yok ise methodun çağrılmasını önler
                     */
                    if (phrases.event && !event) {
                        return false;
                    }

                    /**
                     * [target] ifadesi  target yoksa veya html elamansa methodun çağrılmasını önler
                     */
                    if (phrases.target && (!event.target || event.target instanceof HTMLElement)) {
                        return false;
                    }

                    /**
                     * [each] ifadesi her hedef için methodun çağrılmasını sağlar
                     */
                    if (phrases.each && event.targets && event.targets.length > 1) {

                        var targets = event.targets,
                            i = targets.length,
                            copyEvent = event.clone(),
                            result = true;

                        if (this._owner)
                            this._owner.activeEvent = this;

                        while (i--) {
                            copyEvent.target = targets[i];
                            if (this._call(name , copyEvent) === false) {
                                result = false;
                            }
                        }

                        return result;
                    }

                }
            }


            if (this._owner)
                this._owner.activeEvent = this;

            return this._call(name , event);
        },

        _call: function (name  , event) {
            if (Util.isFunction(this[name || 'callback'])) {
                this[name || 'callback'].call(this.context , event);
            }
        },

        _remove: function (m) {
            if (this._owner && this._owner.off && !m) {
                this._owner.off(this);
            }
        }
    });




    Input.enable = function (parent) {
        this._list = [];
        this._parent = parent;
    };

    Util.assign(Input.enable.prototype , {
        add: function (obj) {

            if (Util.isArray(obj)) {
                for (var i = 0 ; i < obj.length ; i++) {
                    this.add(obj[i]);
                }
                return this;
            }

            if (this._list.indexOf(obj) < 0) {
                this._list.push(obj);
            }
        },
        remove: function (obj) {
            var index = this._list.indexOf(obj);
            if (index > -1) {
                this._list.splice(index  , 1);
            }
        },
        removeAll: function () {
            this._list = [];
        },
        getList: function () {
            return this._list;
        },
        get: function () {
            var list = this._list,
                length = list.length,
                i = length,
                item;

            if (length > 0) {
                while (i--) {
                    item = list[i];

                    if (item === false) {
                        return false;
                    }

                    if (item instanceof Input && item.status === false) {
                        return false;
                    }

                    if (Util.isFunction(item) && item.call(this._parent.context) === false) {
                        return false
                    }
                }
            }

            return true;
        }
    });







})();