import os
from dotenv import load_dotenv
from supabase import create_client
import json
import traceback


# find_dotenv()
load_dotenv("./MoscowNewsMap/.env")

# config = dotenv_values(".env")
# print(config['DB_URL'])
# или
# print(os.getenv('DB_URL'))

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase = create_client(url, key)

# print(os.environ.get("SUPABASE_URL"))
# districts = supabase.table("area").select("*").execute()

# data, count = supabase.table('district').insert({"title": "Проверка"}).execute()
# data, count = supabase.table('district').delete().eq('title', "Проверка").execute()

# print(districts)
# news = supabase.table("news").select("*").execute()
# print(news)

# метод по получению unix даты последней новости ресурса source


def checkNews(source):
    try:
        response = (supabase.table("news")
            .select("date_unix")
            .eq("source", source)
            .order("date_unix", desc=True)
            .limit(1)
            .execute()
        )
        data = response.data

        if data != []:
            last_date = float(data[0]["date_unix"])

            return last_date
        elif data == []:
            # реализовать бота, отправляющего ошибку!
            print(f"Источник {source} не найден!\nОтвет БД: {data}")

    except Exception as e:
        print(f"Ошибка при выполнении метода checkNews - метод по получению unix даты последней новости ресурса source\n{e}\n")
        traceback.print_exc()


def typeUnifier(type, source):  # метод по приведению к обобщенным типам
    try:
        # формирование SQL запроса для получения обобщенного типа новости
        response = (supabase.table("news_types")
            .select("unified_type")
            .eq("source", source)
            .eq("sources_type", type)
            .execute()
        )
        data = response.data

        if data != []:
            type = data[0]["unified_type"]
            # print(type)
        elif data == []:
            # реализовать бота, отправляющего ошибку!
            print(f"Тип {type} не найден! Источник: {source}")
            type = "None"
        return type

    except Exception as e:
        print(f"Ошибка при выполнении метода typeUnifier - метод по приведению к обобщенным типам\n{e}\n")
        traceback.print_exc()


# метод по добавлению записей в БД
def insert_into(news_list):

    title = ""
    description = ""
    link = ""
    type = ""
    source = ""
    area = ""
    district = ""
    image = ""
    date_unix = 0
    date = ""
    lng = 0
    lat = 0

    try:
        for values in news_list.values():
            # print(values)
            for key, val in values.items():
                # print(val)
                title = values["title"]

                if "description" in values:
                    description = values["description"]
                else:
                    description = "None"

                date_unix = values["date_unix"]

                date = values["date"]

                link = values["link"]

                if "type" in values:
                    type = values["type"]
                else:
                    type = "None"

                if type != "None":  # приведение к обобщенным типам
                    if values["source"] == "mos.ru" or values["source"] == "vm":
                        source = values["source"]
                        type = typeUnifier(type, source)
                    elif values["source"] == "77.мвд.рф":
                        source = "77.мвд.рф"

                if "img" in values:
                    image = values["img"]
                else:
                    image = "None"

                if key == "geo":
                    if source == "mos.ru" or source == "vm":
                        # print(len(val))
                        for keys, values in val.items():

                            lng = keys[0]
                            lat = keys[1]
                            area = values["area"]
                            district = values["district"]
                            # print(title)
                            # print(description)
                            # print(link)
                            # print(type)
                            # print(source)
                            # print(area)
                            # print(district)
                            # print(image)
                            # print(date)
                            # print(lng)
                            # print(lat)
                            # print('################################################################')
                            print(f"Новость добавлена: {date_unix}")
                            query = (supabase.table("news").insert(
                                    {
                                        "title": title,
                                        "description": description,
                                        "date_unix": date_unix,
                                        "date": date,
                                        "link": link,
                                        "type": type,
                                        "area": area,
                                        "district": district,
                                        "lng": lng,
                                        "lat": lat,
                                        "image": image,
                                        "source": source,
                                    }
                                ).execute()
                            )

                    elif source == "77.мвд.рф":

                        area = values["geo"]
                        lng = values["coordinate"][0]
                        lat = values["coordinate"][1]

                        # print(f'Координаты: {lng} {lat}')
                        # print('################################################################')

                        print(f"Новость добавлена: {date_unix}")
                        query = (supabase.table("news").insert(
                                {
                                    "title": title,
                                    "description": description,
                                    "date_unix": date_unix,
                                    "date": date,
                                    "link": link,
                                    "type": type,
                                    "area": area,
                                    "lng": lng,
                                    "lat": lat,
                                    "source": source,
                                }
                            ).execute()
                        )

    except Exception as e:
        print(f"Ошибка при выполнении метода insert_into - метод по добавлению записей в БД\n{e}\n")
        traceback.print_exc()


# news_list = {1714121400.0: {'title': 'Полицейские задержали женщину по подозрению в краже из организации, в которой она работала', 'description': 'В полицию с заявлением о краже обратился директор организации, расположенной на Новоданиловской набережной. Он рассказал, что из сейфа компании пропали 100 тысяч рублей...', 'date_unix': 1714121400.0, 'date': '26.04 в 11:50', 'link': 'https://77.xn--b1aew.xn--p1ai//news/item/49606493/', 'type': 'ГУ МВД РФ по Г. Москве', 'source': '77.мвд.рф', 'geo': 'Южный', 'coordinate': [37.678065, 55.622014]}, 1714116600.0: {'title': 'Полицейскими УВД юга столицы задержана подозреваемая в покушении на сбыт наркотического средства', 'description': 'При личном досмотре полицейские обнаружили и изъяли у 26-летней гражданки 77 свертков с производным N-метилэфедрона...', 'date_unix': 1714116600.0, 'date': '26.04 в 10:30', 'link': 'https://77.xn--b1aew.xn--p1ai//news/item/49606373/', 'type': 'ГУ МВД РФ по Г. Москве', 'source': '77.мвд.рф', 'geo': 'Южный', 'coordinate': [37.678065, 55.622014]}, 1714113600.0: {'title': 'Столичными оперативниками задержаны подозреваемые в разбойном нападении в районе Северное Бутово', 'description': 'Около подъезда дома на бульваре Дмитрия Донского один из злоумышленников схватил 24-летнего мужчину и повел его в автомобиль каршеринга, где их ждал второй соучастник...', 'date_unix': 1714113600.0, 'date': '26.04 в 09:40', 'link': 'https://77.xn--b1aew.xn--p1ai//news/item/49606144/', 'type': 'ГУ МВД РФ по Г. Москве', 'source': '77.мвд.рф', 'geo': 'Юго-Западный', 'coordinate': [37.576187, 55.662735]}, 1714043100.0: {'title': 'В Москве сотрудники полиции задержали подозреваемого в многомиллионном мошенничестве под предлогом инвестирования', 'description': 'Аферист знакомился с гражданами и представлялся финансовым экспертом. Он заявлял, что является высококвалифицированным инвестором, и обещал высокую доходность от вложений...', 'date_unix': 1714043100.0, 'date': '25.04 в 14:05', 'link': 'https://77.xn--b1aew.xn--p1ai//news/item/49602725/', 'type': 'ГУ МВД РФ по Г. Москве', 'source': '77.мвд.рф', 'geo': 'Зеленоградский', 'coordinate': [37.19425, 55.987583]}, 1714040100.0: {'title': 'Полицейские Таганского района столицы задержали мужчину, находившегося в федеральном розыске', 'description': 'В полицию поступила информация об обнаружении местонахождения мужчины, находившегося в федеральном розыске. Прибывшие по адресу сотрудники полиции задержали на Нижегородской улице 34-летнего мужчину...', 'date_unix': 1714040100.0, 'date': '25.04 в 13:15', 'link': 'https://77.xn--b1aew.xn--p1ai//news/item/49585838/', 'type': 'ГУ МВД РФ по Г. Москве', 'source': '77.мвд.рф', 'geo': 'Центральный', 'coordinate': [37.617644, 55.755819]}, 1714036200.0: {'title': 'Оперативники Центрального округа Москвы задержали мужчину по подозрению в краже денег со счета его знакомой', 'description': 'В квартире своей знакомой мужчина попросил у потерпевшей смартфон и через мобильное приложение оформил от ее имени кредит...', 'date_unix': 1714036200.0, 'date': '25.04 в 12:10', 'link': 'https://77.xn--b1aew.xn--p1ai//news/item/49570988/', 'type': 'ГУ МВД РФ по Г. Москве', 'source': '77.мвд.рф', 'geo': 'Центральный', 'coordinate': [37.617644, 55.755819]}, 1714031400.0: {'title': 'Сотрудники уголовного розыска района Северное Медведково задержали подозреваемых в краже из автомобиля', 'description': 'Ночью из машины, припаркованной на стоянке в проезде Шокальского, похитили строительные инструменты стоимостью почти 130 тысяч рублей...', 'date_unix': 1714031400.0, 'date': '25.04 в 10:50', 'link': 'https://77.xn--b1aew.xn--p1ai//news/item/49570953/', 'type': 'ГУ МВД РФ по Г. Москве', 'source': '77.мвд.рф', 'geo': 'Северо-Восточный', 'coordinate': [37.632565, 55.854875]}}

# insert_into(news_list)
