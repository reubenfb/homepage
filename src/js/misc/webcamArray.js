const sketch = (s) => {

	let width = 320;
	let capture;
	let canvas;
	let tracker;

	// logic for controlling video trigger
	const hiddenThreshold = 2000;
	let eyesRevealed = false;
	let eyesHiddenStart = 0;
	let eyesTimeHidden = 0;
	let triggered = false;


	s.setup = () => {
		s.pixelDensity(1);
		capture = s.createCapture(s.VIDEO);
		capture.elt.setAttribute('playsinline', '');
		canvas = s.createCanvas(width, width* 0.75);
		capture.size(320,240);
		capture.hide();

		tracker = new clm.tracker();
		tracker.init();
		tracker.start(capture.elt);

		//canvas.mouseClicked(switchVideos);
	};

	s.draw = () => {
		s.push();
		s.translate(width, 0);
		s.scale(-1,1);
		s.image(capture,0, 0, width, width*0.75);
		s.pop();

		let positions = tracker.getCurrentPosition();

		if(positions){

			eyesRevealed = true;
			eyesHiddenStart = 0;
			eyesTimeHidden = 0;

			let eyeOne = [23, 63, 24, 64, 25, 65, 26, 66];
			let eyeTwo = [30, 68, 29, 67, 28, 70, 31, 69];

			s.noFill();

			s.beginShape();
				for(let i = 0; i < eyeOne.length; i++){
					let pos = positions[eyeOne[i]];
					// inverting X
					s.vertex(-(pos[0] - 320), pos[1]);
				}
			s.endShape(s.CLOSE)

			s.beginShape();
				for(let i = 0; i < eyeTwo.length; i++){
					let pos = positions[eyeTwo[i]];
					s.vertex(-(pos[0] - 320), pos[1]);
				}
			s.endShape(s.CLOSE);

			s.textSize(20);
			s.textFont('Courier New');
			s.fill(255);
			let margin = 8;

			s.textAlign(s.LEFT, s.TOP);
			s.text('PLEASE', margin, margin);

			s.textAlign(s.RIGHT, s.TOP);
			s.text('HIDE', 320-margin, margin);

			s.textAlign(s.LEFT, s.BOTTOM);
			s.text('YOUR', margin, 240-margin);

			s.textAlign(s.RIGHT, s.BOTTOM);
			s.text('EYES', 320-margin, 240-margin);


		}
		else {

			if(eyesHiddenStart == 0){
				eyesHiddenStart = new Date();
			}

			eyesTimeHidden = new Date() - eyesHiddenStart;

			if(!triggered && eyesRevealed && eyesTimeHidden > hiddenThreshold){
				switchVideos();
			}
			
		}
		
	};

	function switchVideos(){

		if(triggered == true){
			return;
		}

		let vids = [1,2,3,4,5,6,7,8];
		let randomCount = randomIntFromInterval(1,4);
		let randomVids = vids.sort(() => .5 - Math.random()).slice(0,randomCount);

		for(let i = 0; i<randomVids.length; i++){
			let mosaic = document.getElementById(`mosaic${randomVids[i]}`);
			let webcam = document.getElementById(`webcam${randomVids[i]}`);
			mosaic.style.opacity = 0;
			webcam.play();
			mosaic.pause();
			mosaic.currentTime = 0;
			triggered = true;

			webcam.onended = (event) => {
				mosaic.style.opacity = 1;
				mosaic.play();
				triggered = false;
				eyesRevealed = false;
				eyesHiddenStart = 0;
				eyesTimeHidden = 0;
			}
		}
	}

	function randomIntFromInterval(min, max) { 
		return Math.floor(Math.random() * (max - min + 1) + min)
	}

};

let myp5 = new p5(sketch, document.getElementById('canvas-container'));