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
      'send-to-sidechain',
      'Send the contents of your testnet wallet to the sidechain',
      function (yargs) {
      },
      function (argv) {
        Wallet.sendToSideChain();
      }
    )
    .demand(2);
};
