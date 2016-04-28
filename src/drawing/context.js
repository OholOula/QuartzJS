// Quartz.Drawing.Context
// require:core.util
// require:drawing.transformation

var Context = null;

(function () {

    Context = qz.Context = function () {

    };

    Util.inherit(Context , Transformation);

})();