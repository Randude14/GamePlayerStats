
const HttpMethod = {
    PUT: 'PUT',
    GET: 'GET',
    POST: 'POST',
    PATCH: 'PATCH',
    DELETE: 'DELETE'
}

async function fetchNoBody(apiCall: string, method: string): Promise<Response> {
    const res = await fetch(`http://localhost:3000/${apiCall}`, {
        method: method
    });

    return res;
}

async function fetchWithNoAuth(apiCall: string, method: string, body: string): Promise<Response> {

    // GET cannot have bodies even when empty
    if(method === HttpMethod.GET) {
        const res = await fetch(`http://localhost:3000/${apiCall}`, {
            method: method
        });

        return res;
    }
    else {
        const res = await fetch(`http://localhost:3000/${apiCall}`, {
            method: method,
            headers: { 'Content-Type': 'application/json'},
            body: body
        });

        return res;
    }
}

async function fetchWithAuth(apiCall: string, method: string, body: string): Promise<Response> {
    const token: string = localStorage.getItem('token') || '';

    // GET cannot have bodies even when empty
    if(method === HttpMethod.GET) {
        const res = await fetch(`http://localhost:3000/${apiCall}`, {
            method: method,
            headers: {'x-auth-token': token},
        });

        return res;
    }
    else {
        const res = await fetch(`http://localhost:3000/${apiCall}`, {
            method: method,
            headers: { 'Content-Type': 'application/json', 'x-auth-token': token},
            body: body
        });

        return res;
    }
}

export { fetchNoBody, fetchWithNoAuth, fetchWithAuth, HttpMethod}