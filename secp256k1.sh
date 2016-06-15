#!/bin/bash

INSTALL_DIR=/vagrant/install

set -e

[ -d $INSTALL_DIR ] || mkdir $INSTALL_DIR

cd /vagrant/secp256k1
git pull

./autogen.sh
./configure --with-bignum=no

make
make DESTDIR=$INSTALL_DIR install
