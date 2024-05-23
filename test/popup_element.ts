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



// // элемент-контейнер
// const element = document.createElement('div');
// element.className = 'vmmap-popup';
// element.style.cssText = 'left: -130px; top: -361px;'
// // верхняя плашка с кнопкой закрытия
// const panel = document.createElement('div')
// panel.className = 'popup-panel'
// // кнопка закрытия 
// const closeBtn = document.createElement('button');
// closeBtn.className = 'close';
// closeBtn.textContent = 'Закрыть';
// closeBtn.onclick = () => this._closePopup();

// panel.append(closeBtn)
// element.append(panel)

// const wrp = document.createElement('div');
// wrp.className = 'popup-wrp';

// element.append(wrp)

// const mainEl = document.createElement('div')
// mainEl.className = 'main-el'
// mainEl.style.cssText = 'overflow: hidden; height: auto; width: 260px; display: block;'

// wrp.append(mainEl)

// const cover = document.createElement('div')
// cover.className = 'vmpopup-cover'

// const a = document.createElement('a')
// const img = document.createElement('img')
// let src = this._props.linkImg; // Ссылка на фото
// img.setAttribute('src', src)

// a.append(img)
// cover.append(a)
// mainEl.append(cover)

// const h2 = document.createElement('h2')
// const title = document.createElement('a')
// title.textContent = this._props.popupContent; // заголовок новости
// let link = this._props.linkContent; // Ссылка на новость
// title.setAttribute('href',link)

// h2.append(title)
// mainEl.append(h2)

// const footer = document.createElement('div')
// footer.className = 'vmpopup-footer'

// const time = document.createElement('div')
// time.className = 'time'
// time.textContent = this._props.date; // Дата выхода поста

// footer.append(time)
// mainEl.append(footer)

// const arrow = document.createElement('div')
// arrow.className = 'arrow'
// element.append(arrow)