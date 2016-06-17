#!/bin/bash

cd /vagrant/elements/
git checkout alpha
git pull
source /vagrant/.env

./contrib/sidechain-manipulation.py $@
