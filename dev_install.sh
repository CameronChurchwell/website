#!/bin/sh

#define colors for shell outputs
reset=$(tput sgr0)
red=$(tput setaf 1)
green=$(tput setaf 2)
blue=$(tput setaf 4)

install_dir=$(pwd)
echo "Installing in directory: $install_dir"

#Homebrew
if [[ $(command -v brew) == "" ]]; then
    echo "$red Did not find Homebrew! Installing...$reset"
    /usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
else
    echo "$green Found Homebrew! Updating...$reset"
    brew update
    echo "$green Homebrew Update Complete$reset"
fi

#Python3
if [[ $(command -v python3) == "" ]]; then
    echo "$red Did not find Python! Installing...$reset"
    brew install python3
    echo "$green Installed python3$reset"
else
    echo "$green Found Python3$reset"
fi

#pip3
if [[ $(command -v pip3) == "" ]]; then
    echo "Did not find pip3"
    brew install pip3
    echo "$green Installed pip3$reset"
else
    echo "$green Found pip3$reset"
fi

#Postgres (also starts server on login)
if [[ $(command -v postgres) == "" ]]; then
    echo "Installing Postgres"
    brew install postgres
    pg_ctl -D /usr/local/var/postgres start && brew services start postgresql
    echo "$green Installed and Started Postgres$reset"
else
    echo "$green Found Postgres, Starting pg_ctl if stopped$reset"
    pg_ctl -D /usr/local/var/postgres start && brew services start postgresql
fi

#Setup DB Roles and Account
if [[ $(command -v psql) == "" ]]; then
    echo "$red Did not find psql. Check installation$reset"
    exit 1
else
    read -p "$red Enter New DB Password: $reset" dbpass #Ask user for new password
    psql postgres -c "CREATE ROLE cameron WITH LOGIN PASSWORD '$dbpass';" #Create new role
    psql postgres -c "ALTER ROLE cameron CREATEDB;" #Give cameron permission to create databases
    psql postgres -c "CREATE DATABASE website;" #Create database
    psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE website TO cameron;"
    psql postgres -c "ALTER ROLE cameron SUPERUSER;"
    psql -U cameron -d website -c "CREATE EXTENSION IF NOT EXISTS citext; CREATE EXTENSION IF NOT EXISTS lo; CREATE EXTENSION IF NOT EXISTS pgcrypto; CREATE EXTENSION IF NOT EXISTS ltree;"
    echo "$green DB has been created with name 'website' and role 'cameron'$reset"
fi

#Eventually we should add something here that restores from a dump

#Install virtualenv
if [[ $(command -v virtualenv) == "" ]]; then
    echo "$red Did not find virtualenv! Installing...$reset"
    pip3 install virtualenv
    echo "$green Installed virtualenv$reset"
else
    echo "$green Found virtualenv!$reset"
fi

#Create environment
if [ -d "env" ]
then
    echo "$green Found environment directory!$reset"
else
    echo "Making env directory"
    mkdir env
    echo "Creating website environment"
    virutalenv ./env/websiteEnv
    echo "$green Created virtualenv$reset"
fi

#Install python packages
source ./env/websiteEnv/bin/activate
echo "$green Activated virtualenv!$reset"
echo "Installing python packages"
pip3 install --no-cache-dir -r ./python_requirements.txt
echo "$green Installed required python packages!"

#Install Dart
if [[ $(command -v dart) == "" ]]; then
    echo "$red Did not find Dart! Installing...$green"
    brew tap dart-lang/dart
    brew install dart
    pub upgrade
    pub get
    echo "$green Installed Dart$reset"
else
    echo "Found Dart! Updating..."
    brew upgrade dart
    pub get
    echo "$green Updates complete$reset"
fi

#Install Sass
if [[ $(command -v sass) == "" ]]; then
    echo "$red Did not find Sass! Installing...$reset"
    brew install sass/sass/sass
    echo "$green Installed Sass$reset"
else
    echo "$green Found Sass!$reset"
fi
    
