import React, { Component } from "react";
import { connect } from "react-redux";
import { removeMessage } from "../redux/ActionCreators";
import { Button, Collapse } from "react-bootstrap";
import "./Message.css";

const mapStateToProps = (store) => ({
    messages: store.messages,
});

const mapDispatchToProps = {
    removeMessage,
};

const Message = connect(
    mapStateToProps,
    mapDispatchToProps
)(
    class extends Component {
        constructor() {
            super();

            this.state = { showMore: [] };
        }

        messageDurationInSeconds = 10;

        updateMessage = (data) => {
            // Clear the message after some seconds
            let message =
                data.message || data.statusText || JSON.stringify(data);
            let stackTrace = data.stackTrace;

            setTimeout(() => {
                // We only clear the message if the user did not click "Show more"
                if (!this.state.showThis) {
                    this.clear();
                }
            }, 1000 * this.messageDurationInSeconds);

            this.setState({ ...this.state, message, stackTrace });
        };

        toggle = (i) => {
            let showMore = this.state.showMore;
            while (showMore.length < i) {
                showMore.push(false);
            }

            showMore[i] = !showMore[i];
            console.log(showMore);

            this.setState({ ...this.state, showMore });
        };

        removeMessage = (message) => {
            // We do not pass index because indexes might change due adding or removal
            let index = this.props.messages.indexOf(message);
            if (index >= 0 && !this.state.showMore[index]) {
                let showMore = this.state.showMore.splice(index, 1);
                this.setState({ ...this.state, showMore });
                this.props.removeMessage(index);
            }
        };

        render() {
            if (this.props.messages.length === 0) {
                return null;
            }
            return (
                <React.Fragment>
                    {this.props.messages.map((message, i) => {
                        // We schedule to remove the message
                        setTimeout(() => {
                            this.removeMessage(message);
                        }, 1000 * this.messageDurationInSeconds);
                        return (
                            <div key={i} className={"alert alert-danger p-0"}>
                                <p>
                                    {message.message}
                                    <button
                                        type="button"
                                        className="close"
                                        data-dismiss="modal"
                                        aria-label="Close"
                                        onClick={(_) =>
                                            this.removeMessage(message)
                                        }
                                    >
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </p>
                                {!!message.object && (
                                    <div>
                                        <Button
                                            onClick={() => this.toggle(i)}
                                            aria-controls="example-collapse-text"
                                            aria-expanded={
                                                this.state.showMore[i]
                                            }
                                        >
                                            Show more &raquo;
                                        </Button>
                                        <Collapse in={this.state.showMore[i]}>
                                            <p>
                                                {JSON.stringify(message.object)}
                                            </p>
                                        </Collapse>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </React.Fragment>
            );
        }
    }
);

export default Message;
