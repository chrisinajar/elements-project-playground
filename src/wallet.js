var runCommand = require('./run-command');
var env = require('./env');
var debug = require('debug')('wallet');
var faucet = require('faucet-testnet');
var jsonfile = require('jsonfile');
var path = require('path');

module.exports = {
  create: create,
  load: load,
  save: save,
  sendToSideChain: sendToSideChain
};
var _WALLET_FILE = path.join(__dirname, '../.wallet.json');

// assign wallet variable using load
var _WALLET;
load();

function create () {
  runCommand('./bin/bitcoin-cli -testnet -rpcuser=' + env.user + ' -rpcpassword=' + env.pass + ' getnewaddress', function (err, data) {
    if (err) {
      if (err.trim() === 'error: couldn\'t connect to server') {
        console.log('Looks like bitcoind isn\'t running. Start it using');
        console.log('$ make run-alpha');
      } else {
        console.error(err);
      }
      return;
    }
    var wallet = data.trim();
    debug('Testnet address:', wallet);
    debug('Funding address now...');
    faucet(wallet, 0.1, function (err, data) {
      console.log(err || data);
    });
    save({
      address: wallet
    });
  });
}

function save (wallet) {
  wallet = wallet || _WALLET;
  jsonfile.writeFileSync(_WALLET_FILE, wallet);
}
function load () {
  _WALLET = jsonfile.readFileSync(_WALLET_FILE);
  return _WALLET;
}
// mqA438AUw4hCZZ8xuhTbhq1CYmiRWTeNEx

function sendToSideChain () {
  // sidechain-manipulation.py generate-one-of-one-multisig sidechain-wallet
  // we use the .sh wrapper to ensure the elements directory is on the right version before execution
  runCommand('./sidechain-manipulation.sh generate-one-of-one-multisig sidechain-wallet', function (err, data) {
    console.log(err || data);
    var lines = data.split('\n');
    data = {};
    lines
      .map(function (line) {
        return line.split(': ');
      })
      .filter(function (d) {
        return d.length === 2;
      })
      .forEach(function (d) {
        data[d[0]] = d[1];
      });
    _WALLET_FILE.sidechain_p2sh = data['P2SH address'];
    save();

    runCommand('./sidechain-manipulation.sh send-to-sidechain ' + _WALLET_FILE.sidechain_p2sh + ' 0.1', function (err, data) {
      console.log(err || data);
      // ./contrib/sidechain-manipulation.py claim-on-sidechain 2NCs5ufweTL8VHKNT6wrZMTkrnnmpZCy99j 94ffbf32c1f1c0d3089b27c98fd991d5 bf01b88710b6023125379510ebd84b373bee88217c80739a1144e5e92b4ee2d0
    });
  });
}
