var _ = require('lodash');
var s = require('underscore.string');

module.exports = {
  parse: function(data) {
    return _.map(data, function(item) {
      return separate(item);
    });
  }
}

function separate(data) {
  var re = /^([^\[]+)(?:\[([^\]]+)\])?/;
  var m;
  var result = {};
  if ((m = re.exec(data)) != null) {
    result['symbol'] = m[1];
    result['notify'] = notifyWhen(m[2]);
  };

  return result;
}

function notifyWhen(data) {
  if (!data) return [];

  var result = [];
  _.each(data.split(','), function(item) {
    var re = /([\+\-])?([\d\.]+)(%)?/;
    var m;
    var when = {};
    if ((m = re.exec(item)) != null) {
      // Original
      when['raw'] = m[0];
      
      // Sign
      when['sign'] = m[1] ? ((m[1] == '-') ? 'negative' : 'positive') : 'none';

      // Value
      when['value'] = s.toNumber(m[2], 2) || 0;

      // Percent
      when['percent'] = m[3] ? true : false;
    }

    if (when) result.push(when);
  });

  return result;
}
