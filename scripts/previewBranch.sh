#!/bin/bash
input="/root/repositories.txt"
while IFS= read -r line
do
  echo "Using $line repository to create a $branch branch"
  git clone $line repo
  cd repo
  if [ $action == "delete" ] 
  then
    echo "POISTA $branch"
    git push origin --delete $branch
  elif [ $action == "create" ] 
  then
    echo "LISÄÄ $branch"
    git branch $branch 
    git push origin $branch
  else
    echo "EI TOIMINTOA"
  fi

  cd ..
  rm -rf repo
done < "$input"