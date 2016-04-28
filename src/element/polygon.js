// Quartz.Element.Polygon
// require:drawing.element

(function () {
    Element.Polygon = function (opt) {
        opt = opt || {};
        Element.call(this , opt);
        Polygon.call(this , (Util.isArray(opt.points) && opt.points) || (opt.getPoints && opt.getPoints()));
    };

    Util.inherit(Element.Polygon , Element);
    Util.include(Element.Polygon , Polygon);

    Util.assign(Element.Polygon.prototype , {
        draw: function (context) {

            if (this.hasPoints()) {
                var length = this.getPointsLength(),
                    p = this.getPoints(),
                    i = 1;
                context.moveTo(p[0].x , p[0].y);
                for ( ; i < length ; i++) {
                    context.lineTo(p[i].x , p[i].y);
                }
            }

        },
        clone: function () {
            return new Element.Polygon(this);
        }
    });

})();