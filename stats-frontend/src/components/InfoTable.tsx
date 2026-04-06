import { useEffect, useState, type ReactElement } from "react"
import { useAuth } from "../context/useAuth";
import { fetchWithAuth, fetchWithNoAuth, HttpMethod } from "../util/serverRequests";
import './InfoTable.css'


type ITRecord = Record<string, any>

interface ColumnInfoSettings {
    auth: boolean, // whether to use user token
    endpoint: string, // API endpoint to get rows from
    rowFields: string[], // Array of fields to pull from rows
    columnName: (field: string) => string, // Function passed to get field name from column
    rowFieldBuilder: (field: string, data: ITRecord) => ReactElement, // Function passed to get elements based on field and data
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

function buildRows({rowFields, rowFieldBuilder}: ColumnInfoSettings, rows: ITRecord[]) {

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

export function InfoTable(settings: ColumnInfoSettings) {

    const { token } = useAuth();

    const [rows, setRows] = useState<ITRecord[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    if(!settings.endpoint || !settings.rowFields || !settings.columnName || !settings.rowFieldBuilder) {
        return <strong>Invalid settings.</strong>
    }

    useEffect(() => {
        const fetchRows = async () => {
            if(settings.auth && !token) {
                setErrorMessage('Please log in first.');
                setLoading(false);
                return;
            }

            const endpointFetch = settings.auth ? fetchWithAuth : fetchWithNoAuth;
            const res = await endpointFetch(settings.endpoint, HttpMethod.GET);
            try {
                const data = await res.json();
                if(res.ok) {
                    setErrorMessage(null);
                    if(!Array.isArray(data)) {
                        setErrorMessage('Invalid endpoint.');
                    }
                    else {
                        const _rows: ITRecord[] = data;
                        setRows(_rows);
                    }
                }
                else {
                    let msg = data.message || data.msg;
                    if(!msg && Array.isArray(data.errors)) {
                        msg = data.errors[0].msg;
                    }
                    setErrorMessage(msg);
                }
            }
            catch(err: unknown) {
                console.log(err);
                setErrorMessage(err.message || err.msg);
            }


            setLoading(false);
        }
        
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