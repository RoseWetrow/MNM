from natasha import ( # импортируем необходимые модули из Natasha и объявляем переменные
    Segmenter,
    MorphVocab,
    LOC,
    AddrExtractor    
)
import requests
from bs4 import BeautifulSoup


# поиск адреса из текста
def searchGeo(text): # модель NLP Natasha

    stopWordsd = ['Россия', 'России', 'Росси']
    control = ['Москва', 'Москве', 'Москвы', 'Москву', 'Москвой', 
               'Московской', 'Московским', 'Московский', 'Московская', 'Московские']

    morph_vocab = MorphVocab()
    addr_extractor = AddrExtractor(morph_vocab)
    #Текст, содержащий адреса - text
    matches = addr_extractor(text) # извлечение адреса из текста
    facts = [i.fact.as_json for i in matches]
    address = ''
    
    controller = False
    for i in range(len(facts)): # цикл для вывода адреса в удобной форме
        part = list(facts[i].values())
        
        if part[0] in stopWordsd or (part[0] in control and controller == True):
            continue
        elif part[0] in control and controller == False:
            controller = True
            address += f'Москва, '
        else:
            address += f'{part[0]} '

    return address
    # добавить проверку на результат адреса


# получение округа и района из html (метод для mos.ru)
def searchDistrict():
    pass

