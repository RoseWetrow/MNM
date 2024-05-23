from datetime import datetime
import pytz  # для установки часового пояса
import traceback


# метод по преобразованию даты из unix в нормальную дату с русским месяцем
def fromUnixToTime(date):
    try:
        tz = pytz.timezone("Europe/Moscow")  # Устанавливаем часовой пояс МСК
        formatted_datetime = datetime.fromtimestamp(date, tz=tz)
        # Форматирование времени для вывода без секунд
        formatted_string = formatted_datetime.strftime("%d.%m в %H:%M")
        return formatted_string
    except Exception as e:
        print(
            f"Ошибка при выполнении метода fromUnixToTime- метод по преобразованию даты из unix в нормальную дату с русским месяцем   \n{e}\n"
        )
        traceback.print_exc()


# date = fromUnixToTime(1714047382)
# print(date)


# метод по преобразованию даты в unix формат  (для vm.ru или mos.ru)
def fromTimeToUnix(date):
    try:
        date_object = datetime.strptime(date, "%Y-%m-%dT%H:%M:%S")
        unix_time = date_object.timestamp()  # Получение Unix time
        return unix_time
    except Exception as e:
        print(
            f"Ошибка при выполнении метода fromTimeToUnix - метод по преобразованию даты в unix формат  (для vm.ru или mos.ru)\n{e}\n"
        )
        traceback.print_exc()


# метод по преобразованию даты в unix формат  (для 77.мвд.рф)
def fromTimeToUnix_MVD(date):
    # Определение текущей даты
    current_date = datetime.now().date()
    current_year = datetime.now().year

    try:
        # Проверяем, содержит ли строка слово "Сегодня"
        date = date.split("Сегодня ")
        # print(date)
        # print(len(date))
        if len(date) > 1:
            time_str = date[1]  # Выделяем время из строки
            date_object = datetime.strptime(
                f"{current_date} {time_str}", "%Y-%m-%d %H:%M"
            )
        elif len(date) == 1:
            time_str = date[0]
            time_str = time_str.split()
            d = time_str[0]
            m = time_str[1]
            h_m = time_str[2]

            months = {
                "Января": 1,
                "Февраля": 2,
                "Марта": 3,
                "Апреля": 4,
                "Мая": 5,
                "Июня": 6,
                "Июля": 7,
                "Августа": 8,
                "Сентября": 9,
                "Октября": 10,
                "Ноября": 11,
                "Декабря": 12,
            }
            for key in months:
                if key == m:
                    m = months[key]

            date_object = datetime.strptime(
                f"{current_year}-{m}-{d} {h_m}", "%Y-%m-%d %H:%M"
            )

        unix_time = date_object.timestamp()  # Получение Unix time
        return unix_time

    except Exception as e:
        print(
            f"Ошибка при выполнении метода fromTimeToUnix_MVD - метод по преобразованию даты в unix формат (для 77.мвд.рф)\n{e}\n"
        )
        traceback.print_exc()


# date = 'Сегодня 13:35'
# # date = 'Сегодня 10:50'
# # date = '23 Апреля 15:50'
# unix = fromTimeToUnix_MVD(date)
# print(unix)
