var BlockView = React.createClass({
    getBlockPosition: function() {
        var position = {
            left: 0,
            top: 0,
            width: 0,
            height: 0
        };
        var spec = this.props.spec,
            block = this.props.block;

        position.width = spec.col;
        position.height = spec.row;

        position.left = spec.col * block.coords.col;
        position.top = spec.row * block.coords.row;
        return position;
    },
    populateBlock: function(e) {
        e.preventDefault();
        var freshAttributes = {
            title: this.refs.freshTitle.value,
            subtitle: this.refs.freshSubtitle.value,
            url: this.refs.freshUrl.value,
            editing: false
        };

        // Update block in board object
        this.props.updateBlock(this.props.block, freshAttributes);

        this.refs.freshTitle.value = "";
        this.refs.freshSubtitle.value = "";
        this.refs.freshUrl.value = "";
    },
    render: function() {
        var styles = this.getBlockPosition();

        var contents = null;
        if (this.props.block.isDummy) {
            contents = (
                <div>
                </div>
            );
        } else if (this.props.block.editing) {
            contents = (
                <form onSubmit={this.populateBlock}>
                    <input placeholder="Title" ref="freshTitle" />
                    <input placeholder="Subtitle" ref="freshSubtitle" />
                    <input placeholder="Url" ref="freshUrl" />
                    <input type="submit" />
                </form>
            );
        } else {
            styles.backgroundImage = "url(" + this.props.block.url + ")";
            contents = (
                <div>
                    <h2>{this.props.block.title}</h2>
                    <h3>{this.props.block.subtitle}</h3>
                </div>
            );
        }

        // Render contents in block wrapper
        return (
            <div className="block content" style={styles}>
                {contents}
            </div>
        )
    }
});