var request = require('request-promise');
var cheerio = require('cheerio');
var s = require('underscore.string');
var log = require('winston');

var stockUrl = 'http://marketdata.set.or.th/mkt/stockquotation.do?symbol={symbol}&language=th&country=TH';
var setUrl = 'http://marketdata.set.or.th/mkt/sectorialindices.do?language=th&country=TH';

module.exports = {
  getStockByName: function(name) {
    var options = {
      method: 'GET',
      url: stockUrl.replace(/{symbol}/g, name),
      resolveWithFullResponse: true
    };
    return request(options)
      .then(function(res) {
        var keys = ['price', 'change', 'percent', 'previous', 'open', 'high', 'low', 'volume', 'value', 'avg'];
        var data = {
          symbol: s(name).toUpperCase().value()
        };
        var $ = cheerio.load(res.body);
        $('table.table-set')
          .eq(0)
          .find('tbody tr')
          .nextAll()
          .each(function(i, el) {
            var $td = $(this).find('td').eq(1);
            data[keys[i]] = s.trim($td.text());
          });

        return data;
      });
  },

  getSET: function() {
    var options = {
      method: 'GET',
      url: setUrl,
      resolveWithFullResponse: true
    };
    return request(options)
      .then(function(res) {
        var data = [];
        var $ = cheerio.load(res.body);
        var keys = ['symbol', 'price', 'change', 'percent', 'high', 'low', 'volume', 'value'];
        $('table.table-info')
          .eq(0)
          .find('tbody tr')
          .each(function(i, el) {
            var temp = {};
            $(this)
              .find('td')
              .each(function(i, el) {
                temp[keys[i]] = s($(this).text()).trim().toUpperCase().value();
              });
            if (temp) data.push(temp);
          });

        return data;
      });
  }
}
