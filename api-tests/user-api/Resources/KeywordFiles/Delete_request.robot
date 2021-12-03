*** Settings ***
Resource    ../Common.robot


*** Variables ***


*** Keywords ***
Delete created user
    [Arguments]    ${Newid}
    log to console    Delete created user:
    Create Session    DeleteUser   ${BaseUrl}
    ${Get_Response}=   DELETE On Session     DeleteUser  /v1/businessUsers/${Newid}   headers=${headers}
    log to console    Delete user status code:${Get_Response.status_code}
    ${status_code}  convert to string    ${Get_Response.status_code}
    should be equal    ${status_code}  200
