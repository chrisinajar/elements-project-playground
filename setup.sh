#!/bin/bash

cd /vagrant/

apt-get update -q
apt-get upgrade -y

apt-get -y install \
  build-essential \
  libtool autotools-dev autoconf pkg-config \
  libssl-dev libboost-all-dev libdb5.1-dev libdb5.1++-dev \
  git

# Get source code
git clone https://github.com/ElementsProject/elements
git clone https://github.com/bitcoin/secp256k1
git clone https://github.com/blockstream/contracthashtool
git clone https://github.com/jgarzik/python-bitcoinrpc
