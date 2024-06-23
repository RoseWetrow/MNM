import requests
from bs4 import BeautifulSoup
import fake_useragent
# from extractors import searchGeo
from file_writer import writeFile
from time_conventer import fromTimeToUnix, fromUnixToTime, fromTimeToUnix_MVD
from geocoding import getCord, getDistAndArea, gethAreaCord
from DB_worker import checkNews, insert_into
import traceback



#       'title': title,
#       'description': description,
#       'date_unix': date_unix,
#       'date': date,
#       'link': link,
#       'type': type,
#       'source': 'vm',
#       'img': img,
#       'geo': geo



#использование фейкового юзерагента при отправке запроса
user = fake_useragent.UserAgent().random
header = {'User-Agent': user}



# json method (вечерняя москва)
def getInfoVM():
    print('Метод по получению новостей с вечерняя москва')
    news_list = {}
    # URL API
    url = "https://vm.ru/api/map?date_range=3&mcat="

    try:
        # Запрос JSON данных
        response = requests.get(url, headers=header)

        news_json = response.json()['data']['list']

        for news in news_json:
            date = news['publishedAt']
            date_unix = float(fromTimeToUnix(date.split('.')[0]))

            # проверка даты
            last_date = checkNews('vm')

            if last_date >= date_unix: # если полученная дата новости меньше или равна последней сохраненной - новость старая
                continue
            
            # добавить нормальную дату
            date = fromUnixToTime(date_unix)

            # получение названия
            title = news['title']

            # полуяение ссылки на статью
            link = news['link']
            if link.startswith('/news/'):
                link = f'https://vm.ru{link}'
            
            print(link)
            
            img = ''
            # проверка на описание (может быть пустым)
            if news['media'] != []: # в media хранится изображение и описание
                # достаем фото
                img = news['media'][0]['files']['original']['path']
                img = f'https://vmrucdn.servicecdn.ru/{img}'

                description = news['media'][0]['title']
                description = description.split(' Фото')
                description = description[0]
            else:
                img = None
                description = None

            type = ''
            # Проверяем наличие поля 'placemark' в новости
            if 'placemark' in news and news['placemark']:
                type = news['placemark']['title']
            else:
                # Или проверяем наличие поля 'category' в новости
                if 'category' in news and news['category']:
                    type = news['category']['title']
                else:
                    # Если оба поля отсутствуют, то устанавливаем тип как "Unknown Type"
                    type = None

            # сохранения координат новости (может быть несколько)
            coordinates_arr = news['geo']
            coordinates = []
            for geo in coordinates_arr:
                lng = geo['point']['coordinates'][1]
                lat = geo['point']['coordinates'][0]

                coordinates += [[lng, lat]]
            
            # получение района и округа
            geo = getDistAndArea(coordinates)

            #Добавление в словарь 
            news_list[date_unix] = {
                'title': title,
                'description': description,
                'date_unix': date_unix,
                'date': date,
                'link': link,
                'type': type,
                'source': 'vm',
                'img': img,
                'geo': geo
            }
        
        if news_list != {}:
            print('Done')
            insert_into(news_list)
        elif news_list == {}:
            print('Новых новостей нет')

    except Exception as e:
        print(f'Ошибка при выполнении метода для vm.ru\n{e}\n')
        traceback.print_exc()



# getInfoVM()
    


# json + address parsing + NLP method (kp.ru)
# def getInfo2():
#     news_list = {}

#     # URL API
#     url = "https://s02.api.yc.kpcdn.net/content/api/1/pages/get.json?pages.direction=page&pages.target.class=100&pages.target.id=1"

#     try:
#         # Запрос JSON данных
#         response = requests.get(url, headers=header)

#         for i in range(0, 10, 1):
#             news_json = response.json()['childs'][i] # получаем новость
#             print(news_json)

#             type = news_json['@tag'][0] # получаем тип
            
#             if type == 'economics' or type == 'interesting': # отметаем новости про экономику и интересные факты
#                 continue

#             date = news_json['meta'][3]['value'] # получаем дату
#             date_unix = fromTimeToUnix(date) # преобразовываемм дату в unix формат

#             # добавить проверку на дату
#             # добавить нормальную дату
#             date = fromUnixToTime(date_unix)

#             id = news_json['@id']
#             link = f'https://www.msk.kp.ru/online/news/{id}/' 
            
#             # парсинг текста по ссылке
#             resPar = requests.get(link).text
#             data = BeautifulSoup(resPar, 'html.parser')
#             news_content = data.find('div', class_="sc-1wayp1z-0 sc-1wayp1z-5 gwmrBl chEeRL")
#             texts = news_content.find_all('p', class_="sc-1wayp1z-16 dqbiXu")
#             content = ''
#             # преобразование html в текст и объединение всех параграфов в одну переменную
#             for text in texts:
#                 content += text.text

#             # сокращение ненужного
#             result_content = content[:content.find('Ранее KP.RU')] if 'Ранее KP.RU' in content else content

#             geo = searchGeo(result_content) #  получаем адрес из текста

#             if geo == '' or geo == 'Москва, ': # если адрес обнаружить неудалось
#                 continue

#             title = news_json['ru']['title']
#             description = news_json['ru']['description']
#             type = news_json['@tag'][0] 
#             img = news_json['image']['url']
#             img = f'https://s16.stc.yc.kpcdn.net{img}'

#             news_list[date_unix] = {
#             'title': title,
#             'description': description,
#             'date_unix': date_unix,
#             'date': date,
#             'link': link,
#             'type': type,
#             'source': 'kp.ru',
#             'img': img,
#             'geo': geo
#             }


#     except Exception as e:
#         print(f'Ошибка при выполнении метода для kp.ru\n{e}\n')
#         traceback.print_exc()


        
# getInfo2()


# json + address parsing method (mos.ru) (only rayon)
def getInfoMOSRU():
    print('Метод по получению новостей с мос.ру')

    url = 'https://www.mos.ru/api/newsfeed/v4/frontend/json/ru/articles?fields=id,title,date_timestamp,image,kind,territory_district_id,sphere,entity_id,entity_suffix&filter=%7B%22has_district%22:1,%22status%22:%5B%22public%22,%22public_oiv%22%5D%7D&page=1&per-page=15'
    
    try:
        response = requests.get(url, headers=header)

        items = response.json()['items']

        news_list = {}

        for item in items:

            id = item['id']
            link = f'https://www.mos.ru/news/item/{id}/' 
            title = item['title']
            date_unix = float(item['date_timestamp'])

            # проверка даты
            last_date = checkNews('mos.ru')
            
            if last_date >= date_unix: # если полученная дата новости меньше или равна последней сохраненной - новость старая
                continue
            print(link)
            
            # получение нормальной даты
            date = fromUnixToTime(date_unix)

            # получение типа 
            type = item['sphere']['title']
            
            if type.startswith('Выборы'):
                type = 'Выборы'

            # получение картинки
            img = item['image']

            if img != None:
                img = item['image']['original']['src']
                img = f'https://www.mos.ru{img}'

            # парсинг района
            resPar = requests.get(link).text
            data = BeautifulSoup(resPar, 'html.parser')

            news_article_content = data.find('main', class_="news-article-content")
            news_article_footer_content = news_article_content.find('div', class_="news-article-footer-content")
            news_article_footer__rows = news_article_footer_content.find('div', class_="news-article-footer__rows")
            news_article_place = news_article_footer__rows.find_all('div', class_="news-article-place")

            if len(news_article_place) < 2: # если указан только округ
                continue

            news_article_place__name_0 = news_article_place[0].find_all('a', class_="news-article-place__name") # округа
            news_article_place__name_1 = news_article_place[1].find_all('a', class_="news-article-place__name") # районы
        
            geo_text = []
            # geo_cord = []
            if len(news_article_place__name_0) == 1 and len(news_article_place__name_1) == 1:      # если один округ с районом
                print('один округ с районом')
                news_article_place__title_0 = news_article_place[0].find('span', class_="news-article-place__title").text
                news_article_place__name_0 = news_article_place[0].find('a', class_="news-article-place__name").text
                news_article_place__title_1 = news_article_place[1].find('span', class_="news-article-place__title").text
                news_article_place__name_1 = news_article_place[1].find('a', class_="news-article-place__name").text
                geo_str = f'Москва, {news_article_place__title_0} {news_article_place__name_0}, {news_article_place__title_1} {news_article_place__name_1}'
                geo_text += [geo_str]
                # cord = getCord(geo_str)
                # geo_cord += [cord]
                geo = getCord(geo_text, area=news_article_place__name_0, district=news_article_place__name_1)
                
            elif len(news_article_place__name_0) > 1 and len(news_article_place__name_1) > 1 or len(news_article_place__name_1) > 1:      # если несколько и округов и районов
                print('несколько и округов и районов или несколько районов в одном округе')
                news_article_place__title = news_article_place[1].find('span', class_="news-article-place__title").text
                news_article_place__name = news_article_place[1].find_all('a', class_="news-article-place__name")
                for place in news_article_place__name:
                    geo_str = f'Москва, {news_article_place__title} {place.text}'
                    geo_text += [geo_str]
                    # cord = getCord(geo_str)
                    # geo_cord += [cord]
                geo = getCord(geo_text)
            
            # print(geo_text)
            # print(geo_cord)

            # парсинг описания
            news_article__preview = data.find('section', class_="news-article__preview").text
            news_article__preview = news_article__preview.replace(u'\xa0', u' ')

            news_list[date_unix] = {
            'title': title,
            'description': news_article__preview,
            'date_unix': date_unix,
            'date': date,
            'link': link,
            'type': type,
            'source': 'mos.ru',
            'img': img,
            'geo': geo
            }
        
        if news_list != {}:
            writeFile(news_list)
            print('Done')
            insert_into(news_list)
        elif news_list == {}:
            print('Новых новостей нет')

    except Exception as e:
        print(f'Ошибка при выполнении метода для mos.ru\n{e}\n')
        traceback.print_exc()

# getInfoMOSRU()



def getIndoMVD():
    print('Метод по получению новостей с мвд.рф')

    link = 'https://77.xn--b1aew.xn--p1ai/news'

    areas = {'ЦАО':'Центральный','ВАО':'Восточный','ЗАО':'Западный','ЗелАО':'Зеленоградский','ТиНАО':'Троицкий и Новомосковский',
            'ЮАО':'Южный','ЮВАО':'Юго-Восточный','ЮЗАО':'Юго-Западный','СЗАО':'Северо-Западный','СВАО':'Северо-Восточный','САО':'Северный'}

    try:
        news_list = {}
        resPar = requests.get(link, headers=header).text
        data = BeautifulSoup(resPar, 'html.parser')
        b_news = data.find('div', class_="b-news")
        section_list = b_news.find('div', class_="section-list type-4 type-4a margin2")
        sl_item = section_list.find_all('div', class_="sl-item")

        for item in sl_item:

            item_title = item.find('div', class_="sl-item-title")
            title = item_title.text

            link = item_title.find('a', href=True)
            link = link['href']
            link = f'https://77.xn--b1aew.xn--p1ai/{link}'

            resParLink = requests.get(link, headers=header).text # парсим текст статьи для получения даты
            data = BeautifulSoup(resParLink, 'html.parser')

            # парсинг даты
            date_item = data.find('div', class_="article-date-item").text # сегодня / 22 апреля / 23 апреля...
            date_item = ' '.join(date_item.split()) # удаляем лишние пробелы в дате
            # print(date_item)
            date_unix = float(fromTimeToUnix_MVD(date_item)) # конвертируем в unix дату
            # print(date_unix)

            # проверка даты
            last_date = checkNews('77.мвд.рф')

            if last_date >= date_unix: # если полученная дата новости меньше или равна последней сохраненной - новость старая
                continue
            print(link)
        
            # получение нормальной даты
            date = fromUnixToTime(date_unix)

            # парсинг заголовка и описания новости со страницы статьи
            item_title = item.find('div', class_="sl-item-title")
            title = item_title.text
            description = item.find('div', class_="sl-item-text").text

            # парсинг текста статьи
            article = data.find('div', class_="article")
            texts = article.find_all('p')

            content = ''
            if len(texts) > 1:               # если в тексте несколько параграфов - нужная статья
                for text in texts:
                    content += text.text 
                
                area_info = content.split('Пресс-служба УВД по ') 

                if len(area_info) > 1:       # если часть с адресом есть после разделения 
                    area = area_info[1] # получаем часть с адресом
                else:                        # если части с адресом после разделения нет  
                    continue
            else:                            # если в тексте один параграф - статья ненужная
                continue
            # print(f'РАЙОН: {area}') 

            concret_area = ''
            for key in areas.keys():
                # print(key)
                geo = area.find(key) # если в area найден район (key из словаря areas) - geo = 0, иначе -1
                # print(geo)
                
                if geo != -1:
                    concret_area = areas[key]
                else:
                    continue

            if concret_area == '':
                continue
            
            # print(f'ПОЛНЫЙ РАЙОН: {concret_area}')
            coordinate  = gethAreaCord(concret_area)
            
            title = title.replace(u'\n', u'') # убираем лишний символ

            news_list[date_unix] = {
            'title': title,
            'description': description,
            'date_unix': date_unix,
            'date': date,
            'link': link,
            'type': 'ГУ МВД РФ по Г. Москве',
            'source': '77.мвд.рф',
            'geo': concret_area,
            'coordinate': coordinate
            }

        if news_list != {}:
            print('Done')
            insert_into(news_list)
        elif news_list == {}:
            print('Новых новостей нет')

    except Exception as e:
        print(f'Ошибка при выполнении метода для 77.мвд.рф\n{e}\n')
        traceback.print_exc()

    
# getIndoMVD()



# 'ЦАО',  'ВАО', 'ЗАО', 'ЗелАО','ТиНАО','ЮАО','ЮВАО','ЮЗАО','СЗАО','СВАО','САО',












def test():
    # url = 'https://www.mos.ru/api/newsfeed/v4/frontend/json/ru/articles?fields=id,title,date_timestamp,image,kind,territory_district_id,sphere,entity_id,entity_suffix&filter=%7B%22has_district%22:1,%22status%22:%5B%22public%22,%22public_oiv%22%5D%7D&page=1&per-page=10'
    # response = requests.get(url)

    # items = response.json()['items']


    # for item in items:
    #     id = item['id']
    #     link = f'https://www.mos.ru/news/item/{id}/'

    link = 'https://www.mos.ru/news/item/137524073/' # несколько районов в одном округе
    # link = 'https://www.mos.ru/news/item/137257073/' # несколько округов и районов
    # link = 'https://www.mos.ru/news/item/137313073/' # один округ и один район

    # парсинг района
    resPar = requests.get(link).text
    data = BeautifulSoup(resPar, 'html.parser')

    news_article_content = data.find('main', class_="news-article-content")
    news_article_footer_content = news_article_content.find('div', class_="news-article-footer-content")
    news_article_footer__rows = news_article_footer_content.find('div', class_="news-article-footer__rows")
    news_article_place = news_article_footer__rows.find_all('div', class_="news-article-place")

    news_article_place__name_0 = news_article_place[0].find_all('a', class_="news-article-place__name") # округа
    news_article_place__name_1 = news_article_place[1].find_all('a', class_="news-article-place__name") # районы

    geo_text = []
    geo_cord = []
    if len(news_article_place__name_0) == 1 and len(news_article_place__name_1) == 1:      # если один округ с районом
        news_article_place__title_0 = news_article_place[0].find('span', class_="news-article-place__title").text
        news_article_place__name_0 = news_article_place[0].find('a', class_="news-article-place__name").text
        news_article_place__title_1 = news_article_place[1].find('span', class_="news-article-place__title").text
        news_article_place__name_1 = news_article_place[1].find('a', class_="news-article-place__name").text
        geo_str = f'Москва, {news_article_place__title_0} {news_article_place__name_0}, {news_article_place__title_1} {news_article_place__name_1}'
        geo_text += [geo_str]
        # cord = getCord(geo_str)
        # geo_cord += [cord]
        geo = getCord(geo_text, area=news_article_place__name_0, district=news_article_place__name_1)
        
    elif len(news_article_place__name_0) > 1 and len(news_article_place__name_1) > 1 or len(news_article_place__name_1) > 1:      # если несколько и округов и районов
        print('несколько и округов и районов или несколько районов в одном округе')
        news_article_place__title = news_article_place[1].find('span', class_="news-article-place__title").text
        news_article_place__name = news_article_place[1].find_all('a', class_="news-article-place__name")
        for place in news_article_place__name:
            geo_str = f'Москва, {news_article_place__title} {place.text}'
            geo_text += [geo_str]
            # cord = getCord(geo_str)
            # geo_cord += [cord]
        geo = getCord(geo_text)

    print(geo)
                

# test()
