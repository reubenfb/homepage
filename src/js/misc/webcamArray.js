const sketch = (s) => {

	let width = 320;
	let capture;
	let canvas;
	let tracker;
	let triggered = false;

	// s.preload = () => {
	// }

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

		canvas.mouseClicked(switchVideos);
	};

	s.draw = () => {
		s.push();
		s.translate(width, 0);
		s.scale(-1,1);
		s.image(capture,0, 0, width, width*0.75);
		s.pop();

		let positions = tracker.getCurrentPosition();

		if(positions){

			let eyeOne = [23, 63, 24, 64, 25, 65, 26, 66];
			let eyeTwo = [30, 68, 29, 67, 28, 70, 31, 69];

			s.noStroke();
			s.fill(255,0,0);

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
			s.endShape(s.CLOSE)

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
			let vid = document.getElementById(`vid${randomVids[i]}`);
			vid.setAttribute('src', 'images/mp4s/try_start_small2.mp4');
			vid.removeAttribute('loop');
			triggered = true;

			vid.onended = (event) => {
				vid.setAttribute('src', 'images/mp4s/test_mosaic.mp4');
				vid.setAttribute('loop', true);
				triggered = false;
			}

			vid.load();
		}

	}

	function randomIntFromInterval(min, max) { 
		return Math.floor(Math.random() * (max - min + 1) + min)
	}

};

let myp5 = new p5(sketch, document.getElementById('canvas-container'));