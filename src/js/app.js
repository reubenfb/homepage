'use strict'

var d3 = require("d3-selection");
var LazyLoad = require("vanilla-lazyload");

var lazyLoadInstance = new LazyLoad({});

if(window.innerWidth < 500 || ('ontouchstart' in window)|| (navigator.MaxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0)){
  return;
} else {
  d3.selectAll('.graphic')
    .on('mouseover', function(){
      d3.select(this).classed('userHover', true);
    })
    .on('mouseleave', function(){
      d3.select(this).classed('userHover', false);
    });
}