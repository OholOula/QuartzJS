// Quartz.Drawing.Path
// require:core.util
// require:core.event
// require:drawing.transformation

var Path = null;

(function () {

    Path = qz.Path = function () {
        Transformation.call(this);
        Event.call(this);
        Input.Manager.call(this);
        this._elementID = Util.getUniqueID();
        this._objectType += '#' + this._elementID;
        this._parent = null;
        this._elements = [];
    };

    Util.include(Path , Transformation);
    Util.include(Path , Event);
    Util.include(Path , Common);
    Util.include(Path , Input.Manager);

    Util.createObjectType(Path , 'Path');

    Properties.add(Path.prototype , Properties.PACKAGE.Path);


    Path.FILTER = {
        type: function (element) {
            return (element instanceof Path ? 'P' : 'E') + element._elementID;
        },
        self: function (element) {
            return element;
        }
    };

    Path.SELECTOR = {
        all: function () {
            return 1;
        },
        element: function (obj) {
            if (obj instanceof Element) {
                return 1;
            }
        } ,
        path: function (obj) {
            if (obj instanceof Path) {
                return 1;
            }
        }
    };



    Util.assign(Path.prototype , {
        has: function (obj) {
            var index = this.find(obj);
            return index < 0;
        },

        find: function (obj) {
            var index = this._elements.indexOf(obj);
            return index < 0 ? false : index;
        },

        getElements: function () {
            return this._elements;
        },

        setElements: function (elements) {
            this._elements = elements;
        },

        getElementsLength: function () {
            return this._elements.length;
        },


        add: function (obj , index) {
            if (obj instanceof Element || obj instanceof Path) {

                if (obj._parent) {
                    throw new Error(obj.toString() + ' already added');
                }

                var length = this.getElementsLength();

                if (!Util.isNumber(index)) index = null;

                if (index > length - 1 || (index < 0 && -index > length)) index = null;


                if (this.has(obj)) {
                    if (index != null) {
                        this.remove(obj , index);
                    } else {
                        return this;
                    }
                }

                this.emit('addedElement:before' , obj , this);
                obj.emit && obj.emit('addedToPath:before' , this , obj);


                if (index != null) {
                    this._elements.splice(index , 0 , obj);
                } else {
                    this._elements.push(obj);
                }

                index = index || this._elements.length - 1;


                obj._parent = this;

                this.emit('addedElement' , obj , index , this);
                this.emit('addedElement:after' , obj , index , this);

                obj.emit && obj.emit('addedToPath' , this , index , obj);
                obj.emit && obj.emit('addedToPath:after' , this , index , obj);

                return this;
            }

            return false;
        },

        remove: function (obj) {

            if (Util.isNumber(obj)) {
                if (obj < 0) {
                    obj = obj + this.getElementsLength();
                }
                if (this._elements[obj]) {
                    obj = this._elements[obj]
                } else {
                    return false;
                }
            }

            var index = this.find(obj);

            if (index !== false) {
                this.emit('removedElement:before' , obj , index , this);
                obj.emit && obj.emit('removedFromPath:before' , obj , index , this);

                this._elements.splice(index , 1);

                obj._parent = null;

                this.emit('removedElement:after' , obj , index , this);
                this.emit('removedElement' , obj , index , this);

                obj.emit && obj.emit('removedFromPath:after' , this , index , obj);
                obj.emit && obj.emit('removedFromPath' , this , index , obj);

                return true;
            }

            return false;
        },

        search: function (obj , result) {

            //paketle
            if (result === true) {
                return this.search.bind(this , obj);
            }

            var i = 0,
                elements = this._elements,
                element = null,
                length = elements.length,
                cr;

            result = result || [];


            if (Util.isFunction(obj)) {
                for ( ; i  < length ; i++) {
                    element = elements[i];
                    if (cr = obj.call(this , element , i)) {

                        if (cr === 1) {
                            result.push({
                                index: i,
                                element: element,
                                path: this
                            });
                        } else {
                            result.push(element);
                        }

                    }
                    if (element instanceof Path) {
                        element.search(obj , result);
                    }
                }
            } else {
                for ( ; i  < length ; i++) {
                    element = elements[i];
                    if (element === obj) {
                        return obj;
                    }
                    if (element instanceof Path) {
                        element.search(obj);
                    }
                }
            }



            return result;
        },



        move: function (obj , index) {
            var id = this.find(obj);
            if (id !== false) {
                this._elements.splice(id , 1);
                this._elements.splice(index , 0 , obj);
            }
        },


        set: function (index , obj) {
            if (Util.isNumber(index) && index >= 0 && index < this.getElementsLength()) {
                this._elements[index] = obj;
            }
            return false;
        },

        isEmpty: function () {
            return !this.getElementsLength();
        },

        get: function (index) {
            if (Util.isNumber(index) && index >= 0 && index < this.getElementsLength()) {
                return this._elements[index];
            }
            if (index == 'last' && !this.isEmpty()) {
                return this._elements[this.getElementsLength() - 1];
            }
            return this.isEmpty() ? false : this._elements;
        },

        last:function () {
            return this.get('last');
        },

        reverse: function () {
            this._elements.reverse();
        },

        size:function (deep) {
            if (!deep)  return this.getElementsLength();

            var size = this.size(),
                i = 0,
                element;

            for ( ; i < size ; i++) {
                element = this._elements[i];
                if (element instanceof Path) {
                    size += element.size(true);
                }
            }


            return size;

        },


        tree: function (el , filter) {
            var size = this.size(),
                elements = this._elements,
                tree,
                element,
                i = 0;

            if (!filter) filter = Path.FILTER.type;

            tree = [filter(this)];

            for ( ; i < size ; i++) {
                element = elements[i];
                if (element instanceof Path) {
                    tree.push(element.tree(el , filter));
                } else if (el) {
                    tree.push(filter(element));
                }
            }

            return tree;

        }
    });






})();