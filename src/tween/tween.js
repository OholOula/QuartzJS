// Quartz.Tween
// require:tween.easing


var Tween;


(function () {
    
    
    /**
     * events
     * play
     * pause
     * stop
     * forward - forward:start -> ileri gitme animasyonu başlayınca
     * forward:end -> ileri gitme animasyonu sona erince
     * backward - backward:start -> geri gitme animasyonu başlayınca
     * backward:end -> geri gitem animasyonu bitince
     * tick -> her adımda çalışır
     * direction -> yön değişince çalışır
     */
    Tween = qz.Tween = function (properties , settings , owner) {
        Event.call(this);
        
        var self = this;
        
        /**
         * animasyonların gerçekleşeceği  nesne
         */
        this._owner = owner;
        
        /**
         * tekrar hesaplamak için
         */
        this._givenProperties = properties;
        
        /**
         * animasyon uygulanacak özellikler
         */
        this.recalculate(properties);
        
        /**
         * forward ve backward editler hızı animasyon için
         */
        if (settings.time)
            this.time = settings.time;
        
        /**
         * forwardDelay ve backwardDelay editler
         */
        if (settings.delay)
            this.delay = settings.delay;
        
        /**
         * otamatik oynatır
         */
        this.autoplay = settings.autoplay == null ? true : settings.autoplay;
        
        /**
         * animasyoun ileriye doğru gerçekleşme süresi
         */
        this.forward = settings.forward != null ? settings.forward : this.forward || 1000;
        
        /**
         * her loop başında ileri doğru gitmeden önce beklenecek süre
         */
        this.forwardDelay = settings.forwardDelay != null ? settings.forwardDelay : this.forwardDelay || 0;
        
        /**
         * ilk haline geri dönme süresi (0 ise dönmez)
         */
        this.backward = settings.backward != null ? settings.backward : this.backward;
        
        /**
         * geriye dönüş başlamadan önce beklenecek süre
         */
        this.backwardDelay = settings.backwardDelay != null ? settings.backwardDelay : this.backwardDelay || 0;
        
        /**
         * animasyon türü
         */
        this.easing = settings.easing || Tween.DEFAULT.EASING;

        /**
         * sürekli animasyonu gerçekleşitir
         */
        this.loop = !!settings.loop;
        

        /**
         * oynatılmasından itibaren geçen süre
         */
        this._elapsed = 0;
        
        /**
         * animasyon süresi / geçen zaman
         */
        this._ratio = 0;
        
        /**
         * delay kontrolü için kullanılır
         */
        this._delayCounter = 0;
        
        
        this._playing = false;
        this._paused = false;
        this._stopped = true;
        
        /**
         * yazı şeklinde mevcut durum
         */
        this._status = Tween.STATUS.STOPPED;
        
        
        
        /**
         * animasyon yönü
         */
        this._direction = Tween.DIRECTION.FORWARD;
        
        
        
        this._ticker = new Timer.Ticker({
            pass: true,
            callback: function (interval) {
                self._tick(interval);
            }
        });
        
        /**
         * çalışma frekansı
         * @default genel zamanlayıcı frekansı
         */
        this.frequency = settings.frequency;
        
        if (this._owner.getMain()) {
            this._owner.getMain().timer.add(this._ticker);
        }
        
        this._owner.on('addedToPath' , function () {
            var main = this.getMain();
            if (main && main.timer) {
                main.timer.add(self._ticker);
            }
        });

        this._owner.on('removedFromPath:before' , function () {
            var main = this.getMain();
            if (main && main.timer) {
                main.timer.remove(self._ticker);
            }
        });
        

    }
    
    Util.include(Tween , Event);
    
    Tween.STATUS = {
        PLAYING: 'playing',
        PAUSED: 'paused',
        STOPPED: 'stopped',
    };
    
    
    Tween.DIRECTION = {
        FORWARD: 'forward',
        BACKWARD: 'backward'
    };
    
    Tween.DEFAULT = {
        EASING: qz.Easing.Linear.None
    };
    
    Tween.KEYS = {
        SEPERATOR: ':',
        START: 'start',
        END: 'end',
        TICK: 'tick',
        PLAY: 'play',
        PAUSE: 'pause',
        STOP: 'stop',
        DIRECTION: 'direction'
    }
    
    Util.assign(Tween.prototype , {
        
        /**
         * mevcut durumu değiştirir
         */
        _changeStatus: function (status) {
            
            if (status && this._status != status) {
                this._playing = false;
                this._paused = false;
                this._stopped = false;
                
                this._status = status;
                
                switch (status) {
                    case Tween.STATUS.PLAYING: 
                        this._playing = true;  
                        this.emit(Tween.KEYS.PLAY);
                    break;
                    case Tween.STATUS.PAUSED: 
                        this._paused = true; 
                        this.emit(Tween.KEYS.PAUSE);
                    break;
                    case Tween.STATUS.STOPPED: 
                        this._stopped = true; 
                        this.emit(Tween.KEYS.STOP);
                    break;
                }; 
                
            }
   
        },
        
        /**
         * yönün durumunu değiştirir
         */
        _changeDirection: function (direction) {
            
            if (direction != this._direction) {
                this._direction = direction;    
                this.emit(Tween.KEYS.DIRECTION);       
            }
            
        },
        
        /**
         * 
         */
        _parseProperties: function (properties) {
            if (Util.isObject(properties) && this._owner) {
                var obj = {},
                    key , value , current , to , from;
                
                for (key in properties) {
                    value = properties[key];
                    
                    if (Util.isArray(value)) {
                        from = value[0];
                        to = value[1];
                    } else {
                        to = value;
                        from = this._owner[key];
                    }
                    
                    if (key in this._owner) {
                        obj[key] = {
                            from: from,
                            to: Util.isString(to) ? from + parseInt(to) : to
                        }
                        
                    }
                    
                }
                
                return obj;
            }
            
            return {};
        },
        
        /**
         * animasyonu başlatır
         * @param reset - önce durdurur(stop)
         */
        play: function (reset) {
            if (reset) {
                this.stop();
            }
            
            if (this._stopped) {
                this._ticker.pass = false;
                this._elapsed = 0;
                this._delayCounter = 0;
            }
            
            if (this._paused) {
                this._ticker.pass = false;
            }
            
            if (this._stopped || this._paused) {
                this._changeStatus(Tween.STATUS.PLAYING);
                this._changeDirection(Tween.DIRECTION.FORWARD);               
            }
            
            return this;
        },
        
        /**
         * duraklatır
         */
        pause: function (nochange) {
            this._ticker.pass = true;
            
            if (!nochange)
                this._changeStatus(Tween.STATUS.PAUSED);
                
            return this;
        },
        
        /**
         * durdurur
         * @param recalculate - mevcut konuma göre animasyon gideceği değerleri hesaplar
         */
        stop: function (recalculate) {
            this._elapsed = 0;
            this._delayCounter = 0;
            this.pause(true);
            this._changeStatus(Tween.STATUS.STOPPED);
            if (recalculate) {
                this.recalculate();
            }
            
            return this;
        },
        
        /**
         * mevcut konuma göre animasyon gideceği değerleri hesaplar
         * @param properties - yeni değerler
         */
        recalculate: function (properties) {
            this._properties = this._parseProperties(properties || this._givenProperties);
            return this;
        },
        
        /**
         * belirtilen yere animasyonu götürür
         * @param ratio -  1 ile 0 arasında bir değer animasyon konumu
         * @param direction - animasyon yönü +1 -> forward , -1 > backward
         */
        goto: function (ratio , direction) {
            
            if (this._playing && ratio != null) {
                var value;
                if (!direction) {
                    direction = this._direction == Tween.DIRECTION.FORWARD ? 1 : -1;
                }
                
                ratio = Util.clamp(ratio , 0 , 1);
                value = (direction > 0 ? this.forward : this.backward);
                if (value) {
                    this._elapsed = value * ratio;
                    this._direction = direction > 0 ? Tween.DIRECTION.FORWARD : Tween.DIRECTION.BACKWARD;                   
                }

            }
            

        },
        
        _tick: function (interval) {
            
            if (this._playing) {
                
                
                var properties = this._properties,
                    easing = this.easing || Tween.DEFAULT.EASING,
                    direction = this._direction == Tween.DIRECTION.FORWARD ? 1 : -1,
                    directionTime = direction > 0 ? this.forward : this.backward,
                    directionDelay = direction > 0 ? this.forwardDelay : this.backwardDelay,
                    key , value , data , difference , ratio;
                 
                
                
                if (directionDelay) {
                    if (this._delayCounter < directionDelay) {
                        this._delayCounter += interval;
                        return;
                    }
                }
                
                if (this._elapsed == 0) {
                    this.emit(this._direction + Tween.KEYS.SEPERATOR + Tween.KEYS.START);
                    this.emit(this._direction);
                }
                

                this._elapsed += interval;
                
                if (this._elapsed >= directionTime) {
                    this._elapsed = directionTime;
                }
                

                this._ratio = ratio = this._elapsed / directionTime;
                
                
                for (key in properties) {
                    data = properties[key];
                    difference = data.to - data.from;
                    value = easing(ratio) * difference;
                    this._owner[key] = (direction > 0 ? data.from : data.to) + (value * direction);
                }
                
                this.emit(Tween.KEYS.TICK);

                if (ratio == 1) {
                    
                    this.emit(this._direction + Tween.KEYS.SEPERATOR + Tween.KEYS.END);
           
                    if (this.loop) {
                        
                        if (direction > 0 ? this.backward : this.forward) {
                            this._changeDirection(direction > 0 ? Tween.DIRECTION.BACKWARD : Tween.DIRECTION.FORWARD);
                        }
  
                        this._elapsed = 0;
                        this._delayCounter = 0;
                    } else {
                        this.stop();
                    }
                    

           
                }
                
                
                
            }  
                            
                     
        }
        
    });
    
    Object.defineProperties(Tween.prototype , {
        frequency: {
            get: function () {
                return this._ticker.frequency;
            } ,
            set: function (value) {
                this._ticker.frequency = value;
            }
        } ,
        
        time: {
            get: function () {
                return this.forward;
            } ,
            set: function (value) {
                this.forward = value;
                this.backward = value;
            }
        } ,
        
        delay: {
            get: function () {
                return this.forwardDelay;
            },
            
            set: function (value) {
                this.forwardDelay = value;
                this.backwardDelay = value;
            }
        },
        
        ratio: {
            get: function () {
                if (this._playing) {
                    return this._ratio;
                }
                return 0;
            }
        },
        
        direction: {
            get: function () {
                return this._direction;
            }
        },
        
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
        } 
    });
    

    
})();