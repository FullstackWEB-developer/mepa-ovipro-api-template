*** Settings ***
Library    RequestsLibrary
Library    Collections
Library    JSONLibrary
Library    Zoomba.APILibrary
Library     OperatingSystem
Variables    ../PythonFiles/UserJsonFile.py

*** Variables ***
${BaseUrl}      https://api.dev-ovipro.net
${RequestId}    dda8d27a-6d3f-406a-a783-4aa19f52b779
${UserID}       f12fdae4-7851-4c21-aa4f-7727ab2fadbd
&{headers}  Content-Type=application/json   charset=UTF-8   Authorization=${auth}    Request-Id=${RequestId}
