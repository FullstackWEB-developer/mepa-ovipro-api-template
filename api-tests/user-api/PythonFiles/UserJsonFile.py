import json


def read_request_content_user():
    file = open('../Resources/Textfiles/NewUserInfo.json', 'r')
    jsonfile = file.read()
    return (jsonfile)


def update_request_content_user():
    file = open('../Resources/Textfiles/UpdatedUserInfo.json', 'r')
    jsonfile = file.read()
    return (jsonfile)


def verify_file_vs_response():
    file = open('../Resources/Textfiles/Check.json', 'r')
    jsonfile = file.read()
    return (jsonfile)


userGetJson = ''
with open('../Resources/Textfiles/user.get.json','r') as f:
    userGetJson = json.loads(f.read())


token = ''
with open('../Resources/Textfiles/token.txt', 'r') as f:
    token = f.read()

auth = f'Bearer {token}'
