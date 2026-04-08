import { useEffect, useState, useRef, type ReactElement } from "react"
import { useAuth } from "../context/useAuth";
import { fetchWithAuth, fetchWithNoAuth, HttpMethod } from "../util/serverRequests";
import './InfoTable.css'

type RowObject = Record<string, unknown>;

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

// Generics type allows table to work with an inhertied object type
export function InfoTable<T extends RowObject>({auth, endpoint, httpMethod, pageSize, rowFields, rowFieldBuilder, columnName}: ColumnInfoSettings) {

    const { token } = useAuth();
    const [rows, setRows] = useState<T[]>([]);
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
                setRows([]);
                setLoading(false);
                return;
            }

            const endpointFetch = auth ? fetchWithAuth : fetchWithNoAuth;
            // for now assume endpoint already has the correct format before adding, this should probably get fixed later
            const res = await endpointFetch(pageSize ? `${endpoint}&page=${page}&pageSize=${pageSize}` : endpoint, httpMethod || HttpMethod.GET);

            let data: unknown = null;
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
                setRows([]);
                setLoading(false);
                return;
            }

            if (!Array.isArray(data)) {
                setErrorMessage("Expected an array response.");
                setRows([]);
                setLoading(false);
                return;
            }

            setRows(data as T[]);
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
    const shouldDisablePrev = pageSize <= 0 || page === 1;
    const shouldDisableNext = pageSize <= 0 || rows.length < pageSize;

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
            {buildRows(rowFields, rowFieldBuilder, rows.filter( (e, i) => i != rows.length-1))}
            {pageSize > 0 && <div>
                <button disabled={shouldDisablePrev} onClick={onPrevClickHandler}>Prev</button>
                <button disabled={shouldDisableNext} onClick={onNextClickHandler}>Next</button>
            </div>}
        </div>
    </>
}