(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports = function makeMosaic(itemWidth, itemHeight, totalWidth, totalHeight, pixels, pixelDensity){

	pixelDensity = pixelDensity || 1;

	if(totalWidth % itemWidth != 0 || totalHeight % itemHeight != 0){
		console.error("Mosaic size doesn't fit cam dimensions");
		return;
	}

	let finalPixels = [];
	let len = totalWidth/itemWidth * totalHeight/itemHeight;

	for(let i = 0; i < len; i++){
		finalPixels.push([0, 0, 0]);
	}

	// logic to handle higher pixel densities, selecting 
	// top-left pixel in each "grid" of high density pixels

	let finalPx = 0;

	for(let i = 0; i < pixels.length; i+=4){

		let densePx = i/4;
		let row = Math.floor(densePx/(totalWidth * pixelDensity));

		if(densePx % pixelDensity == 0 && row % pixelDensity == 0){

			let x = finalPx % totalWidth;
			let y = Math.floor(finalPx/totalWidth);
			let gridX = Math.floor(x/itemWidth);
			let gridY = Math.floor(y/itemHeight);
			let pos = gridX + gridY*(totalWidth/itemWidth);

			finalPixels[pos][0] += pixels[i];
			finalPixels[pos][1] += pixels[i+1];
			finalPixels[pos][2] += pixels[i+2];

			finalPx++;
		}
	}


	return finalPixels.map(px => {
		return px.map(num => Math.round(num/(itemWidth * itemHeight)))
	});
}


},{}]},{},[1]);
