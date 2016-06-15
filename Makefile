
SHELL = /bin/sh

ROOT=$(shell pwd)
VAGRANTENV=${ROOT}/.vagrant/
USERENV=${ROOT}/.env
BINDIR=${ROOT}/bin/
ELEMENTSDIR=${ROOT}/elements/
ALPHAD=${ROOT}/bin/alphad
BITCOIND=${ROOT}/bin/bitcoind
SECPINSTALL=${ROOT}/install
CCHT=${ROOT}/contracthashtool/contracthashtool
CCHTDIR=${ROOT}/contracthashtool
SECPDIR=${ROOT}/secp256k1
NODE_MODULES=${ROOT}/node_modules
NEW_UUID=$(shell date | md5)

.PHONY: all requirements clean alpha mainchain run-mainchain run-alpha stop build

all: requirements
$(VAGRANTENV): Vagrantfile setup.sh
	which vagrant || echo 'Please install vagrant'
	vagrant up --no-provision
	vagrant provision
	touch "$@"

$(NODE_MODULES): package.json
	npm install
	touch "$@"

requirements: $(VAGRANTENV) $(NODE_MODULES)
clean: 
	- vagrant destroy
	rm -rf ${VAGRANTENV}
	rm -rf $(USERENV)
	rm -rf $(ELEMENTSDIR)
	rm -rf $(BINDIR)
	rm -rf $(SECPDIR)
	rm -rf $(SECPINSTALL)
	rm -rf $(CCHTDIR)

build: mainchain alpha

$(ALPHAD): $(VAGRANTENV)
	vagrant up
	vagrant ssh -c 'cd /vagrant/ && ./build.sh alpha'
alpha: $(ALPHAD)

$(BITCOIND): $(VAGRANTENV)
	vagrant up
	vagrant ssh -c 'cd /vagrant/ && ./build.sh mainchain'
mainchain: $(BITCOIND)

.PHONY: secp256k1
secp256k1: $(SECPINSTALL)
$(SECPINSTALL): $(VAGRANTENV) secp256k1.sh
	vagrant up
	vagrant ssh -c 'cd /vagrant/ && ./secp256k1.sh'

.PHONY: contracthashtool
contracthashtool: $(CCHT)
$(CCHT): $(VAGRANTENV) $(SECPINSTALL) contracthashtool.sh
	vagrant up
	vagrant ssh -c 'cd /vagrant/ && ./contracthashtool.sh'

stop:
	vagrant up
	- vagrant ssh -c 'killall alphad ; killall bitcoind'

run-alpha: stop alpha run-mainchain
	vagrant ssh -c "cd /vagrant/ && ./bin/alphad -rpcuser=vagrantrpc -rpcpassword=${NEW_UUID} -testnet -rpcconnect=127.0.0.1 -rpcconnectport=18332 -tracksidechain=all -txindex -blindtrust=true" &
	sleep 5

run-mainchain: stop mainchain
	vagrant ssh -c "cd /vagrant/ && ./bin/bitcoind -rpcuser=vagrantrpc -rpcpassword=${NEW_UUID} -testnet -txindex" &
	sleep 5
