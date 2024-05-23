import type {ZoomRange, LngLatBounds, LngLat, YMapLocationRequest} from '@yandex/ymaps3-types';



export const ZOOM_RANGE: ZoomRange = {min: 11, max: 19}; 
export const NEW_LOCATION_CENTER = 0; 

// Определяем границу всей земли
// const worldBounds: LngLatBounds = [
//     [-90, -180], // Юго-западный угол мира
//     [90, 180]    // Северо-восточный угол мира
// ];

// Bounding box - bottom left and top right corners
export const RESTRICT_AREA: LngLatBounds = [
    [36.659950, 55.439766],  // юго-запад  
    [38.598013, 56.323066]   // северо-восток 
];

// Добавление начального центра и зума 
export const LOCATION: YMapLocationRequest = {
    center: [37.623082, 55.75254], // starting position [lng, lat] 55.750147, 37.624071
    zoom: 9 // starting zoom
};

// From the coordinates of bottom left and top right corners, we make 4 coordinates of the rectangle
export function boundsToPolygonCoordinates(bounds: LngLatBounds): LngLat[] {
    return [bounds[0], [bounds[1][0], bounds[0][1]], bounds[1], [bounds[0][0], bounds[1][1]]];
}

