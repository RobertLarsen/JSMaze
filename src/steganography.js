var Steganography = function() {
    this._alphabet = null;
    this._maze = null;
    this._solution = null;
    this._text = null;
    this._cell_letter_table = null;
};

Steganography.prototype.initialize = function(alphabet, maze, solution, text, font_size) {
    var randomCharacter, i;
    this._alphabet = alphabet;
    this._maze = maze;
    this._solution = solution;
    this._text = text;
    this._cell_letter_table = [];
    this._font_size = font_size;

    randomCharacter = function() {
        return alphabet.charAt(Math.floor(Math.random() * alphabet.length));
    };
    maze.eachCell(function(c) {
        this._cell_letter_table[c.getId()] = randomCharacter();
    }, this);
    i = 0;
    solution.forEach(function(c) {
        var ch = (i >= text.length ? this._cell_letter_table[c.getId()] : text.charAt(i));
        i++;
        this._cell_letter_table[c.getId()] = ch;
    }, this);
};

Steganography.prototype.paint = function(context) {
    this._maze.eachCell(function(cell) {
        var ch = this._cell_letter_table[cell.getId()],
            center = cell.getCenter(),
            metrics = context.measureText(ch);
        context.fillText(ch, center.x - metrics.width / 2, center.y + this._font_size / 2);
    }, this);
};
