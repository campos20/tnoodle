export function removeQueryParam(name) {
    var searchParams = new URLSearchParams(window.location.search);
    searchParams.delete(name);
    setQueryParamsWithoutRedirect(searchParams);
}

export function updateQueryParam(name, value) {
    var searchParams = new URLSearchParams(window.location.search);
    searchParams.set(name, JSON.stringify(value));
    setQueryParamsWithoutRedirect(searchParams);
}

function setQueryParamsWithoutRedirect(searchParams) {
    let url =
        window.location.origin +
        window.location.pathname +
        "?" +
        searchParams.toString();

    window.history.pushState(null, "", url);
}

export function getQueryParameter(name) {
    let urlSplit = window.location.href.split("?");
    let lastElement = urlSplit.slice(-1)[0];
    return parseQueryString(lastElement)[name];
}

// Copied from https://stackoverflow.com/a/3855394/1739415
function parseQueryString(query) {
    if (!query) {
        return {};
    }

    return (/^[?#]/.test(query) ? query.slice(1) : query)
        .split("&")
        .reduce((params, param) => {
            let [key, value] = param.split("=");
            params[key] = value
                ? decodeURIComponent(value.replace(/\+/g, " "))
                : "";
            return params;
        }, {});
}
