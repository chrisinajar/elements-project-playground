# Elements Project Playground
Scripts and makefiles for playing with sidechains without worrying about building them. See the [Elements Project](https://elementsproject.org).

**TL;DR** `make run-alpha`

##### Purpose
Building a side chain is a multi-step process with all kinds of dependencies that can go wrong. The goal of this repository is to make this as easy as humanly possible. There should be no reason not to play with a sidechain if you're interested, so lets make it effortless so that it actually happens.

Currently only the alpha sidechain is supported.

# Installation
You must have `vagrant` and `npm` installed. Making will provision the vagrant image and install all dependencies.

```
$ make
```

## Building
We build both `bitcoind` and `alphad` inside of the vagrant VM. This means you don't need to deal with wrangling dependencies on your local system. We also build a few tools for talking to the bitcoin daemons.

```
$ make build
```

## Running
To start the alpha sidechain node, run
```
$ make run-alpha
```
to stop them again, use
```
$ make stop
```
You can also clean up all the built assets (including the vagrant image) with
```
$ make clean
```

# API

### Makefile

#### `make requirements`
Provision the vagrant image and run `npm install`

#### `make clean`
Delete all generated assets

#### `make alpha`
Build the alpha sidechain binaries

#### `make mainchain`
Build the main bitcoin binaries

#### `make run-mainchain`
Start up `bitcoind` inside of the vagrant VM

#### `make run-alpha`
Start up `alphad` inside of the vagrant VM

#### `make stop`
Stop both `alphad` and `bitcoind`. Does not stop the VM.

#### `make build`
Build all binaries: alpha, bitcoin, libsecp256k1, contracthashtool

#### `make secp256k1`
Build libsecp256k1 binaries.

#### `make contracthashtool`
Build contracthashtool binaries.

# Contributing
Please please do. Open a PR and it will be replied to promptly, and likely merged assuming it improves the user experience.

# License
MIT
