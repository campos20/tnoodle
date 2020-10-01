import fetchIntercept from "fetch-intercept";

export default class Interceptor {
    constructor() {
        // http interceptor
        fetchIntercept.register({
            request: (...request) => {
                // TODO set loading
                return request;
            },

            response: (response) => {
                if (!response.ok) {
                    this.handleHttpError(response);
                }
                return response;
            },

            responseError: (error) => {
                this.handleHttpError(error);
                return Promise.reject(error);
            },
        });
    }

    handleHttpError = (error) => {
        error
            .json()
            .then((data) => {
                this.props.updateMessage(data);
            })
            .catch(() => this.props.updateMessage(error));
    };
}
