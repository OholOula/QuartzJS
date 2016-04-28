// Quartz.Drawing.Scene
// require:core.util

var Scene = null;

(function () {
    var CONTEXT_TYPE = '2d',
        DEFAULT_STYLE = {
            position: 'relative' ,
            top: '0px' ,
            left: '0px' ,
            padding: '0px' ,
            margin: '0px'
        };

    // �izim nesnesi
    // options.Canvas => HTMLCanvasElement
    // options.container => Canvas eleman�n� kapsayacak html eleman (�rn:HTMLDivElement)
    Scene = qz.Scene = function (options) {

        if (Util.isString(options)) {
            options = {container: options};
        } else if (!options || !Util.isObject(options)) {
            options = {};
        }

        if (options.canvas && Util.isString(options.canvas)) {
            options.canvas = document.getElementById(options.canvas);
            if (!options.canvas)
                throw new TypeError('Canvas must be valid type')
        }


        this._canvas = options.canvas || document.createElement('Canvas');
        this._context = this._canvas.getContext(CONTEXT_TYPE);
        this.container = options.container;

        if (this.container) {
            this.addToContainer();
        }

        this.setStyle(DEFAULT_STYLE);

        if (options.height)
            this.setHeight(options.height);

        if (options.width)
            this.setWidth(options.width);

        if (options.style)
            this.setStyle(options.style);

    };


    Scene.prototype.getCanvas = Scene.prototype.getCanvasElement = function () {
        return this._canvas;
    };

    Scene.prototype.getContext = function () {
        return this._context;
    };


    // Canvas nesnesini kapsay�caya ekler
    Scene.prototype.addToContainer = function (container) {
        container = container || this.container;


        if (container && Util.isString(container)) {
            container = document.getElementById(container);
        }

        if (container) {
            container.appendChild(this.getCanvas());
        }

    };

    Scene.prototype.setWidth = function (width) {
        this._canvas.width = width;
    };

    Scene.prototype.getWidth = function () {
        return this._canvas.width
    };

    Scene.prototype.setHeight = function (height) {
        this._canvas.height = height;
    };

    Scene.prototype.getHeight = function () {
        return this._canvas.height
    };

    // set css
    Scene.prototype.setStyle = function (property , value) {
        var properties = Util.isObject ? property : {},
            canvas = this.getCanvas(),
            key;

        if (property && value) {
            properties[property] = value;
        }

        for (key in properties) {
            canvas.style[key] = properties[key];
        }

    };

    Scene.prototype.getStyle = function (property) {
        return this.getCanvas().style[property];
    };

    // Canvas nesnesinin �zelliklerine eri�im
    // getOffsetWidth , getClientHeight ....
    Util.each([
        'offsetWidth' , 'offsetHeight' , 'offsetTop' , 'offsetLeft' ,
        'clientWidth' , 'clientHeight' , 'clientTop' , 'clientLeft'
    ] , function (key) {
        var name = 'get' + key[0].toUpperCase() + key.slice(1);
        Scene.prototype[name] = function () {
            return this.getCanvas()[key];
        }
    });



})();
