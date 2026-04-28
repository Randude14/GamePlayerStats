import { useState, type ReactElement } from "react";
import { InfoTable, QUERY_PARAM_ID } from "../components/InfoCardPage";
import { blankImage } from "../util/Helpers";
import { useAuth } from "../context/useAuth";
import { PlayerStatEditButton } from "../components/PlayerStatEditButton";
import { HighlighLabelTag } from "../components/HighlightLabelTag";
import type { EditPopupSettings } from "../context/EditPopupContext";

type PlayerStatRow = {
    username: string,
    hours_played: number,
    date_purchased: Date,
    game_id: number,
    player_id: number,
    game_cover_url: string,
    game_title: string,
    game_release: string,
    game_developers: string[],
    game_publishers: string[]
}

const FILTER_ID: string = 'StatFilter';
const FILTER_PARAM: string = 'statFilter';
const FILTER_OPTIONS: string[] = ['Both Player And Game', 'Player Only', 'Game Only'];

const buildHighlightedLabel = (condition: boolean, className: string, text: string, highlightedText: string): ReactElement => {
    return condition ? 
                <HighlighLabelTag className={className} text={text} highlightedText={highlightedText}  /> :
                <label className={className}>{text}</label>;
}

const infoCardBuilder = (data: PlayerStatRow, currentUsername: string, updateGameCallback: () => void): ReactElement => {

    const datePurchased: string = new Date(data.date_purchased).toLocaleDateString();
    const gameRelease: string = new Date(data.game_release).toLocaleDateString();
    const isCurrentUser = currentUsername === data.username;
    
    const params: URLSearchParams = new URLSearchParams(window.location.search);
    const highlightedText: string = params.get(QUERY_PARAM_ID);
    
    const filterSelectRef: HTMLSelectElement = document.getElementById(FILTER_ID) as HTMLSelectElement;
    let filterSelection: string = '0';
    if(filterSelectRef) {
        filterSelection = filterSelectRef.value;
    }

    const gameTitleLabel: ReactElement = buildHighlightedLabel(
                    filterSelection === '0' || filterSelection === '2', '', data.game_title, highlightedText);
    const playerTitleLabel: ReactElement = buildHighlightedLabel(
                    filterSelection === '0' || filterSelection === '1', '', data.username, highlightedText);
    

    return <div className="info-card-fields">
        <div><img className="info-card-image" src={data.game_cover_url || blankImage()}/></div>
        <div><label>{`User: `}</label> {playerTitleLabel} </div>
        <div>{ gameTitleLabel }</div>
        <div><label>{`Hours Played: ${data.hours_played}`}</label></div>
        <div><label>{ `Date Purchased: ${datePurchased}` }</label></div>
        <div><label>{ `Game Release: ${gameRelease}` }</label></div>
        {isCurrentUser && <PlayerStatEditButton 
                game={{
                    id: data.game_id,
                    title: data.game_title,
                    release: data.game_release || '1999-10-28',
                    developers: data.game_developers,
                    publishers: data.game_publishers,
                    cover_url: data.game_cover_url,
                    created_at: null
                }} 
                disabled={false} buttonLabel="Update" successCallback={updateGameCallback}/>}
    </div>
}

export function PlayerStatsAllPage() {
    const { user } = useAuth();
    const [refreshKey, setRefreshKey] = useState<number>(1);

    const updateGameCallback = () => {
        setRefreshKey(refreshKey+1);
    }

    const cardGenerator = (data: PlayerStatRow) => {
        return infoCardBuilder(data, user?.username, updateGameCallback);
    }

    return <div>
        <h1>All Player Stats</h1>
        <InfoTable<PlayerStatRow> key={`PlayerStatAll-${refreshKey}`} auth={false} searchInputPlaceholder="Enter text to search through stats."
            endpoint="player_stats/all/search" infoCardBuilder={cardGenerator}
            addPageNavigationElements={addPageNavigationElements} addSearchParams={addSearchParams}/>
    </div>
}

const addSearchParams = () => {
    const filterSelectRef: HTMLSelectElement = document.getElementById(FILTER_ID) as HTMLSelectElement;
    if(filterSelectRef) {
        return {
            [FILTER_PARAM]: String(filterSelectRef.value)
        }
    }
    return {};
}

const getStatFilter = (searchParams: URLSearchParams): number => {
    return searchParams.has(FILTER_PARAM) ? Number(searchParams.get(FILTER_PARAM)) : 0;
}

const addPageNavigationElements = (searchParams: URLSearchParams, refreshPage: () => void) => {
    let filter: number = getStatFilter(searchParams);
    if(isNaN(filter)) filter = 0;

    const filterChanged = () => {
        refreshPage();
    }

    return <div className="info-search">
        <label>Filter By:</label>
        <select defaultValue={filter} id={FILTER_ID} onChange={filterChanged}>
            {
                FILTER_OPTIONS.map( (filter, index) => {
                    return <option key={index} value={String(index)}>{filter}</option>
                } )
            }
        </select>
    </div>
}