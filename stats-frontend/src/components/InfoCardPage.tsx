import { useEffect, useState, type ReactElement } from "react"
import { useAuth } from "../context/useAuth";
import { fetchWithAuth, fetchWithNoAuth, HttpMethod } from "../util/serverRequests";
import './InfoCardPage.css'
import type { RowObject, SearchReults } from "../util/Models";

interface ColumnInfoSettings {
    auth: boolean, // whether to use user token
    endpoint: string, // API endpoint to get rows from
    httpMethod?: string, // HTTP method to use, GET if not passed
    pageSize?: number,  // Sets the page limit, if set to 0 or less, disables the prev/next buttons
    infoCardBuilder: (data: RowObject) => ReactElement, // Function passed to build the info cards
}


type ClickHandler = () => void;
function buildPageButtons<T extends RowObject>(searchResults: SearchReults<T>, 
            onPrevClickHandler: ClickHandler, onNextClickHandler: ClickHandler) {

    return <div>
                <button className="info-card-navigation" disabled={!searchResults.hasPreviousPage} onClick={onPrevClickHandler}>Previous</button>
                <label className="info-card-navigation">{`Page ${searchResults.page} / ${searchResults.totalPages}`}</label>
                <button className="info-card-navigation" disabled={!searchResults.hasNextPage} onClick={onNextClickHandler}>Next</button>
            </div>
}

// Generics type allows table to work with an inhertied object type
export function InfoTable<T extends RowObject>({auth, endpoint, httpMethod, pageSize, infoCardBuilder}: ColumnInfoSettings) {

    const { token } = useAuth();
    const [searchResults, setSearchResults] = useState<SearchReults<T>>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [page, setPage] = useState(1);

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
            const res = await endpointFetch(pageSize ? `${endpoint}&page=${page}&pageSize=${pageSize}` : endpoint, httpMethod || HttpMethod.GET);

            let data: SearchReults<T> = null;
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
    }, [auth, endpoint, httpMethod, token, page, pageSize]);

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

    const onPrevClickHandler = () => {
        setPage(Math.max(page-1, 1));
    }
    const onNextClickHandler = () => {
        setPage(page+1);
    }

    return <>
        <div className="info-card-table">
            {searchResults.results && searchResults.results.map(row => {
                // TODO: maybe in future build a blank card instead of returning null?

                return <div className="info-card">
                    {infoCardBuilder(row) || <>Null</>}
                </div>;
            })}
        </div>
        {pageSize > 0 && buildPageButtons(searchResults, onPrevClickHandler, onNextClickHandler)}
    </>
}