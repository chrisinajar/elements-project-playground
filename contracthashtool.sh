#!/bin/bash

set -e

cd /vagrant/contracthashtool
git pull

make CXXFLAGS="-I../install/usr/local/include -L../install/usr/local/lib -static"
