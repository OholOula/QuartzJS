// Quartz.Drawing.Element
// require:drawing.transformation
// require:drawing.properties
// require:core.util
// require:color.rgba
// require:input.handler
// require:input.manager

var Element = null;

(function () {

    Element = qz.Element = function (opt) {
        Event.call(this);
        Transformation.call(this , opt);
        Input.Manager.call(this , opt);


        /**
         * Benzersiz Kimliği
         */
        this._elementID = Util.getUniqueID();
        this._objectType += '#E' + this._elementID; // rahat debug için

        /**
         * Ekli olduğu path
         * @property
         * @private
         */
        this._parent = null;


        /**
         * Özellilerin(Properties) ataması
         * @type {number}
         */
        var i = 0,
            props = this._props,
            length = props.length,
            prop;

        for ( ; i < length ; i++) {
            prop = props[i];
            opt[prop] != null && (this[prop] = opt[prop]);
        }


    };

    Util.include(Element , Transformation);
    Util.include(Element , Event);
    Util.include(Element , Common);
    Util.include(Element , Input.Manager);

    Properties.add(Element , Properties.PACKAGE.Element);

    Util.createObjectType(Element , 'Element');


    Util.assign(Element.prototype , {
        inPath: function () {
            return !!this._parent;
        }
    });





})();