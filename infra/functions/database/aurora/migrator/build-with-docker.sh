#!/bin/bash
set -e
if [ "$CI" != true ] ; then
clear
fi

# Console colors
D='\033[1;30m' # Dark Grey
B='\033[0;35m' #
O='\033[1;34m' # Orange
N='\033[0m'    # No Color

BASEDIR=$(dirname "$0")

cd $BASEDIR

# Get handler name
PARENT_DIR=${PWD##*/}
HANDLER_NAME=$PARENT_DIR

# Create Docker volumes for caching (faster repeatable build speeds)
printf "\n${D}USING VOLUMES:${N}\n"

printf "\n${O}ƛ${N} ${B}TEST:${N}\n"
echo "TODO"

printf "\n${O}ƛ${N} ${B}BUILD:${N}\n"
docker run \
	--rm \
	--interactive \
	-w /var/task \
	-v $PWD:/var/task \
  lambci/lambda:build-java11 \
  mvn clean package --no-transfer-progress
exit 0
