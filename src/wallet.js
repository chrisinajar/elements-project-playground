var Promise = require('bluebird');
var runCommand = require('./run-command');
var env = require('./env');
var debug = require('debug')('wallet');
var faucet = require('faucet-testnet');
var jsonfile = require('jsonfile');
var path = require('path');
var toArray = require('to-array');
var jsonic = require('jsonic');
var partial = require('ap').partial;

module.exports = {
  create: create,
  load: load,
  save: save,
  sendToSideChain: sendToSideChain,
  claimOnSidechain: claimOnSidechain,
  getTransaction: getTransaction,
  getBlockForTransaction: getBlockForTransaction
};

var bitcoinCLIAsync = Promise.promisify(bitcoinCLI);
var runCommandAsync = Promise.promisify(runCommand);

var _WALLET_FILE = path.join(__dirname, '../.wallet.json');
var BITCOIN_CLI = './bin/bitcoin-cli -testnet -rpcuser=' + env.user + ' -rpcpassword=' + env.pass + ' ';

// assign wallet variable using load
var _WALLET = {};
load();

function bitcoinCLI () {
  var args = toArray(arguments);
  var cb = args.pop();
  runCommand(BITCOIN_CLI + args.join(' '), cb);
}

function create () {
  bitcoinCLIAsync('getnewaddress')
    .then(function (data) {
      var wallet = data.trim();
      debug('Testnet address:', wallet);
      debug('Funding address now...');
      faucet(wallet, 0.1, function (err, data) {
        console.log(err || data);
      });
      save({
        address: wallet
      });
    })
    .catch(function (err) {
      if (err.trim() === 'error: couldn\'t connect to server') {
        console.log('Looks like bitcoind isn\'t running. Start it using');
        console.log('$ make run-alpha');
      } else {
        console.error(err);
      }
      return err;
    });
}

function save (wallet) {
  wallet = wallet || _WALLET;
  debug(wallet);
  jsonfile.writeFileSync(_WALLET_FILE, wallet);
}
function load () {
  try {
    _WALLET = jsonfile.readFileSync(_WALLET_FILE);
  } catch (e) {
    _WALLET = {};
  }
  return _WALLET;
}
// mqA438AUw4hCZZ8xuhTbhq1CYmiRWTeNEx

function sendToSideChain () {
  // sidechain-manipulation.py generate-one-of-one-multisig sidechain-wallet
  // we use the .sh wrapper to ensure the elements directory is on the right version before execution
  return runCommandAsync('./sidechain-manipulation.sh generate-one-of-one-multisig sidechain-wallet')
    .then(function (data) {
      debug(data);
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
      debug(data);
      _WALLET.sidechain_p2sh = data['P2SH address'];
      _WALLET.sidechain_1of1 = data['One-of-one address'];
      save();
    })
    .then(function () {
      return runCommandAsync('./sidechain-manipulation.sh send-to-sidechain ' + _WALLET.sidechain_p2sh + ' 0.1');
    })
    .then(function (data) {
      debug(data);
      var nonceRegex = /^\(nonce: (.*)\)$/;
      var txIdRegex = /^sendrawtransaction - Sent tx with id (.*)$/;
      var nonce;
      var txId;
      data
        .split('\n')
        .forEach(function (line) {
          var result = nonceRegex.exec(line);
          if (result) {
            nonce = result[1];
            return;
          }
          result = txIdRegex.exec(line);
          if (result) {
            txId = result[1];
            return;
          }
        });

      _WALLET.nonce = nonce;
      _WALLET.txId = txId;
      save();

      debug(nonce);
      debug(txId);
    });
}

function getTransaction (txId) {
  return bitcoinCLIAsync('gettransaction', txId || _WALLET.txId)
    .then(jsonic);
}

function getBlockForTransaction (txId) {
  return getTransaction(txId)
    .then(function (data) {
      if (data.blockhash) {
        return bitcoinCLIAsync('getblock', data.blockhash);
      }
      throw new Error('Transaction has not been written to a block');
    });
}

function waitForBlockDepth (txId) {
  var check = partial(checkBlockDepth, txId);
  var waitTenSeconds = partial(timeoutPromise, 10000);
  var hasWarned = false;

  return checkLoop();

  function checkLoop () {
    console.log('Checking transaction block depth...');
    return check()
      .catch(function (err) {
        console.log('Error :', err);
        if (!hasWarned) {
          hasWarned = true;
          console.log();
          console.log('You must wait until the transaction has at least 10 confirmations');
          console.log('This tool will keep retrying until you kill it.');
          console.log('To try again after killing this command, use:');
          console.log();
          console.log('./sidechains.js wallet claim');
          console.log();
          console.log('This process should take about', ((err.confirmationsNeeded - 1) * 15) + ~~(15 - (Date.now() / 60000 - 5) % 15), 'minutes');
        }
        return waitTenSeconds().then(checkLoop);
      });
  }
}

function checkBlockDepth (txId, needed) {
  needed = needed || 10;
  txId = txId || _WALLET.txId;
  // confirmations vs desired is off-by-1
  needed++;

  return getTransaction(txId)
    .then(function (data) {
      if (data.confirmations < needed) {
        var err = new Error('Not enough confirmations, need ' + (needed - 1) + ' but only found ' + (data.confirmations - 1));
        err.confirmations = data.confirmations;
        err.confirmationsNeeded = needed - data.confirmations;
        throw err;
      }
      return data.confirmations;
    });
}

function claimOnSidechain () {
  waitForBlockDepth()
    .then(function () {
      console.log('It worked!');
    })
    .then(function () {
      return runCommandAsync('./sidechain-manipulation.sh claim-on-sidechain ' + [_WALLET.sidechain_p2sh, _WALLET.nonce, _WALLET.txId].join(' '));
    })
    .then(function (data) {
      console.log(arguments);
    });
}

function timeoutPromise (ms) {
  return new Promise(function (resolve, reject) {
    setTimeout(resolve, ms);
  });
}
