import { useEffect, useState, type ReactElement } from "react"
import { useAuth } from "../context/useAuth";
import { fetchWithAuth, fetchWithNoAuth, HttpMethod } from "../util/serverRequests";
import './InfoCardPage.css'
import type { RowObject, SearchResults } from "../util/Models";

interface ColumnInfoSettings<T extends RowObject> {
    auth: boolean, // whether to use user token
    endpoint: string, // API endpoint to get rows from
    httpMethod?: string, // HTTP method to use, GET if not passed
    infoCardBuilder: (data: RowObject) => ReactElement, // Function passed to build the info cards
    pageNavBuilder?: (results: SearchResults<T>) => ReactElement, // Function passed to build the page navigation buttons at the bottom 
}

// Generics type allows table to work with an inhertied object type
export function InfoTable<T extends RowObject>({auth, endpoint, httpMethod, infoCardBuilder, pageNavBuilder}: ColumnInfoSettings<T>) {

    const { token } = useAuth();
    const [searchResults, setSearchResults] = useState<SearchResults<T>>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchRows = async () => {
            setLoading(true);
            setErrorMessage(null);

            if(!endpoint) {
                return;
            }

            if (auth && !token) {
                setErrorMessage("Please log in first.");
                setSearchResults(null);
                setLoading(false);
                return;
            }

            const endpointFetch = auth ? fetchWithAuth : fetchWithNoAuth;
            // for now assume endpoint already has the correct format before adding, this should probably get fixed later
            const res = await endpointFetch(endpoint, httpMethod || HttpMethod.GET);

            let data: SearchResults<T> = null;
            try {
                data = await res.json();
            } catch {
                data = null;
            }

            if (!res.ok) {
                const err = data as
                | { message?: string; msg?: string; errors?: { msg?: string }[] }
                | null;

                let msg = err?.message || err?.msg;
                if (!msg && Array.isArray(err?.errors)) {
                    msg = err?.errors[0]?.msg;
                }

                setErrorMessage(msg || "Failed to load data.");
                setSearchResults(null);
                setLoading(false);
                return;
            }

            setSearchResults(data);
            setLoading(false);
        };

        fetchRows();
    }, [auth, endpoint, httpMethod, token]);

    // safely return nothing if endpoint is null
    // some pages have search fields
    if(!endpoint) {
        return <></>
    }

    if(!infoCardBuilder) {
        return <strong>Invalid settings.</strong>
    }

    if(loading) {
        return <strong>Loading...</strong>
    }

    if(errorMessage) {
        return <strong>{errorMessage}</strong>
    }

    return <>
        <div className="info-card-table">
            {searchResults.results && searchResults.results.map(row => {

                return <div className="info-card">
                    {infoCardBuilder(row) || <>Null</>}
                </div>;
            })}
        </div>
        {pageNavBuilder && pageNavBuilder(searchResults)}
    </>
}