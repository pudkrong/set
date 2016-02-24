var stock = require('./stock');
var Box = require('./box');
var parser = require('./parser');
var winston = require('winston');
var toYAML = require('winston-console-formatter');
var _ = require('lodash');
var s = require('underscore.string');
var Promise = require('promise');
var schedule = require('node-schedule');
var moment = require('moment');
var program = require('commander');
var log = new winston.Logger({
  level: 'debug'
});
var n = require('./notify');
console.log('========n========', n);
log.add(winston.transports.Console, toYAML.config());

program
  .version('0.0.1')
  .usage('[options] <symbol ...>')
  .option('-i, --interval', 'Time to update')
  .parse(process.argv);

var watchList = parser.parse(program.args);
log.info(watchList);

function getStocks() {
  var allReturns = _.map(watchList, function(item) {
    return stock.getStockByName(item.symbol);
  });

  // Add SET data
  allReturns.push(Promise.resolve({ symbol: '_blank', price: '' }));
  allReturns.push(stock.getSET());

  Promise.all(allReturns)
    .then(function(result) {
      var stocks = _.flatten(result);

      log.info(stocks);

      var data = _.map(stocks, function(item) {
        if (item.symbol == '_blank') {
          return [''];
        } else {
          return [item.symbol, item.price, item.change, item.percent];
        }
      });
    })
    .catch(function(err) {
      log.error(err);
      // getStocks();
    });
};

getStocks();
