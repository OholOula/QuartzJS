// Quartz.Input.Input
// require:core.util
// require:input.input
// require:input.keyboard
// require:input.pointer



(function () {

    /**
     * Olayı işleyicisi
     * @constructor
     */
    Input.Handler = function (event , element , original) {
        var point;

        /**
         * olay pointera aitse,
         * olaya target , targetX ve targetY ekler
         */
        if (event instanceof PointerEvent) {
            if (element && element.getPointDistance) {
                point = element.getPointDistance(event.offsetX , event.offsetY);
                event.target = element;
                event.targetX = point.x;
                event.targetY = point.y;
            }

            if (original) {
                event.originalTarget = original;
            }
        }

        return event;
    };


})();