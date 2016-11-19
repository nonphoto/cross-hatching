This webpage renders an image by cross-hatching SVG lines. Moving the mouse produces a subtle 3d effect. I spent about four hours writing code, but I spent a lot more just thinking about the problem. I could have spent less time on a less math-y project, but I thought it was a good idea and I was having fun anyway. All you have to do to run it is open `index.html` in Safari (I'm in Safari 10.0). Unfortunately it does not work on Chrome at the moment, but it looks like a minor bug.

EDIT: I made a change to ensure that lines are not cut off prematurely. Floating point math was causing the beginning of the line to already be out of bounds by a tiny fraction.

Jonas Luebbers, Fall 2016
