var Wallet = require('../wallet');

exports.command = 'wallet';

exports.describe = 'Create and manage wallets in both testnet and alpha';

exports.builder = function (yargs) {
  return yargs
    .command(
      'new',
      'Create new wallet',
      function (yargs) {
        return yargs
          .option('force', {
            alias: 'f',
            default: false,
            boolean: true
          });
      },
      function (argv) {
        var wallet = Wallet.load();

        if (wallet.address) {
          console.warn('You already have a testnet wallet');
          if (argv.force) {
            console.warn('Force overwriting existing wallet!!');
          } else {
            console.warn('If you would like to overwrite your existing wallet with a new one, use --force');
            return;
          }
        }
        Wallet.create();
      }
    )
    .command(
      'show',
      'Show wallet information',
      function (yargs) {
      },
      function (argv) {
        console.log(JSON.stringify(Wallet.load(), null, '  '));
      }
    )
    .command(
      'send',
      'Send the contents of your testnet wallet to the sidechain',
      function (yargs) {
      },
      function (argv) {
        Wallet.sendToSideChain()
          .then(Wallet.claimOnSidechain)
          .catch(console.error.bind(console));
      }
    )
    .command(
      'tx-status',
      'Check the status of the send-to-chain transaction',
      function (yargs) {},
      function (argv) {
        var wallet = Wallet.load();
        if (!wallet.txId) {
          return console.error('Please use `wallet send` to setup the transaction');
        }
        Wallet.getBlockForTransaction(wallet.txId)
          .then(function (data) {
            console.log(data);
          });
      }
    )
    .command(
      'claim',
      'Claim the alpha wallet containing the pegged testnet coins',
      function (yargs) {
      },
      function (argv) {
        Wallet.claimOnSidechain();
      }
    )
    .command(
      'spend',
      'Spend the transaction on the sidechain',
      function (yargs) {
      },
      function (argv) {
        Wallet.spendOnSidechain();
      }
    )
    .demand(2);
};
