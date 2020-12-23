/**
 * Get the parameter value after the # sign
 */
export function getHashParameter(name: string) {
    return parseQueryString(window.location.hash)[name];
}

/**
 * Get parameter value after the ? sign
 */
export function getQueryParameter(name: string) {
    let urlSplit = window.location.href.split("?");
    let lastElement = urlSplit.slice(-1)[0];
    return parseQueryString(lastElement)[name];
}

// Copied from https://stackoverflow.com/a/3855394/1739415
function parseQueryString(query: string) {
    if (!query) {
        return {};
    }

    return (/^[?#]/.test(query) ? query.slice(1) : query)
        .split("&")
        .reduce((params: any, param) => {
            let [key, value] = param.split("=");
            params[key] = value
                ? decodeURIComponent(value.replace(/\+/g, " "))
                : "";
            return params;
        }, {});
}
