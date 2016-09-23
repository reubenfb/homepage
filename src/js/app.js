'use strict'

var d3 = require('d3-selection');
var _ = require('underscore');
var data = require('../../data/data.json').reverse();
var newArray = data.slice();

d3.selectAll('.graphic')
  .on('mouseover', function(){
    d3.select(this).classed('userHover', true);
  })
  .on('mouseleave', function(){
    d3.select(this).classed('userHover', false);
  });


function randomSelect() {

  d3.selectAll('.graphic').classed('chosen', false);
  var chosen =  newArray[0].image.replace('.png', '');
  d3.selectAll('.' + chosen).classed('chosen', true);

  newArray.shift();

  if(newArray.length == 0){
    newArray = data.slice();
  }

}

setInterval(randomSelect, 750);




