var vagrant = require('node-vagrant');
var once = require('once');
var debug = require('debug')('vagrant');
var machine = vagrant.create();

var startVagrantOnce = once(startVagrant);

module.exports = runCommand;

function runCommand (cmd, cb) {
  startVagrantOnce();
  debug('Running:', cmd);
  cmd = 'cd /vagrant/ && ' + cmd;
  machine._run(['ssh', '-c', cmd], cb);
}

function startVagrant () {
  debug('Starting up vagrant...');
  machine.up(function (err, out) {
    if (err) {
      console.error(err.stack || err);
      process.exit(1);
    }
    debug('Vagrant is running!');
  });
}
