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
