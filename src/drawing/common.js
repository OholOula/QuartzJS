// Quartz.Drawing.Common
// require:core.util

var Common;
(function () {

    // path ve element için ortak fonksiyonlar
    Common = qz.Common = function () {

    };

    Util.assign(Common.prototype , {

        getElementId: function () {
            return this._elementID;
        },

        inPath: function () {
            return !!this._parent;
        },

        getParent: function () {
            return this._parent;
        },

        getMain: function () {
            if (this instanceof Path && this._mainPath) {
                return this;
            }
            if (this.inPath()) {
                var main = this;
                while (main.inPath()) {
                    main = main.getParent();
                }
                return main;
            }
            return false;
        },

        getLayerList: function () {
            if (this.inPath()) {
                var main = this,
                    list = [];
                while (main.inPath()) {
                    list.push(main.getParent().find(main));
                    main = main.getParent();
                }
                return list.reverse();
            }
            return false;
        },

        calculateAbsoluteTransformation: function () {
            var inPath = this.inPath(),
                temp = new Transform(),
                selfTransformation = this.calculateTransformation(),
                list = [selfTransformation],
                parent, i;


            if (inPath) {
                parent = this;
                while (parent.inPath()) {
                    parent = parent.getParent();
                    list.push(parent.calculateTransformation());
                }

                i = list.length;

                while (i--) {
                    temp.multiply(list[i].get());
                }
                return temp;
            } else {
                return selfTransformation
            }

        },

        getAbsoluteTransformation: function () {
            return this.calculateAbsoluteTransformation();
        }


    });

})();