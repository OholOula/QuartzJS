// Quartz.System.Timer


var Timer;
(function () {

    var requestAnimationFrame = window.requestAnimationFrame ||
                                window.mozRequestAnimationFrame ||
                                window.webkitRequestAnimationFrame ||
                                window.msRequestAnimationFrame,

        cancelAnimationFrame =  window.cancelAnimationFrame ||
                                window.mozCancelAnimationFrame ||
                                window.webkitCancelAnimationFrame ||
                                window.msCancelAnimationFrame;

    /**
     * Zamanlayıcı 
     * son eklenen ilk çalıştırılır
     */
    Timer = qz.Timer = function (owner) {
        
        /**
         * zamanlayıcının sahibi
         * zamanlayıcı olayları sahibinde tetiklenir
         * timer:start
         * timer:stop
         */
        this._owner = owner;
        
        /**
         * çalışma durumu
         */
        this._running = false;
        
        /**
         * rafID (requestAnimationFrame)
         */
        this._RAFID = null;
        
        /**
         * tick nesneleri
         */
        this._list = [];
        
        /**
         * son çalışma zamanı
         */
        this._lastTick = 0;
        
        
        this.calculator = new Calculator({
            condition: 200,// 200 ms de bir hesaplar
            frequency: 16,// beklenen frekans
            processing: 16,// max işlem süresi
        });
        
        
        this.start();
    }
    
    Util.include(Timer , Event);
    
    Util.assign(Timer.prototype , {
        now: Util.now,
        
        /**
         * listeye yeni tick nesnesi ekler
         */
        add: function (opt) {
            if (opt instanceof Timer.Ticker) {
                this._list.push(opt);
            } else {
                var ticker = new Timer.Ticker(opt);
                this._list.push(ticker);
                return ticker;
            }
        },

        /**
         * listeden belirtilen tick nesnesini kaldırır
         */
        remove: function (tick) {
            var index = this._list.indexOf(tick);
            if (index > -1) {
                this._list.splice(index , 1);
            }
        },
    
        /**
         * Çalışmaya başlar ve tetiklenme isteğinde bulunur
         */
        start: function () {
            this._running = true;
            this._start();
            
            if (!this._lastTick) {
                this._lastTick = this.now();
            }
            
            if (this._owner) {
                this._owner.emit('timer:start');
            }
        },
        
        
        /**
         * her çalışmada sürekli tetiklenir ve tetikler
         */
        _start: function () {
            if (this._running) {
                var self = this;
                this._RAFID = requestAnimationFrame(function () {
                    self._start();
                    self._update(); 
                });
            }
        },
        
        /**
         * çalışmayı durdurur
         */
        stop: function () {
            if (this._RAFID) {
                this._running = false;
                this._lastTick = 0;
                cancelAnimationFrame(this._RAFID);
                if (this._owner) {
                    this._owner.emit('timer:stop');
                }
            }
        },
        
        /**
         * tik tak
         */
        _update: function () {
            var begin = this.now(),
                length = this._list.length,
                frequency = begin - this._lastTick,
                ticker , interval , start;

            this._lastTick = begin;


            while (length--) {
                
                
                start = this.now();
                interval = start - begin;
                ticker = this._list[length];
                
                
                if (!ticker.pass && ticker._callback) {
                    
                    if (ticker.frequency) {
                        ticker._total += frequency + interval;
                        if (ticker._total < ticker.frequency) {
                            continue;
                        };
                    } else {
                        ticker.frequency = 0;
                    }
                    
                    
                    
                    ticker._callback.call(ticker._context , ticker._total || frequency + interval);
                    ticker.calculator.add(ticker._total || frequency + interval , this.now() - start);
                    
                    if (ticker._total) {
                        ticker._total -= Math.max(ticker.frequency , frequency);
                    }
                    
                }
                
 
            }
            
            
            this.calculator.add(frequency , this.now() - begin);
            
            
        }
        
        
        
    });
    
    
    Object.defineProperties(Timer.prototype , {
        frequency: {
            get: function () {
                return this.calculator.getFrequency();
            }
        },
        processing: {
            get: function () {
                return this.calculator.getProcessing();
            }
        },
        fps: {
            get: function () {
                return 1000 / this.calculator.getFrequency();
            }
        }
    });
    

    
    /**
     * belirli zaman aralığında veya çalışma adedinde
     * ortalama değeri bulur (frekans ve işlem süresi hesabı)
     */
    var Calculator = function (detail) {
        /**
         * frekans toplamları
         */
        this._frequencySum = 0;
        
        /**
         * işlem süresi toplamları
         */
        this._processingSum = 0;
        
        /**
         * frekans ortalaması
         */
        this._frequencyAverage = detail.frequency || 16;
        
        /**
         * işlem ortalaması
         */
        this._processingAverage = detail.processing || 16;
        
        /**
         * sayaç
         */
        this._counter = 0;

        /**
         * hesaplama koşulu
         */
        this.condition = detail.condition || 200;
    }
    
    Util.assign(Calculator.prototype , {
        add: function (frequency , processing) {
            this._frequencySum += frequency;
            this._processingSum += processing;
            this._counter++;
            this._calculate();
        },
        
        _calculate: function () {
            if (this._frequencySum >= this.condition && this._counter) {
                this._frequencyAverage = this._frequencySum / this._counter;
                this._processingAverage = this._processingSum / this._counter;
                this._frequencySum = this._processingSum = this._counter = 0;
            };
        },
        
        getFrequency: function () {
            return this._frequencyAverage;
        },
        
        getProcessing: function () {
            return this._processingAverage;
        }
    });
    
    

    Timer.Ticker = function (opt) {
        
        if (Util.isFunction(opt)) {
            opt = {
                callback: opt
            };
        }
        
        /**
         * çalıştırılacak method
         */
        this._callback = opt.callback;
        this._context = opt.context || this;
        
        /**
         * true ise callback çalıştırılmaz
         */
        this.pass = opt.pass;
        
        
        /**
         * çalışma sıklığı
         * zamanlayıcı frekansından yüksek olmalı
         */
        this.frequency = opt.frequency;
        /**
         * frequency için geçen zaman toplamı
         */
        this._total = 0;
        
        
        
        this.calculator = new Calculator({
            condition: 200,
            frequency: 16,
            processing: 16,
        });
    }
    
    
    
})();