// import {RESTRICT_AREA, ZOOM_RANGE, boundsToPolygonCoordinates, LOCATION, NEW_LOCATION_CENTER} from './common';
// import type {LngLat, YMapMarker, YMapCameraRequest, YMapLocationRequest} from '@yandex/ymaps3-types';


// window.map = null;

// main();
// async function main() {
    
//     // Waiting for all api elements to be loaded
//     await ymaps3.ready;
//     const {YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapFeature, YMapControls, YMapMarker, YMapComplexEntity} = ymaps3;

//     // Load the control package and extract the geolocation control from it КАСТОМ МАРКЕР
//     const {YMapGeolocationControl, YMapZoomControl} = await ymaps3.import('@yandex/ymaps3-controls@0.0.1');

//     // Функция изменения положения камеры при открытии маркера
//     function changeMapPosition(location: YMapLocationRequest, camera: YMapCameraRequest, geo) {
//         map.update({location: {center: geo, zoom: 14, duration: 5000}, camera});
//     }

//     // Create a custom marker class with a popup
//     interface CustomMarkerWithPopupProps {
//         coordinates: LngLat; // marker position [lng, lat]
//         imgLink: string;
//         newsTitle: string;
//         newsLink: string;
//         newsDate: string;
//         geo: LngLat;
//         zIndex?: number;
//     }
//     class CustomMarkerWithPopup extends YMapComplexEntity<CustomMarkerWithPopupProps> {
//         private _marker: YMapMarker;
//         private _popup: YMapMarker | null = null;

//         // Handler for attaching the control to the map
//         _onAttach() {
//             this._createMarker();
//         }
//         // Handler for detaching control from the map
//         _onDetach() {
//             this._marker = null;
//         }
//         // Handler for updating marker properties
//         _onUpdate(props: CustomMarkerWithPopupProps) {
//             if (props.zIndex !== undefined) {
//                 this._marker?.update({zIndex: props.zIndex});
//             }
//             if (props.coordinates !== undefined) {
//                 this._marker?.update({coordinates: props.coordinates});
//             }
//         }
//         // Method for creating a marker element
//         _createMarker() {
//             const element = document.createElement('div');
//             element.className = 'marker';
//             element.onclick = () => {
//                 this._openPopup();
//             };

//             this._marker = new YMapMarker({coordinates: this._props.coordinates}, element);
//             this.addChild(this._marker);
//         }

//         // Method for creating a popup window element
//         _openPopup() {
//             if (this._popup) {
//                 return;
//             }
            
//             // Приближаем камеру к метке при открытии
//             changeMapPosition(NEW_LOCATION_CENTER, {tilt: (45 * Math.PI) / 180}, this._props.geo);

//             // элемент-контейнер
//             const element = document.createElement('div');

//             let imgLink = this._props.imgLink;
//             let newsTitle = this._props.newsTitle;
//             let newsLink = this._props.newsLink;
//             let newsDate = this._props.newsDate;

//             popupElement(element,imgLink, newsTitle, newsLink, newsDate)



//             const zIndex = (this._props.zIndex ?? YMapMarker.defaultProps.zIndex) + 1_000;
//             this._popup = new YMapMarker({coordinates: this._props.coordinates, zIndex}, element);
//             this.addChild(this._popup);
//         }

//         _closePopup() {
//             if (!this._popup) {
//                 return;
//             }

//             this.removeChild(this._popup);
//             this._popup = null;
//         }
//     }

//     ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//     // Initialize the map
//     map = new YMap(
//         // Pass the link to the HTMLElement of the container
//         document.getElementById('map'),

//         // Pass the map initialization parameters, set the map location bounds with the current restricted area
//         {location: LOCATION, 
//         restrictMapArea: RESTRICT_AREA, 
//         zoomRange: ZOOM_RANGE, // Если текущий масштаб выходит за пределы этой настройки, то кнопки увеличения или уменьшения масштаба блокируются.
//         }, 
//         // Add a map schema layer and a geo objects layer
//         [new YMapDefaultSchemeLayer({}), new YMapDefaultFeaturesLayer({})],
        
//     );

//     // Create and add a polygon to the map that will mark the border of the map restrict area
//     const borderPolygon = new YMapFeature({
//         id: 'polygon',
//         geometry: {
//             type: 'Polygon',
//             coordinates: [boundsToPolygonCoordinates(RESTRICT_AREA)]
//         },
//         style: {
//             stroke: [{width: 12, color: '#007afce6'}],
//             fill: 'rgba(0, 0, 0, 0)'
//         }
//     });
//     map.addChild(borderPolygon);


//     map.addChild(
//         // Using YMapControls you can change the position of the control
//         new YMapControls({position: 'top left'})
//             // Add the geolocation control to the map
//             .addChild(new YMapGeolocationControl({}))
//     );
    
//     map.addChild(
//         // Using YMapControls you can change the position of the control
//         new YMapControls({position: 'left'})
//           // Add the zoom control to the map
//           .addChild(new YMapZoomControl({}))
//     );   
    
//     // Add a custom marker with a popup window to the map
//     map.addChild(new CustomMarkerWithPopup({coordinates: [37.696972, 55.863657], 
//         geo: [37.696972, 55.863657],newsTitle: 'Popup on the custom marker', newsDate: '04.04.24 в 15:30', newsLink: 'https://yandex.ru/maps-api/docs', 
//         imgLink: 'https://i.pinimg.com/originals/ef/30/6c/ef306ce84f1d2915b26be25bcb34442d.jpg'}));
//     map.addChild(new CustomMarkerWithPopup({coordinates: [37.634479, 55.835154], 
//         geo: [37.634479, 55.835154], newsTitle: 'Здесь расположено здание РГСУ с корпусом технопарка.', newsDate: '05.04.24 в 13:20', newsLink: 'https://yandex.ru/maps-api/docs', 
//         imgLink: 'https://disshelp.ru/blog/wp-content/uploads/2021/05/word-image-215.png'}));
// }



// async function popupElement(element, imgLink, newsTitle, newsLink, newsDate) { // imgLink, newsTitle, newsLink, newsDate

//     element.className = 'vmmap-popup';
//     element.style.cssText = 'left: -130px; top: -361px;'
//     // верхняя плашка с кнопкой закрытия
//     const panel = document.createElement('div')
//     panel.className = 'popup-panel'
//     // кнопка закрытия 
//     const closeBtn = document.createElement('button');
//     closeBtn.className = 'close';
//     closeBtn.textContent = 'Закрыть';
//     closeBtn.onclick = () => this._closePopup();

//     panel.append(closeBtn)
//     element.append(panel)

//     const wrp = document.createElement('div');
//     wrp.className = 'popup-wrp';

//     element.append(wrp)

//     const mainEl = document.createElement('div')
//     mainEl.className = 'main-el'
//     mainEl.style.cssText = 'overflow: hidden; height: auto; width: 260px; display: block;'

//     wrp.append(mainEl)

//     const cover = document.createElement('div')
//     cover.className = 'vmpopup-cover'

//     const a = document.createElement('a')
//     const img = document.createElement('img')
//     let src = imgLink; // Ссылка на фото imgLink
//     img.setAttribute('src', src)

//     a.append(img)
//     cover.append(a)
//     mainEl.append(cover)

//     const h2 = document.createElement('h2')
//     const title = document.createElement('a')
//     title.textContent = newsTitle; // заголовок новости newsTitle
//     let link = newsLink; // Ссылка на новость newsLink
//     title.setAttribute('href',link)

//     h2.append(title)
//     mainEl.append(h2)

//     const footer = document.createElement('div')
//     footer.className = 'vmpopup-footer'

//     const time = document.createElement('div')
//     time.className = 'time'
//     time.textContent = newsDate; // Дата выхода поста newsDate

//     footer.append(time)
//     mainEl.append(footer)

//     const arrow = document.createElement('div')
//     arrow.className = 'arrow'
//     element.append(arrow)
    
// }








// import {RESTRICT_AREA, ZOOM_RANGE, boundsToPolygonCoordinates, LOCATION, NEW_LOCATION_CENTER} from './common';
// import type {LngLat, YMapMarker, YMapCameraRequest, YMapLocationRequest} from '@yandex/ymaps3-types';


// window.map = null;

// main();
// async function main() {
    
//     // Waiting for all api elements to be loaded
//     await ymaps3.ready;
//     const {YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapFeature, YMapControls, YMapMarker, YMapComplexEntity} = ymaps3;

//     // Load the control package and extract the geolocation control from it КАСТОМ МАРКЕР
//     const {YMapGeolocationControl, YMapZoomControl} = await ymaps3.import('@yandex/ymaps3-controls@0.0.1');

//     // Функция изменения положения камеры при открытии маркера
//     function changeMapPosition(location: YMapLocationRequest, camera: YMapCameraRequest, geo) {
//         map.update({location: {center: geo, zoom: 14, duration: 5000}, camera});
//     }

//     // Create a custom marker class with a popup
//     interface CustomMarkerWithPopupProps {
//         coordinates: LngLat; // marker position [lng, lat]
//         popupContent: string;
//         linkContent: string;
//         linkImg: string;
//         date: string;
//         geo: LngLat;
//         zIndex?: number;
//     }
//     class CustomMarkerWithPopup extends YMapComplexEntity<CustomMarkerWithPopupProps> {
//         private _marker: YMapMarker;
//         private _popup: YMapMarker | null = null;

//         // Handler for attaching the control to the map
//         _onAttach() {
//             this._createMarker();
//         }
//         // Handler for detaching control from the map
//         _onDetach() {
//             this._marker = null;
//         }
//         // Handler for updating marker properties
//         _onUpdate(props: CustomMarkerWithPopupProps) {
//             if (props.zIndex !== undefined) {
//                 this._marker?.update({zIndex: props.zIndex});
//             }
//             if (props.coordinates !== undefined) {
//                 this._marker?.update({coordinates: props.coordinates});
//             }
//         }
//         // Method for creating a marker element
//         _createMarker() {
//             const element = document.createElement('div');
//             element.className = 'marker';
//             element.onclick = () => {
//                 this._openPopup();
//             };

//             this._marker = new YMapMarker({coordinates: this._props.coordinates}, element);
//             this.addChild(this._marker);
//         }

//         // Method for creating a popup window element
//         _openPopup() {
//             if (this._popup) {
//                 return;
//             }
            
//             // Приближаем камеру к метке при открытии
//             changeMapPosition(NEW_LOCATION_CENTER, {tilt: (45 * Math.PI) / 180}, this._props.geo);

//             // элемент-контейнер
//             const element = document.createElement('div');

//             element.className = 'vmmap-popup';
//             element.style.cssText = 'left: -130px; top: -361px;'
//             // верхняя плашка с кнопкой закрытия
//             const panel = document.createElement('div')
//             panel.className = 'popup-panel'
//             // кнопка закрытия 
//             const closeBtn = document.createElement('button');
//             closeBtn.className = 'close';
//             closeBtn.textContent = 'Закрыть';
//             closeBtn.onclick = () => this._closePopup();

//             panel.append(closeBtn)
//             element.append(panel)

//             const wrp = document.createElement('div');
//             wrp.className = 'popup-wrp';

//             element.append(wrp)

//             const mainEl = document.createElement('div')
//             mainEl.className = 'main-el'
//             mainEl.style.cssText = 'overflow: hidden; height: auto; width: 260px; display: block;'

//             wrp.append(mainEl)

//             const cover = document.createElement('div')
//             cover.className = 'vmpopup-cover'

//             const a = document.createElement('a')
//             const img = document.createElement('img')
//             let src = this._props.linkImg; // Ссылка на фото
//             img.setAttribute('src', src)

//             a.append(img)
//             cover.append(a)
//             mainEl.append(cover)

//             const h2 = document.createElement('h2')
//             const title = document.createElement('a')
//             title.textContent = this._props.popupContent; // заголовок новости
//             let link = this._props.linkContent; // Ссылка на новость
//             title.setAttribute('href',link)

//             h2.append(title)
//             mainEl.append(h2)

//             const footer = document.createElement('div')
//             footer.className = 'vmpopup-footer'

//             const time = document.createElement('div')
//             time.className = 'time'
//             time.textContent = this._props.date; // Дата выхода поста

//             footer.append(time)
//             mainEl.append(footer)

//             const arrow = document.createElement('div')
//             arrow.className = 'arrow'
//             element.append(arrow)


//             const zIndex = (this._props.zIndex ?? YMapMarker.defaultProps.zIndex) + 1_000;
//             this._popup = new YMapMarker({coordinates: this._props.coordinates, zIndex}, element);
//             this.addChild(this._popup);
//         }

//         _closePopup() {
//             if (!this._popup) {
//                 return;
//             }

//             this.removeChild(this._popup);
//             this._popup = null;
//         }
//     }

//     ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//     // Initialize the map
//     map = new YMap(
//         // Pass the link to the HTMLElement of the container
//         document.getElementById('map'),

//         // Pass the map initialization parameters, set the map location bounds with the current restricted area
//         {location: LOCATION, 
//         restrictMapArea: RESTRICT_AREA, 
//         zoomRange: ZOOM_RANGE, // Если текущий масштаб выходит за пределы этой настройки, то кнопки увеличения или уменьшения масштаба блокируются.
//         }, 
//         // Add a map schema layer and a geo objects layer
//         [new YMapDefaultSchemeLayer({}), new YMapDefaultFeaturesLayer({})],
        
//     );

//     // Create and add a polygon to the map that will mark the border of the map restrict area
//     const borderPolygon = new YMapFeature({
//         id: 'polygon',
//         geometry: {
//             type: 'Polygon',
//             coordinates: [boundsToPolygonCoordinates(RESTRICT_AREA)]
//         },
//         style: {
//             stroke: [{width: 12, color: '#007afce6'}],
//             fill: 'rgba(0, 0, 0, 0)'
//         }
//     });
//     map.addChild(borderPolygon);


//     map.addChild(
//         // Using YMapControls you can change the position of the control
//         new YMapControls({position: 'top left'})
//             // Add the geolocation control to the map
//             .addChild(new YMapGeolocationControl({}))
//     );
    
//     map.addChild(
//         // Using YMapControls you can change the position of the control
//         new YMapControls({position: 'left'})
//           // Add the zoom control to the map
//           .addChild(new YMapZoomControl({}))
//     );   
    
//     // Add a custom marker with a popup window to the map
//     map.addChild(new CustomMarkerWithPopup({coordinates: [37.696972, 55.863657], 
//         geo: [37.696972, 55.863657],popupContent: 'Popup on the custom marker', date: '04.04.24 в 15:30', linkContent: 'https://yandex.ru/maps-api/docs', 
//         linkImg: 'https://i.pinimg.com/originals/ef/30/6c/ef306ce84f1d2915b26be25bcb34442d.jpg'}));
//     map.addChild(new CustomMarkerWithPopup({coordinates: [37.634479, 55.835154], 
//         geo: [37.634479, 55.835154], popupContent: 'Здесь расположено здание РГСУ с корпусом технопарка.', date: '05.04.24 в 13:20', linkContent: 'https://yandex.ru/maps-api/docs', 
//         linkImg: 'https://disshelp.ru/blog/wp-content/uploads/2021/05/word-image-215.png'}));
// }

export {}
import {getNews, typeColors} from './api_work';
import {RESTRICT_AREA, ZOOM_RANGE, boundsToPolygonCoordinates, LOCATION} from './common';
import type {LngLat, YMapMarker, YMapCameraRequest, YMapLocationRequest} from '@yandex/ymaps3-types';




async function initMap(){
    await ymaps3.ready;
    const {YMap, YMapDefaultSchemeLayer, YMapFeature, YMapDefaultFeaturesLayer, YMapControls} = ymaps3;

    // Load the control package and extract the geolocation control from it КАСТОМ МАРКЕР
    const {YMapGeolocationControl, YMapZoomControl} = await ymaps3.import('@yandex/ymaps3-controls@0.0.1');
    
    const map = new YMap(document.getElementById('map'), {
        location: LOCATION,
        restrictMapArea: RESTRICT_AREA,
        zoomRange: ZOOM_RANGE,
    });

    map.addChild(new YMapDefaultSchemeLayer({}));
    map.addChild(new YMapDefaultFeaturesLayer({}));

    const borderPolygon = new YMapFeature({
        id: 'polygon',
        geometry: {
            type: 'Polygon',
            coordinates: [boundsToPolygonCoordinates(RESTRICT_AREA)]
        },
        style: {
            stroke: [{width: 12, color: '#007afce6'}],
            fill: 'rgba(0, 0, 0, 0)'
        }
    });
    map.addChild(borderPolygon);

    const controls = new YMapControls({position: 'top left'});
    controls.addChild(new YMapGeolocationControl({}));
    controls.addChild(new YMapZoomControl({}));

    map.addChild(controls);

    window.map = map;
}



// Созданине кастомных маркеров с классом по созданию маркера
function createMarkers(map, news) {

    // const markers: Feature[] = [];

    // Функция изменения положения камеры при открытии маркера
    function changeMapPosition(location: YMapLocationRequest, camera: YMapCameraRequest, geo) {
        console.log(map.center);

        if (map.zoom >= 14){
            map.update({location: {duration: 5000}, camera});
        }
        else if (map.zoom < 14){
            map.update({location: {center: geo, zoom: 14, duration: 5000}, camera});
        }      
        // map.update({location: {center: geo, zoom: map.zoom > 14 ? map.zoom: 14, duration: 5000}, camera});
    }


    const {YMapMarker, YMapComplexEntity} = ymaps3;
    // Create a custom marker class with a popup
    interface CustomMarkerWithPopupProps {
        coordinates: LngLat; // marker position [lng, lat]
        newsTitle: string; // newsTitle
        newsLink: string; // newsLink
        newsImg: string;     // newsImg
        newsDate: string;         // newsDate
        coordinatesZoom: LngLat;
        zIndex?: number;
        type: string;
    }
    class CustomMarkerWithPopup extends YMapComplexEntity<CustomMarkerWithPopupProps> {
        private _marker: YMapMarker;
        private _popup: YMapMarker | null = null;
        isOpen: boolean = false;

        // Handler for attaching the control to the map
        _onAttach() {
            this._createMarker();
        }
        // Handler for detaching control from the map
        _onDetach() {
            this._marker = null;
        }
        // Handler for updating marker properties
        _onUpdate(props: CustomMarkerWithPopupProps) {
            
            if (props.zIndex !== undefined) {
                this._marker?.update({zIndex: props.zIndex});
            }
            if (props.coordinates !== undefined) {
                this._marker?.update({coordinates: props.coordinates});
            }
        }
        // Method for creating a marker element
        _createMarker() {
            
            const element = document.createElement('div');
            element.className = 'marker';
            element.onclick = () => {
                this._openPopup();
            };

            const hint = document.createElement('div');
            hint.className = 'hint';
            const title = document.createElement('a');
            title.textContent = this._props.newsTitle; // заголовок новости
            hint.append(title);
            
            // Add the hint on mouse enter
           
            element.onmouseenter = () => {
                if (this.isOpen != true && !element.contains(hint)){
                    element.append(hint);
                }
            }
           
            // Remove the hint on mouse leave
            element.onmouseleave = () => {
                if (element.contains(hint)) {
                    element.removeChild(hint);
                }
            };

            this._marker = new YMapMarker({coordinates: this._props.coordinates}, element);
            this.addChild(this._marker);
        }
        // Method for creating a popup window element
        _openPopup() {
            if (this._popup) {
                return;
            }

            this.isOpen = true;

            // Приближаем камеру к метке при открытии
            changeMapPosition(null, {tilt: (45 * Math.PI) / 180}, this._props.coordinatesZoom);
            
            // реализовать случай, когда в одной метке больше одной новости

            // элемент-контейнер
            const element = document.createElement('div');
            element.className = 'vmmap-popup';
            element.style.cssText = 'left: -130px; top: -361px;'

            // верхняя плашка с кнопкой закрытия
            const panel = document.createElement('div')
            panel.className = 'popup-panel'
            const typeColor = typeColors[this._props.type] || '#FFFFFF'; // Белый цвет по умолчанию
            panel.style.background = typeColor;
            
            // кнопка закрытия 
            const closeBtn = document.createElement('button');
            closeBtn.className = 'close';
            closeBtn.textContent = 'Закрыть';
            closeBtn.onclick = () => this._closePopup();

            panel.append(closeBtn)
            element.append(panel)

            const wrp = document.createElement('div');
            wrp.className = 'vmpopup-wrp';

            element.append(wrp)

            const mainEl = document.createElement('div')
            mainEl.className = 'main-el'
            mainEl.style.cssText = 'overflow: hidden; height: auto; width: 260px; display: block;'

            wrp.append(mainEl)

            if (this._props.newsImg != null){ // если фото есть
                const cover = document.createElement('div')
                cover.className = 'vmpopup-cover'

                const a = document.createElement('a')
                const img = document.createElement('img')
                let src = this._props.newsImg; // ссылка на фото
                img.setAttribute('src', src)

                a.append(img)
                cover.append(a)
                mainEl.append(cover)
            }
            
            const h2 = document.createElement('h2')
            const title = document.createElement('a')
            title.textContent = this._props.newsTitle; // заголовок новости
            let link = this._props.newsLink; // ссылка на новость
            title.setAttribute('href',link)

            h2.append(title)
            mainEl.append(h2)

            const footer = document.createElement('div')
            footer.className = 'vmpopup-footer'

            const time = document.createElement('div')
            time.className = 'time'
            time.textContent = this._props.newsDate; // дата выхода поста

            footer.append(time)
            mainEl.append(footer)

            const arrow = document.createElement('div')
            arrow.className = 'arrow'
            element.append(arrow)

            const zIndex = (this._props.zIndex ?? YMapMarker.defaultProps.zIndex) + 1_000;
            this._popup = new YMapMarker({coordinates: this._props.coordinates, zIndex}, element);

            this.addChild(this._popup);
            
            //Добавление отступа от метки сверху
            const markerRect = wrp.getBoundingClientRect();
            console.log(markerRect)
            console.log(markerRect.height)  
            let top = markerRect.height + 42
            console.log('+42: ' + top)
            element.style.top ='-' + top + 'px'

        }

        _closePopup() {
            if (!this._popup) {
                return;
            }
            this.isOpen = false;

            // const popup = document.querySelector('.vmmap-popup');
            this._popup.element.className = 'vmmap-popup hidden'

            // Добавляем задержку в 1 секунду перед удалением элемента
            setTimeout(() => {
                this.removeChild(this._popup);
                this._popup = null;
            }, 500);
        }
    }

    // map.addChild(new CustomMarkerWithPopup({coordinates: [37.696972, 55.863657], 
    //     coordinatesZoom: [37.696972, 55.863657 + 0.009],newsTitle: 'Popup on the custom marker.', newsDate: '04.04.24 в 15:30', newsLink: 'https://yandex.ru/maps-api/docs', 
    //     newsImg: 'https://i.pinimg.com/originals/ef/30/6c/ef306ce84f1d2915b26be25bcb34442d.jpg'}));

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



async function main() {
    const news = await getNews()
    await initMap();
    createMarkers(window.map, news);
}
window.map = null;
main();




// // api_works.ts
// export async function getNews() {
//     let result = await fetch('http://127.0.0.1:8000/api/news');
//     let news = await result.json();
//     return news;
// }

