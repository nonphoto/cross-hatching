
function Layer(element, imageData) {
	this.element = element;
	this.imageData = imageData;
	this.bounds = {
		x1: 0,
		x2: 1,
		y1: 0,
		y2: 1
	}
	this.center = center = {
		x: 0.5,
		y: 0.5
	}
}

Layer.prototype.getPixelValue = function(x, y) {

	// Convert to image coordinates.
	x = Math.floor(x * this.imageData.width);
	y = Math.floor(y * this.imageData.height);

	// Get the index that corresponds to the coordinates.
	const index = ((4 * this.imageData.width) * y) + (4 * x);

	// Get the RGB values.
	const r = this.imageData.data[index];
	const g = this.imageData.data[index + 1];
	const b = this.imageData.data[index + 2];

	// Return the average;
	return (r + g + b) / 3;
};

Layer.prototype.drawLine = function(x1, y1, x2, y2) {
	let line = document.createElementNS('http://www.w3.org/2000/svg','line');
	line.setAttribute('x1', x1);
	line.setAttribute('y1', y1);
	line.setAttribute('x2', x2);
	line.setAttribute('y2', y2);
	this.element.appendChild(line);
};

Layer.prototype.drawRayIntersection = function(threshold, cx, cy, dx, dy) {
	// Thanks: http://www.scratchapixel.com/lessons/3d-basic-rendering/minimal-ray-tracer-rendering-simple-shapes/ray-box-intersection

	// Distance from center where the ray intersects x bounds.
	const txa = (this.bounds.x1 - cx) / dx;
	const txb = (this.bounds.x2 - cx) / dx;
	const txmin = Math.min(txa, txb);
	const txmax = Math.max(txa, txb);

	// Distance from center where the ray intersects y bounds.
	const tya = (this.bounds.y1 - cy) / dy;
	const tyb = (this.bounds.y2 - cy) / dy;
	const tymin = Math.min(tya, tyb);
	const tymax = Math.max(tya, tyb);

	// If the line doesn't intersect...
	if (txmin > tymax || tymin > txmax) {
		return false;
	}

	// Distance from center where the ray first intersects the bounds.
	const ta = Math.max(txmin, tymin);

	// First intersection point.
	let ax = cx + (dx * ta);
	let ay = cy + (dy * ta);

	// Next point along the ray. (This needs to be clamped to ensure it is exactly within bounds).
	let bx = Math.max(this.bounds.x1, Math.min(this.bounds.y2, ax));
	let by = Math.max(this.bounds.y1, Math.min(this.bounds.y2, ay));

	// Should we start by drawing a line?
	let wasDrawing = this.getPixelValue(ax, ay) > threshold;

	// How far to step forward.
	const step = 0.005;

	// While the second point is still within bounds...
	while (bx >= 0 && bx <= 1 && by >= 0 && by <= 1) {

		// Advance the point along the ray.
		bx += dx * step;
		by += dy * step;

		// Should we draw a line here?
		const isDrawing = this.getPixelValue(bx, by) > threshold;


		// If we should start a new line...
		if (isDrawing && !wasDrawing) {
			ax = bx;
			ay = by;
		}

		// If we should end the current line...
		else if (!isDrawing && wasDrawing) {
			this.drawLine(ax, ay, bx, by);
		}

		wasDrawing = isDrawing;
	}

	// If we didn't finish the last line...
	if (wasDrawing) {
		const tb = Math.min(txmax, tymax);
		bx = cx + (dx * tb);
		by = cy + (dy * tb);
		this.drawLine(ax, ay, bx, by);
	}

	return true;
};

Layer.prototype.drawPattern = function(threshold, offset, dx, dy) {

	// Draw center line.
	this.drawRayIntersection(threshold, this.center.x, this.center.y, dx, dy);

	// Draw lines offset from center.
	const stepx = dx * offset;
	const stepy = dy * offset;
	let cx = stepx;
	let cy = stepy;
	while (
		this.drawRayIntersection(threshold, this.center.x - cx, this.center.y - cy, dx, dy) &&
		this.drawRayIntersection(threshold, this.center.x + cx, this.center.y + cy, dx, dy)
	) {
		// These are flipped because the offset is perpendicular to the direction of the line.
		cx += stepy;
		cy -= stepx;
	}
};

window.onload = function() {

	// Get the pixel data from the source image.
	let img = document.getElementById('source');
	let canvas = document.createElement('canvas');
	let context = canvas.getContext('2d');
	canvas.width = img.width;
	canvas.height = img.height;
	context.drawImage(img, 0, 0, img.width, img.height);
	let imageData = context.getImageData(0, 0, img.width, img.height);

	// Instantiate and draw layers.
	for (let i = 0; i < 5; i++) {
		let layer = new Layer(document.getElementById('svg-' + i), imageData);
		layer.drawPattern((255 / 5) * i, 0.01, Math.cos(i), Math.sin(i));
	}
};

window.onmousemove = function(e) {
	const ratio = 0.1
	const x = (e.clientX - (window.innerWidth / 2)) * ratio;
	const y = (e.clientY - (window.innerHeight / 2)) * ratio;
	var layers = document.getElementsByClassName("layer");
	for (let i = 0; i < layers.length; i++) {
		let p = (i - 2) * 0.1
		layers[i].style.transform = "translate(" + (x * p) + "px, " + (y * p) + "px)";
	}
};
