export function getHashParameter(name: string) {
    return parseQueryString(window.location.hash)[name];
}

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
        .reduce((params, param) => {
            let [key, value] = param.split("=");
            params[key] = value
                ? decodeURIComponent(value.replace(/\+/g, " "))
                : "";
            return params;
        }, {});
}

const setPageWithoutRedirect = (url: string) =>
    window.history.pushState(null, "", url);

const currentLocationWithoutQuery = () =>
    window.location.origin + window.location.pathname;

export const updateQueryParam = (name: string, value: string) => {
    var searchParams = new URLSearchParams(window.location.search);
    searchParams.set(name, value);
    setPageWithoutRedirect(
        currentLocationWithoutQuery() + "?" + searchParams.toString()
    );
};

export const removeQueryParam = (name: string) => {
    var searchParams = new URLSearchParams(window.location.search);
    searchParams.delete(name);
    setPageWithoutRedirect(
        currentLocationWithoutQuery() + "?" + searchParams.toString()
    );
};
