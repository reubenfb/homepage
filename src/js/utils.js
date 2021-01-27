'use strict';
var _ = require('underscore');

module.exports = {

  reorderData: function(data, columns){

    var counter = [0,0,0,0].slice(0, columns);
    var colArray = [[],[],[],[]];

    var newData = [];
    var columnCount = 0;

    _.each(data, function(chart, i){

      if(i === 0){
        colArray[0].push(chart);
        counter[0] = chart.highlight === "TRUE" ? counter[0] + 2 : counter[columnCount] + 1;
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

    // you need to balance the columns with blanks to make sure the sorting works
    let  maxCount = Math.max(...counter);

    let fakeChart = {
      title: 'You found my secret column-balancing chart',
      image: 'reuben.jpg',
      link: 'reubenfb.com',
      highlight: '',
      secret: 'TRUE'
    }

    _.each(counter, function(count,i){

      if(count < maxCount){
        colArray[i].push(fakeChart);
      }

    });

    return colArray[0].concat(colArray[1]).concat(colArray[2]).concat(colArray[3])

  }

}