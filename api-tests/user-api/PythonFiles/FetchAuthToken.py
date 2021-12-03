import sys

from playwright.sync_api import sync_playwright

if len(sys.argv) != 3:
    print('Login information missing, try: FetchAuthToken.py <username> <passowrd>')
    sys.exit(2)

username = sys.argv[1]
passowrd = sys.argv[2]
url = 'https://www.dev-ovipro.net/login'

print(f'Fetching token from {url}')

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()

    page.goto(url)

    page.click('span.MuiButton-label:has-text("Login")')

    page.fill('input#alma-tunnus-username', username)
    page.fill('input#alma-tunnus-password', passowrd)
    page.click('button#alma-tunnus-button-login')

    page.wait_for_selector(selector=f'p:has-text("{username}")', state='attached')

    token = page.evaluate('window.ALMA.tunnus.getIdToken().idToken')

    browser.close()

    f = open('../Resources/Textfiles/token.txt', 'w')
    f.write(token)
    f.close()

    print('Token successfuly saved')
