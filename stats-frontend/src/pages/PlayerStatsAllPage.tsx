import { type ReactElement } from "react";
import { InfoTable, QUERY_PARAM_ID } from "../components/InfoCardPage";
import { ApiRoutes } from "../util/ApiRoutes";
import { PlayerStatCardDetails, type PlayerStatRow } from "../components/cards/PlayerStatCardDetailsComponent";

const FILTER_ID: string = 'StatFilter';
const FILTER_PARAM: string = 'statFilter';
const FILTER_OPTIONS: string[] = ['Both Player And Game', 'Player Only', 'Game Only'];

const infoCardBuilder = (data: PlayerStatRow, refreshData: () => void): ReactElement => {
    
    const params: URLSearchParams = new URLSearchParams(window.location.search);
    const highlightedText: string = params.get(QUERY_PARAM_ID);
    const filterSelection: string = params.get(FILTER_PARAM) || '0';

    const highlightGame: boolean = filterSelection === '0' || filterSelection === '2';
    const highlightUsername: boolean = filterSelection === '0' || filterSelection === '1';
    
    return <PlayerStatCardDetails playerStat={data} highlightGame={highlightGame} 
            highlightUsername={highlightUsername} highlightedText={highlightedText} refreshData={refreshData} />
}

export function PlayerStatsAllPage() {

    return <div>
        <h1>All Player Stats</h1>
        <InfoTable<PlayerStatRow> key={`PlayerStatAll`} auth={false} searchInputPlaceholder="Enter text to search through stats."
            endpoint={ApiRoutes.SEARCH_PLAYER_STATS} infoCardBuilder={infoCardBuilder}
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

const addPageNavigationElements = (searchParams: URLSearchParams, refreshPage: (resetPage?: boolean) => void) => {
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