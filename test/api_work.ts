export async function getNewsWeekly() {
    try {
        let result = await fetch('http://127.0.0.1:8000/api/news_weekly');
        let news = await result.json();
        console.log('Ответ от API:', news);
        return news;
    } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
    }
}

export async function getNewsToday() {
    try {
        let result = await fetch('http://127.0.0.1:8000/api/news_today');
        let news = await result.json();
        console.log('Ответ от API:', news);
        return news;
    } catch (error) {
        console.error('Ошибка при выполнении запроса:', error);
    }
}

// Объект для сопоставления типов новостей с цветами фона
export const typeColors = {
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
