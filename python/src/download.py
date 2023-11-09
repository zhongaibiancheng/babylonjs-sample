import requests

with open("../url.txt") as my_file:
    line = my_file.readline()
    line = line[:-1]
    print(line)
    while line:
        contents = line.split("/",-1)
        print(contents)
        filename = "../data/"+contents[len(contents) - 1]

        r = requests.get(line, allow_redirects=True)
        open(filename, 'wb+').write(r.content)
        line = my_file.readline()
        line = line[:-1]
    my_file.close()