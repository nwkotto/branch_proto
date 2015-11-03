var BoardView = React.createClass({
    getInitialState: function() {
        var state = {
            styles: this.windowBounds(),
            board: new Board()
        }
        return state;
    },
    windowBounds: function() {
        return {
            width: window.innerWidth,
            height: window.innerHeight
        }
    },
    updateWindowBounds: function() {
        this.setState({styles: this.windowBounds()});
    },
    componentDidMount: function() {
        window.addEventListener("resize", this.updateWindowBounds);
    },
    componentWillUnmount: function() {
        window.removeEventListener("resize", this.updateWindowBounds);
    },
    blockWrapperMouseMove: function(e) {
        var pxCoords = {
            row: e.pageY,
            col: e.pageX
        };
        var coords = this.state.board.openBlockCoords(pxCoords, this.refs.blockWrapper.getBoundingClientRect());
        var freshBlock = null;
        if (coords.row > -1 && coords.col > -1) {
            freshBlock = {
                coords: coords,
                isDummy: true
            }
        }
        this.setState({freshBlock: freshBlock});
    },
    blockWrapperClick: function(e) {
        var freshBlock = this.state.freshBlock;
        if (freshBlock && freshBlock.coords.row > -1 && freshBlock.coords.col > -1) {
            this.state.board.addBlock({}, this.state.freshBlock.coords);
            this.setState({board: this.state.board});
        }
    },

    // Block update functions
    updateBlock: function(block, attributes) {
        var blockToUpdate = this.state.board.getBlock(block);
        for (var attribute in attributes) {
            blockToUpdate[attribute] = attributes[attribute];
        }
        this.setState({board: this.state.board});
    },
    updateBlockSpec: function(e) {
        e.preventDefault();
        var coords = {
            col: this.refs.freshCol.value,
            row: this.refs.freshRow.value
        }
        this.state.board.updateBlockSpec(coords);
        this.setState({board: this.state.board});
    },


    render: function() {
        var blockSpec = this.state.board.getBlockSpec();

        var that = this;
        var blocks = this.state.board.getFormattedBlocks().map(function(block) {
            return (
                <BlockView updateBlock={that.updateBlock} key={block.key} block={block} spec={blockSpec} />
            )
        });
        var freshBlock = null;
        if (this.state.freshBlock) {
            freshBlock = (
                <BlockView block={this.state.freshBlock} spec={blockSpec} />
            )
        }
        return (
            <div style={this.state.styles}>
                <form onSubmit={this.updateBlockSpec}>
                    <input ref="freshCol" placeholder="New column width" />
                    <input ref="freshRow" placeholder="New row height" />
                    <input type="submit" />
                </form>
                <div className={this.state.board.getClassName()}
                    style={this.state.board.getStyles()}
                    onMouseMove={this.blockWrapperMouseMove}
                    onClick={this.blockWrapperClick}
                    ref="blockWrapper">
                    {blocks}
                    {freshBlock}
                </div>
                <div className="vertical-center"></div>
            </div>
        )
    }
})