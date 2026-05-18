import { useState, type ReactElement } from "react"
import { InfoTable, QUERY_PARAM_ID } from "../components/InfoCardPage";
import { useSearchParams } from "react-router-dom";
import type { Game } from "../util/Models";
import { ApiRoutes } from "../util/ApiRoutes";
import { HttpMethod } from "../util/serverRequests";
import { GameCardDetails } from "../components/cards/GameCardDetailsComponent";

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
    const [ searchParams ] = useSearchParams();
    const internalChecked: boolean = getInternalSearchParam(searchParams);
    const endpoint: string = internalChecked ? ApiRoutes.GAME_INTERNAL_SEARCH : ApiRoutes.GAME_EXTERNAL_SEARCH;

    return <>
        <InfoTable<GameDataRow> key={`$GameSearchPage`} auth={false} endpoint={endpoint} searchInputPlaceholder="Enter text to search for games."
                httpMethod={HttpMethod.GET} infoCardBuilder={infoCardBuilder} 
                addPageNavigationElements={addPageNavigationElements} addSearchParams={addSearchParams} />
    </>

}

// ------------ Helper Functions ----------------
const getInternalSearchParam = (searchParams: URLSearchParams): boolean => {
    return searchParams.has(INTERNAL_PARAM) ? Boolean(searchParams.get(INTERNAL_PARAM) === "true") : true;
}

const infoCardBuilder = (data: GameDataRow, onImport: () => void): ReactElement => {
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
                    external_id: data.external_id,
                    cover_url: data.cover_url,
                    isImported: data.isImported,
                    canImport: data.canImport,
                    created_at: null
                };

    return <GameCardDetails game={game} highlightedText={highlightedText} onImport={onImport} fullDetails={false} />
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