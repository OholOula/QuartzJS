// Quartz.Input.Query
// require:input.input


(function () {

    /**
     * Sorguyu işler
     * @param query
     * @example test.denem[needle][event][key?=value]
     * {
     *      key: "test.denem",
     *      name: "test",
     *      property: "denem",
     *      pharases: {
     *              event: {},
     *              needle: {},
     *              key: {
     *                  value: "value",
     *                  target: "?",
     *                  operator: "="
     *              }
     *      }
     * }
     * @return {}
     */
    Input.Query = function (query) {
        var index = query.indexOf('['),
            temp;

        this.key = query.slice(0 , index < 0 ? void 0 : index);

        // name.property
        temp = this.key.split('.');

        if (temp[1]) {
            this.property = temp[1];
        }

        this.name = temp[0];

        if (index > -1) {
            Input.Query.REGEXP.lastIndex = 0;
            while (temp = Input.Query.REGEXP.exec(query)) {

                if (!this.phrases) {
                    this.phrases = {};
                }
                this.phrases[temp[1]] = {
                    target: null,
                    operator: null,
                    value: temp[3]
                };

                if (temp[2].length > 1) {
                    this.phrases[temp[1]].target = temp[2][0];
                    this.phrases[temp[1]].operator = temp[2][1];
                } else {
                    this.phrases[temp[1]].operator = temp[2] || null;
                }

            }
        }

        return this;
    };

    Util.createObjectType(Input.Query , 'Input.Query');

    /**
     * pointer.down[needle][event][key=value]
     * Yapısı ayıklamak için
     * @type {RegExp}
     */
    Input.Query.REGEXP = new RegExp("\\[([^\\]=\?]+)([=\?]{0,2})(.*?)\\]" , "ig");


    Util.assign(Input.Query.prototype , {
        /**
         * name yok ise bütün ifadeleri döndürür
         * name var ise ilgili ifadeyi döndürür
         * @param name
         * @return {}
         */
        getPhrase: function (name) {
            if (name) {
                return this.phrases && this.phrases[name];
            }
            return this.phrases;
        } ,

        /**
         * belirtilen ifadenin değerini döndürür
         * @param name
         * @return {*|boolean}
         */
        getValue: function (name) {
            var phrase = this.getPhrase(name);
            return phrase.value || false;
        } ,

        /**
         * ifadeyi verilen value ile kıyaslar
         * @param name - phrases ismi
         * @param value - karşılaştırılacak değer
         * @param type - boolean number string dönüştürülüp karşılaştırılacak
         */
        equals: function (name , value , type) {
            var phrase, phValue;

            if (phrase = this.getPhrase(name)) {
                phValue = phrase.value;

                if (Util.isBoolean(type)) {
                    if (phValue == 'true' || phValue == "1") {
                        phValue = true;
                    } else {
                        phValue = false;
                    }
                }

                if (Util.isNumber(type)) {
                    phValue = parseInt(phValue);
                }

                return value == phValue;
            }

        }

    });


})();