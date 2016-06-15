#!/bin/bash

set -e

BRANCH=$1

cd /vagrant/
[ -d ./bin ] || mkdir bin

cd elements
git checkout ${BRANCH}
git pull

# configure and build
./autogen.sh
./configure --with-incompatible-bdb
make

if [ "$BRANCH" == "mainchain" ]
then
  mv src/bitcoin{d,-cli,-tx} ../bin/
else
  mv src/alpha{d,-cli,-tx} ../bin/
fi
