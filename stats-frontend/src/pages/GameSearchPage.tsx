import { useState, type ReactElement } from "react"
import { InfoTable, QUERY_PARAM_ID } from "../components/InfoCardPage";
import { useAuth } from "../context/useAuth";
import { getFirstObject } from "../util/Helpers";
import { PlayerStatEditButton } from "../components/PlayerStatEditButton";
import { useSearchParams } from "react-router-dom";
import { HighlighLabelTag } from "../components/HighlightLabelTag";
import { ImageViewProps } from "../components/ImageViewDetails";
import type { Game } from "../util/Models";
import { useEditPopup, type EditPopupSettings } from "../context/EditPopupContext";
import { GameDetailsPopupGenerator } from "../components/GameDetailsPopupGenerator";
import { ApiRoutes } from "../util/ApiRoutes";
import { HttpMethod } from "../util/serverRequests";
import { ImportButton } from "../components/ImportButton";

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
    const endpoint: string = internalChecked ? ApiRoutes.GAME_INTERNAL_SEARCH : ApiRoutes.GAME_EXTERNAL_SEARCH;

    const onImportHandler = () => setRefreshKey(v => v + 1);

    const infoCardBuilder =  (data: GameDataRow) => {
        const gameDetailsPopupHandler = () => {
            const game: Game = {
                ...data,
                id: data.internal_id,
                created_at: null
            };
            const popupSettings: EditPopupSettings = GameDetailsPopupGenerator({ game, userId: user?.id, game_external_id: data.external_id, toastMessage: () => 'Yes' });

            showPopup(popupSettings);
        }
        

        return <GameInfoCard data={data} onImport={onImportHandler} gameDetailsPopupHandler={gameDetailsPopupHandler} />
    }
        
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

const GameInfoCard = ({ data, gameDetailsPopupHandler, onImport }: { data: GameDataRow, onImport: () => void, gameDetailsPopupHandler: () => void }): ReactElement => {
    const { token } = useAuth();
    const isLoggedIn = !!token;
    const params: URLSearchParams = new URLSearchParams(window.location.search);
    const highlightedText: string = params.get(QUERY_PARAM_ID);

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
        <div><ImageViewProps game={game} game_external_id={data.external_id} /></div>
        <div><HighlighLabelTag className="" text={data.title} highlightedText={highlightedText}/></div>
        <div><label>{ getFirstObject(data.developers) }</label></div>
        <div><label>{ getFirstObject(data.publishers) }</label></div>
        <div><label>{ data.release ? new Date(data.release).toLocaleDateString() : 'N/A' }</label></div>
        
        <div><ImportButton game_external_id={data.external_id} isImported={data.isImported} canImport={data.canImport} onImport={onImport} /></div>
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

const addPageNavigationElements = (searchParams: URLSearchParams, refreshPage: (resetPage?: boolean) => void) => {
    const internalChecked: boolean = getInternalSearchParam(searchParams);

    const internalLabelClicked = () => {
        const checkBoxRef: HTMLInputElement = document.getElementById(INTERNAL_CHECKBOX_ID) as HTMLInputElement;
        if(checkBoxRef) {
            checkBoxRef.checked = !checkBoxRef.checked;
            refreshPage(true);
        }
    }

    return <div className="info-search">
        <input type="checkbox" id={INTERNAL_CHECKBOX_ID} checked={internalChecked} onChange={
            (e) => {
                e.preventDefault();
                if(e.target) {
                    refreshPage(true);
                }
            }
        } /> 
        <label onClick={internalLabelClicked} htmlFor="my-input">Imported Games Only</label>
    </div>
}