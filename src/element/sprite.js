// Quartz.Element.Sprite
// require:drawing.element



(function () {

    /**
     new Sprite({
        fps: 35,
        default: texture || {
            name: 'dhero',
            frame: 1
        },
        image: ['sprite' , pack.get('image.sprite') , pack.get('json.sprite')] || {
            name: 'dhero',
            ...
        }
        images: {
            dhero: {
                source: pack.get('image.sprite'),
                datasheet: pack.get('json.sprite'),
                datasheet: [pack.get('json.sprite') , ['background']],
                frameNames: ['background'], // resimden parçalınacak kare adları
                length: 12,
                size: [300 , 100] , // sıralı
                fps: 10 // yok ise genel fpsi alır
            },
            dhero: [pack.get('image.sprite') , pack.get('json.sprite') , 20] // 12 fps
            dhero: [pack.get('image.sprite') , [300 , 100] , 12 , 20] // 20 fps
        },
        animations: {
            normal: {
                image: 'dhero', // yok ise ilk eklenmiş resmi alır
                fps: 12, // yok ise resmin fpsini alır
                frames: [0,1,2,3,4,5,6 , 'otherAnimation' , 'stop'],
                frames: [function (index) {
				    return index + '.png';
			    } , [0 , 6] , 'abc.png'], // çıkış: ['0.png' , '1.png' , ... , '6.png' , 'abc.png']
			    // aralık belirtilmess resim boyutu kadar çalışır
                pivot: [x , y] || {
                    x: 0,
                    y: 1,
                    width: 100,
                    height: 200
                },
                offsets: {
                    1: [0 , -100],
                    2: [0 , -120]
                }
            }
        }
    });
     * */

    
    Element.Sprite = function (opt) {
        Element.Rectangle.call(this , opt);

        var self = this;
        

        /**
         * Genel fps
         * @type {*|number}
         */
        this.fps = opt.fps || 25;

        /**
         * resim karesi büyüklüğüne göre büyüklüğü değiştirir
         * @type {boolean}
         */
        this.autosize = opt.autosize == null ? true : opt.autosize;

        /**
         * Kullanılan resimleri ve resimlerden ayıklanmış kareleri tutar
         * @type {{}}
         */
        this.images = {};
        
        /**
         * Eklenmiş resim adedi
         * @type {number}
         */
        this._imagesLength = 0;

        /**
         * ilk eklenmiş resim adı
         * @type {null}
         * @private
         */
        this._firstImageName = null;

        if (opt.image) {
            this.addImage(null , opt.image);
        }

        if (opt.images) {
            for (var key in opt.images) {
                this.addImage(key , opt.images[key]);
            }
        }

        /**
         * Oynatılacak animasyonlar
         * @type {{}}
         */
        this.animations = {};

        /**
         * Mevcut animasyonların uzunluğu
         * @type {number}
         */
        this._animationsLength = 0;


        if (opt.animations) {
            for (var key in opt.animations) {
                this.addAnimation(key , opt.animations[key]);
            }
        }


        /**
         * gösterilen (ekrana basılan) resim adı
         * @type {null}
         * @private
         */
        this._showingImage = null;


        /**
         * ekrana basılacak resmin karesi
         * @type {null}
         * @private
         */
        this._showingImageFrame = null;


        /**
         * oynatılma durumu
         * @type {boolean}
         * @private
         */
        this._playing = false;
        
        /**
         * duraklatılma durumu
         */
        this._paused = false;
        
        /**
         * durdurulma durumu
         */
        this._stopped = true;
        
        /**
         * mevcut konum metni
         */
        this._status = Element.Sprite.STOP;

        /**
         * oynatılan animasyon adı
         * @type {null}
         * @private
         */
        this._playingAnimationName = null;

        /**
         * oynatılan animasyonun kaçıncı karesi
         * @type {null}
         * @private
         */
        this._playingAnimationIndex = null;

        /**
         * oynatılandan sonraki oynatılacak kare indisi
         * @type {null}
         * @private
         */
        this._playingAnimationNextIndex = null;

        /**
         * Arta kalan zaman
         * oynatılan karelerden arta kalan zaman toplanır ve sonraki kareye eklenir
         * böylece zaman göre gerçek fps değerine göre kare yakalanmaya çalışılır
         * @type {number}
         * @private
         */
        this._wasteTime = 0;

        /**
         * pivot hesabı için kullanılacak
         * @type {Point}
         * @private
         */
        this._totalPivot = new Point;


        /**
         * offset hesabı için kullanılacak
         * @type {Point}
         * @private
         */
        this._totalOffset = new Point;

        /**
         * ilk kareyi beklemeden oynatır
         * @type {boolean}
         * @private
         */
        this._playQuickly = false;


        this._timer = new Timer.Ticker({
            pass: true,
            callback: function (interval) {
                self._control(interval);
            }
        });
        
        if (this.getMain()) {
            this.getMain().timer.add(this._timer);
        }

        this.on('addedToPath' , function () {
            var main = this.getMain();
            if (main && main.timer) {
                main.timer.add(this._timer);
            }
        });

        this.on('removedFromPath:before' , function () {
            var main = this.getMain();
            if (main && main.timer) {
                main.timer.remove(this._timer);
            }
        });

    };

    Util.inherit(Element.Sprite , Element.Rectangle);


    Element.Sprite.DEFAULT_IMAGE_NAME = 'defImage';
    Element.Sprite.DEFAULT_ANIMATION_NAME = 'defAnim';
    Element.Sprite.SEPERATOR = ':';
    Element.Sprite.STOP = 'stop';
    Element.Sprite.PLAY = 'play';
    Element.Sprite.PAUSE = 'pause';
    Element.Sprite.TICK = 'tick';
    Element.Sprite.ANIMATION = 'animation';
    Element.Sprite.STATUS = 'status';
   


    Util.assign(Element.Sprite.prototype , {

        draw: function (context) {
            if (this._showingImage && this._showingImageFrame) {

                var frame = this.getImageFrame(this._showingImage , this._showingImageFrame),
                    width , height;

                if (frame) {

                    if (this.autosize) {
                        width = this.width = frame.size.width;
                        height = this.height = frame.size.height;
                    } else {
                        width = this.width;
                        height = this.height;
                    }

                    context.drawImage(frame.texture.getBufferCanvas() , 0 , 0 , width , height);

                    if (this.stroke || this.fill) {
                        Element.Rectangle.prototype.draw.call(this , context);
                    }

                }

            }

        },
        
        
        _changeStatus: function (status) {
            if (status && status != this._status) {
                var _last = this._status;
                
                this._playing = false;
                this._paused = false;
                this._stopped = false;     
                
                this._status = status;
                
                switch (status) {
                    case Element.Sprite.PLAY: this._playing = true; break;
                    case Element.Sprite.PAUSE: this._paused = true; break;
                    case Element.Sprite.STOP: this._stopped = true; break;
                }
                
                
                this.emit(Element.Sprite.ANIMATION + Element.Sprite.SEPERATOR + Element.Sprite.STATUS , status , _last);
            }
               
        },

        /**
         * belirtilen animasyonu oynatmaya başlar
         * @param name - oynatılacak animasyon adı
         * @param index - oynatılmaya kaçıncı kareden başlatılacağı
         * @param quickly - çalışma frekansını beklemeden anında oynatır
         */
        play: function (name , quickly , index) {

            if (!name && this._paused) {
                this._changeStatus(Element.Sprite.PLAY);
                this._timer.pass = false;
                this.emit(this._playingAnimationName + Element.Sprite.SEPERATOR + Element.Sprite.PLAY);
                this.emit(Element.Sprite.ANIMATION + Element.Sprite.SEPERATOR + Element.Sprite.PLAY);
                return this;
            }
            
            if (!name) {
                return;
            }
            

            if (this._playing) {
                if (name == this._playingAnimationName) {
                    return;
                }
                this.stop();
            }
               
              
            if (!this.hasAnimation(name)) {
                throw new Error(name + ' İsimli animasyon eklenmemiş');
            }

            var animation = this.getAnimation(name),
                frames = animation.frames;


            if (!(Util.isNumber(index) && index >= 0 && index < frames.length)) {
                index = null;
            }

            this._playingAnimationName = name;
            this._playingAnimationIndex = index || 0;
            this._playingAnimationNextIndex = index || 0;




            this._changeStatus(Element.Sprite.PLAY);
            this._timer.pass = false;

            this.emit(name + Element.Sprite.SEPERATOR + Element.Sprite.PLAY);
            this.emit(Element.Sprite.ANIMATION + Element.Sprite.SEPERATOR + Element.Sprite.PLAY);

            if (quickly) {
                this.playNext();
            }

            return this;
        },

        /**
         * sıradaki kareyi oynatır
         */
        playNext: function () {
            if (this._playing) {
                var self = this;
                window.setTimeout(function () {
                    self._playQuickly = true;
                    self._control();
                } , 1);
            }
        },

        /**
         * duraklatır
         */
        pause: function (noemit) {
            this._changeStatus(Element.Sprite.PAUSE);
            this._timer.pass = true;
            
            if (noemit) return;
            
            this.emit(Element.Sprite.ANIMATION + Element.Sprite.SEPERATOR + Element.Sprite.PAUSE);
            if (this._playingAnimationName) {
                this.emit(this._playingAnimationName + Element.Sprite.SEPERATOR + Element.Sprite.PAUSE);
            }
        },

        /**
         * durdurur(resetler)
         */
        stop: function () {
            var _temp = this._playingAnimationName;

            this._playingAnimationName = null;
            this._playingAnimationIndex = null;
            this._playingAnimationNextIndex = null;
            this._wasteTime = 0;
            this.pause(true);
            
            this._changeStatus(Element.Sprite.STOP);
            this.emit(Element.Sprite.ANIMATION + Element.Sprite.SEPERATOR + Element.Sprite.STOP);
            if (_temp) {
                this.emit(_temp + Element.Sprite.SEPERATOR + Element.Sprite.STOP);
            }
        },


        /**
         * offset bilgisini sıfırlar
         * böylece  mevcut konum için tekrar offset bilgisi hesaplanır
         */
        resetOffset: function () {
            this._totalOffset.set(0 , 0);
        },

        /**
         * pivot bilgisini sıfırlar
         * böylece  mevcut konum için tekrar pivot bilgisi hesaplanır
         */
        resetPivot: function () {
            this._totalPivot.set(0 , 0);
        },


        resetOffsetAndPivot: function () {
            this.resetOffset();
            this.resetPivot();
        },

        /**
         * atık zaman üzeriden çalışma sıklığını kontrol eder
         * @param interval
         * @private
         */
        _control: function (interval) {
            if (!this._playing) {
                return this.stop();
            }
            var frequency = this.playingFrequency;
            this._wasteTime += interval ? interval : 0;

            /**
             * en düşük çalışma sıklığı
             */
            if (frequency < 1) {
                frequency = 1;
            }

            while (frequency <= this._wasteTime || this._playQuickly) {
                if (!this._playQuickly)
                    this._wasteTime -= frequency;
                this._playQuickly = false;
                this._tick();
            }

        },


        /**
         * mevcut kare gösterilir ve sonraki kara hesaplanır
         * @returns {*}
         * @private
         */
        _tick: function () {
            if (!this._playing) {
                return this.stop();
            }


            if (!this.hasAnimation(this._playingAnimationName)) {
                throw new Error(this._playingAnimationName + " Animasyonu ekli değil.");
            }


            var animationName = this._playingAnimationName,
                animation = this.getAnimation(animationName),
                index = this._playingAnimationNextIndex,
                frameKey = animation.frames[index],
                framesLength = animation.frames.length,
                imageKey = animation.image,
                point = new Point,
                image , width , height , pivot , frame;


            if (!imageKey) {
                imageKey = this.getImageName();
                if (!imageKey)
                    throw new Error('Eklenmiş resim yok.');
            }


            image = this.getImage(imageKey);
            frame = this.getImageFrame(imageKey , frameKey);

            if (!image.frames.has(frameKey)) {
                throw new Error(frameKey + ' Belirtilen karesi eklenmemiş.');
            }


            if (animation.pivot) {
                pivot = animation.pivot;
                width = pivot.width || image.maxFrameWidth;
                height = pivot.height || image.maxFrameHeight;
                point.set(Util.clamp(pivot.x , 0 , 1) , Util.clamp(pivot.y , 0 , 1));
                point.set((width - frame.size.width) * point.x , (height - frame.size.height) * point.y);
                point.sub(this._totalPivot);


                this.offsetX += point.x;
                this.offsetY += point.y;

                this._totalPivot.sum(point);
            }
            
            if (animation.offsets) {

                if (animation.offsets[index]) {
                    point.set(Point(animation.offsets[index]));
                    point.sub(this._totalOffset);

                    this.offsetX += point.x;
                    this.offsetY += point.y;

                    this._totalOffset.sum(point);

                    /**
                     * offset yok ise ilk konuma geri al
                     */
                } else if (this._totalOffset.x != 0 || this._totalOffset.y != 0) {

                    this.offsetX -= this._totalOffset.x;
                    this.offsetY -= this._totalOffset.y;
                    this._totalOffset.set(0 , 0);

                }

            }

            this._playingAnimationIndex = index;
            this.show(imageKey , frameKey , true);

            if (index >= framesLength - 1) {
                index = 0;
            } else {
                index++;
            }
            this._playingAnimationNextIndex = index;

            this.emit(animationName + Element.Sprite.SEPERATOR + Element.Sprite.TICK);
            this.emit(Element.Sprite.ANIMATION + Element.Sprite.SEPERATOR + Element.Sprite.TICK);


            if (index >= framesLength - 1) {
                frameKey = animation.frames[index];
                if (frameKey == Element.Sprite.STOP) {
                    this.stop();
                } else if (this.hasAnimation(frameKey)) {
                    return this.play(frameKey);
                }
            }

        },


        /**
         * name yok ise genel fps döner
         * name var ise animasyon fpsi var iste onu yoksa ise resmin fps değerini döndürür
         * @param name
         * @returns {*}
         */
        getFPS: function (name) {
            if (this.hasAnimation(name)) {
                var animation , image;

                animation = this.getAnimation(name);
                if (animation.fps) {
                    return animation.fps;
                }

                if (animation.image && this.hasImage(animation.image)) {

                    image = this.getImage(animation.image);
                    if (image.fps) {
                        return image.fps;
                    }
                }
                

                if (!animation.image && this.getImageName()) {

                    image = this.getImage(this.getImageName());
                    if (image.fps) {
                        return image.fps;
                    }
                }

            }
            return this.fps;
        },

        /**
         * Belirtilen resimde belirtilen kareyi ekranda gösterir
         * show(image , frame)
         * show(frame)
         * @param image
         * @param frame
         */
        show: function (image , frame , nocontrol) {
            if (!frame) {
                frame = image;
                image = this.getImageName();
            }
            
            if (!nocontrol) {

                if (!this.hasImage(image)) {
                    throw new Error(image + ' Gösterilecek resim bulunamadı.');
                }

                if (!this.getImage(image).frames.has(frame)) {
                    throw new Error(frame + ' Belirtilen resim karesi bulunamadı.');
                }

            }

            this._showingImage = image;
            this._showingImageFrame = frame;

        },


        /**
         * ilk eklenmiş resim adını döndürür
         */
        getImageName: function () {
            return this._firstImageName;
        },


        /**
         * resim karesini döndürür
         * @param image
         * @param frame
         */
        getImageFrame: function (image , frame) {
            return this.getImage(image) ? this.getImage(image).frames.get(frame) : false;
        },

        /**
         * Resim bilgisi işler ve resmi ekler
         * belirtilen bilgilere göre resmi karelere ayırır
         * @param data
         * @param name
         * @returns {{}}
         */
        addImage: function (name , data) {
            var obj = {};


            /**
             * kısa ekleme şeklinin ayrıştırılması
             */
            if (Util.isArray(data)) {

                if (Util.isString(data[0])) {
                    name = data[0];
                    data = data.slice(1);
                }

                obj.name = name || Element.Sprite.DEFAULT_IMAGE_NAME;
                obj.source = data[0];

                if (data[1]) {

                    if (data[1].hasOwnProperty('frames')) {
                        obj.datasheet = data[1];
                        if (data[2]) {
                            obj.fps = data[2];
                        }
                    } else {
                        obj.size = data[1];
                    }

                }

                if (Util.isNumber(data[2])) {
                    obj.length = data[2];
                }

                if (Util.isNumber(data[3])) {
                    obj.fps = data[3];
                }

            } else if (Util.isObject(data)) {
                obj = data;
                obj.name = data.name || name || Element.Sprite.DEFAULT_IMAGE_NAME;
            } else {
                throw new Error('Geçersiz Tipte Resim Bilgisi');
            }


            if (!(obj.source instanceof Image)) {
                throw new Error(obj.source + ' Geçersiz Resim Tipi');
            }


            if (obj.datasheet && Util.isObject(obj.datasheet) && !obj.datasheet.hasOwnProperty('frames')) {
                throw new Error(obj.datasheet + ' Geçersiz Datasheet');
            }

            obj.fps = obj.fps;
            obj.frames = new Element.Sprite.Frames;
            obj.framesLength = 0;
            obj.maxFrameWidth = 0;
            obj.maxFrameHeight = 0;


            if (obj.datasheet) {

                if (Util.isArray(obj.datasheet)) {

                    if (obj.datasheet[1]) {
                        obj.frameNames = obj.datasheet[1];
                        obj.datasheet = obj.datasheet[0];
                    }

                }

                if (obj.frameNames && !(Util.isString(obj.frameNames) || Util.isArray(obj.frameNames))) {
                    throw new Error(obj.frameNames + ' Geçersiz Tipte Kare Adları');
                }

                if (Util.isString(obj.frameNames)) {
                    obj.frameNames = [obj.frameNames];
                }


                var dataOfFrames = obj.datasheet.frames,
                    frameName , item , sourceSize , sourceOffset , offset , size;


                for (frameName in dataOfFrames) {
                    item = dataOfFrames[frameName];


                    if (obj.frameNames && obj.frameNames.indexOf(frameName) < 0) {
                        continue;
                    }

                    sourceSize =  item.sourceSize ?
                            Size(item.sourceSize.w , item.sourceSize.h) :
                            Size(item.frame.w , item.frame.y);

                    sourceOffset = Point(item.spriteSourceSize || [0 , 0]);

                    offset = Point(item.frame);
                    size = Size(item.frame.w , item.frame.h);

                    obj.frames.add(frameName , {
                        offset: sourceOffset,
                        size: sourceSize ,
                        trimmedSize: size ,
                        texture: new Texture(obj.source , offset , size , sourceOffset , sourceSize)
                    });

                    if (sourceSize.width > obj.maxFrameWidth)
                        obj.maxFrameWidth = sourceSize.width;

                    if (sourceSize.height > obj.maxFrameHeight)
                        obj.maxFrameHeight = sourceSize.height;

                    obj.framesLength++;

                }

            } else if (obj.length && obj.size) {
                obj.size = Size(obj.size);
                
                var width = obj.size.width,
                    height = obj.size.height,
                    iWidth = obj.source.width,
                    iHeight = obj.source.height,
                    column = Math.floor(iWidth / width),
                    row = Math.floor(iHeight / height),
                    offset,
                    i = 0 , j = 0;

                obj.maxFrameWidth = width;
                obj.maxFrameHeight = height;

                for ( ; i < row ; i++) {
                    for (j = 0 ; j < column ; j++) {

                        offset = [
                            j * width,
                            i * height
                        ];


                        obj.frames.add(obj.framesLength , {
                            offset: Point(0 , 0),
                            size: Size(width , height),
                            trimmedSize: Size(width , height),
                            texture: new Texture(obj.source , offset , obj.size)
                        });


                        if (++obj.framesLength >= obj.length) break;
                    }
                    if (obj.framesLength >= obj.length) break;
                }

            }


            if (!this._firstImageName) {
                this._firstImageName = obj.name;
            }

            this.images[obj.name] = obj;
            this._imagesLength++;


            return obj;
        },


        /**
         * Belirtilen resmi kaldırır
         * @param name
         */
        removeImage: function (name) {
            if (this.images.hasOwnProperty(name)) {
                delete this.images[name];
                this._imagesLength--;
            }
        },

        /**
         * name var ise o isme ait resmin olup oladığını döndürür
         * yok ise eklenmiş resimin olup olmadığını döndürür
         * @param name
         * @returns {boolean}
         */
        hasImage: function (name) {
            if (name) {
                return this.images.hasOwnProperty(name);
            }
        },

        /**
         * belirtilen resmi döndürür
         * @param name
         * @returns {*}
         */
        getImage: function (name) {
            if (name && this.hasImage(name)) {
                return this.images[name];
            }
            return this.images;
        },


        /**
         * yeni animasyon ekler
         * @param data
         * @param name
         */
        addAnimation: function (name , data) {

            var obj = {},
                key;

            if (!this._imagesLength) {
                throw new Error('Animasyon eklemek için önce resim eklemelisiniz');
            }


            if (data.image && !this.hasImage(data.image)) {
                throw new Error('Belirtilen resim bulunamadı');
            }
            

            obj.image = data.image;
            obj.fps = data.fps;
            obj.name = name || data.name || Element.Sprite.DEFAULT_ANIMATION_NAME;

            if (!obj.image) {
                obj.image = this.getImageName();
            }

            if (data.frames && Util.isArray(data.frames)) {
                if (Util.isFunction(data.frames[0])) {
                    var _s = 1,
                        fn = data.frames[0],
                        begin , end , i;

                    if (Util.isArray(data.frames[1])) {
                        begin = data.frames[1][0];
                        end = data.frames[1][1];
                        _s++;
                    } else {
                        begin = 0;
                        end = this.getImage(obj.image).frames.length;
                    }


                    obj.frames = [];

                    for (i = begin ; (begin < end ? i <= end : i >= end) ; (begin < end ? i++ : i--)) {
                        obj.frames.push(fn(i));
                    }

                    obj.frames = obj.frames.concat(data.frames.slice(_s))


                } else {
                    obj.frames = data.frames;
                }
            }

            if (data.pivot) {
                if (Util.isArray(data.pivot)) {
                    obj.pivot = Point(data.pivot);
                } else if (Util.isObject(data.pivot)) {
                    obj.pivot = data.pivot;
                }
            }

            if (data.offsets) {

                obj.offsets = {};
                for (key in data.offsets) {
                    obj.offsets[key] = Point(data.offsets[key]);
                }

            }


            this.animations[obj.name] = obj;
            this._animationsLength++;

            return obj;
        },


        /**
         * name var ise name adlı animasyon varmı diye bakar
         * yoksa herhangi eklenmiş animasyon varmı diye bakar
         * @param name
         * @returns {boolean}
         */
        hasAnimation: function (name) {
            if (name) {
                return !!this.animations[name];
            }
        } ,

        /**
         * name var ise ilgili animasyonu döndürür
         * name yok ise bütün animasyonları döndürür
         * @param name
         */
        getAnimation: function (name) {
            if (name) {
                return this.animations[name];
            }
            return this.animations;
        },


        /**
         * belirtilen animasyonu kaldırır
         * @param name
         */
        removeAnimation: function (name) {
            if (this.hasAnimation(name)) {
                delete this.animations[name];
                this._animationsLength--;
            }
        }

    });


    Object.defineProperties(Element.Sprite.prototype , {
        /**
         * oynatma durumu
         */
        playing: {
            get: function () {
                return this._playing;
            }
        },
        
        paused: {
            get: function () {
                return this._paused;
            }  
        },
        
        stopped: {
            get: function () {
                return this._stopped;
            }
        },
        
        status: {
            get: function () {
                return this._status;
            }
        },

        /**
         * ekli resimlerin adedini döndürür
         */
        imagesLength: {
            get: function () {
                return this._imagesLength;
            }
        },

        /**
         * ekli animasyon adedi
         */
        animationsLength: {
            get: function () {
                return this._animationsLength;
            }
        },

        /**
         * ekranda gösterilen resim adı
         */
        showingImage: {
            get: function () {
                return this._showingImage;
            }
        },

        /**
         * ekranda gösterilen resim karesi
         */
        showingFrame: {
            get: function () {
                return this._showingImageFrame;
            }
        },

        /**
         * oynatılan animasyon adı oynatılmıyorsa false
         */
        playingAnimation: {
            get: function () {
                if (this._playing) {
                    return this._playingAnimationName;
                }
                return false;
            }
        },

        /**
         * oynatılan animasoyunu oynatılan karenin indisi
         */
        playingAnimationIndex: {
            get: function () {
                if (this._playing) {
                    return this._playingAnimationIndex;
                }
                return false;
            }
        },

        /**
         * sıradkai oynatılacak animasyon karesi indisi
         */
        playingAnimationNextIndex: {
            get: function () {
                if (this._playing) {
                    return this._playingAnimationNextIndex;
                }
                return false;
            }
        },

        /**
         * oynatılan karenin adı
         */
        playingFrame: {
            get: function () {
                if (this._playing) {
                    return this._showingImageFrame;
                }
                return false;
            }
        },
        
        /**
         * oynatılan animasyonun fps değeri
         */
        playingFPS: {
            get: function () {
                if (this._playing) {
                    return this.getFPS(this._playingAnimationName);
                }
            }
        },
        
        
        playingFrequency: {
            get: function () {
                if (this._playing) {
                    return 1000 / this.playingFPS;
                }
            }
        },

        /**
         * oynatılan resim
         */
        playingImage: {
            get: function () {
                if (this._playing) {
                    return this._showingImage;
                }
                return false;
            }
        }
    });


    Element.Sprite.Frames = function () {
        this._frames = {};
        this._length = 0;
    };

    Util.assign(Element.Sprite.Frames.prototype , {
        add: function (name , frame) {
            this._frames[name] = frame;
            this._length++;
        } ,
        has: function (name) {
            if (name) {
                return !!this._frames[name];
            }
            return !!this._length;
        },
        remove: function (name) {
            if (this._frames.hasOwnProperty(name)) {
                delete this._frames[name];
                this._length--;
            }
            return false;
        },
        get: function (name) {
            if (name) {
                if (this.has(name)) {
                    return this._frames[name];
                }
                return false;
            }
            return this._frames;
        }
    });

    Object.defineProperties(Element.Sprite.Frames.prototype , {
        length: {
            get: function () {
                return this._length;
            }
        }
    });


})();