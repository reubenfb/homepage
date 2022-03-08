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


/* SAFARI UGH */

var multiColumn = d3.select('.one-column').node().getBoundingClientRect().height == 0;

if (navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1 && multiColumn) {
  d3.selectAll('.graphic').style('border-radius', '0px');
  var introHeight = d3.select('.intro').node().getBoundingClientRect().height;
  var graphicsHeight = d3.select('.graphics-container').node().getBoundingClientRect().height;
  d3.select('.top-container').style('height', introHeight + graphicsHeight + 'px');
}