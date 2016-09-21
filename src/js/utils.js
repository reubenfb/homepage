'use strict';
var _ = require('underscore');

module.exports = {

  reorderData: function(data, columns){

    var counter = [0,0,0,0].slice(0, columns);
    var colArray = [[],[],[],[]];

    var newData = [];
    var columnCount = 0;

    _.each(data, function(chart){
      var nextColumn = columnCount + 1;
      if(nextColumn === columns){
        nextColumn = 0;
      }
      if(counter[columnCount] <= counter[nextColumn]){
        colArray[columnCount].push(chart);
        counter[columnCount] = chart.interactive === "TRUE" ? counter[columnCount] + 2 : counter[columnCount] + 1;
      }
      else {
        colArray[nextColumn].push(chart);
        counter[nextColumn] = chart.interactive === "TRUE" ? counter[nextColumn] + 2 : counter[nextColumn] + 1;
      }
      columnCount = nextColumn;
    });

    return colArray[0].concat(colArray[1]).concat(colArray[2]).concat(colArray[3])

  }

}