(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeColors = exports.getNews = void 0;
function getNews() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let result = yield fetch('http://127.0.0.1:8000/api/news_weekly');
            let news = yield result.json();
            console.log('Ответ от API:', news);
            return news;
        }
        catch (error) {
            console.error('Ошибка при выполнении запроса:', error);
        }
    });
}
exports.getNews = getNews;
exports.typeColors = {
    "Благоустройство": "#A6C48A",
    "Выборы": "#FFD700",
    "Городское управление": "#00BFFF",
    "Городское хозяйство": "#00BFFF",
    "Здравоохранение": "#FF4500",
    "Культура": "#E6D500",
    "Образование": "#FFD700",
    "Происшествия": "#FF0000",
    "Развлечения": "#FF69B4",
    "Социальная сфера": "#87CEFA",
    "Спорт": "#32CD32",
    "Строительство и реконструкция": "#D2691E",
    "Технологии": "#4682B4",
    "Транспорт": "#D2B48C",
    "Туризм": "#FF6347",
    "Экология": "#228B22",
    "Экономика и предпринимательство": "#8B0000",
    "ГУ МВД РФ по Г. Москве": "#0000CD"
};

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.boundsToPolygonCoordinates = exports.LOCATION = exports.RESTRICT_AREA = exports.NEW_LOCATION_CENTER = exports.ZOOM_RANGE = void 0;
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

},{}],3:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_work_1 = require("./api_work");
const common_1 = require("./common");
function initMap() {
    return __awaiter(this, void 0, void 0, function* () {
        yield ymaps3.ready;
        const { YMap, YMapDefaultSchemeLayer, YMapFeature, YMapDefaultFeaturesLayer, YMapControls } = ymaps3;
        const { YMapGeolocationControl, YMapZoomControl } = yield ymaps3.import('@yandex/ymaps3-controls@0.0.1');
        const map = new YMap(document.getElementById('map'), {
            location: common_1.LOCATION,
            restrictMapArea: common_1.RESTRICT_AREA,
            zoomRange: common_1.ZOOM_RANGE,
        });
        map.addChild(new YMapDefaultSchemeLayer({}));
        map.addChild(new YMapDefaultFeaturesLayer({}));
        const borderPolygon = new YMapFeature({
            id: 'polygon',
            geometry: {
                type: 'Polygon',
                coordinates: [(0, common_1.boundsToPolygonCoordinates)(common_1.RESTRICT_AREA)]
            },
            style: {
                stroke: [{ width: 12, color: '#007afce6' }],
                fill: 'rgba(0, 0, 0, 0)'
            }
        });
        map.addChild(borderPolygon);
        const controls = new YMapControls({ position: 'top left' });
        controls.addChild(new YMapGeolocationControl({}));
        controls.addChild(new YMapZoomControl({}));
        map.addChild(controls);
        window.map = map;
    });
}
function createMarkers(map, news) {
    function changeMapPosition(location, camera, geo) {
        console.log(map.center);
        if (map.zoom >= 14) {
            map.update({ location: { duration: 5000 }, camera });
        }
        else if (map.zoom < 14) {
            map.update({ location: { center: geo, zoom: 14, duration: 5000 }, camera });
        }
    }
    const { YMapMarker, YMapComplexEntity } = ymaps3;
    class CustomMarkerWithPopup extends YMapComplexEntity {
        constructor() {
            super(...arguments);
            this._popup = null;
            this.isOpen = false;
        }
        _onAttach() {
            this._createMarker();
        }
        _onDetach() {
            this._marker = null;
        }
        _onUpdate(props) {
            var _a, _b;
            if (props.zIndex !== undefined) {
                (_a = this._marker) === null || _a === void 0 ? void 0 : _a.update({ zIndex: props.zIndex });
            }
            if (props.coordinates !== undefined) {
                (_b = this._marker) === null || _b === void 0 ? void 0 : _b.update({ coordinates: props.coordinates });
            }
        }
        _createMarker() {
            const element = document.createElement('div');
            element.className = 'marker';
            element.onclick = () => {
                this._openPopup();
            };
            const hint = document.createElement('div');
            hint.className = 'hint';
            const title = document.createElement('a');
            title.textContent = this._props.newsTitle;
            hint.append(title);
            element.onmouseenter = () => {
                if (this.isOpen != true && !element.contains(hint)) {
                    element.append(hint);
                }
            };
            element.onmouseleave = () => {
                if (element.contains(hint)) {
                    element.removeChild(hint);
                }
            };
            this._marker = new YMapMarker({ coordinates: this._props.coordinates }, element);
            this.addChild(this._marker);
        }
        _openPopup() {
            var _a;
            if (this._popup) {
                return;
            }
            this.isOpen = true;
            changeMapPosition(null, { tilt: (45 * Math.PI) / 180 }, this._props.coordinatesZoom);
            const element = document.createElement('div');
            element.className = 'vmmap-popup';
            element.style.cssText = 'left: -130px; top: -361px;';
            const panel = document.createElement('div');
            panel.className = 'popup-panel';
            const typeColor = api_work_1.typeColors[this._props.type] || '#FFFFFF';
            panel.style.background = typeColor;
            const closeBtn = document.createElement('button');
            closeBtn.className = 'close';
            closeBtn.textContent = 'Закрыть';
            closeBtn.onclick = () => this._closePopup();
            panel.append(closeBtn);
            element.append(panel);
            const wrp = document.createElement('div');
            wrp.className = 'vmpopup-wrp';
            element.append(wrp);
            const mainEl = document.createElement('div');
            mainEl.className = 'main-el';
            mainEl.style.cssText = 'overflow: hidden; height: auto; width: 260px; display: block;';
            wrp.append(mainEl);
            if (this._props.newsImg != null) {
                const cover = document.createElement('div');
                cover.className = 'vmpopup-cover';
                const a = document.createElement('a');
                const img = document.createElement('img');
                let src = this._props.newsImg;
                img.setAttribute('src', src);
                a.append(img);
                cover.append(a);
                mainEl.append(cover);
            }
            const h2 = document.createElement('h2');
            const title = document.createElement('a');
            title.textContent = this._props.newsTitle;
            let link = this._props.newsLink;
            title.setAttribute('href', link);
            h2.append(title);
            mainEl.append(h2);
            const footer = document.createElement('div');
            footer.className = 'vmpopup-footer';
            const time = document.createElement('div');
            time.className = 'time';
            time.textContent = this._props.newsDate;
            footer.append(time);
            mainEl.append(footer);
            const arrow = document.createElement('div');
            arrow.className = 'arrow';
            element.append(arrow);
            const zIndex = ((_a = this._props.zIndex) !== null && _a !== void 0 ? _a : YMapMarker.defaultProps.zIndex) + 1000;
            this._popup = new YMapMarker({ coordinates: this._props.coordinates, zIndex }, element);
            this.addChild(this._popup);
            const markerRect = wrp.getBoundingClientRect();
            console.log(markerRect);
            console.log(markerRect.height);
            let top = markerRect.height + 42;
            console.log('+42: ' + top);
            element.style.top = '-' + top + 'px';
        }
        _closePopup() {
            if (!this._popup) {
                return;
            }
            this.isOpen = false;
            this._popup.element.className = 'vmmap-popup hidden';
            setTimeout(() => {
                this.removeChild(this._popup);
                this._popup = null;
            }, 500);
        }
    }
    news.forEach(item => {
        const marker = new CustomMarkerWithPopup({
            coordinates: [parseFloat(item.lng), parseFloat(item.lat)],
            coordinatesZoom: [parseFloat(item.lng), parseFloat(item.lat) + 0.009],
            newsTitle: item.title,
            newsDate: item.date,
            newsLink: item.link,
            newsImg: item.image,
            type: item.type
        });
        map.addChild(marker);
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const news = yield (0, api_work_1.getNews)();
        yield initMap();
        createMarkers(window.map, news);
    });
}
window.map = null;
main();

},{"./api_work":1,"./common":2}]},{},[3,2,1]);
