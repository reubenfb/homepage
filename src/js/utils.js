'use strict';
var _ = require('underscore');

module.exports = {

  reorderData: function(data, columns){

    var counter = new Array(columns).fill(0);
    var colArray = _.map(counter, function(){ return []; });

    var columnCount = 0;

    _.each(data, function(chart, i){

      if(i === 0){
        colArray[0].push(chart);
        counter[0] = chart.highlight === "TRUE" ? 2 : 1;
      }
      else {
        assignColumn();
      }

      function assignColumn() {

        var prevColumn = columnCount - 1 < 0 ? columns - 1 : columnCount - 1;

        if(counter[columnCount] < counter[prevColumn] || (columnCount === 0 && counter[columnCount] === counter[prevColumn])){
          colArray[columnCount].push(chart);
          counter[columnCount] = chart.highlight === "TRUE" ? counter[columnCount] + 2 : counter[columnCount] + 1;
          columnCount = columnCount + 1 < columns ? columnCount + 1 : 0;
          return;
        } else {
          columnCount = columnCount + 1 < columns ? columnCount + 1 : 0;
          assignColumn();
        }

      }
    });

    return colArray;

  }

}
