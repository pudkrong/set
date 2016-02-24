var blessed = require('blessed');
var log = require('winston');
var _ = require('lodash');

var screen = blessed.screen({
  smartCSR: true
});
screen.key(['escape', 'q', 'C-c'], function(ch, key) {
  return process.exit(0);
});

var Box = function() {
  this.box = blessed.listtable({
    top: 0,
    left: 0,
    width: 30,
    height: 'shrink',
    mouse: false,
    align: 'left',
    valign: 'top',
    pad: 5,
    tags: true,
    style: {
      header: {
        fg: 'cyan',
        bold: true,
        border: {
          fg: 'red'
        }
      },
      cell: {
        fg: 'white'
      }
    }
  });

  screen.append(this.box);

  this.render = function() {
    this.box.screen.render();
  };

  this.setHeader = function(header) {
    this.header = header;
  };

  this.setData = function(data) {
    var self = this;
    this.data = [this.header];
    this.data.push(['']);
    _.each(data, function(d) {
      var data = makeStyle(d, 2, [1, 2, 3]);
      self.data.push(data);
    });

    this.box.setData(this.data);
    this.render();
  };

  // Return style data by given column
  function makeStyle(data, indexStyle, indexReplace) {
    var matches = /^([\+\-])?([\d\.]+)/.exec(data[indexStyle]);
    var sign = matches ? matches[1] || '' : '';
    var color = 'white'
    switch(sign) {
      case '+':
        color = 'green';
        break;
      case '-':
        color = 'red';
        break;
    }

    indexReplace = _.isArray(indexReplace) ? indexReplace : [indexReplace];
    _.each(indexReplace, function(i) {
      if (data[i]) {
        data[i] = ('{<<color>>-fg}' + data[i] + '{/<<color>>-fg}').replace(/\<\<color\>\>/g, color);
      }
    });

    return data
  }
};

module.exports = Box;
