# Elements Project Playground
Scripts and makefiles for playing with sidechains without worrying about building them. See the [Elements Project](https://elementsproject.org).

##### Purpose
Building a side chain is a multi-step process with all kinds of dependencies that can go wrong. The goal of this repository is to make this as easy as humanly possible. There should be no reason not to play with a sidechain if you're interested, so lets make it effortless so that it actually happens.

Currently only the alpha sidechain is supported.

# Installation
You must have `vagrant` and `npm` installed. Making will provision the vagrant image and install all dependencies.

```
$ make
```

## Building
We build both `bitcoind` and `alphad` inside of the vagrant VM. This means you don't need to deal with wrangling dependencies on your local system.

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

# Contributing
Please please do. Open a PR and it will be replied to promptly, and likely merged assuming it improves the user experience.

# License
MIT
