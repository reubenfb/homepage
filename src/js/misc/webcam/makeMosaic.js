module.exports = function makeMosaic(itemWidth, itemHeight, totalWidth, totalHeight, pixels){

	let finalPixels = [];
	let len = totalWidth/itemWidth * totalHeight/itemHeight;

	for(let i = 0; i < len; i++){
		finalPixels.push([0, 0, 0]);
	}

	for(let i = 0; i < pixels.length; i+=4){

		let r = pixels[i];
		let g = pixels[i+1];
		let b = pixels[i+2];

		let pixel = i/4;
		let x = pixel % totalWidth;
		let y = Math.floor(pixel/totalWidth);
		let gridX = Math.floor(x/itemWidth);
		let gridY = Math.floor(y/itemHeight);
		let pos = gridX + gridY*(totalWidth/itemWidth);

		finalPixels[pos][0] += r;
		finalPixels[pos][1] += g;
		finalPixels[pos][2] += b;

	}

	return finalPixels.map(px => {
		return px.map(num => Math.round(num/(itemWidth * itemHeight)))
	});
}

