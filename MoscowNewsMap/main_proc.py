import time
from pars import getInfoVM, getInfoMOSRU, getIndoMVD



def start():
    print('Запущен')

    go = True

    while go:
        # выполнение первого метода получеиня новостей при запуске
        getInfoVM()
        time.sleep(15) # задеркжа при запуске 2 метода
        getInfoMOSRU()
        time.sleep(15) # задеркжа при запуске 3 метода
        getIndoMVD()

        go = False
        time.sleep(10) # частота выполнения цикла получеиня новостей
        go = True

start()

