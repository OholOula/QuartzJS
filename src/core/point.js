// Quartz.Point
// require:core.util

var Point = null;

(function () {

    /**
     * new Point([x , y]);
     * new Point(x , y);
     * new Point({x:x , y:y});
     * @param x - X Konumu
     * @param y - Y Konumu
     */
    Point = qz.Point = function (x , y) {
            if (x instanceof Point) return x;
            if (!(this instanceof Point)) return new Point(x , y);

            // noktaları kontrol et
            var p = Point.control(x , y);

            this.x = p.x;
            this.y = p.y;
    };
    
    Point.control = function (x , y) {
        if (x instanceof qz.Point) return x;

        var p = {x: 0 , y: 0},
            xt = typeof x == 'number',
            yt = typeof y == 'number';

        if (x == null && y == null) {
            return p;
        }

        if (xt || yt) {
            p.x = xt ? x : 0;
            p.y = yt ? y : 0;
            return p;
        }

        if (Util.isArray(x) && x.length > 0) {
            p.x = x[0] == null ? 0 : x[0];
            p.y = x[1] == null ? 0 : x[1];
            return p;
        }

        if (Util.isObject(x)) {
            if (x.x != null) p.x = x.x;
            if (x.y != null) p.y = x.y;
            if (x.width != null) p.x = x.width;
            if (x.height != null) p.y = x.height;
            return p;
        }

        
        return p;
    };
    
    Point.is = function (p) {
        return p instanceof Point;
    }
    
    Util.assign(Point.prototype , {
        clone: function () {
            return new Point(this.x , this.y);
        },

        equals: function (x , y) {
            var p = Point.control(x  , y);
            return this.x == p.x && this.y == p.y;
        },

        distance: function (x , y) {

            var p = Point.control(x , y);
            x = this.x - p.x,
            y = this.y - p.y;

            return Math.sqrt(x*x + y*y);
        },

        set: function (x , y) {
            var p = Point.control(x , y);
            this.x = p.x;
            this.y = p.y;
            return this;
        },

        sum: function (x , y) {
            var p = Point.control(x , y);

            this.x += p.x;
            this.y += p.y;
            return this;
        },

        sub: function (x , y) {
            var p = Point.control(x , y);

            this.x -= p.x;
            this.y -= p.y;
            return this;
        },

        reverse: function () {
            var temp = this.x;
            this.x = this.y;
            this.y = temp;
            return this;
        },

        invert: function () {
            this.x *= -1;
            this.y *= -1;
        }        
    });





})();