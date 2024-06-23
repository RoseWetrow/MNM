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
exports.typeColors = exports.getNewsToday = exports.getNewsWeekly = void 0;
function getNewsWeekly() {
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
exports.getNewsWeekly = getNewsWeekly;
function getNewsToday() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let result = yield fetch('http://127.0.0.1:8000/api/news_today');
            let news = yield result.json();
            console.log('Ответ от API:', news);
            return news;
        }
        catch (error) {
            console.error('Ошибка при выполнении запроса:', error);
        }
    });
}
exports.getNewsToday = getNewsToday;
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
