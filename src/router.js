import { writable } from 'svelte/store'
const writableCurrentRoute = writable({})
export const currentRoute = {
    subscribe: writableCurrentRoute.subscribe
}

export function navigateTo(route, params) {
    // change current router path
    route.params = params || {}
    writableCurrentRoute.set(route);
    // push the path into web browser history API
    const hydratedPath = getHydratedPath(route)

    window.history.pushState(
      { path: hydratedPath },
      "",
      window.location.origin + hydratedPath
    );
}

export function mapUrlToRoute(url, routes) {
    const matchedRoute = matchRouteByUrl(routes, url)
    writableCurrentRoute.set(matchedRoute)
    if (!history.state) {
      window.history.replaceState({ path: url },"",url)
    }
    if (matchedRoute && matchedRoute.redirectTo) {
        handleRedirect(routes, matchedRoute)
    }
}

function getHydratedPath(route) {
    const splitPath = route.path.split(/\//)
    let newPath = ""
    for (let index = 0; index < splitPath.length; index++) {
        if (splitPath[index].slice(0,1) === ':') {
            newPath += String(route.params[splitPath[index].slice(1)])
        } else {
            newPath += splitPath[index]
        }
        newPath += "/"
    }
    newPath = newPath.slice(0, -1)

    if (route.params) {
        const pathParamIds = splitPath.filter(segment => segment.slice(0,1) === ":").map(segment => segment.slice(1))
        const queryParams = Object.keys(route.params).filter(paramKey => !pathParamIds.includes(paramKey)).reduce((qps, qpId) => {
          qps[qpId] = route.params[qpId]
          return qps
        }, {})
        let queryParamString = Object.keys(queryParams).map((key) => {
            return encodeURIComponent(key) + '=' + encodeURIComponent(String(queryParams[key]))
        }).join('&')
        if (queryParamString) {
            newPath += '?' + queryParamString
        }
    }
    return newPath
}

function matchRouteByUrl(routes, url) {
    let queryParams = getQueryParams(url)
    console.log(`Query Params: ${JSON.stringify(queryParams, null, 2)}`)
    const urlWithoutQueryParams = url.includes('?') ? url.split('?')[0] : url
    console.log(`urlWithoutQueryParams: ${urlWithoutQueryParams}`)

    const matchedRoute = Object.values(routes).filter(route => {
        const splitPath = route.path.split(/\//)
        const splitUrl = urlWithoutQueryParams.split(/\//)
        if (splitPath.length === splitUrl.length || isWildcardMatch(splitPath)) {
            let match = true
            for (let index = 0; index < splitPath.length; index++) {
                const pathSegment = splitPath[index];
                if (pathSegment !== splitUrl[index] && pathSegment.slice(0, 1) !== ':' && pathSegment !== '*') {
                    match = false
                }
            }
            return match;
        }
        return false;
    })[0]

    if (matchedRoute) {
        let pathParams = getPathParams(matchedRoute, urlWithoutQueryParams)
        // console.log(`matched route: ${JSON.stringify(matchedRoute)}, pathParams: ${JSON.stringify(pathParams)}`)
        if (pathParams) {
            matchedRoute.params = Object.assign(pathParams, queryParams)
        } else {
            matchedRoute.params = Object.assign({}, queryParams)
        }
    }
    
    return matchedRoute
}

function getPathParams(matchedRoute, url) {
    let pathParams = {};
        const splitPath = matchedRoute.path.split(/\//);
            const splitUrl = url.split(/\//);
        for (let index = 0; index < splitPath.length; index++) {
        const pathSegment = splitPath[index];
            if (pathSegment.slice(0, 1) === ':') {
            pathParams[pathSegment.slice(1)] = splitUrl[index];
        }
    }
    return pathParams;
}

function getQueryParams(url) {
    return url.includes('?') ? url.split('?')[1].split('&')
        .reduce((params, param) => {
                let [key, value] = param.split('=');
                params[key] = value ? decodeURIComponent(value.replace(/\+/g, ' ')) : '';
                return params;
            }, {}
        ) : {}
}

function isWildcardMatch(splitPath) {
    return (splitPath.length === 1 && splitPath[0] === '*');
}

function handleRedirect(routes, routeWithRedirect) {
    const routeToRedirectTo = Object.values(routes).filter(r => routes[routeWithRedirect.redirectTo])[0];
    writableCurrentRoute.set(routeToRedirectTo);
    window.history.pushState({ path: routeToRedirectTo.path }, "", window.location.origin + routeToRedirectTo.path);
}
