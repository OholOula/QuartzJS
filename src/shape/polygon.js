// Quartz.Shape.Polygon
// require:core.properties
// require:core.util
// require:core.points

var Polygon = null;

(function () {

    Polygon = qz.Polygon = function (points , offsetX , offsetY) {
        Points.call(this , points);

        offsetX != null && (this.offsetX = offsetX);
        offsetY != null && (this.offsetY = offsetY);
    };

    Util.inherit(Polygon , Points);
    Util.include(Polygon , Transformation);

    Util.createObjectType(Polygon  , 'Polygon');


    Util.assign(Polygon.prototype , {
        _getRealTransformation: function () {
            return this.getAbsoluteTransformation ? this.getAbsoluteTransformation() : this.getTransformation();
        },

        containsPoint: function (x , y) {
            return Polygon.containsPoint(this , x , y , this._getRealTransformation());
        },

        clone: function () {
            return new Polygon(this.getPoints().slice() , this.offsetX , this.offsetY);
        },

        /**
         * 0,0 Noktası ile belirtilen nokta arasındaki mesafeyi döndürür
         */
        getPointDistance: function (x , y) {
            return this._getRealTransformation().flush(x , y);
        }

    });


    Polygon.containsPoint = function (points , x , y , transform) {
        var point = Point(x , y),
            inside = false,
            length,
            i, j,
            pix, piy, pjx,pjy;


        if (transform instanceof Transform) {

            /**
             * Eğer noktalar dizi şeklinde ise Points nesnesi oluşturur
             */
            if (!(points.applyTransformationToPoints)) {
                points = new Points(points);
            }
            points = points.applyTransformationToPoints(transform);

        }



        points = points.getPoints ? points.getPoints() : points;
        length = points.length;


        // https://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
        for (i = 0 , j = length - 1 ; i < length ; j = i++) {
            pix = points[i].x;
            piy = points[i].y;
            pjx = points[j].x;
            pjy = points[j].y;
            if (((piy > point.y) != (pjy > point.y)) && (point.x < (pjx - pix) * (point.y - piy) / (pjy - piy) + pix)) {
                inside = !inside;
            }
        }

        return inside;
    };




})();