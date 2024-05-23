import os
from dotenv import load_dotenv
import requests
import traceback



load_dotenv(".env")
YANDEX_KEY = os.environ.get("YANDEX_KEY")

def searchAreaAndDistrict(Components):
    # # получение округа
    # area = Components[4]
    # # получение района
    # district = Components[5]

    area_distr = []

    if Components[4]['kind'] == 'district' and Components[5]['kind'] == 'district': # это округ и район
        # получение округа
        area = Components[4]['name']
        # получение района
        district = Components[5]['name']
        # удаление лишнего
        area =  area.split(' административный округ')[0]
        # удаление лишнего
        district = district.split('район')
        
        # обрабокта случаев и удаление лишего
        if district[0] == '':   # район Название
            district = district[1]
            district = district.lstrip()
        elif district[0] != '': # Название район
            district = district[0]
            district = district.rstrip()

        print(area)
        print(district)
        
        area_distr = [area, district]
    elif Components[3]['kind'] == 'area' and Components[4]['name'].startswith('поселение'): # это округ и поселениелоьо
        # получение округа
        area = Components[3]['name']
        # получение района
        district = Components[4]['name']
        # удаление лишнего
        area =  area.split(' административный округ')[0]
        # удаление лишнего
        district = district.split('поселение')
        
        # обрабокта случаев и удаление лишего
        if district[0] == '':   # поселение Название
            district = district[1]
            district = district.lstrip()
        elif district[0] != '': # Название поселение
            district = district[0]
            district = district.rstrip()

        print(area)
        print(district)
        
        area_distr = [area, district]
    else:
        area_distr = []
        
    return area_distr                        




def getCord(addresses, area=None, district=None): # для мос ру

    # url = f'https://geocode-maps.yandex.ru/1.x/?apikey={YANDEX_KEY}&geocode={geo}&format=json' # используем HTTP Геокодер от Яндекса

    try:
        geo = {}

        if area and district: # если один округ с районом (по адресу находим координаты и компонуем в словарь)
            url = f'https://geocode-maps.yandex.ru/1.x/?apikey={YANDEX_KEY}&geocode={addresses}&format=json' # используем HTTP Геокодер от Яндекса
            response = requests.get(url)
            print(url)

            print(area)
            print(district)
            coordinates = response.json()['response']['GeoObjectCollection']['featureMember'][0]['GeoObject']['Point']['pos']
            split_coordinates = coordinates.split() # разделение 37.551277 55.741617 на ширину и долготу,
            split_coordinates = [float(coord) for coord in split_coordinates]  # преобразовывваем в float шириину и долготу, иначе тип будет строкой
            coordinates = [split_coordinates[0], split_coordinates[1]]

            geo[tuple(coordinates)] = {
                'area': area, 
                'district': district
            }
            # return geo
        elif area is None and district is None: # если несколько (по адресу находим координаты, округ, район и компануем в словарь)
            print(addresses)
            # coordinates_arr = []
            for address in addresses:
                url = f'https://geocode-maps.yandex.ru/1.x/?apikey={YANDEX_KEY}&geocode={address}&format=json' # используем HTTP Геокодер от Яндекса
                response = requests.get(url)
                print(url)

                print(address)
                coordinates = response.json()['response']['GeoObjectCollection']['featureMember'][0]['GeoObject']['Point']['pos']
                split_coordinates = coordinates.split() # разделение 37.551277 55.741617 на ширину и долготу,
                split_coordinates = [float(coord) for coord in split_coordinates]  # преобразовывваем в float шириину и долготу, иначе тип будет строкой
                coordinates = [split_coordinates[0], split_coordinates[1]]

                for i in range(0,4,1):
                    Components = response.json()['response']['GeoObjectCollection']['featureMember'][i]['GeoObject']['metaDataProperty']['GeocoderMetaData']['Address']['Components']
                    # print(Components)
                    # if len(Components) < 6: # в этом инфы нет
                    #     continue
                    if len(Components) == 6 or len(Components) == 5: # если это поселения троицкого или новомосковского округов  and (Components[4]['kind'] == 'area' and Components[4]['name'].startwith('поселение'))
                    #     pass
                    # elif len(Components) == 6:
                        area_distr = searchAreaAndDistrict(Components)
                        print(coordinates)
                        if area_distr == []:
                            continue
                        elif area_distr != []:
                            
                            geo[tuple(coordinates)] = {
                                'area': area_distr[0], 
                                'district': area_distr[1]
                            }
                            break
                    else:
                        continue
        return geo

    except Exception as e:
        print(f'Ошибка в методе getCord при получении координат по адресу\n{e}\n')
        traceback.print_exc()


# [[37.638448718246416, 55.78243932528627], [37.57470622883601, 55.78688920854923], [37.599102684200304, 55.78674030500903]]
def getDistAndArea(coordinates_arr): # для вечерней москвы      

    try:
        geo = {}
        # print(coordinates_arr)
        for coordinates in coordinates_arr: 
            print(coordinates)
        
            url = f'https://geocode-maps.yandex.ru/1.x/?apikey={YANDEX_KEY}&geocode={coordinates[0]},{coordinates[1]}&format=json'
            print(url)
            response = requests.get(url)

            for i in range(0,4,1):
                Components = response.json()['response']['GeoObjectCollection']['featureMember'][i]['GeoObject']['metaDataProperty']['GeocoderMetaData']['Address']['Components']
                # print(Components)
                if len(Components) < 6:
                    continue
                else:
                    area_distr = searchAreaAndDistrict(Components)

                    if area_distr == []:
                       continue
                    elif area_distr != []:

                        geo[tuple(coordinates)] = {
                        'area': area_distr[0], 
                        'district': area_distr[1]
                        }
                        break 
        return geo
    except Exception as e:
        print(f'Ошибка в методе getDistAndArea при получении округа и района по координатам\n{e}\n')
        traceback.print_exc()



def gethAreaCord(area): # для 77.мвд.рф
                                                                                                                                                                                                                                                                                                                                                                    
    areas_cord = {'Центральный':[37.617644, 55.755819], 'Южный':[37.678065, 55.622014], 'Северный':[37.525774, 55.83839], 'Юго-Западный':[37.576187, 55.662735], 'Северо-Восточный':[37.632565, 55.854875], 'Западный':[37.443533, 55.728003], 'Восточный':[37.775631, 55.787715], 'Северо-Западный':[37.451555, 55.829370], 'Юго-Восточный':[37.754592, 55.692019], 'Зеленоградский':[37.194250, 55.987583], 'Троицкий и Новомосковский':[37.226887, 55.386683]}

    try:
        coordinates = []
        for key in areas_cord.keys():
            if key == area:
                coordinates = areas_cord[key]

        return coordinates
    
    except Exception as e:
        print(f'Ошибка в методе searchArea при получении координат по округу\n{e}\n')
        traceback.print_exc()
    














def Test():
    # coordinates = [[37.638448718246416, 55.78243932528627], [37.57470622883601, 55.78688920854923], [37.599102684200304, 55.78674030500903]]
    # получение района и округа
    geo = gethAreaCord('Северо-Восточный')
    print(geo)


# Test()