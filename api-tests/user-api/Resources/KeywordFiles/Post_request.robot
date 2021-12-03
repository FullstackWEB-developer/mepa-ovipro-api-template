*** Settings ***
Library    OperatingSystem
Resource    ReadJsonContentUserInfo.robot
Resource    ../Common.robot

*** Variables ***


*** Keywords ***
Create new user and call get request to verified content
    log to console  Create new user:
    Create Session    CreateUser   ${BaseUrl}

    #Read content from json file
    ${jsonContent}=     Fetch Request Content For New User
    #Post ${jsonContent} as Data to API endpoint and store response to Variable ${response}
    ${response}=     POST On Session    CreateUser     /v1/businessUsers  data=${jsonContent}    headers=${headers}
    ${code}=    convert to string    ${response.status_code}
    log to console    User creation Status code:${response.status_code}
    should be equal    ${code}  200

    #Convert ${response.content} to JSON and store it to ${json_response}
    ${json_response}=    Convert String to JSON    ${response.content}

    # fetch actual value from response json ${json_response} with(get value from json) from json path(id)
    # and store it to list(@{id_list)
    @{id_list}=   get value from json   ${json_response}    id

    # Fetching the value(get from list) from the list(${id_list}) indexed 0 to variable(${Newid})
    ${Newid}=   get from list   ${id_list}     0

    log to console  Here is new User's ID: ${Newid}
    Set Suite Variable     ${Newid}

    [Return]    ${Newid}


