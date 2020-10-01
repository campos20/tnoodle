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

        removeMessage = (index) => {
            let showMore = this.state.showMore.filter((_, i) => i !== index);
            this.props.removeMessage(index);
            this.setState({ ...this.state, showMore });
        };

        render() {
            if (this.props.messages.length === 0) {
                return null;
            }
            return (
                <div className="container-fluid">
                    {this.props.messages.map((message, i) => (
                        <div key={i} className={"col-12 alert alert-danger"}>
                            <p>
                                {message.message}
                                <button
                                    type="button"
                                    className="close"
                                    data-dismiss="modal"
                                    aria-label="Close"
                                    onClick={(e) => this.removeMessage(i)}
                                >
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </p>
                            {!!message.object && (
                                <div>
                                    <Button
                                        onClick={() => this.toggle(i)}
                                        aria-controls="example-collapse-text"
                                        aria-expanded={this.state.showMore[i]}
                                    >
                                        click
                                    </Button>
                                    <Collapse in={this.state.showMore[i]}>
                                        <div id="example-collapse-text">
                                            Anim pariatur cliche reprehenderit,
                                            enim eiusmod high life accusamus
                                            terry richardson ad squid. Nihil
                                            anim keffiyeh helvetica, craft beer
                                            labore wes anderson cred nesciunt
                                            sapiente ea proident.
                                        </div>
                                    </Collapse>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            );
        }
    }
);

export default Message;
