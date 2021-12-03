*** Settings ***
Resource    ../Common.robot
Resource    Post_request.robot

*** Variables ***

*** Keywords ***
Get created user information content
    [Arguments]    ${Newid}
    log to console    Get created user content:
    Create Session    GetCreatedUserInfo   ${BaseUrl}
    ${Get_Response}=   GET On Session     GetCreatedUserInfo  /v1/businessUsers/${Newid}   headers=${headers}
    log to console    Created user info status:${Get_Response.status_code}
    log to console    Created user content:${Get_Response.content}

    ${code}=    convert to string    ${Get_Response.status_code}
    should be equal     ${code}     200


Call Get Request Test
    ${response}=   Call Get Request     ${headers}     ${BaseUrl}     /v1/businessUsers/${UserID}

    Log    ${response.text}

    # assert response status code
    Should Be True     ${response.status_code} == 200

    # assert response has expected json value
    Validate Response Contains Expected Response     ${response.text}    ${userGetJson}
