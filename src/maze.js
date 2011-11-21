/**
 * Copyright (c) Mozilla Foundation http://www.mozilla.org/
 * This code is available under the terms of the MIT License
 */
if (!Array.prototype.filter) {
    Array.prototype.filter = function(fun /*, thisp*/) {
        var len = this.length >>> 0;
        if (typeof fun != "function") {
            throw new TypeError();
        }

        var res = [];
        var thisp = arguments[1];
        for (var i = 0; i < len; i++) {
            if (i in this) {
                var val = this[i]; // in case fun mutates this
                if (fun.call(thisp, val, i, this)) {
                    res.push(val);
                }
            }
        }

        return res;
    };
}

if (!Array.prototype.random) {
    Array.prototype.random = function() {
        return this.length ? this[Math.floor(Math.random() * this.length)] : undefined;
    };
}

if (!Array.prototype.forEach) {
    Array.prototype.forEach = function(callback, obj) {
        for (var i = 0; i < this.length; i++) {
            callback.call(obj || window, this[i], i, this);
        }
    };
}

var Maze = function() { };

Maze.prototype.eachCell = function(callback, obj) { };
Maze.prototype.paint = function(context) {
    this.eachCell(function(cell) {
        cell.paint(context);
    });
};

Maze.Cell = function() { };
Maze.Cell.prototype.getId = function() { };
Maze.Cell.prototype.paint = function(context) { };
Maze.Cell.prototype.hasAllWalls = function() { };
Maze.Cell.prototype.breakWallTo = function(neighbour) { };
Maze.Cell.prototype.getAllNeighbours = function() { };
