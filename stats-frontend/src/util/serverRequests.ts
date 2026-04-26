
const HttpMethod = {
    PUT: 'PUT',
    GET: 'GET',
    POST: 'POST',
    PATCH: 'PATCH',
    DELETE: 'DELETE'
}

function emptyBody(body: string): boolean {
    return !body || body.length === 0;
}

const backendUrl = import.meta.env.VITE_BACKEND_URL || '/api';

function buildUrl(apiCall: string): URL {
    return new URL(`${backendUrl}/${apiCall}`);
}

async function fetchWithNoAuth(apiCall: string, method: typeof HttpMethod[keyof typeof HttpMethod], body: string=''): Promise<Response> {
    return fetchURLWithNoAuth(`${backendUrl}/${apiCall}`, method, body);
}

async function fetchWithAuth(apiCall: string, method: typeof HttpMethod[keyof typeof HttpMethod], body: string=''): Promise<Response> {
    return fetchURLWithAuth(`${backendUrl}/${apiCall}`, method, body);
}

async function fetchURLWithNoAuth(url: string, method: typeof HttpMethod[keyof typeof HttpMethod], body: string=''): Promise<Response> {

    // GET cannot have bodies even when empty
    if(method === HttpMethod.GET || emptyBody(body)) {
        const res = await fetch(url, {
            method: method
        });

        return res;
    }
    else {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json'},
            body: body
        });

        return res;
    }
}

async function fetchURLWithAuth(url: string, method: typeof HttpMethod[keyof typeof HttpMethod], body: string=''): Promise<Response> {
    const token: string = localStorage.getItem('token') || '';

    if(token === '') {
        return Promise.reject("User not logged in.");
    }

    // GET cannot have bodies even when empty
    if(method === HttpMethod.GET || emptyBody(body)) {
        const res = await fetch(url, {
            method: method,
            headers: {'x-auth-token': token},
        });

        return res;
    }
    else {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json', 'x-auth-token': token},
            body: body
        });

        return res;
    }
}

export { fetchURLWithNoAuth, fetchURLWithAuth, fetchWithNoAuth, fetchWithAuth, buildUrl, HttpMethod };