$(document).ready(function() {

    // ***** MODELS ***** //
    var Grid = function() {
        // Indexing in - data[row][column]
        var priv = {
            grid: [],

            // Expand the grid
            addRow: function(op) {
                op = op || "push";
                var freshRow = [];
                if (this.grid.length > 0) {
                    freshRow = this.grid[0].map(function(item) {
                        return -1;
                    });
                }
                this.grid[op](freshRow);
                return this;
            },
            addRows: function(number) {
                return this._repeat("addRow", number);
            },
            addCol: function(op) {
                op = op || "push";
                this.grid = this.grid.map(function(item) {
                    item[op](-1);
                    return item;
                });
                return this;
            },
            addCols: function(number) {
                return this._repeat("addCol", number);
            },
            padBoard: function() {
                // Check outer row items
                function updateActions(actions, block, method, param) {
                    var action = {
                        method: method,
                        param: param
                    };
                    if (block > -1 && actions.indexOf(action) === -1) {
                        actions.push(action);
                    }
                }

                try {
                    var padActions = [];
                    // Columns
                    for (var i = 0; i < this.grid.length; ++i) {
                        updateActions(padActions, this.grid[i][0], this.addCol, "unshift");
                        updateActions(padActions, this.grid[i][this.grid[0].length - 1], this.addCol, "push");
                    }

                    // Rows
                    for (var i = 0; i < this.grid[0].length; ++i) {
                        updateActions(padActions, this.grid[0][i], this.addRow, "unshift");
                        updateActions(padActions, this.grid[this.grid.length - 1][i], this.addRow, "push");
                    }

                    // Initialize pad actions
                    console.log(padActions);
                    padActions.map(function(action) {
                        action["method"].apply(priv, [action["param"]]);
                    });
                } catch (e) {
                    console.log(e);
                }
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
                return -1;
            },
            setBlock: function(block, index) {
                priv.addRows((block.row + 1) - priv.grid.length).addCols((block.col + 1) - priv.grid[0].length);

                // Add block index to grid
                console.log("set block", block.row, block.col);
                priv.grid[block.row][block.col] = index;

                priv.padBoard();
                console.log("Grid", priv.grid);
            },

            // Metadata methods
            numRows: function() {
                return priv.grid.length;
            },
            numCols: function() {
                return priv.grid.length > 0 ? priv.grid[0].length : 0;
            }
        }

        return pub;
    }

    var Board = function(params) {
        var params = params || {};
        var priv = {
            wrapperClass: params.wrapperClass || "block-wrapper",
            grid: new Grid(),
            blocks: [],
            blockSpec: {
                col: parseInt(params.width, 10) || 300,
                row: parseInt(params.height, 10) || 185
            },
            styles: {},
            updateStyles: function() {
                // Specify board params based on grid size
                var width = this.blockSpec.col * this.grid.numCols(),
                    height = this.blockSpec.row * this.grid.numRows();

                // Resize board; re-specify bounds
                this.styles = {
                    "width": width,
                    "height": height
                }
                console.log(this.styles);
                return this;
            },
            getBounds: function() {
                return {
                    "col": {
                        "start": $board.position().left,
                        "end": $board.position().left + $board.width()
                    },
                    "row": {
                        "start": $board.position().top,
                        "end": $board.position().top + $board.height()
                    }
                }
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
            }
        };

        var pub = {
            getClassName: function() {
                return priv.wrapperClass;
            },
            getStyles: function() {
                return priv.styles;
            },
            getBlocks: function() {
                return priv.blocks;
            },
            getBlockSpec: function() {
                return priv.blockSpec;
            },
            addBlock: function(row, col) {
                var block = {
                    row: row,
                    col: col
                };
                priv.blocks.push(block);
                priv.grid.setBlock(block, priv.blocks.length - 1);
                priv.updateStyles();
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
        priv.updateStyles();

        return pub;
    }

    // ***** VIEWS ***** //
    var BlockView = React.createClass({
        getBlockPosition: function() {
            var position = {
                left: 0,
                top: 0
            };
            var spec = this.props.spec,
                coords = this.props.coords;
            position.left = spec.col * coords.col;
            position.top = spec.row * coords.row;
            return position;
        },
        render: function() {
            return (
                <div className="block" style={this.getBlockPosition()}>
                    Allo
                </div>
            )
        }
    });
    
    var BoardView = React.createClass({
        getInitialState: function() {
            var state = {
                styles: this.windowBounds(),
                board: new Board()
            }
            state.board.addBlock(0,0);
            state.board.addBlock(1,0);
            console.log(state);
            return state;
        },
        windowBounds: function() {
            return {
                width: window.innerWidth,
                height: window.innerHeight
            }
        },
        updateWindowBounds: function() {
            this.setState({styles: this.windowBounds()})
        },
        componentDidMount: function() {
            window.addEventListener("resize", this.updateWindowBounds);
        },
        componentWillUnmount: function() {
            window.removeEventListener("resize", this.updateWindowBounds);
        },
        handleMouseMove: function(e) {
            // console.log("Move", e.clientX, e.clientY);
        },
        handleClick: function(e) {
            // console.log("Click", e.clientX, e.clientY);
        },
        blockCoords: function(block) {

        },
        render: function() {
            var blockSpec = this.state.board.getBlockSpec();

            var that = this;
            var blocks = this.state.board.getBlocks().map(function(block) {
                var key = block.row.toString() + block.col.toString();
                return (
                    <BlockView key={key} block={block} coords={block} spec={blockSpec} />
                )
            });
            return (
                <div style={this.state.styles}
                    onMouseMove={this.handleMouseMove}
                    onClick={this.handleClick}>
                    <div className={this.state.board.getClassName()} style={this.state.board.getStyles()}>
                        {blocks}
                    </div>
                    <div className="vertical-center"></div>
                </div>
            )
        }
    })
    ReactDOM.render(<BoardView />, document.getElementById("pane"))

    // var board = new Board();
    // board.addBlock(0, 0);
    // board.addBlock(0, 1);
    // board.addBlock(0, 2);
    // board.addBlock(1, 0);
});