*** Settings ***
Library    ../../PythonFiles/UserJsonFile.py

*** Variables ***


*** Keywords ***
Update Content For New User
    ${jsonbody}=    update_request_content_user
    [Return]    ${jsonbody}

Fetch Request Content For New User
    ${jsonbody}=    read_request_content_user
    [Return]    ${jsonbody}


Verify jsonfile vs response
    ${verifyjsonbody}=    verify_file_vs_response
    [Return]    ${verifyjsonbody}


