*** Settings ***
Resource    ../Common.robot
Resource    ReadJsonContentUserInfo.robot

*** Variables ***


*** Keywords ***
Update user info
    [Arguments]    ${Newid}
    log to console  Update user info:
    Create Session    UpdateUser   ${BaseUrl}
    ${createdjsonContent}=     Update Content For New User

    ${convertedToJson}=    Convert String to JSON    ${createdjsonContent}
    ${updatedjsonContent}=    Update value to JSON    ${convertedToJson}     id  ${Newid}
    ${jsonAsString}=     Convert JSON to string  ${updatedjsonContent}

    ${updatedresponse}=     put on session    UpdateUser     /v1/businessUsers/${Newid}  data=${jsonAsString}     headers=${headers}
    log to console    Updated user content: ${updatedresponse.content}
    ${code}=    convert to string    ${updatedresponse.status_code}
    log to console    Updated user content status code: ${updatedresponse.status_code}
    should be equal    ${code}  200
