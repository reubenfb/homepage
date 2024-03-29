let scale = require('d3-scale');
let makeMosaic = require('./makeMosaic.js');

const sketch = (s) => {

	let text = "I saw the best minds of my generation destroyed by madness, starving hysterical naked, dragging themselves through the negro streets at dawn looking for an angry fix, angelheaded hipsters burning for the ancient heavenly connection to the starry dynamo in the machinery of night, who poverty and tatters and hollow-eyed and high sat up smoking in the supernatural darkness of cold-water flats floating across the tops of cities contemplating jazz, who bared their brains to Heaven under the El and saw Mohammedan angels staggering on tenement roofs illuminated, who passed through universities with radiant cool eyes hallucinating Arkansas and Blake-light tragedy among the scholars of war, who were expelled from the academies for crazy & publishing obscene odes on the windows of the skull, who cowered in unshaven rooms in underwear, burning their money in wastebaskets and listening to the Terror through the wall, who got busted in their pubic beards returning through Laredo with a belt of marijuana for New York, who ate fire in paint hotels or drank turpentine in Paradise Alley, death, or purgatoried their torsos night after night with dreams, with drugs, with waking nightmares, alcohol and cock and endless balls, incomparable blind streets of shuddering cloud and lightning in the mind leaping toward poles of Canada & Paterson, illuminating all the motionless world of Time between, Peyote solidities of halls, backyard green tree cemetery dawns, wine drunkenness over";

	let capture;
	let height = 450;
	let width = height * 4/3;
	let offset = 0;
	let vidWidth = width;

	let charWidth = 12;
	let charHeight = 18;
	let textChars;
	let len = (width/charWidth) * (height/charHeight);

	if(navigator.userAgent.match(/Android/i) || navigator.userAgent.match(/iPhone/i)){
		vidWidth = height * 3/4;
		offset = (width - vidWidth)/2;
	}

	let weightScale = scale.scaleLinear()
		.range([200, 900]);

	let opacityScale = scale.scaleLinear()
		.range([0.05, 1]);

	s.setup = () => {
		s.createCanvas(width, height*2);
		s.pixelDensity(1);
		capture = s.createCapture(s.VIDEO);
		capture.hide();

		let textBlock = document.querySelector('#text');
		textBlock.style.width = width +'px';
		textBlock.style.height = height + 'px';

		writeText(text, textBlock);

		document.querySelector('form')
			.addEventListener('submit', function(e){
				e.preventDefault();
				text = document.querySelector('textarea').value;
				writeText(text, textBlock);
			});

	};

	s.draw = () => {
		s.push();
		// flip video
		s.translate(width,0);
		s.scale(-1, 1);
		s.image(capture, offset, height, vidWidth, height);
		s.pop();

		s.loadPixels();
		let pixels = s.pixels;
		pixels = pixels.slice(pixels.length/2, pixels.length);

		let chars = makeMosaic(charWidth, charHeight, width, height, pixels);

		// sharpending via non-linear scale
		let pow = 1.8;
		let lums = chars.map(char => 0.299*char[0] + 0.587*char[1] + 0.114*char[2]);
		lums = lums.map(lum => Math.pow(lum, pow))
		let lumMax = Math.max(...lums);
		weightScale.domain([0, lumMax]);
		opacityScale.domain([0, lumMax]);

		for(i = 0; i < len; i++){
			textChars[i].style.opacity = opacityScale(lums[i]);
			textChars[i].style.fontWeight = Math.round(weightScale(lums[i]));
		}

	};

	function writeText(text, parent){
		let xPos = 0;
		let yPos = 0;
		text = text.replace(/\s/g, '');

		// repeat text inputs that are too short
		while(text.length < len){
			text += text;
		}

		parent.innerHTML = "";

		for(let i = 0; i < len; i++){

			let newChar = document.createElement('div');
			newChar.innerHTML = text.charAt(i);
			newChar.classList.add('char');
			newChar.style.left = xPos + 'px';
			newChar.style.top = yPos + 'px';

			parent.appendChild(newChar);

	  		xPos += charWidth;

			if(xPos >= width){
				xPos = 0;
				yPos += charHeight;
			}
		}

		textChars = document.querySelectorAll('.char');
	}

};

let myp5 = new p5(sketch, document.querySelector('#canvas-container'));