(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const sketch = (s) => {

	let capture;
	let tracker;
	let height = 450;
	let width = height * 4/3;
	let offset = 0;
	let vidWidth = width;
	const pixelDensity = 1;
	const centerCLMpoint = 33;
	let circleSize = 225;
	let circleX = -1000;
	let circleY = -1000;
	let faceAppeared = false;


	let pixelShow = Array(width * height).fill(false);

	if(navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/iPhone/i)){
		vidWidth = height * 3/4;
		offset = (width - vidWidth)/2;
		circleSize = 300;
		document.querySelector('#canvas-container').style.transform = 'scale(1.5)';
	}

	s.setup = () => {
		s.createCanvas(width, height);
		s.pixelDensity(pixelDensity);
		capture = s.createCapture(s.VIDEO);
		capture.elt.setAttribute('playsinline', '');
		capture.size(width, height);
		capture.hide();

		console.log(faceapi.nets)
	};

	s.draw = () => {
		s.clear();
		s.push();
		// flip video
		s.translate(width,0);
		s.scale(-1, 1);
		s.image(capture, offset, 0, vidWidth, height);
		s.pop();

		s.loadPixels();
		let pixels = s.pixels;
	};

};

let ptDistance = function(pt1, pt2){
	return Math.sqrt(Math.pow((pt1[0]-pt2[0]), 2) + Math.pow((pt1[1]-pt2[1]), 2));
}

let myp5 = new p5(sketch, document.querySelector('#canvas-container'));
},{}]},{},[1]);
