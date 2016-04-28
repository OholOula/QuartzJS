// Quartz.Input.Event
// require:core.util

var InputEvent,
    PointerEvent,
    KeyboardEvent,
    WheelEvent;

(function () {

    var _copy = function (keys , copy , org) {
        for (var i = 0 ; i < keys.length ; i++) {
            if (keys[i] in org) {
                copy[keys[i]] = org[keys[i]];
            }
        }
    };

    //https://developer.mozilla.org/en-US/docs/Web/API/Event
    InputEvent = qz.InputEvent = function (event) {
        _copy(InputEvent.list , this , event);
        this.originalEvent = event;
        this.preventDefault = function () {
            event.preventDefault();
        }
    };


    InputEvent.list = ['type' , 'target'];


    Util.createObjectType(InputEvent , 'InputEvent');

    Util.assign(InputEvent.prototype , {
        init: function (obj) {
            Util.assign(this , obj);
        } ,
        clone: function () {
            var event = new this.__proto__.constructor(this.originalEvent);

            /**
             * özel atamalar
             */
            this.target && (event.target = this.target);
            this.targets && (event.targets = this.targets);
            this.originalTarget && (event.originalTarget = this.originalTarget);

            return event;
        }
    });






    PointerEvent = qz.PointerEvent = function (event) {
        InputEvent.call(this , event);
        _copy(PointerEvent.list , this , event);
        //fix
        if (this.offsetX == null) {
            this.offsetX = event.offsetX || event.layerX;
            this.offsetY = event.offsetX || event.layerX;
        }

        if (this.pageX == null) {
            this.pageX = event.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft || 0);
            this.pageY = event.clientY + (document.documentElement.scrollTop || document.body.scrollTop || 0);
        }

        this.offset = Point(this.offsetX , this.offsetY);

    };

    PointerEvent.list = ['altKey' , 'ctrlKey' , 'metaKey' , 'shiftKey' , 'button' , 'buttons' , 'clientX' , 'clientY' ,
                         'movementX' , 'movementY' , 'screenX' , 'screenY' , 'pageX' , 'pageY' , 'which' , 'offsetX' ,
                         'offsetY'];

    Util.inherit(PointerEvent , InputEvent);
    Util.createObjectType(PointerEvent , 'Pointer');

    Util.assign(PointerEvent.prototype , {

    });


    var _wheelType = Util.wheelType();

    // https://developer.mozilla.org/en-US/docs/Web/Events/wheel
    WheelEvent = qz.WheelEvent = function (event) {
        PointerEvent.call(this , event);

        this.init({
            originalEvent: event,
            target: event.target || event.srcElement,
            type: "wheel",
            deltaMode: event.type == "MozMousePixelScroll" ? 0 : 1,
            deltaY: event.deltaY,
            deltaX: 0,
            deltaZ: 0,
            preventDefault: function() {
                event.preventDefault ?
                    event.preventDefault() :
                    event.returnValue = false;
            }
        });


        if (_wheelType != 'wheel') {
            if (_wheelType == "mousewheel") {
                this.deltaY = - 1/40 * event.wheelDelta;
                event.wheelDeltaX && ( this.deltaX = - 1/40 * event.wheelDeltaX );
            } else {
                this.deltaY = event.detail;
            }
        }
    };


    Util.inherit(WheelEvent , PointerEvent);
    Util.createObjectType(WheelEvent , 'Wheel');





    KeyboardEvent = qz.KeyboardEvent = function (event) {
        InputEvent.call(this , event);
        _copy(KeyboardEvent.list , this , event);

    };

    KeyboardEvent.list = ['altKey' , 'ctrlKey' , 'metaKey' , 'shiftKey' , 'charCode' , 'keyCode' , 'repeat' , 'which'];

    Util.inherit(KeyboardEvent , InputEvent);
    Util.createObjectType(KeyboardEvent , 'Keyboard');

})();