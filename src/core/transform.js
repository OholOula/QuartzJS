// Quartz.Transform
// require:core.util
// require:core.point

var Transform = null;

(function () {


    /**
     * Dönüşüm
     * @param matrix - Array
     */
    Transform = qz.Transform = function (matrix) {
        this.matrix = (matrix || defaultMatrix).slice();
    };

    // varsayılan matris
    // tanımlamalar
    // 0-scaleX      2-skewY     4-translateX
    // 1-skewX       3-scaleY    5-translateY
    // 0
    var defaultMatrix = [1 , 0 , 0 , 1 , 0 , 0],
        tempMatrix = defaultMatrix.slice(),
        tempTransform = new Transform,
        tfp = Transform.prototype,
        setMatrix = function (m , n) {
            m[0] = n[0];
            m[1] = n[1];
            m[2] = n[2];
            m[3] = n[3];
            m[4] = n[4];
            m[5] = n[5];
            return m;
        };
        
        
    Util.assign(Transform.prototype , {
        /**
         * mevcut matrisi döndürür
         */
        get: function () {
            return this.matrix;
        },

        /**
         * mevcut matrisinin değerlerini yeni matrisin değerleri yapar
         */
        set: function (n) {
            n = n instanceof Transform ? n.get() : typeof n == 'number' ? arguments : n;
            setMatrix(this.matrix , n);
            return this.matrix;
        },

        /**
         * matris dizisinin kopyasını döndürür
         */
        copy: function () {
            return this.matrix.slice();
        },

        /**
         * mevcut transformu kopyalar
         */
        clone: function () {
            return new transform(this.get());
        },

        /**
         * mevcut matrisi varsayılan değerleri atar
         */
        toDefault: function () {
            this.set(defaultMatrix);
        },

        /**
         * matris çarpımı
         * unbound true ise çıkan sonuç mevcut matrise atanmaz.sonucun kopyası döndürülür
         * m0 m2 m4     n0 n2 n4     m0*n0 + m2*n1     m0*n2 + m2*n3    m0*n4 + m2*n5 + m4
         * m1 m3 m5  x  n1 n3 n5  =  m1*n0 + m3*n1     m1*n2 + m3*n3    m1*n4 + m3*n5 + m5
         * 0  0  1      0  0  1      0
         * multiply[matrix , unbound];
         * multiply[0 , 0 , 0 , 0 , 0 , 0 , unbound]
        */
        multiply: function () {
            var m = this.get(),
                isArray = arguments[0] ? Util.isArray(arguments[0]) : false,
                n = isArray ? arguments[0] : arguments,
                unbound = n[isArray ? 1 : 6] === true,
                t = tempMatrix;

            t[0] = m[0] * n[0] + m[2] * n[1];
            t[1] = m[1] * n[0] + m[3] * n[1];

            t[2] = m[0] * n[2] + m[2] * n[3];
            t[3] = m[1] * n[2] + m[3] * n[3];

            t[4] = m[0] * n[4] + m[2] * n[5] + m[4];
            t[5] = m[1] * n[4] + m[3] * n[5] + m[5];


            return !unbound ? this.set(t) : t.slice();
        },

        /**
         * ölçeklendirme
         * matris çarpımı yapıyoruz.[x , 0 , 0 , y , 0 , 0] matrisi ile mevcut matrisi çarpıyoruz
         * hız için etkilenecek sonuçları üstteki matrix çarpımı sonucundan tespit edip
         * tek tek çarpılır.
         */
        scale: function (x , y , offset , oy) {
            x = x || 1;
            y = y || 1;

            if (offset != null) {
                offset = Point(offset , oy);
                this.translate(offset.x , offset.y);
            }

            this.matrix[0] *= x;
            this.matrix[1] *= x;
            this.matrix[2] *= y;
            this.matrix[3] *= y;

            if (offset)
                this.translate(-offset.x , -offset.y);

            return this;
        },

        /**
         * konumlandırma
         */
        translate: function (x , y) {
            x = x || 0;
            y = y || 0;

            this.matrix[4] += this.matrix[0] * x + this.matrix[2] * y;
            this.matrix[5] += this.matrix[1] * x + this.matrix[3] * y;
            return this;
        },

        /**
         * eğme
         */
        skew: function (x , y) {
            this.multiply(1 , (x || 0) , (y || 0) , 1 , 0 , 0);
            return this;
        },

        /**
         * döndürme
         * https://en.wikipedia.org/wiki/Rotation_matrix
         */
        rotate: function (radian , offset  , y) {
            var c = Math.cos(radian),
                s = Math.sin(radian);
            if (offset != null) {
                offset = Point(offset , y);
                this.translate(offset.x , offset.y);
            }

            this.multiply(c , s , -s , c , 0 , 0);

            if (offset)
                this.translate(-offset.x , -offset.y);

            return this;
        },


        /**
         * determinatı hesaplar
         */
        determinant: function () {
            var m = this.get();
            return m[0] * m[3] - m[1] * m[2];
        },


        /**
         * matrisin tersini hesaplar
         */
        inverse: function (unbound) {
            var dt = 1 / this.determinant(),
                m = this.get(),
                n = tempMatrix;

            n[0] = m[3] * dt;
            n[1] = -m[1] * dt;
            n[2] = -m[2] * dt;
            n[3] = m[0] * dt;
            n[4] = (m[2] * m[5] - m[3] * m[4]) * dt;
            n[5] = -(m[0] * m[5] - m[1] * m[4]) * dt;

            return !unbound ? this.set(n) : n.slice();
        },

        /**
         * belirtilen noktanın mevcut matriste göre hangi noktaya denk geldiğini döndürür
         */
        point: function (x , y) {
            var p = Point(x , y),
                m = this.get(),
                t = tempMatrix;

            t[4] = m[0] * p.x + m[2] * p.y + m[4];
            t[5] = m[1] * p.x + m[3] * p.y + m[5];

            return new Point(t[4] , t[5]);
        },

        /**
         * belirtilen noktayı mevcut matrise gömer ve hangi noktaya denk geldiğini döndürür
         */
        flush: function (x , y , m) {

            var inverse, p;

            inverse = m || (Util.isArray(y) && y.length == 6 ? y : null);



            if (!inverse) {
                tempTransform.set(this.get());
                tempTransform.inverse();
            } else {
                tempTransform.set(inverse);
            }


            p = Point.control(x , y);
            m = tempTransform.translate(p.x , p.y).get();
            return new Point(m[4] , m[5]);
        }
    });






})();