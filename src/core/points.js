// Quartz.Points
// require:core.point

var Points = null;

(function () {


    Points = qz.Points = function (points) {
        this._points = [];
        if (Util.isArray(points)) {
            this.addMultiplePoint(points);
        }
    };

    // yeni eleman ekler
    Points.prototype.addPoint = function (p , index) {
        p = Point(p);
        if (index != null) {
            if (index < 0) index = this.size() + index;
            this.getPoints().splice(index , 0 , p);
        } else {
            this.getPoints().push(p);
        }
        return this;
    };

    Points.prototype.addMultiplePoint = function (points) {
        for (var i = 0; i < points.length;i++) {
            this.addPoint(points[i]);
        }
    };


    // elemanları döndürür
    Points.prototype.getPoints = function () {
        return this._points;
    };

    // eleman sayısını döndürür
    Points.prototype.getPointsLength = function () {
        return this._points.length;
    };

    // nokta var mı?
    Points.prototype.hasPoints = function () {
        return !!this._points.length;
    };

    // elemanlarda noktayı arar
    Points.prototype.searchPoint = function (p , s) {
        var elements = this.getPoints(),
            length = this.getPointsLength(),
            i = s || 0;

        p = point(p);

        for ( ; i < length ; i++) {
            if (p.equals(elements[i])) {
                return i;
            }
        }

        return false;
    };


    // belirtilen noktayı kaldırır
    // i , qz.Point veya number tipinde olabilir
    Points.prototype.removePoint = function (i) {
        if (typeof i != 'number') {
            i = this.searchPoint(i);
        }

        if (i < 0) i = this.countPoints() + i;

        return this.get().splice(i , 1);
    };


    Points.prototype.applyTransformationToPoints = function (transform) {
        var elements = this._points,
            length = elements.length,
            points = new Points,
            i = 0;
        if (this.hasPoints()) {
            for ( ; i < length ; i++) {
                points.addPoint(transform.point(elements[i]));
            }
        }
        return points;
    };

    Points.prototype.setPoints = function (points) {
        this._points = points;
    };

})();