#!/bin/bash
env
input="/root/repositories.txt"
while IFS= read -r line
do
  echo "Using $line repository to create a $branch branch"
  git clone $line repo
  cd repo
  if [ $action == "delete" ] 
  then
    echo "POISTA $branch"
    git branch -d $branch
  elif [ $action == "create" ] 
  then
    echo "LISÄÄ $branch"
    git branch $branch 
  else
    echo "EI TOIMINTOA"
  fi
  git status
  git push origin $branch
  cd ..
  rm -rf repo
done < "$input"