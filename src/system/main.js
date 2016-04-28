// Quartz.System.Main
// require:system.timer



var Main;

(function () {
    Main = Path.Main = function (name) {
        Path.call(this);


        /**
         * Çizim elemanı
         */
        this._scene = new Scene({
            container: name ,
            width: 1000,
            height: 400
        });

        /**
         * Çizim Context
         * @type {CanvasRenderingContext2D}
         * @private
         */
        this._context = this._scene.getContext();


        /**
         * HTMLCanvas element
         */
        this._canvas = this._scene.getCanvas();

        /**
         * ana path
         * @type {boolean}
         * @private
         */
        this._mainPath = true;


        /**
         * Pointer Planner
         * @type {Pointer.Planner}
         */
        this.pointerPlanner = new Pointer.Planner({
            owner: this,
            element: this._canvas
        });


        /**
         * Keyboard Planner
         * @type {Keyboard.Planner}
         */
        this.keyboardPlanner = new Keyboard.Planner;


        /**
         * Zamanlayıcı
         * @type {Timer}
         */
        this.timer = new Timer;


        /**
         * Çizimlerin yapılacağı drawingTicker
         * @type {Timer.Ticker}
         */
        this.drawingTicker = new Timer.Ticker({
            callback: this.draw,
            context: this
        });


        this.timer.add(this.drawingTicker);
    };

    Util.inherit(Path.Main , Path);
    Util.createObjectType(Path.Main , 'Main');

    Util.assign(Path.Main.prototype , {
        draw: function () {
            var context = this._context;

            Draw.clear(context);
            Draw.path(context , this);
        }
    });



})();