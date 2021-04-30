Creating, updating or deleting a Preview branch
===============================================

## Preview environments
Preview environments are AWS Dev accounts _feature_ environments. As Ovi PRO ERP consists multiple API Domains and each API Domain is individual GitHub repository, environment has to be deployed from multiple repositories.

Currently there are 3 mandatory GitHub repositories (`mepa-ovipro-common-environment`, `mepa-ovipro-core-backend` and `mepa-valtti`), that are required to be deployed into preview environment in order to make it work.

To ease developers/teams work, we introduce you this Docker image, where you can easilly create those preview environments (or update or delete).

## Prerequisite
In order to work with this docker image, you obiously need docker running on your local environment. Also as this uses GIT, you need to have configured GIT.
These samples, howto build and run this docker image assumes that you using some form unix system (like linux or mac).

## Build that docker image
Building docker image is quite easy. You need to just provide docker command such as
```
docker build -t <name of docker image> . --build-arg SSH_PRIVATE_KEY="$(cat ~/.ssh/id_rsa)"
```

## To run Docker image
This docker images main purpose is to create or delete git branches from given git repositories (check `repositories.txt` file). When ever there is need to add more repositories, just add them to this AND push them to git too!
To create or update preview environemnt use this type of docker command
```
docker run -v ~/.gitconfig:/etc/gitconfig -e action=create -e branch=<name of preview branch> <name of docker image>
```

To delete preview environemnt use this type of docker command
```
docker run -v ~/.gitconfig:/etc/gitconfig -e action=delete -e branch=<name of preview branch> <name of docker image>
```