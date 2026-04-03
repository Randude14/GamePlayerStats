
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

async function fetchWithNoAuth(apiCall: string, method: string, body: string=''): Promise<Response> {

    // GET cannot have bodies even when empty
    if(method === HttpMethod.GET || emptyBody(body)) {
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

async function fetchWithAuth(apiCall: string, method: string, body: string=''): Promise<Response> {
    const token: string = localStorage.getItem('token') || '';

    if(token === '') {
        return Promise.reject("User not logged in.");
    }

    // GET cannot have bodies even when empty
    if(method === HttpMethod.GET || emptyBody(body)) {
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

export { fetchWithNoAuth, fetchWithAuth, HttpMethod}