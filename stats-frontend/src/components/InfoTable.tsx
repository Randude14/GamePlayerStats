import { useEffect, useState, type ReactElement } from "react"
import { useAuth } from "../context/useAuth";
import { fetchWithAuth, fetchWithNoAuth, HttpMethod } from "../util/serverRequests";
import './InfoTable.css'

type RowObject = Record<string, unknown>;

interface ColumnInfoSettings {
    auth: boolean, // whether to use user token
    endpoint: string, // API endpoint to get rows from
    rowFields: string[], // Array of fields to pull from rows
    columnName: (field: string) => string, // Function passed to get field name from column
    rowFieldBuilder: (field: string, data: RowObject) => ReactElement, // Function passed to get elements based on field and data
}

function buildColumnHeaders({rowFields, columnName}: ColumnInfoSettings) {

    const columnNames: string[] = rowFields.map(col => columnName(col));

    return <>
            {
                columnNames.map((col) => {
                    return <span key={col} className="column-headers">{col}</span>
                })
            }
        </>
}

function buildRows<T extends RowObject>({rowFields, rowFieldBuilder}: ColumnInfoSettings, rows: T[]) {

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
export function InfoTable<T extends RowObject>(settings: ColumnInfoSettings) {

    const { token } = useAuth();

    const [rows, setRows] = useState<T[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    if(!settings.endpoint || !settings.rowFields || !settings.columnName || !settings.rowFieldBuilder) {
        return <strong>Invalid settings.</strong>
    }

    useEffect(() => {
        const fetchRows = async () => {
            setLoading(true);
            setErrorMessage(null);

            if (settings.auth && !token) {
                setErrorMessage("Please log in first.");
                setRows([]);
                setLoading(false);
                return;
            }

            const endpointFetch = settings.auth ? fetchWithAuth : fetchWithNoAuth;
            const res = await endpointFetch(settings.endpoint, HttpMethod.GET);

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
    }, [settings.auth, settings.endpoint, token]);

    if(loading) {
        return <strong>Loading...</strong>
    }

    if(errorMessage) {
        return <strong>{errorMessage}</strong>
    }

    const columns: number = settings.rowFields.length;

    return <>
        <div className="info-table" style={{ 
                gridTemplateColumns: `repeat(${columns}, 1fr)`
            }}>
            {buildColumnHeaders(settings)}
            {buildRows(settings, rows)}
        </div>
    </>
}