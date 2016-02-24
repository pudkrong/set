#!/usr/bin/env node

var winston = require('winston');
var toYAML = require('winston-console-formatter');
var _ = require('lodash');
var s = require('underscore.string');
var Promise = require('promise');
var schedule = require('node-schedule');
var moment = require('moment');
var program = require('commander');

var stock = require('./stock');
var Box = require('./box');
var parser = require('./parser');
var notify = require('./notify');

var log = new winston.Logger({
  level: 'debug'
});
log.add(winston.transports.Console, toYAML.config());

program
  .version('0.0.1')
  .usage('[options] <symbol ...>')
  .option('-i, --interval', 'Time to update')
  .parse(process.argv);

var watchList = parser.parse(program.args);

var box = new Box();
box.setHeader(['Symbol', 'Price', 'Change', 'Percent']);

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
      var data = _.map(stocks, function(item) {
        if (item.symbol == '_blank') {
          return [''];
        } else {
          return [item.symbol, item.price, item.change, item.percent + ' %'];
        }
      });

      data.push(['']);
      data.push(['Updated', moment().format('HH:mm:ss')]);
      box.setData(data);

      // Alert
      notify.check(watchList, stocks);
    })
    .catch(function(err) {
      // log.error(err);
      getStocks();
    });
};

getStocks();
var job = schedule.scheduleJob('*/30 * * * * *', getStocks);
