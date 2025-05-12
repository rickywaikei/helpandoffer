#!/bin/bash

# Script to update version number from 3.0 to 3.2 in all handlebars files

# Find all handlebars files containing the version string and update them
find views/ -name "*.handlebars" -type f -exec sed -i 's/{{__ '\''app.name'\''}} - {{__ '\''about.version'\''}} 3.0/{{__ '\''app.name'\''}} - {{__ '\''about.version'\''}} 3.2/g' {} \;

echo "Version updated to 3.2 in all handlebars files"
