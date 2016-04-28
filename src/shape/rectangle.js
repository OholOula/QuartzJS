// Quartz.Shape.Rectangle
// require:core.properties
// require:core.util
// require:drawing.element
// require:shape.polygon

var Rectangle = null;

(function () {

    Rectangle = qz.Rectangle = function (x , y , width , height) {

        x = x || 0;
        y = y || 0;
        width = width || 0;
        height = height || 0;

        Polygon.call(this , [
            [0 , 0],
            [width , 0],
            [width , height],
            [0 , height]
        ] , x , y);


    };


    Util.inherit(Rectangle , Polygon);
    Util.createObjectType(Rectangle  , 'Rectangle');

    Util.assign(Rectangle.prototype , {

        clone: function () {
            return new Rectangle(this.offsetX , this.offsetY , this.width , this.height);
        }

    });

    /*
    *
     [0 , 0],
     [width , 0],
     [width , height],
     [0 , height]
    *
    * */
    Object.defineProperties(Rectangle.prototype , {
        width: {
            get: function () {
                return this.getPoints()[1].x;
            } ,
            set: function (value) {
                var points = this.getPoints();
                points[1].x = value;
                points[2].x = value;
            }
        },
        height: {
            get: function () {
                return this.getPoints()[2].y;
            } ,
            set: function (value) {
                var points = this.getPoints();
                points[2].y = value;
                points[3].y = value;
            }
        }
    });



})();