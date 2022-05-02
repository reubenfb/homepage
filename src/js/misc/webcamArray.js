const sketch = (s) => {

	let width = 320;
	let capture;

	// s.preload = () => {
	// }

	s.setup = () => {
		s.createCanvas(width, width* 0.75);
		s.pixelDensity(1);
		capture = s.createCapture(s.VIDEO);
		capture.hide();
	};

	s.draw = () => {
		s.push();
		s.translate(width, 0);
		s.scale(-1,1);
		s.image(capture,0, 0, width, width*0.75);
		s.pop();
	};

};

let myp5 = new p5(sketch, window.document.getElementById('container'));