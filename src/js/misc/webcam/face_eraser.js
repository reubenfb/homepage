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

		tracker = new clm.tracker();
		tracker.init();
		tracker.start(capture.elt);
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

		let positions = tracker.getCurrentPosition();

		if(positions){
			let pos = positions[centerCLMpoint];

			// only smooth after the face has shown up
			if(faceAppeared){
				circleX = circleX*0.8 + -(pos[0] - width)*0.2; // inverting because webcam)
				circleY = circleY*0.8 + pos[1]*0.2;
			}
			else {
				circleX = -(pos[0] - width);
				circleY = pos[1];
			}

			faceAppeared = true;
		}

		for(let i = 0; i < pixels.length; i+=4){

			let px = i/4;

			if(pixelShow[px] == false){
				let x = px % width;
				let y = Math.floor(px/width);

				let distToCenter = ptDistance([x,y], [circleX, circleY]);

				if(distToCenter < circleSize/2){
					pixelShow[px] = true;
				}
				else {
					pixels[i] = 0;
					pixels[i+1] = 0;
					pixels[i+2] = 0;
				}
			}

		}

		s.updatePixels();
		s.noFill();
		s.strokeWeight(2);
		s.stroke(255,60,0);
		s.circle(circleX, circleY, circleSize);
	};

};

let ptDistance = function(pt1, pt2){
	return Math.sqrt(Math.pow((pt1[0]-pt2[0]), 2) + Math.pow((pt1[1]-pt2[1]), 2));
}

let myp5 = new p5(sketch, document.querySelector('#canvas-container'));