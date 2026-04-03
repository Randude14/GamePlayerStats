import { useEffect, useState, type ReactElement } from "react"
import { useAuth } from "../context/useAuth";
import { fetchWithAuth, fetchWithNoAuth, HttpMethod } from "../util/serverRequests";
import './ColumnInfo.css'


interface ColumnInfoSettings {
    auth: boolean, // whether to use user token
    endpoint: string, // API endpoint to get rows from
    rowFields: string[], // Array of fields to pull from rows
    columnName: (field: string) => string, // Function passed to get field name from column
    rowFieldBuilder: (field: string, data: any) => ReactElement, // Function passed to get elements based on field and data
}

function buildColumnHeaders(settings: ColumnInfoSettings) {

    const columnNames: string[] = settings.rowFields.map(col => settings.columnName(col));

    return <>
            {
                columnNames.map((col) => {
                    return <span className="column-headers">{col}</span>
                })
            }
        </>
}

function buildRows(settings: ColumnInfoSettings, rows: []) {

    return <>
        {
            rows.map(row => {
                return settings.rowFields.map(field => {
                        return settings.rowFieldBuilder(field, row) || <>Null</>;
                    }) || <>Null</>
            })
        }
    </>
}

export function ColumnInfo(settings: ColumnInfoSettings) {

    const { token } = useAuth();

    const [rows, setRows] = useState<[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    if(!settings.endpoint || !settings.rowFields || !settings.columnName || !settings.rowFieldBuilder) {
        return <>Invalid input.</>
    }

    useEffect(() => {
        const fetchRows = async () => {
            const res = settings.auth ? 
                await fetchWithAuth(settings.endpoint, HttpMethod.GET) : 
                await fetchWithNoAuth(settings.endpoint, HttpMethod.GET);

            const data = await res.json();

            if(res.ok) {
                const _rows = data;
                setRows(_rows);
            }
            else {
                let msg = data.message || data.msg;
                if(!msg && Array.isArray(data.errors)) {
                    msg = data.errors[0].msg;
                }
                setErrorMessage(msg);
            }
            setLoading(false);
        }
        
        fetchRows();
    });

    if(loading) {
        return <strong>Loading...</strong>
    }

    if(errorMessage) {
        return <strong>{errorMessage}</strong>
    }

    const columns: number = settings.rowFields.length;

    return <>
        <div className="column-info-box" style={{ 
                gridTemplateColumns: `repeat(${columns}, 1fr)`
            }}>
            {buildColumnHeaders(settings)}
            {buildRows(settings, rows)}
        </div>
    </>
}