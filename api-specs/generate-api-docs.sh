#!/bin/sh
# Generate API reference as HTML documentation 

# Prerequisites
# - node.js installed
# - redoc-cli installed

# Address API 
npx redoc-cli bundle realty-api-v1.yaml -o ./../api-docs/realty-api-reference.html --title "Realty API Reference" 
