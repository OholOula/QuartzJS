// Quartz.Core.Properties
// require:core.util
// require:color.rgba

var Properties = null;

(function () {

    Properties = qz.Properties = {};


    var _router = function (detail , attempt) {
            return {
                get: function () {
                    return attempt.get.call(this , detail.storage ,  detail);
                },
                set: function (value) {
                    attempt.set.call(this , detail.storage , value , detail);
                    if (this.emit) {
                        this.emit(detail.event , this[detail.name] , value);
                    }
                }
            }
        };


    var _get = function (key) {
        return this[key];
    };

    Properties.type = {
        text: {
            get: _get,
            set: function (key , value) {
                if (Util.isString(value)) {
                    this[key] = value;
                } else if (value.toString) {
                    this[key] = value.toString();
                }
            }
        },
        number: {
            get: _get,
            set: function (key , value) {
                if (Util.isNumber(value)) {
                    this[key] = value;
                } else{
                    var result = Number(value);
                    if (!isNaN(result)) {
                        this[key] = result;
                    }
                }
            }
        },
        boolean: {
            get: _get,
            set: function (key , value) {
                this[key] = !!value;
            }
        },
        choice: {
            get: _get,
            set: function (key , value , detail) {
                if (detail.list && detail.list.indexOf(value) > -1) {
                    this[key] = value;
                }
            }
        },
        point: {
            get: _get,
            set: function (key , value) {
                this[key] = Point(value);
            }
        },
        list: {
            get: _get,
            set: function (key , value) {
                if (Util.isArray(value)) {
                    this[key] = value;
                }
            }
        },
        color: {
            get: _get,
            set: function (key , value) {
                if (value === false || value == null) {
                    this[key] = false;
                } else {
                    this[key] = RGBA(value);
                }
            }
        },
        alpha: {
            get: _get,
            set: function (key , value) {
                this[key] = RGBA.alpha(value);
            }
        }

    };


    var _prepare = function (key , obj) {
        return Util.assign({
            name: key,
            storage: '_' + key,
            event: 'change:' + key
        } , obj);
    };

    /*
        key: {
            name: 'key',
            storage: '_key',
            event: 'change:width',
            default: 100,
            type: Properties.type.number,
            apply: function () {

            }
        }
    */
    Properties.detail = {
        x: _prepare('x' , {
            default: 100,
            type: Properties.type.number,
        }),
        y: _prepare('y' , {
            default: 100,
            type: Properties.type.number
        }),
        width: _prepare('width' , {
            default: 100,
            type: Properties.type.number,
        }),
        height: _prepare('height' , {
            default: 100,
            type: Properties.type.number
        }),
        alpha: _prepare('alpha' , {
            default: 1,
            type: Properties.type.number,
            calculate: function (shape , inheritance) {
                return inheritance.alpha * shape.alpha;
            },
            apply: function (shape , context , inheritance) {
                if (inheritance.alpha == null)
                    inheritance.alpha = 1;

                var value = this.calculate(shape , inheritance);

                context.globalAlpha = value;

                if (inheritance.apply)
                    inheritance.alpha =  value;
            }
        }),
        fill: _prepare('fill' , {
            default: false,
            type: Properties.type.color,
            apply: function (shape , context) {
                if (shape.fill) {
                    context.fillStyle = shape.fill.toCanvas();
                }
            }
        }),
        stroke: _prepare('stroke' , {
            default: false,
            type: Properties.type.color,
            apply: function (shape , context) {
                if (shape.stroke) {
                    context.strokeStyle = shape.stroke.toCanvas();
                }
            }
        }),
        strokeJoin: _prepare('strokeJoin' , {
            default: 'miter',
            list: ['miter' , 'bevel' , 'round'],
            type: Properties.type.choice,
            apply: function (shape , context) {
                if (shape.strokeJoin !== 'miter') {
                    context.strokeJoin = shape.strokeJoin;
                }
            }
        }),
        strokeCap: _prepare('strokeCap' , {
            default: 'butt',
            list: ['butt' , 'round' , 'square'],
            type: Properties.type.choice,
            apply: function (shape , context) {
                if (shape.strokeCap !== 'butt') {
                    context.lineCap = shape.strokeCap;
                }
            }
        }),
        strokeWidth: _prepare('strokeWidth' , {
            default: 1,
            type: Properties.type.number,
            apply: function (shape , context) {
                if (shape.strokeWidth) {
                    context.lineWidth = shape.strokeWidth;
                }
            }
        }),
        strokeDash: _prepare('strokeDash' , {
            default: [],
            type: Properties.type.list,
            apply: function (shape , context) {
                if (shape.strokeDash.length !== 0) {
                    context.setLineDash(shape.strokeDash);
                }
            }
        }),
        strokeDashOffset: _prepare('strokeDashOffset' , {
            default: 0,
            type: Properties.type.number,
            apply: function (shape , context) {
                if (context.lineDashOffset) {
                    context.lineDashOffset = shape.strokeDashOffset;
                }
            }
        }),
        shadow: _prepare('shadow' , {
            default: false,
            type: Properties.type.color,
            apply: function (shape , context) {
                if (shape.shadow) {
                    context.shadowColor = shape.shadow.toCanvas();
                }
            }
        }),
        shadowOffset: _prepare('shadowOffset' , {
            default: 0,
            type: Properties.type.point,
            apply: function (shape , context) {
                if (shape.shadowOffset) {
                    context.shadowOffsetX = shape.shadowOffset.x;
                    context.shadowOffsetY = shape.shadowOffset.y;
                }
            }
        }),
        shadowBlur: _prepare('shadowBlur' , {
            default: 0,
            type: Properties.type.number,
            apply: function (shape , context) {
                if (shape.shadowBlur) {
                    context.shadowBlur = shape.shadowBlur;
                }
            }
        }),
        visible: _prepare('visible' , {
            default: true,
            type: Properties.type.boolean
        }),
        closed: _prepare('closed' , {
            default: true,
            type: Properties.type.boolean,
        })
    };


    Properties.add = function (assign , detail) {

        if (Util.isArray(detail)) {
            var i = detail.length;
            while (i--) {
                Properties.add(assign , detail[i]);
            }
            return true;
        }

        if (Util.isString(detail)) {
            detail = Properties.detail[detail];
        }

        if (!detail) return false;

        if (Util.isFunction(assign))
            assign = assign.prototype;

        if (!assign._props) {
            assign._props = [];
        }

        var attempt = _router(detail , detail.type);

        Object.defineProperty(assign , detail.name , {
            enumerable: true,
            configurable: true,
            get: attempt.get,
            set: attempt.set
        });

        Object.defineProperty(assign , detail.storage , {
            enumerable: true,
            configurable: true,
            writable: true,
            value: detail.default
        });

        assign._props.push(detail.name);

    };


    Properties.PACKAGE = {
        Element: ['fill' , 'alpha' , 'visible' , 'stroke' , 'strokeJoin' , 'strokeCap' , 'strokeWidth' , 'strokeDash' ,
            'strokeDashOffset' , 'shadow' , 'shadowOffset' , 'shadowBlur' , 'closed'],
        SkRect: ['x' , 'y' , 'width' , 'height'],
        Path: ['visible' , 'alpha']
    };




})();