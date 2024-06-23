export {}
import {getNewsWeekly, getNewsToday, typeColors} from './api_work';
import {RESTRICT_AREA, ZOOM_RANGE, boundsToPolygonCoordinates, LOCATION, AVAILABLE_BEHAVIORS, INITIALLY_ENABLED_BEHAVIORS} from './common';
import type {LngLat, YMapMarker, YMapCameraRequest, YMapLocationRequest} from '@yandex/ymaps3-types';




async function initMap(show = false){
    await ymaps3.ready;
    const {YMap, YMapDefaultSchemeLayer, YMapFeature, YMapDefaultFeaturesLayer, YMapControls, YMapControlButton} = ymaps3;

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

    // Создание кнопок недельных и дневных новостей

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

    if (show){
         // Кнопка обзора новостей, если выбрана кнопка todayButton
        const showButton = new YMapControlButton({
            text: 'Обзор новостей',
            color: '#fff',
            background: '#f00',
            onClick: viewTodayNews
        });
        controls.addChild(showButton);
    }

    window.map = map;
}

async function showWeeklyNews() {
    stopAutoRotate()
    console.log('Недельные новости')
    map.destroy();
    map = null;
    await initMap();
    const news = await getNewsWeekly()
    createMarkers(window.map, news);
}

async function showTodayNews() {
    stopAutoRotate()
    console.log('Новости за сегодня')
    map.destroy();
    map = null;
    await initMap(true);
    const news = await getNewsToday()
    createMarkers(window.map, news);

}


// State with active map behaviors
let behaviors = INITIALLY_ENABLED_BEHAVIORS;

let frame = 0;
let hasAutoRotate = false;
let timeouts = []; // массив для хранения идентификаторов таймаутов
let currentMarkerIndex = 0; // хранение текущего index маркера
let markers = []; // глобальная переменная для хранения маркеров

async function viewTodayNews(){
    stopAutoRotate()
    console.log('Обзор новостей за день')
    map.destroy();
    map = null;
    await initMap(true);
    const news = await getNewsToday()
    markers = createMarkersForView(window.map, news);
    hasAutoRotate = true;

    // if (hasAutoRotate){
        await showMarkersSequentially();
    // }
}


async function showMarkersSequentially(index = 0) {
    // if (index >= markers.length) return;
    if (index >= markers.length){ // Когда новости новости кончаются
        stopAutoRotate()
        map.update({location: {center: [37.623082, 55.75254], zoom: 9, duration: 4000}, camera: {tilt: (0 * (Math.PI / 180))}}); // перемещение камеры к первому маркеру
        setTimeout(() => {showTodayNews()}, 4000);
    }

    console.log('Ало')
    currentMarkerIndex = index; // Сохраняем текущий индекс маркера

    // Убираем возможность управления картой
    behaviors = behaviors.filter((behavior) => behavior !== 'drag');
    behaviors = behaviors.filter((behavior) => behavior !== 'scrollZoom');
    behaviors = behaviors.filter((behavior) => behavior !== 'dblClick');
    map.setBehaviors(behaviors);
    // Получаем текущую метку
    const marker = markers[index];

    // Перемещение камеры к текущему маркеру
    function changeMapPosition(coordinatesZoom) {

        function changeZoome(){
            // console.log('Сработало changeZoome')
            if (marker._props.source == 'vm'){
                map.update({location: {center: coordinatesZoom, zoom: 17, duration: 4000}, camera: {tilt: (50 * (Math.PI / 180))}}); // перемещение камеры к первому маркеру
            }
            else{
                map.update({location: {center: coordinatesZoom, zoom: 15, duration: 4000}, camera: {tilt: (50 * (Math.PI / 180))}}); // перемещение камеры к первому маркеру
            }
        }
        changeZoome()

        // Вращение камеры вокруг маркера
        function startAutoRotationCamera() {
            changeZoome()

            if (hasAutoRotate) {
                //  Divide degrees by 100 to slow rotation to ~10 degrees / sec
                map.update({camera: {azimuth: map.azimuth + (10 * Math.PI) / 180 / 120}});
                // Request the next frame of the animation
                frame = requestAnimationFrame(startAutoRotationCamera);
            } else {
                // If the automatic rotation mode is stopped then cancel the request for the next animation frame
                cancelAnimationFrame(frame);
            }
        }

        const timeoutId = window.setTimeout(startAutoRotationCamera, 4000); // ждем приблежения перед вращением
        timeouts.push(timeoutId);
    }

    changeMapPosition(marker._props.coordinatesZoom);

    marker._openPopup(); // открыть попап текущего маркера

    // Задержка перед закрытием попапа и переходом к следующему маркеру
    const timeoutId = setTimeout(() => {
        if (hasAutoRotate){
            marker._closePopup();
            cancelAnimationFrame(frame);
            showMarkersSequentially(index + 1);
        }
    }, 15000);

    timeouts.push(timeoutId);
}


function stopAutoRotate() {
    timeouts.forEach(timeoutId => clearTimeout(timeoutId));  // очистка всех таймаутов
    timeouts = [];
    cancelAnimationFrame(frame);
    hasAutoRotate = false;
}

// метод для открытия следующего маркера
function nextMarker() {
    cancelAnimationFrame(frame);
    timeouts.forEach(timeoutId => clearTimeout(timeoutId));
    showMarkersSequentially(currentMarkerIndex + 1);
}
// метод для открытия предыдущего маркера
function previousMarker() {
    if (currentMarkerIndex == 0) return;
    markers[currentMarkerIndex]._closePopup();
    cancelAnimationFrame(frame);
    timeouts.forEach(timeoutId => clearTimeout(timeoutId));
    showMarkersSequentially(currentMarkerIndex - 1);
}

//////////////////////////////////////////////
// Созданине кастомных маркеров с классом по созданию маркера
function createMarkersForView(map, news) {
    const markers = [];

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
        source: string;
        description: string;
    }
    class CustomMarkerWithPopup extends YMapComplexEntity<CustomMarkerWithPopupProps> {
        private _marker: YMapMarker;
        private _popup: YMapMarker | null = null;
        isOpen: boolean = false;
        minHeight: number = 0;

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
            const typeColor = typeColors[this._props.type] || 'rgb(215 215 215)'; // Белый цвет по умолчанию
            element.style.backgroundColor = typeColor;

            this._marker = new YMapMarker({coordinates: this._props.coordinates}, element);
            this.addChild(this._marker);

            markers.push(this); // добавление ссылки на маркер в массив
        }
        // Method for creating a popup window element
        _openPopup() {
            if (this._popup) {
                return;
            }

            this.isOpen = true;

            // элемент-контейнер
            const element = document.createElement('div');
            element.className = 'map-popup-view'; // vmmap-popup
            element.style.cssText = 'left: -130px; top: -150px;'

            // верхняя плашка с кнопкой закрытия
            const panel = document.createElement('div')
            panel.className = 'popup-panel'
            const typeColor = typeColors[this._props.type] || 'rgb(215 215 215)'; // Белый цвет по умолчанию
            panel.style.background = typeColor;
            
            // кнопка следующего маркера 
            const nextBtn = document.createElement('button-next');
            nextBtn.className = 'next';
            // nextBtn.textContent = 'Следующая';
            nextBtn.onclick = () => {
                this._closePopup();
                nextMarker(); // переход к следующему маркеру
            };
            // кнопка предыдущего  маркера 
            const previousBtn = document.createElement('button-previous');
            previousBtn.className = 'previous';
            // previousBtn.textContent = 'Предыдущая';
            previousBtn.onclick = () => {
                previousMarker(); // переход к следующему маркеру
            };

            panel.append(nextBtn)
            panel.append(previousBtn)
            element.append(panel)

            const wrp = document.createElement('div');
            wrp.className = 'popup-wrp';

            element.append(wrp)

            const mainEl = document.createElement('div')
            mainEl.className = 'main-el'
            mainEl.style.cssText = 'overflow: hidden; height: auto; width: 260px; display: block;'

            wrp.append(mainEl)

            if (this._props.newsImg != null){ // если фото есть
                const cover = document.createElement('div')
                cover.className = 'popup-cover'

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
            footer.className = 'popup-footer'

            const time = document.createElement('div')
            time.className = 'time'
            time.textContent = this._props.newsDate; // дата выхода поста

            footer.append(time)

            if (this._props.description != null){ // если есть описание
                const description = document.createElement('a')
                description.className = 'description-link'
                description.textContent = 'подробнее';
                description.onclick = () => this._openDescription(mainEl, wrp, panel);
                footer.append(description)
            }

            mainEl.append(footer)

            const zIndex = (this._props.zIndex ?? YMapMarker.defaultProps.zIndex) + 1_000;
            this._popup = new YMapMarker({coordinates: this._props.coordinates, zIndex}, element);

            this.addChild(this._popup);

            const markerRect = wrp.getBoundingClientRect();
            // Устанавливаем min hight для корректного отображения описания
            wrp.style.minHeight = markerRect.height + 'px'
            this.minHeight =  markerRect.height // сохраняем значение min hight
            
        }
        _closePopup() {
            if (!this._popup) {
                return;
            }

            this.isOpen = false;

            // const popup = document.querySelector('.vmmap-popup');
            this._popup.element.className = 'map-popup hidden'

            // Добавляем задержку в 1 секунду перед удалением элемента
            setTimeout(() => {
                this.removeChild(this._popup);
                this._popup = null;
            }, 500);
        }

        _openDescription(mainEl, wrp, panel){
            if (!this._popup) {
                return;
            }

            if (mainEl) {
                timeouts.forEach(timeoutId => clearTimeout(timeoutId));  // очистка всех таймаутов
                timeouts = [];

                // создаем текст описания
                const descriptionEl = document.createElement('div');
                descriptionEl.className = 'description-text';
                descriptionEl.textContent = this._props.description;
                
                // создаем ссылку на источник
                const a = document.createElement('a')
                a.textContent = 'Читать в источнике';
                a.className = 'description-text-link';
                let link = this._props.newsLink; // ссылка на новость
                a.setAttribute('href',link)

                // Скрываем текущее содержимое panel
                Array.from(panel.children).forEach(child => {
                    if (child instanceof HTMLElement) {
                        child.style.display = 'none';
                    }
                });

                // создаем кнопку назад
                const backBtn = document.createElement('button');
                backBtn.className = 'back';
                // backBtn.textContent = 'Назад';
                backBtn.onclick = ()=> this._closeDescription(mainEl, descriptionEl, a, backBtn, panel);
                panel.append(backBtn)    

                // Скрываем текущее содержимое mainEl
                Array.from(mainEl.children).forEach(child => {
                    if (child instanceof HTMLElement) {
                        child.style.display = 'none';
                    }
                });
                mainEl.append(descriptionEl);
                mainEl.append(a);
            }
        }

        _closeDescription(mainEl, descriptionEl, a, backBtn, panel){

            // Задержка перед закрытием попапа и переходом к следующему маркеру
            const timeoutId = setTimeout(() => {
                if (hasAutoRotate){
                    this._closePopup();
                    cancelAnimationFrame(frame);
                    showMarkersSequentially(currentMarkerIndex + 1);
                }
            }, 15000);

            timeouts.push(timeoutId);

            // очищаем описание и кнопку назад
            mainEl.removeChild(descriptionEl)
            mainEl.removeChild(a)
            panel.removeChild(backBtn)

            // Возвращаем содержимое panel
            Array.from(panel.children).forEach(child => {
                if (child instanceof HTMLElement) {
                    child.style.display = '';
                }
            });
            // Возвращаем содержимое mainEl
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
            coordinatesZoom: [parseFloat(item.lng), parseFloat(item.lat) + 0.001], // при 0.001 вращение по центру метки, при 0.0059 метка на центру экрана, при 0.009 посередине попап окно
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

    return markers
}
//////////////////////////////////////////////

// Созданине кастомных маркеров с классом по созданию маркера
function createMarkers(map, news) {
    
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
        description: string;
    }
    class CustomMarkerWithPopup extends YMapComplexEntity<CustomMarkerWithPopupProps> {
        private _marker: YMapMarker;
        private _popup: YMapMarker | null = null;
        isOpen: boolean = false;
        minHeight: number = 0;
        top: number = 0;
        indentationNotNeed: boolean = false;

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
            const typeColor = typeColors[this._props.type] || 'rgb(215 215 215)'; // Белый цвет по умолчанию
            element.style.backgroundColor = typeColor;

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
            element.className = 'map-popup';
            // element.style.cssText = 'left: -130px; top: -361px;'

            // верхняя плашка с кнопкой закрытия
            const panel = document.createElement('div')
            panel.className = 'popup-panel'
            const typeColor = typeColors[this._props.type] || 'rgb(215 215 215)'; // Белый цвет по умолчанию
            panel.style.background = typeColor;
            
            // кнопка закрытия 
            const closeBtn = document.createElement('button');
            closeBtn.className = 'close';
            // closeBtn.textContent = 'Закрыть';
            closeBtn.onclick = () => this._closePopup();

            panel.append(closeBtn)
            element.append(panel)

            const wrp = document.createElement('div');
            wrp.className = 'popup-wrp';

            element.append(wrp)

            const mainEl = document.createElement('div')
            mainEl.className = 'main-el'
            // mainEl.style.cssText = 'overflow: hidden; height: auto; width: 260px; display: block;'

            wrp.append(mainEl)

            if (this._props.newsImg != null){ // если фото есть
                const cover = document.createElement('div')
                cover.className = 'popup-cover'

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
            footer.className = 'popup-footer'

            const time = document.createElement('div')
            time.className = 'time'
            time.textContent = this._props.newsDate; // дата выхода поста

            footer.append(time)

            if (this._props.description != null){ // если есть описание
                const description = document.createElement('a')
                description.className = 'description-link'
                description.textContent = 'подробнее';
                description.onclick = () => this._openDescription(mainEl, wrp, panel);
                footer.append(description)
            }
            
            mainEl.append(footer)

            const arrow = document.createElement('div')
            arrow.className = 'arrow'
            element.append(arrow)

            const zIndex = (this._props.zIndex ?? YMapMarker.defaultProps.zIndex) + 1_000;
            this._popup = new YMapMarker({coordinates: this._props.coordinates, zIndex}, element);

            this.addChild(this._popup);
            
            //Добавление отступа от метки сверху
            const markerRect = wrp.getBoundingClientRect();
            this.addingIndentation(markerRect)
            // Устанавливаем min hight для корректного отображения описания
            wrp.style.minHeight = markerRect.height + 'px'
            this.minHeight =  markerRect.height // сохраняем значение min hight
            this.top =  markerRect.top // сохраняем значение top
        }

        _closePopup(back: boolean = false) {
            if (!this._popup) {
                return;
            }
            this.isOpen = false;

            // const popup = document.querySelector('.vmmap-popup');
            this._popup.element.className = 'map-popup hidden'

            // Добавляем задержку в 1 секунду перед удалением элемента
            setTimeout(() => {
                this.removeChild(this._popup);
                this._popup = null;

                if (back){
                    this._openPopup();
                }

            }, 500);
        }

        _openDescription(mainEl, wrp, panel){
            if (!this._popup) {
                return;
            }

            if (mainEl) {
                // создаем текст описания
                const descriptionEl = document.createElement('div');
                descriptionEl.className = 'description-text';
                descriptionEl.textContent = this._props.description;
                
                // создаем ссылку на источник
                const a = document.createElement('a')
                a.textContent = 'Читать в источнике';
                a.className = 'description-text-link';
                let link = this._props.newsLink; // ссылка на новость
                a.setAttribute('href',link)

                // создаем кнопку назад
                const backBtn = document.createElement('button');
                backBtn.className = 'back';
                // backBtn.textContent = 'Назад';
                backBtn.onclick = ()=> this._closeDescription(mainEl, descriptionEl, a, backBtn, panel, wrp);
                panel.append(backBtn)    

                // Скрываем текущее содержимое mainEl
                Array.from(mainEl.children).forEach(child => {
                    if (child instanceof HTMLElement) {
                        child.style.display = 'none';
                    }
                });
                mainEl.append(descriptionEl);
                mainEl.append(a);
                
                // Добавляем отступ от метки, если изначальный min height меньше
                const markerRect = wrp.getBoundingClientRect();
                if(this.minHeight < markerRect.height){
                    this.addingIndentation(markerRect)
                }
                else{
                    this.indentationNotNeed = true
                }
            }
        }

        _closeDescription(mainEl, descriptionEl, a, backBtn, panel, wrp){
            // очищаем описание и кнопку назад
            mainEl.removeChild(descriptionEl)
            mainEl.removeChild(a)
            panel.removeChild(backBtn)

            Array.from(mainEl.children).forEach(child => {
                if (child instanceof HTMLElement) {
                    child.style.display = '';
                }
            });

            // Добавляем отступ от метки обратно, если он добавлялся с описанием
            if (!this.indentationNotNeed){
                const markerRect = wrp.getBoundingClientRect();
                this.addingIndentation(markerRect)
            }
        }

        // добавление отступа от метки сверху
        addingIndentation(markerRect){
            console.log('РОБИТ')
            console.log(markerRect)
            let top = markerRect.height + 42
            console.log('+42: ' + top)
            this._popup.element.style.top ='-' + top + 'px'
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

    map.addChild(new CustomMarkerWithPopup({coordinates: [37.936734, 56.129751], coordinatesZoom: [37.936734, 56.129751 + 0.009],newsTitle: 'Тут живет Андрей Кинжалов', newsDate: '17.06.24 в 18:00', newsLink: '', newsImg: 'https://sun1-84.userapi.com/s/v1/ig2/Cjk7craNEn8JHhwGEE5g010KoJqrNTyDQhPNzzZzmfRsF-TBvUpVfdUOghWhpz46EhmbuGscgE96AU_DdT6WhHWD.jpg?size=400x400&quality=96&crop=377,334,721,721&ava=1', type: 'dfdf', description:'Тут живет Андрей Кинжалов!!!'}));

}



async function main() {
    const news = await getNewsWeekly()
    await initMap();
    createMarkers(window.map, news);
}

window.map = null;
main();