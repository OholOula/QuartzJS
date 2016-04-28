// Quartz.Size
// require:core.util

var Size = null;

(function () {

    /**
     * new Size([width , height]);
     * new Size(width , height);
     * new Size({width: width , height:height});
     * @param width - Genişlik
     * @param height - Yükselik
     */
    Size = qz.Size = function (width , height) {
            if (width instanceof Size) return width;
            if (!(this instanceof Size)) return new Size(width , height);

            var p = Size.control(width , height);

            this.width = p.width;
            this.height = p.height;
    };

    Size.control = function (width , height) {
        if (width instanceof Size) return width;

        var p = {width: 0 , height: 0},
            wt = typeof width == 'number',
            ht = typeof height == 'number';

        if (width == null && height == null) {
            return p;
        }

        if (wt || ht) {
            p.width = wt ? width : 0;
            p.height = ht ? height : 0;
            return p;
        }

        if (Util.isObject(width)) {
            if (width.width != null) p.width = width.width;
            if (width.height != null) p.height = width.height;
            if (width.x != null) p.width = width.x;
            if (width.y != null) p.height = width.y;
            return p;
        }

        if (Util.isArray(width) && width.length > 0) {
            p.width = width[0] == null ? 0 : width[0];
            p.height = width[1] == null ? 0 : width[1];
            return p;
        }

        return p;
    };

    Size.is = function (p) {
        return p instanceof Size;
    };
    
    
    Util.assign(Size.prototype , {
        clone: function () {
            return new Size(this.width , this.height);
        },

        equals: function (width , height) {
            var p = Size.control(width  , height);
            return this.width == p.width && this.height == p.height;
        },

        area: function () {
            return this.width * this.height;
        },

        set: function (width , height) {
            var p = Size.control(width , height);
            this.width = p.width;
            this.height = p.height;
            return this;
        },

        sum: function (width , height) {
            var p = Size.control(width , height);

            this.width += p.width || p.x || 0;
            this.height += p.height || p.y || 0;
            return this;
        },

        sub: function (width , height) {
            var p = Size.control(width , height);

            this.width -= p.width || p.x || 0;
            this.height -= p.height || p.y || 0;
            return this;
        },

        reverse: function () {
            var temp = this.width;
            this.width = this.height;
            this.height = temp;
            return this;
        }        
    });



})();