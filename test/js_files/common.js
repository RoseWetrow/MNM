"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AVAILABLE_BEHAVIORS = exports.INITIALLY_ENABLED_BEHAVIORS = exports.boundsToPolygonCoordinates = exports.LOCATION = exports.RESTRICT_AREA = exports.NEW_LOCATION_CENTER = exports.ZOOM_RANGE = void 0;
exports.ZOOM_RANGE = { min: 11, max: 19 };
exports.NEW_LOCATION_CENTER = 0;
exports.RESTRICT_AREA = [
    [36.659950, 55.439766],
    [38.598013, 56.323066]
];
exports.LOCATION = {
    center: [37.623082, 55.75254],
    zoom: 9
};
function boundsToPolygonCoordinates(bounds) {
    return [bounds[0], [bounds[1][0], bounds[0][1]], bounds[1], [bounds[0][0], bounds[1][1]]];
}
exports.boundsToPolygonCoordinates = boundsToPolygonCoordinates;
exports.INITIALLY_ENABLED_BEHAVIORS = ['drag', 'scrollZoom', 'dblClick'];
exports.AVAILABLE_BEHAVIORS = ['drag', 'scrollZoom', 'dblClick', 'mouseRotate', 'mouseTilt'];
