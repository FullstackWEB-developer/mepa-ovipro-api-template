*** Settings ***
Resource    ../Resources/KeywordFiles/Get_request.robot
Resource    ../Resources/KeywordFiles/Post_request.robot
Resource    ../Resources/KeywordFiles/Update_request.robot
Resource    ../Resources/KeywordFiles/Delete_request.robot
Resource    ../Resources/KeywordFiles/ReadJsonContentUserInfo.robot

*** Variables ***


*** Keywords ***


*** Test Cases ***
Testing user API
    log to console    Test starts
Call Get Request Test
    Get_request.Call Get Request Test
Create new user
    Post_request.Create new user and call get request to verified content
Get created user info
    Get_request.Get created user information content    ${Newid}
Update user information
    Update_request.Update user info     ${Newid}
Delete created user
    Delete_request.Delete created user  ${Newid}

