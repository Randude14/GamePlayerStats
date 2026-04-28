import { useState, type ReactElement } from "react"
import { InfoTable, QUERY_PARAM_ID } from "../components/InfoCardPage";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/useAuth";
import { getFirstObject } from "../util/Helpers";
import { PlayerStatEditButton } from "../components/PlayerStatEditButton";
import { fetchWithNoAuth, HttpMethod } from "../util/serverRequests";
import { useSearchParams } from "react-router-dom";
import { HighlighLabelTag } from "../components/HighlightLabelTag";
import { ImageViewProps } from "../components/ImageViewDetails";
import type { Game } from "../util/Models";
import { useEditPopup, type EditPopupSettings } from "../context/EditPopupContext";
import { GameDetailsPopupGenerator } from "../components/GameDetailsPopupGenerator";

const INTERNAL_CHECKBOX_ID: string = "internal-checkbox";
const INTERNAL_PARAM: string = "internalSearch"

type GameDataRow = {
    title: string,
    publishers: string[],
    developers: string[],
    themes: string[],
    platforms: string[],
    player_perspectives: string[],
    game_modes: string[],
    genres: string[],
    release: string,
    cover_url: string,
    game_type: string,
    canImport: boolean,
    isImported: boolean,
    external_id: number,
    internal_id: number
}

// -------- Main Export ------------
export function GameSearchPage() {

    const { user } = useAuth();
    const { showPopup } = useEditPopup();
    const [refreshKey, setRefreshKey] = useState<number>(1);
    const [ searchParams ] = useSearchParams();
    const internalChecked: boolean = getInternalSearchParam(searchParams);
    const endpoint: string = internalChecked ? 'games/internal/search' : 'games/external/search';



    const infoCardBuilder =  (data: GameDataRow) => {
        const gameDetailsPopupHandler = () => {
            const game: Game = {
                ...data,
                id: data.internal_id,
                created_at: null
            };
            const popupSettings: EditPopupSettings = GameDetailsPopupGenerator({ game, userId: user?.id });

            showPopup(popupSettings);
        }
        

        return <GameInfoCard data={data} onImport={onImportHandler} gameDetailsPopupHandler={gameDetailsPopupHandler} />
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

const GameInfoCard = ({ data, onImport, gameDetailsPopupHandler }: { data: GameDataRow, onImport: () => void, gameDetailsPopupHandler: () => void }): ReactElement => {
    const { token } = useAuth();
    const { toast } = useToast();
    const isLoggedIn = !!token;
    const params: URLSearchParams = new URLSearchParams(window.location.search);
    const highlightedText: string = params.get(QUERY_PARAM_ID);

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

    const game: Game = {
                    title: data.title,
                    release: data.release,
                    publishers: data.publishers,
                    developers: data.developers,
                    themes: data.themes,
                    genres: data.genres,
                    platforms: data.platforms,
                    player_perspectives: data.player_perspectives,
                    game_modes: data.game_modes,
                    game_type: data.game_type,
                    id: data.internal_id,
                    cover_url: data.cover_url,
                    isImported: data.isImported,
                    canImport: data.canImport,
                    created_at: null
                };



    return <div className="info-card-fields">
        <div><ImageViewProps game={game} /></div>
        <div><HighlighLabelTag className="" text={data.title} highlightedText={highlightedText}/></div>
        <div><label>{ getFirstObject(data.developers) }</label></div>
        <div><label>{ getFirstObject(data.publishers) }</label></div>
        <div><label>{ data.release ? new Date(data.release).toLocaleDateString() : 'N/A' }</label></div>
        
        {!data.isImported && data.canImport && <div><button onClick={importButtonHandler}>Import Game</button></div>}
        {data.isImported && <div><button disabled>Game Imported</button></div>}
        <div><button onClick={gameDetailsPopupHandler}>View Details</button></div>
        {data.isImported && <PlayerStatEditButton 
                game={game} disabled={!isLoggedIn} buttonLabel="Add Or Update" />}
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