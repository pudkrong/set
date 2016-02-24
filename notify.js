var _ = require('lodash');
var s = require('underscore.string');
var notifier = require('node-notifier');
var nc = new notifier.NotificationCenter();

module.exports = {
  check: function(watchList, data) {
    _.each(watchList, function(watchItem) {
      analyse(watchItem, data);
    });
  }
}

function analyse(watchItem, data) {
  var current = _.find(data, function(d) {
    return d.symbol.toLowerCase() == watchItem.symbol;
  });

  if (current) {
    // Keep price for reference
    if (!watchItem['ref']) {
      watchItem['ref'] = s.toNumber(current.price, 2) || 0;
    }

    _.each(watchItem.notify, function(notification) {
      if (checkThreshold(watchItem, notification, current)) {
        // Alert
        var subtitle = notification.raw;
        var msg = 'Current => ' + current.price;
        nc.notify({
          'title': watchItem.symbol.toUpperCase(),
          'subtitle': subtitle,
          'message': msg,
          'sound': 'Ping', // case sensitive
          // 'appIcon': __dirname + '/coulson.jpg',
          // 'contentImage': __dirname + '/coulson.jpg',
          // 'open': 'file://' + __dirname + '/coulson.jpg'
        });
      }
    });
  }
}

function checkThreshold(watchItem, notification, data) {
  var checkingValue = s.toNumber(data.price, 2) || 0;
  var thresholdValue = s.toNumber(notification.value, 2) || 0;

  var shouldAlert = false;
  if (notification.sign == 'positive') {
    // check relative from ref
    if (notification.percent) {
      shouldAlert = (((checkingValue - watchItem.ref) / watchItem.ref)  >= thresholdValue);
    } else {
      shouldAlert = ((checkingValue - watchItem.ref) >= thresholdValue);
    }
  } else if (notification.sign == 'negative') {
    // check relative from ref
    if (notification.percent) {
      shouldAlert = (((checkingValue - watchItem.ref) / watchItem.ref)  <= thresholdValue);
    } else {
      shouldAlert = ((checkingValue - watchItem.ref) <= thresholdValue);
    }
  } else {
    // check absolute from ref
    if (notification.percent) {
      // shouldAlert = (((checkingValue - watchItem.ref) / watchItem.ref)  <= thresholdValue);
    } else {
      if (watchItem.ref > thresholdValue) {
        shouldAlert = (checkingValue <= thresholdValue);
      } else {
        shouldAlert = (checkingValue >= thresholdValue);
      }
    }
  }

  return shouldAlert;
}
