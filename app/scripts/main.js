$(document).ready(function() {
	var Grid = function() {
		// Indexing in - data[row][column]
		var priv = {
			grid: [[true]],

			// Expand the grid
			addRow: function() {
				var freshRow = this.grid[0].map(function(item) {
					return false;
				});
				this.grid.push(freshRow);
				return this;
			},
			addRows: function(number) {
				return this._repeat("addRow", number);
			},
			addCol: function() {
				this.grid = this.grid.map(function(item) {
					item.push(false);
					return item;
				});
				return this;
			},
			addCols: function(number) {
				return this._repeat("addCol", number);
			},

			// Internal methods
			_repeat: function(method, number) {
				for (var i = 0; i < number; ++i) {
					this[method]();
				}
				return this;
			}
		}

		var pub = {
			// Getters and setters
			getBlock: function(row, col) {
				if (row < priv.grid.length && col < priv.grid[0].length) {
					return priv.grid[row][col];
				}
				return null;
			},
			setBlock: function(row, col, blockData) {
				priv.addRows((row + 1) - priv.grid.length).addCols((col + 1) - priv.grid[0].length);
				console.log(priv.grid);
				priv.grid[row][col] = blockData;
			},

			// Metadata methods
			numRows: function() {
				return priv.grid.length;
			},
			numCols: function() {
				return priv.grid[0].length;
			}
		}

		return pub;
	}

	var Board = function(params) {
		var params = params || {};
		var priv = {
			grid: new Grid(),
			$object: $(params.selector || ".board"),
			blockSpec: {
				col: parseInt(params.width, 10) || 300,
				row: parseInt(params.height, 10) || 185
			},
			updateBounds: function() {
				// Specify board params based on grid size
				var width = this.blockSpec.col * this.grid.numCols(),
					height = this.blockSpec.row * this.grid.numRows();

				// Resize board; re-specify bounds
				var $board = this.$object;
				$board.css({
					"width": width + "px",
					"height": height + "px"
				});
				this.bounds = {
					"col": {
						"start": $board.position().left,
						"end": $board.position().left + $board.width()
					},
					"row": {
						"start": $board.position().top,
						"end": $board.position().top + $board.height()
					}
				}
				return this;
			},
			rowAndCol: function(coords) {
				var indexes = {
					"row": -1,
					"col": -1
				};

				// Check row and col bounds
				for (var dimension in this.bounds) {
					console.log(coords[dimension]);
					if (coords[dimension] > this.bounds[dimension].start && coords[dimension] < this.bounds[dimension].end) {
						var difference = coords[dimension] - this.bounds[dimension].start;
						indexes[dimension] = Math.floor(difference / this.blockSpec[dimension]);
					}
				}

				return indexes;
			},
			createBlockObject: function(row, col) {
				var styles = "left:" + (col * this.blockSpec.col).toString() + "px; top:" + (row * this.blockSpec.row).toString() + "px;";
				this.$object.append("<div class='block' style='" + styles + "'></div>");
			}
		};

		var pub = {
			addBlock: function(row, col) {
				priv.grid.setBlock(row, col, {});
				priv.updateBounds();
				priv.createBlockObject(row, col);
			},
			nearestOpenBlock: function(y, x) {
				var rowAndCol = priv.rowAndCol({
					"row": y,
					"col": x
				});
				console.log(priv.grid.getBlock(y, x));
				return rowAndCol;
			}
		}

		// Initialization
		priv.updateBounds();

		return pub;
	}

	var board = new Board();


	var setBodySize = function() {
		$("body").css({
			"width": $(window).width() + "px",
			"height": $(window).height() + "px"
		});
	}
	$(window).resize(function() {
		setBodySize();
	});

	$(window).on("mousemove", function(e) {
		console.log(board.nearestOpenBlock(e.clientY, e.clientX));
	});

	// Init
	setBodySize();
	board.addBlock(0, 0);
	board.addBlock(0, 1);
	board.addBlock(0, 2);
	board.addBlock(1, 0);
});