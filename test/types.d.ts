import {YMap,  YMapMarker, LngLat} from '@yandex/ymaps3-types';

declare global {
    let map: YMap;

    interface Window {
        map: YMap;
    }
}

export {};
