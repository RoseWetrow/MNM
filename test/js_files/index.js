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
    return __awaiter(this, arguments, void 0, function* (show = false) {
        yield ymaps3.ready;
        const { YMap, YMapDefaultSchemeLayer, YMapFeature, YMapDefaultFeaturesLayer, YMapControls, YMapControlButton } = ymaps3;
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
        const weeklyButton = new YMapControlButton({
            text: 'Недельные новости',
            color: '#fff',
            background: '#007afce6',
            onClick: showWeeklyNews
        });
        controls.addChild(weeklyButton);
        const todayButton = new YMapControlButton({
            text: 'Новости за сегодня',
            color: '#fff',
            background: '#007afce6',
            onClick: showTodayNews
        });
        controls.addChild(todayButton);
        if (show) {
            const showButton = new YMapControlButton({
                text: 'Обзор новостей',
                color: '#fff',
                background: '#f00',
                onClick: viewTodayNews
            });
            controls.addChild(showButton);
        }
        window.map = map;
    });
}
function showWeeklyNews() {
    return __awaiter(this, void 0, void 0, function* () {
        stopAutoRotate();
        console.log('Недельные новости');
        map.destroy();
        map = null;
        yield initMap();
        const news = yield (0, api_work_1.getNewsWeekly)();
        createMarkers(window.map, news);
    });
}
function showTodayNews() {
    return __awaiter(this, void 0, void 0, function* () {
        stopAutoRotate();
        console.log('Новости за сегодня');
        map.destroy();
        map = null;
        yield initMap(true);
        const news = yield (0, api_work_1.getNewsToday)();
        createMarkers(window.map, news);
    });
}
let behaviors = common_1.INITIALLY_ENABLED_BEHAVIORS;
let frame = 0;
let hasAutoRotate = false;
let timeouts = [];
let currentMarkerIndex = 0;
let markers = [];
function viewTodayNews() {
    return __awaiter(this, void 0, void 0, function* () {
        stopAutoRotate();
        console.log('Обзор новостей за день');
        map.destroy();
        map = null;
        yield initMap(true);
        const news = yield (0, api_work_1.getNewsToday)();
        markers = createMarkersForView(window.map, news);
        hasAutoRotate = true;
        yield showMarkersSequentially();
    });
}
function showMarkersSequentially() {
    return __awaiter(this, arguments, void 0, function* (index = 0) {
        if (index >= markers.length) {
            stopAutoRotate();
            map.update({ location: { center: [37.623082, 55.75254], zoom: 9, duration: 4000 }, camera: { tilt: (0 * (Math.PI / 180)) } });
            setTimeout(() => { showTodayNews(); }, 4000);
        }
        console.log('Ало');
        currentMarkerIndex = index;
        behaviors = behaviors.filter((behavior) => behavior !== 'drag');
        behaviors = behaviors.filter((behavior) => behavior !== 'scrollZoom');
        behaviors = behaviors.filter((behavior) => behavior !== 'dblClick');
        map.setBehaviors(behaviors);
        const marker = markers[index];
        function changeMapPosition(coordinatesZoom) {
            function changeZoome() {
                if (marker._props.source == 'vm') {
                    map.update({ location: { center: coordinatesZoom, zoom: 17, duration: 4000 }, camera: { tilt: (50 * (Math.PI / 180)) } });
                }
                else {
                    map.update({ location: { center: coordinatesZoom, zoom: 15, duration: 4000 }, camera: { tilt: (50 * (Math.PI / 180)) } });
                }
            }
            changeZoome();
            function startAutoRotationCamera() {
                changeZoome();
                if (hasAutoRotate) {
                    map.update({ camera: { azimuth: map.azimuth + (10 * Math.PI) / 180 / 120 } });
                    frame = requestAnimationFrame(startAutoRotationCamera);
                }
                else {
                    cancelAnimationFrame(frame);
                }
            }
            const timeoutId = window.setTimeout(startAutoRotationCamera, 4000);
            timeouts.push(timeoutId);
        }
        changeMapPosition(marker._props.coordinatesZoom);
        marker._openPopup();
        const timeoutId = setTimeout(() => {
            if (hasAutoRotate) {
                marker._closePopup();
                cancelAnimationFrame(frame);
                showMarkersSequentially(index + 1);
            }
        }, 15000);
        timeouts.push(timeoutId);
    });
}
function stopAutoRotate() {
    timeouts.forEach(timeoutId => clearTimeout(timeoutId));
    timeouts = [];
    cancelAnimationFrame(frame);
    hasAutoRotate = false;
}
function nextMarker() {
    cancelAnimationFrame(frame);
    timeouts.forEach(timeoutId => clearTimeout(timeoutId));
    showMarkersSequentially(currentMarkerIndex + 1);
}
function previousMarker() {
    if (currentMarkerIndex == 0)
        return;
    markers[currentMarkerIndex]._closePopup();
    cancelAnimationFrame(frame);
    timeouts.forEach(timeoutId => clearTimeout(timeoutId));
    showMarkersSequentially(currentMarkerIndex - 1);
}
function createMarkersForView(map, news) {
    const markers = [];
    const { YMapMarker, YMapComplexEntity } = ymaps3;
    class CustomMarkerWithPopup extends YMapComplexEntity {
        constructor() {
            super(...arguments);
            this._popup = null;
            this.isOpen = false;
            this.minHeight = 0;
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
            const typeColor = api_work_1.typeColors[this._props.type] || 'rgb(215 215 215)';
            element.style.backgroundColor = typeColor;
            this._marker = new YMapMarker({ coordinates: this._props.coordinates }, element);
            this.addChild(this._marker);
            markers.push(this);
        }
        _openPopup() {
            var _a;
            if (this._popup) {
                return;
            }
            this.isOpen = true;
            const element = document.createElement('div');
            element.className = 'map-popup-view';
            element.style.cssText = 'left: -130px; top: -150px;';
            const panel = document.createElement('div');
            panel.className = 'popup-panel';
            const typeColor = api_work_1.typeColors[this._props.type] || 'rgb(215 215 215)';
            panel.style.background = typeColor;
            const nextBtn = document.createElement('button-next');
            nextBtn.className = 'next';
            nextBtn.onclick = () => {
                this._closePopup();
                nextMarker();
            };
            const previousBtn = document.createElement('button-previous');
            previousBtn.className = 'previous';
            previousBtn.onclick = () => {
                previousMarker();
            };
            panel.append(nextBtn);
            panel.append(previousBtn);
            element.append(panel);
            const wrp = document.createElement('div');
            wrp.className = 'popup-wrp';
            element.append(wrp);
            const mainEl = document.createElement('div');
            mainEl.className = 'main-el';
            mainEl.style.cssText = 'overflow: hidden; height: auto; width: 260px; display: block;';
            wrp.append(mainEl);
            if (this._props.newsImg != null) {
                const cover = document.createElement('div');
                cover.className = 'popup-cover';
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
            footer.className = 'popup-footer';
            const time = document.createElement('div');
            time.className = 'time';
            time.textContent = this._props.newsDate;
            footer.append(time);
            if (this._props.description != null) {
                const description = document.createElement('a');
                description.className = 'description-link';
                description.textContent = 'подробнее';
                description.onclick = () => this._openDescription(mainEl, wrp, panel);
                footer.append(description);
            }
            mainEl.append(footer);
            const zIndex = ((_a = this._props.zIndex) !== null && _a !== void 0 ? _a : YMapMarker.defaultProps.zIndex) + 1000;
            this._popup = new YMapMarker({ coordinates: this._props.coordinates, zIndex }, element);
            this.addChild(this._popup);
            const markerRect = wrp.getBoundingClientRect();
            wrp.style.minHeight = markerRect.height + 'px';
            this.minHeight = markerRect.height;
        }
        _closePopup() {
            if (!this._popup) {
                return;
            }
            this.isOpen = false;
            this._popup.element.className = 'map-popup hidden';
            setTimeout(() => {
                this.removeChild(this._popup);
                this._popup = null;
            }, 500);
        }
        _openDescription(mainEl, wrp, panel) {
            if (!this._popup) {
                return;
            }
            if (mainEl) {
                timeouts.forEach(timeoutId => clearTimeout(timeoutId));
                timeouts = [];
                const descriptionEl = document.createElement('div');
                descriptionEl.className = 'description-text';
                descriptionEl.textContent = this._props.description;
                const a = document.createElement('a');
                a.textContent = 'Читать в источнике';
                a.className = 'description-text-link';
                let link = this._props.newsLink;
                a.setAttribute('href', link);
                Array.from(panel.children).forEach(child => {
                    if (child instanceof HTMLElement) {
                        child.style.display = 'none';
                    }
                });
                const backBtn = document.createElement('button');
                backBtn.className = 'back';
                backBtn.onclick = () => this._closeDescription(mainEl, descriptionEl, a, backBtn, panel);
                panel.append(backBtn);
                Array.from(mainEl.children).forEach(child => {
                    if (child instanceof HTMLElement) {
                        child.style.display = 'none';
                    }
                });
                mainEl.append(descriptionEl);
                mainEl.append(a);
            }
        }
        _closeDescription(mainEl, descriptionEl, a, backBtn, panel) {
            const timeoutId = setTimeout(() => {
                if (hasAutoRotate) {
                    this._closePopup();
                    cancelAnimationFrame(frame);
                    showMarkersSequentially(currentMarkerIndex + 1);
                }
            }, 15000);
            timeouts.push(timeoutId);
            mainEl.removeChild(descriptionEl);
            mainEl.removeChild(a);
            panel.removeChild(backBtn);
            Array.from(panel.children).forEach(child => {
                if (child instanceof HTMLElement) {
                    child.style.display = '';
                }
            });
            Array.from(mainEl.children).forEach(child => {
                if (child instanceof HTMLElement) {
                    child.style.display = '';
                }
            });
        }
    }
    news.forEach(item => {
        const marker = new CustomMarkerWithPopup({
            coordinates: [parseFloat(item.lng), parseFloat(item.lat)],
            coordinatesZoom: [parseFloat(item.lng), parseFloat(item.lat) + 0.001],
            newsTitle: item.title,
            newsDate: item.date,
            newsLink: item.link,
            newsImg: item.image,
            type: item.type,
            source: item.source,
            description: item.description
        });
        map.addChild(marker);
    });
    return markers;
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
            this.minHeight = 0;
            this.top = 0;
            this.indentationNotNeed = false;
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
            const typeColor = api_work_1.typeColors[this._props.type] || 'rgb(215 215 215)';
            element.style.backgroundColor = typeColor;
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
            element.className = 'map-popup';
            const panel = document.createElement('div');
            panel.className = 'popup-panel';
            const typeColor = api_work_1.typeColors[this._props.type] || 'rgb(215 215 215)';
            panel.style.background = typeColor;
            const closeBtn = document.createElement('button');
            closeBtn.className = 'close';
            closeBtn.onclick = () => this._closePopup();
            panel.append(closeBtn);
            element.append(panel);
            const wrp = document.createElement('div');
            wrp.className = 'popup-wrp';
            element.append(wrp);
            const mainEl = document.createElement('div');
            mainEl.className = 'main-el';
            wrp.append(mainEl);
            if (this._props.newsImg != null) {
                const cover = document.createElement('div');
                cover.className = 'popup-cover';
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
            footer.className = 'popup-footer';
            const time = document.createElement('div');
            time.className = 'time';
            time.textContent = this._props.newsDate;
            footer.append(time);
            if (this._props.description != null) {
                const description = document.createElement('a');
                description.className = 'description-link';
                description.textContent = 'подробнее';
                description.onclick = () => this._openDescription(mainEl, wrp, panel);
                footer.append(description);
            }
            mainEl.append(footer);
            const arrow = document.createElement('div');
            arrow.className = 'arrow';
            element.append(arrow);
            const zIndex = ((_a = this._props.zIndex) !== null && _a !== void 0 ? _a : YMapMarker.defaultProps.zIndex) + 1000;
            this._popup = new YMapMarker({ coordinates: this._props.coordinates, zIndex }, element);
            this.addChild(this._popup);
            const markerRect = wrp.getBoundingClientRect();
            this.addingIndentation(markerRect);
            wrp.style.minHeight = markerRect.height + 'px';
            this.minHeight = markerRect.height;
            this.top = markerRect.top;
        }
        _closePopup(back = false) {
            if (!this._popup) {
                return;
            }
            this.isOpen = false;
            this._popup.element.className = 'map-popup hidden';
            setTimeout(() => {
                this.removeChild(this._popup);
                this._popup = null;
                if (back) {
                    this._openPopup();
                }
            }, 500);
        }
        _openDescription(mainEl, wrp, panel) {
            if (!this._popup) {
                return;
            }
            if (mainEl) {
                const descriptionEl = document.createElement('div');
                descriptionEl.className = 'description-text';
                descriptionEl.textContent = this._props.description;
                const a = document.createElement('a');
                a.textContent = 'Читать в источнике';
                a.className = 'description-text-link';
                let link = this._props.newsLink;
                a.setAttribute('href', link);
                const backBtn = document.createElement('button');
                backBtn.className = 'back';
                backBtn.onclick = () => this._closeDescription(mainEl, descriptionEl, a, backBtn, panel, wrp);
                panel.append(backBtn);
                Array.from(mainEl.children).forEach(child => {
                    if (child instanceof HTMLElement) {
                        child.style.display = 'none';
                    }
                });
                mainEl.append(descriptionEl);
                mainEl.append(a);
                const markerRect = wrp.getBoundingClientRect();
                if (this.minHeight < markerRect.height) {
                    this.addingIndentation(markerRect);
                }
                else {
                    this.indentationNotNeed = true;
                }
            }
        }
        _closeDescription(mainEl, descriptionEl, a, backBtn, panel, wrp) {
            mainEl.removeChild(descriptionEl);
            mainEl.removeChild(a);
            panel.removeChild(backBtn);
            Array.from(mainEl.children).forEach(child => {
                if (child instanceof HTMLElement) {
                    child.style.display = '';
                }
            });
            if (!this.indentationNotNeed) {
                const markerRect = wrp.getBoundingClientRect();
                this.addingIndentation(markerRect);
            }
        }
        addingIndentation(markerRect) {
            console.log('РОБИТ');
            console.log(markerRect);
            let top = markerRect.height + 42;
            console.log('+42: ' + top);
            this._popup.element.style.top = '-' + top + 'px';
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
            type: item.type,
            description: item.description
        });
        map.addChild(marker);
    });
    map.addChild(new CustomMarkerWithPopup({ coordinates: [37.936734, 56.129751], coordinatesZoom: [37.936734, 56.129751 + 0.009], newsTitle: 'Тут живет Андрей Кинжалов', newsDate: '17.06.24 в 18:00', newsLink: '', newsImg: 'https://sun1-84.userapi.com/s/v1/ig2/Cjk7craNEn8JHhwGEE5g010KoJqrNTyDQhPNzzZzmfRsF-TBvUpVfdUOghWhpz46EhmbuGscgE96AU_DdT6WhHWD.jpg?size=400x400&quality=96&crop=377,334,721,721&ava=1', type: 'dfdf', description: 'Тут живет Андрей Кинжалов!!!' }));
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const news = yield (0, api_work_1.getNewsWeekly)();
        yield initMap();
        createMarkers(window.map, news);
    });
}
window.map = null;
main();
