"use strict";

/**
* Yasin Ekici 2016
*/

const fs = require('fs');


var log = function (obj) {
    console.log(JSON.stringify(obj , null , '\t'));
}


class Path {
    constructor (path , local , name) {
        /**
         * tüm yol adı
         */
        this.full = '';
        
        /**
         * dosyaarın bulunduğu dizin ile beraber adları
         */
        this.local = '';
        
        /**
         * dosya adları
         */
        this.name = '';
        
        if (typeof path === 'string') {
            this.full = path;
        } else if (path instanceof Path) {
            this.full = path.full;
            this.local = path.local;
            this.name = path.name;
        }
        
        if (local) {
            this.local = local;
        }
        if (name) {
            this.name = name;
        }
        
    }
}


class Concat {
    
    constructor (path) {
        /**
         * yüklenilecek dosyaların bulunduğu dizin
         */
        this._path = new Path(path);
        
        /**
         * bütün dosyalar
         */
        this._files = [];
        
        /**
         * dosya keyleri
         */
        this._filesKeys = [];
        
        /**
         * dosyaların içeriği verileri
         */
        this._filesData = [];
        
        /**
         * yüklenmiş dosyalar
         */
        this._loaded = [];
        
        /**
         * birleşitirilmiş dosya
         */
        this._file = null;
        
        
        this.read();
        
        this.loadFiles();
        
        this.handleFiles();
        
        this.run();
    }
    
    /**
     * 
     */
    searchFiles (key) {
        var i = 0,
            files = this._files,
            item;
        for (item of files) {
            if (item.local == key) {
                return i;
            }
            i++;
        }
        return false;
    }
    
    /**
     * belirtilen dizindeki dosyaları bulur
     */
    read (path , list , sub) {
        if (!path) {
            path = this._path;
        }
        
        if (typeof path === 'string') {
            path = new Path(path);
        }
        
        var dir = fs.readdirSync(path.full),
            nPath , i , item;

        
    
        list = list || [];
        if (dir.length > 0) {
            i = dir.length;
            for (item of dir) {
                nPath = new Path(path.full + '/' + item , path.local + (path.local ? '/' : '') + item);
                if (fs.lstatSync(nPath.full).isDirectory()) {
                    this.read(nPath , list , true);
                } else if (nPath.local.indexOf('.js') >= 0) {
                    list.push(new Path(nPath , null , item));
                }
            }
        }
        
        if (!sub) {
            this._files = list;
            
            item = this.searchFiles('starting.js');
            
            if (item !== false) {
                item = list.splice(item , 1);
                list.splice(0 , 0 , item[0]);
            }

            
            item = this.searchFiles('ending.js');
            if (item !== false) {
                item = list.splice(item , 1);
                list.push(item[0]);
            }
            
            
  
        }
        
        return list;
    }
    
    /**
     * dosyaları yükler
     */
    loadFiles () {
        if (this._files.length > 0) {
            var files = this._files,
                data = {
                    _length: 0
                },
                item;
            
            for (item of files) {

                data[item.local] = {
                    path: item,
                    data: fs.readFileSync(item.full , 'utf-8')
                };
                data._length++;
                
                
            }
            
            this._filesData = data;
        }
    }
    
    /**
     * sayfaları işler ve gereksinimlerini bulur
     */
    handleFiles () {
        if (this._filesData && this._filesData._length > 0) {
            var files = this._filesData,
                key , item , match , list , value;
            
            for (key in files) {
                if (key == '_length') continue;
                item = files[key];
                list = [];
                Concat.REGEX.lastIndex = 0;
                if (item.data) {
                    while ((match = Concat.REGEX.exec(item.data)) != null) {
                        value = match[1];
                        if (value) {
                            value = value.replace('.' , '/');
                            if (value.indexOf('.js') < 0) {
                                value += '.js';
                            }
                        }
                        list.push(value);
                    }
                }
                
                item.require = list;
            }
            
            
        }
    }
    
    /**
     * dosyaları birleştirir ve çıtıyı verir
     */
    run () {
        if (this._filesData && this._filesData._length > 0) { 
            var files = this._files,
                item;
                
            this._file = '';
            this._loaded = [];               
            
            for (item of files) {
                this._addFile(item.local);
            }
            
        }
    }
    
    
    _addFile (key , prev) {
        if (this._filesData) {
            var data = this._filesData,
                item , value;
            
            if (this._loaded.indexOf(key) > -1) {
                return;
            }
            
            

            if (data[key]) {
                item = data[key];
                if (item.require && item.require.length > 0) {
                    for (value of item.require) {
                        if (prev == value) {
                            log(`infinity:${value} , ${key}`);
                            break;
                        }
                        this._addFile(value , key);
                    }
                }
                this._loaded.push(key);
                this._file += item.data + '\r\n\r\n';
            }
        }
    }
    
    get files () {
        return this._files;
    }
    
    get file () {
        return this._file;
    }
    
    get loaded () {
        return this._loaded;
    }
    
    get filesData () {
        return this._filesData;
    }
    
    
}

Concat.REGEX = new RegExp('^// require\:(.+)$' , 'mg');

module.exports = {
    run: function (path , response) {
        console.log(`------${(new Date()).toLocaleString()}------`);
        var concat = new Concat(path),
            counter = 5;
        
        response.writeHead(200, {
            'Content-Type': 'text/javascript; charset=utf-8',
        });

        response.write(`//path = ${path}\n`);
        for (let value of concat.loaded) {
            if (counter++ > 4) {
                response.write(`\n//Loaded: `);
                counter = 0;
            }
            response.write(`${value} , `);
        }
        
        response.write('\n');
        
        response.write(concat.file);
        
    },
}

