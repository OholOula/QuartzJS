// Quartz.Element.Image
// require:drawing.element
(function () {

    /**
     * Resim nesnesi oluşturur
     * @param opt
     * @constructor
     */
    Element.Image = function (opt , a , b , c , d) {
        if (opt instanceof Image)
            opt.texture = new Texture(opt , a , b , c , d);

        if (opt instanceof Loader.Image)
            opt.texture = new Texture(opt.image , a , b , c , d);

        if (opt instanceof Texture)
            opt = {texture: opt};


        Element.Rectangle.call(this , opt);


        if (!opt.texture) {
            throw new Error('Kaplama Bulunamadı.');
        }


        this.texture = opt.texture;

        /**
         * width ve height değerleri yok ise dokunun width ve height değerleri kullanılır
         * hasOwnProperty kullanam sebebi üstteki image elemetininde width ve height değeri var
         * Rectangle çağırılınca width ve height o oluyor ama biz kaplanın width ve height istiyoruz
         * Eğer nesneye ait property yoksa width ve height kaplamanınki yapıyor
         */
        if (!opt.hasOwnProperty('width'))
            this.width = this.texture.size.width;
        if (!opt.hasOwnProperty('height'))
            this.height = this.texture.size.height;

    };

    Util.inherit(Element.Image , Element.Rectangle);

    Util.assign(Element.Image.prototype , {
        draw: function (context) {
            if (this.texture) {
                var t = this.texture,
                    c = t.getBufferCanvas();
                
                context.drawImage(c , 0 , 0 ,t.size.width , t.size.height , 0 , 0 , this.width , this.height);

                if (this.stroke || this.fill) {
                    context.rect(0 , 0 , this.width , this.height);
                }

            }
        },
        clone: function () {
            return new Element.Image(this);
        }
    });

})();