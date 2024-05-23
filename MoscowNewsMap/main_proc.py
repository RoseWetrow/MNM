import time
import schedule
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

# def qw1():
#     print('1')
    
# def qw2():
#     print('2')

# def qw3():
#     print('3')


# def start():
#     print('Запущен')

#     go = True

#     while go:
#         # выполнение первого метода получеиня новостей при запуске
#         qw1()
#         time.sleep(5) # задеркжа при запуске 2 метода
#         qw2()
#         time.sleep(5) # задеркжа при запуске 3 метода
#         qw3()

#         go = False
#         time.sleep(10) # частота выполнения цикла получеиня новостей
#         go = True

  
    
# start()