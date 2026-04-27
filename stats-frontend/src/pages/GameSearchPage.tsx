import { useState, type ReactElement } from "react"
import { InfoTable } from "../components/InfoCardPage";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/useAuth";
import { blankImage, getFirstObject } from "../util/Helpers";
import { PlayerStatEditButton } from "../components/PlayerStatEditButton";
import { fetchWithNoAuth, HttpMethod } from "../util/serverRequests";
import { useSearchParams } from "react-router-dom";

const INTERNAL_CHECKBOX_ID: string = "internal-checkbox";
const INTERNAL_PARAM: string = "internalSearch"

type GameDataRow = {
    title: string,
    publishers: string[],
    developers: string[],
    release_date: string,
    cover_url: string,
    isImported: boolean,
    external_id: number,
    internal_id: number
}

// -------- Main Export ------------
export function GameSearchPage() {

    const [refreshKey, setRefreshKey] = useState<number>(1);
    const [ searchParams ] = useSearchParams();
    const internalChecked: boolean = getInternalSearchParam(searchParams);
    const endpoint: string = internalChecked ? 'games/internal/search' : 'games/external/search'

    const infoCardBuilder =  (data: GameDataRow) => {

        return <GameInfoCard data={data} onImport={onImportHandler} />
    }

    const onImportHandler = () => setRefreshKey(v => v + 1);
        
    return <>
        <InfoTable<GameDataRow> key={`$GameSearchPage-${refreshKey}`} auth={false} endpoint={endpoint} searchInputPlaceholder="Enter text to search for games."
                httpMethod={HttpMethod.GET} infoCardBuilder={infoCardBuilder} 
                addPageNavigationElements={addPageNavigationElements} addSearchParams={addSearchParams} />
    </>

}

// ------------ Helper Functions ----------------
const getInternalSearchParam = (searchParams: URLSearchParams): boolean => {
    return searchParams.has(INTERNAL_PARAM) ? Boolean(searchParams.get(INTERNAL_PARAM) === "true") : true;
}

const importGame = async (external_id: number): Promise<boolean> => {
    const res = await fetchWithNoAuth(`games/external/import/${external_id}`, HttpMethod.PUT);
    return res.ok;
}

const GameInfoCard = ({ data, onImport }: { data: GameDataRow, onImport: () => void }): ReactElement => {
    const { token } = useAuth();
    const { toast } = useToast();
    const isLoggedIn = !!token;

    const importButtonHandler = async () =>{
            const imported = await importGame(data.external_id);

            if(imported) {
                onImport();
                toast.success('Game imported!');
            }
            else {
                toast.error('Something went wrong. Could not import game.');
            }
        };

    return <div className="info-card-fields">
        <div><img className="info-card-image" src={data.cover_url || blankImage()}/></div>
        <div><label>{data.title}</label></div>
        <div><label>{ getFirstObject(data.developers) }</label></div>
        <div><label>{ getFirstObject(data.publishers) }</label></div>
        <div><label>{ data.release_date ? new Date(data.release_date).toLocaleDateString() : 'N/A' }</label></div>

        {!data.isImported && <div><button onClick={importButtonHandler}>Import Game</button></div>}
        {data.isImported && <div><button disabled>Game Imported</button></div>}
        {data.isImported && <PlayerStatEditButton 
                game={{
                    title: data.title,
                    publisher: data.publishers.length ? data.publishers[0] : 'N/A',
                    developer: data.developers.length ? data.developers[0] : 'N/A',
                    release: data.release_date,
                    id: data.internal_id,
                    created_at: null
                }
        } disabled={!isLoggedIn} buttonLabel="Add Or Update" />}
    </div>
}

const addSearchParams = () => {
    const checkBoxRef: HTMLInputElement = document.getElementById(INTERNAL_CHECKBOX_ID) as HTMLInputElement;
    if(checkBoxRef) {
        return {
            [INTERNAL_PARAM]: String(checkBoxRef.checked)
        }
    }
    return {};
}

const addPageNavigationElements = (searchParams: URLSearchParams, refreshPage: () => void) => {
    const internalChecked: boolean = getInternalSearchParam(searchParams);

    const internalLabelClicked = () => {
        const checkBoxRef: HTMLInputElement = document.getElementById(INTERNAL_CHECKBOX_ID) as HTMLInputElement;
        if(checkBoxRef) {
            checkBoxRef.checked = !checkBoxRef.checked;
            refreshPage();
        }
    }

    return <div className="info-search">
        <input type="checkbox" id={INTERNAL_CHECKBOX_ID} checked={internalChecked} onChange={
            (e) => {
                e.preventDefault();
                if(e.target) {
                    refreshPage();
                }
            }
        } /> 
        <label onClick={internalLabelClicked} htmlFor="my-input">Imported Games Only</label>
    </div>
}