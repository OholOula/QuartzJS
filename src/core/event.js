// Quartz.Event
// require:core.util

var Event = null;

(function () {

    // temel olay s�n�f� (constructor)
    Event = qz.Event = function () {
        // olay deposu
        this._events = {};
    }

    // yeni dinleyici ekler
    // obj.on('EventName' , func);
    // obj.on({
    //      'EventName1': func1 ,
    //      'EventName2': func2
    // })
    Event.prototype.on = function (name , callback) {
        var events = this._events,
            obj;

        if (qz.Util.isObject(name)) {
            obj = name;
        } else {
            obj = {};
            obj[name] = callback;
        }

        for (name in obj) {
            if (obj[name]) {
                if (!(name in events)) events[name] = [];
                this.emit('addListener' , name , obj[name]);
                events[name].push(obj[name]);
            }
        }

        return this;
    };



    // belirtilen olayın dinlenip dinlenmediğine kontrol eder.
    Event.prototype.has = function (key) {
        return !!this._events[key];
    };


    // dinleyici kaldırır
    Event.prototype.off = function (name , callback) {
        var events = this._events,
            i = 0,
            event;

        // mevcut olay yoksa
        // obj.off('undefinedEventName')
        if (name && !events[name]) return this;

        // b�t�n olaylar� siler
        // obj.off()
        if (!name && !callback) {
            for (name in this._events) {
                for (var key in this._events[name]) {
                    this.emit('removeListener' , name , this._events[name][key]);
                }
            }
            this._events = {};
            return this;
        }

        // name ile tan�mlanm�� olaylar� siler
        // obj.off('EventName')
        if (name && !callback) {
            for (var key in this._events[name]) {
                this.emit('removeListener' , name , this._events[name][key]);
            }
            delete this._events[name];
            return this;
        }

        // name ve func ile tan�mlanm�� olay� siler
        // obj.off('EventName' , callback)
        if (name && callback) {
            event = events[name];
            i = event.length;

            while (i--) {
                if (event[i] === callback) {
                    this.emit('removeListener' , name , callback);
                    event.splice(i , 1);
                    if (event.length === 0)
                        delete events[name];
                    return this;
                }
            }

        }

        return this;

    };


    // olay� tetikler (yayar)
    // obj.emit('EventName')
    Event.prototype.emit = function (name) {
        if (!this._events[name] || this._events[name].length === 0) return this;

        var args = arguments.length > 1 ? Util.slice(arguments , 1) : void 0,
            events = this._events[name],
            i = 0,
            event, result;

        for ( ; i < events.length ; i++) {
            event = events[i];
            if ((args ? event.apply(this , args) : event.call(this)) === false) {
                result = false;
            }
        }

        return result;
    };



})();

