const sketch = (s) => {

	let capture;
	let sizeMult = 1.5;
	let song;
	let volume = 0;
	let rate = 1;

	s.preload = () => {
		song = s.loadSound('../miscFiles/hungarian.mp3');
	}

	s.setup = () => {
		s.pixelDensity(1)
		s.createCanvas(400 * sizeMult, 300 * sizeMult);
		capture = s.createCapture(s.VIDEO);
		capture.hide();
		console.log(song)
		song.loop();
	};

	s.draw = () => {
		let colorful = 0;
		s.push();
		// flip video
		s.translate(s.width,0);
		s.scale(-1, 1);
		s.image(capture, 0, 0, s.width, s.height);
		s.pop();
		//

		// loop through pixels to count colorful ones
		s.loadPixels();
		let pixels = s.pixels;

		for(let i = 0; i < pixels.length; i+=4){

			let r = pixels[i];
			let g = pixels[i+1];
			let b = pixels[i+2];

			// calculate chroma after converting RGB to LAB
			let avg = (r+g+b)/3;
			let lab = rgb2lab([r,g,b]);
			let chroma = s.sqrt(s.pow(lab[1], 2) + s.pow(lab[2], 2));

			// calculate a perceived lum-based gray
			let gray = s.round(r*0.299+g*0.587+b*.114);

			// try not to do a racism by flagging white skin tones in light as colorful
			let myTone = [225,161,153];
			let diffTone = s.abs(r-myTone[0]) + s.abs(g - myTone[1]) + s.abs(b - myTone[2]);

			// these threshold figures are very squishy depending on light
			if(chroma < 30 || diffTone < 80) {
				// convert pixels that aren't colorful enough to grayscale
				pixels[i] = gray;
				pixels[i+1] = gray;
				pixels[i+2] = gray;
			}
			else {
				colorful++;
			}
		}

		s.updatePixels();

		// calculate percent of pixels that are colorful and write it to screen
		let perc = colorful/(s.width*s.height);
		s.fill(s.color(255));
		s.text(s.round(perc * 100) + '%', 10, s.height - 10);

		// use perc to tweak song volume, with smoothing
		let volumeTarget = s.map(perc, 0, 0.08, 0.003, 1, true);
		volume = volume * 0.7 + volumeTarget * 0.3;
		song.amp(volume);

		// also tweak song speed
		let rateTarget = s.map(perc, 0, 0.03, 0.3, 1, true);
		rate = rate * 0.7 + rateTarget * 0.3;
		song.rate(rate);
	};

	// from https://editor.p5js.org/codingJM/sketches/iZKIGYqW1
	function rgb2lab(rgb){
	  var r = rgb[0] / 255,
	      g = rgb[1] / 255,
	      b = rgb[2] / 255,
	      x, y, z;

	  r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
	  g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
	  b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

	  x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
	  y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
	  z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;

	  x = (x > 0.008856) ? Math.pow(x, 1/3) : (7.787 * x) + 16/116;
	  y = (y > 0.008856) ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
	  z = (z > 0.008856) ? Math.pow(z, 1/3) : (7.787 * z) + 16/116;

	  return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)]
	}
};

let button = document.getElementById('button');
button.addEventListener('click', () => {
	button.style.display = 'none';
	let myp5 = new p5(sketch, document.getElementById('canvas-container'));
});