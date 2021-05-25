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

mvn clean package

exit 0
