def writeFile(news):
    with open('./MoscowNewsMap/news.txt', 'w', encoding="utf-8") as file:
        file.write(str(news))

        