import { useEffect, useState, type ReactElement } from "react"
import { useAuth } from "../context/useAuth";
import { fetchWithAuth, fetchWithNoAuth, HttpMethod } from "../util/serverRequests";
import './InfoTable.css'
import type { ExternalGameResult, InfoResult, RowObject } from "../util/Models";

interface ColumnInfoSettings {
    auth: boolean, // whether to use user token
    endpoint: string, // API endpoint to get rows from
    httpMethod?: string, // HTTP method to use, GET if not passed
    rowFields: string[], // Array of fields to pull from rows
    pageSize?: number,  // Sets the page limit, if set to 0 or less, disables the prev/next buttons
    columnName: (field: string) => string, // Function passed to get field name from column
    rowFieldBuilder: (field: string, data: RowObject) => ReactElement, // Function passed to get elements based on field and data
}

function buildColumnHeaders(rowFields: string[], columnName: (field: string) => string) {

    const columnNames: string[] = rowFields.map(col => columnName(col));

    return <>
            {
                columnNames.map((col) => {
                    return <span key={col} className="column-headers">{col}</span>
                })
            }
        </>
}

function buildRows<T extends RowObject>(rowFields: string[], rowFieldBuilder: (field: string, data: RowObject) => ReactElement, rows: T[]) {

    return <>
        {
            rows.map(row => {
                return rowFields.map(field => {
                        return rowFieldBuilder(field, row) || <>Null</>;
                    }) || <>Null</>
            })
        }
    </>
}

type ClickHandler = () => void;
function buildPageButtons<T extends RowObject>(result: InfoResult<T>, 
            onPrevClickHandler: ClickHandler, onNextClickHandler: ClickHandler) {
    let searchResult: ExternalGameResult<T> = null;

    try {
        searchResult = result as ExternalGameResult<T>;
    } 
    catch {
        console.log('Failed to parse searchResult');
        return <>Failed to load data.</>
    }

    return <div>
                <button disabled={!searchResult.hasPreviousPage} onClick={onPrevClickHandler}>Prev</button>
                <label>{`Page ${searchResult.page} / ${searchResult.totalPages}`}</label>
                <button disabled={!searchResult.hasNextPage} onClick={onNextClickHandler}>Next</button>
            </div>
}

// Generics type allows table to work with an inhertied object type
export function InfoTable<T extends RowObject>({auth, endpoint, httpMethod, pageSize, rowFields, rowFieldBuilder, columnName}: ColumnInfoSettings) {

    const { token } = useAuth();
    const [result, setResult] = useState<InfoResult<T>>(null);
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
                setResult(null);
                setLoading(false);
                return;
            }

            const endpointFetch = auth ? fetchWithAuth : fetchWithNoAuth;
            // for now assume endpoint already has the correct format before adding, this should probably get fixed later
            const res = await endpointFetch(pageSize ? `${endpoint}&page=${page}&pageSize=${pageSize}` : endpoint, httpMethod || HttpMethod.GET);

            let data: ExternalGameResult<T> = null;
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
                setResult(null);
                setLoading(false);
                return;
            }

            setResult(data);
            setLoading(false);
        };

        fetchRows();
    }, [auth, endpoint, httpMethod, token, page, pageSize]);

    // safely return nothing if endpoint is null
    // some pages have search fields
    if(!endpoint) {
        return <></>
    }

    if(!rowFields || !columnName || !rowFieldBuilder) {
        return <strong>Invalid settings.</strong>
    }

    if(loading) {
        return <strong>Loading...</strong>
    }

    if(errorMessage) {
        return <strong>{errorMessage}</strong>
    }

    const columns: number = rowFields.length;

    const onPrevClickHandler = () => {
        setPage(Math.max(page-1, 1));
    }
    const onNextClickHandler = () => {
        setPage(page+1);
    }

    return <>
        <div className="info-table" style={{ 
                gridTemplateColumns: `repeat(${columns}, 1fr)`
            }}>
            {buildColumnHeaders(rowFields, columnName)}
            {result.results && buildRows(rowFields, rowFieldBuilder, result.results)}
            {pageSize > 0 && buildPageButtons(result, onPrevClickHandler, onNextClickHandler)}
        </div>
    </>
}