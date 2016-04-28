// Quartz.Drawing.Draw
// require:drawing.properties
// require:core.util
// require:drawing.element
// require:shape.rectangle
// require:drawing.path
// require:system.main
// require:input.planner
// require:input.keyboard
// require:element.polygon
// require:element.rectangle
// require:element.image
// require:element.sprite
// require:loader.image

var Draw = null;

(function () {

    Draw = {};

    Draw.TYPE = {
        DEFAULT: 10
    };

    Draw.applyProperties = function (context , shape , inheritance) {
        if (!shape._props) return false;
        var length = shape._props.length,
            detail, i;
        inheritance = inheritance || {};
        for (i = 0 ; i < length ; i++) {
            detail = Properties.detail[shape._props[i]];
            if (detail.storage in shape && detail.apply) {
                detail.apply(shape , context , inheritance);
            }
        }
    };

    Draw.applyTransformation = function (context , tf) {
        context.transform(tf[0] , tf[1] , tf[2] , tf[3] , tf[4] , tf[5]);
    };

    Draw._clearShadow = function (context) {
        context.shadowColor = 0;
        context.shadowOffsetX = 0;
        context.shadowOffsetY = 0;
        context.shadowBlur = 0;
    };

    Draw.element = function (context , element , inheritance) {

        if (!element.visible) return true;

        if (!element.draw) return false;

        var transformation = element.getTransformation().get();

        inheritance = inheritance || {};

        context.save();

        context.beginPath();

        Draw.applyTransformation(context , transformation);

        Draw.applyProperties(context , element , inheritance);

        element.draw(context);


        if (element.closed) {
            context.closePath();
        }

        if (element.fill) {
            context.fill();
        }

        if (element.stroke && element.fill) {
            Draw._clearShadow(context);
        }

        if (element.stroke) {
            context.stroke();
        }
        context.restore();
    };

    Draw.clear = function (context) {
        context.clearRect(0 , 0 , context.canvas.width , context.canvas.height);
    };


    Draw.path = function (context , path , inheritance) {

        if (!(path instanceof Path) || !path.visible || path.getElements().length == 0) return true;

        var transformation = path.getTransformation().get(),
            elements = path.getElements(),
            element = null,
            length = elements.length,
            i = 0,
            selfInheritance;

        inheritance = inheritance || {};
        inheritance.path = path;

        context.save();


        Draw.applyTransformation(context , transformation);

        Draw.applyProperties(context , path , inheritance);

        selfInheritance = Util.copyObject(inheritance);

        inheritance.apply = true;


        for ( ; i < length ; i++) {
            element = elements[i];
            if (element instanceof Element) {
                Draw.element(context , element , selfInheritance);
            } else if (element instanceof Path) {
                Draw.path(context , element , inheritance);
            }

        }


        context.restore();


    };



    var rg = new Element.Rectangle({
            offsetX: 15,
            offsetY: 15,
            width: 100,
            height: 100,
            fill: 'red',
            //stroke: 'green',
            strokeWidth:  1,
            rotate: 45,
            origin: [50 , 50],
            shadow: 'blue',
            shadowOffset: [15 , 15],
            shadowBlur: 10,
            alpha: 0.9
    }),
        bg = new Element.Rectangle({
            offsetX: 340,
            offsetY: 15,
            width: 30,
            height: 30,
            fill: 'red',
            stroke: 'yellow',
            strokeWidth:  3,
            strokeDash: [10 , 5],
            origin: [15 ,15],
            //rotate: 45,
            //rotateOffset: [50 , 50],
            //shadow: 'blue',
            //shadowOffset: [15 , 15],
            //shadowBlur: 10,
            alpha: 0.7
        }),
        dot = new Element.Rectangle({
            offsetX: 300,
            offsetY: 168,
            width: 10,
            height: 10,
            fill: 'black',
        }),
        path = new Path.Main('scene'),
        p3 = new Path,
        z4 = new Path,
        ld = {};

    window.ld = ld;

    path.timer.add({
        callback: function () {
            var time = Util.now();
            ld['Processing'] = path.timer.processing;
            ld['Frequency'] = path.timer.frequency;
            ld['DT'] = path.drawingTicker.calculator.getProcessing();
            ld['FPS'] = path.timer.fps;
            ld['MX'] = 0;
            ld['MY'] = 0;

            if (path.pointerPlanner.lastGlobalEvent) {
                ld['GX'] = path.pointerPlanner.lastGlobalEvent.offsetX;
                ld['GY'] = path.pointerPlanner.lastGlobalEvent.offsetY;
            }
            
            if (path.pointerPlanner.lastLocalEvent) {
                ld['LX'] = path.pointerPlanner.lastLocalEvent.offsetX;
                ld['LY'] = path.pointerPlanner.lastLocalEvent.offsetY;
            }
            
            if (path.pointerPlanner.lastPrivateEvent) {
                ld['PX'] = path.pointerPlanner.lastPrivateEvent.targetX;
                ld['PY'] = path.pointerPlanner.lastPrivateEvent.targetY;
            }

            var el = document.getElementById('text') ,
                key;

            el.innerHTML = '';

            for (key in ld) {
                if (Util.isNumber(ld[key])) {
                    ld[key] = ld[key].toFixed(4);
                }
                el.innerHTML += ' <b>' + key + ':</b> ' + ld[key];
            }

            this.frequency = 100;
        }
    });


    var pack = new Loader.Pack({
        image: {
            sprites: 'sprites/sprites.png'
        },
        json: {
            sprites: 'sprites/sprites.js'
        }
    });


    pack.on('complete' , function () {
        var sp = new Element.Sprite({
            //stroke: 'red',
            strokeWidth: 1,
            offsetX: 100,
            offsetY: 100,
            image: {
                //name: 'myImage',
                source: pack.get('image.sprites'),
                datasheet: pack.get('json.sprites'),
                //frameNames: ['10.png'],
                length: 15,
                size: [100 , 100],
                fps: 17,
            },
            animations: {
                normal: {
                    //image: 'myImage',
                    fps: 8,
                    frames: [function (i) {
                        return i + '.png';
                    } , [19 , 26] , 'stop'],
                    pivot: {
                        x: 0,
                        y: 1,
                    },
                    offsets: {
                        0: [30 , 0],
                        1: [60 , 0],
                        2: [90 , -30],
                        3: [120 , -50],
                        4: [150 , -50],
                        5: [170 , -60],
                        6: [210 , 0],
                        7: [240 , 0]
                    }
                }
            }
        });

        path.add(sp);


        sp.show('19.png');

        
        
        var tween = new Tween({
            offsetX: '+200',
            alpha: [1 , 0.2]
            //offsetY: 200
        } , {
            time: 1000,
            delay: 400,
            loop: true,
            frequency: 1,
            easing: false,
            //backward: 0,
        } , sp);
        
        
        


        sp.on('pointer.down' , function () {
            tween.goto(0.3 , 1);
        });
        

        
        tween.on('pause' , function () {
            log('duraklatıldı');
        });
        
        tween.on('play' , function () {
            log('oynatılıyor');
        });
        
        tween.on('stop' , function () {
            log('durduruldu');
        });
        
        tween.on('forward' , function () {
            log('forward');
        });
        
        tween.on('forward:end' , function () {
            log('forward:end');
        });
        
        tween.on('backward' , function () {
            log('backward');
        });
        
        tween.on('backward:end' , function () {
            log('backward:end');
        });
        
        
        tween.play();
        
        log(tween);
        
    });

})();