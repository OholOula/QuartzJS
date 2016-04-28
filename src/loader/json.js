// Quartz.Loader.Image
// require:loader.loader
// require:loader.pack



(function () {

    Loader.Json = function (url , success , error) {
        Loader.call(this , success , error);

        /**
         * json data
         * @type {null}
         * @private
         */
        this._data = null;

        var xhr = new XMLHttpRequest(),
            self = this;

        xhr.open('GET' , url , true);

        xhr.onreadystatechange = function () {

            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    self._loaded = true;
                    self._endTime = Util.now();
                    self._data = JSON.parse(xhr.responseText);
                    self._owner && self._owner._load(self);
                    success && success(self._data);
                } else {
                    self._endTime = Util.now();
                    self._owner && self._owner._error(self);
                    error && error();
                }
            }

        };

        xhr.send();

    };

    Util.inherit(Loader.Json , Loader);

    Util.createObjectType(Loader.Image , 'Image');


    Object.defineProperties(Loader.Json.prototype , {
        loaded: {
            get: function () {
                return this._loaded;
            }
        },
        data: {
            get: function () {
                return this._data;
            }
        },
        _get: {
            get: function () {
                return this._data;
            }
        }
    });


    Loader.Pack.TYPES.json = Loader.Json;
})();