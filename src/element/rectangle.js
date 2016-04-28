// Quartz.Element.Polygon
// require:drawing.element

(function () {

    Element.Rectangle = function (opt) {
        opt = opt || {};
        Element.call(this , opt);
        Rectangle.call(this , opt.offsetX , opt.offsetY , opt.width , opt.height);
    };
    

    Util.inherit(Element.Rectangle , Element);
    Util.include(Element.Rectangle , Rectangle);

    Util.assign(Element.Rectangle.prototype , {
        draw: function (context) {
            context.rect(0 , 0 , this.width , this.height);
        },
        clone: function () {
            return new Element.Rectangle(this);
        }
    });




})();