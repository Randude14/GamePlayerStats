import type { ReactElement } from "react";
import { InfoTable } from "../components/InfoTable";

type ITRecord = Record<string, any>

const Fields = {
    PLAYER_NAME: 'username',
    GAME_TITLE: 'title',
    HOURS_PLAYED: 'hours_played',
    DATE_PURCHASED: 'date_purchased',
    GAME_RELEASE: 'release'
}

const columnNames = (field: string): string => {
    switch (field) {
        case Fields.PLAYER_NAME: return 'Username';
        case Fields.GAME_TITLE: return 'Title';
        case Fields.HOURS_PLAYED: return 'Hours Played';
        case Fields.DATE_PURCHASED: return 'Date Purchased';
        case Fields.GAME_RELEASE: return 'Game Release';
    }
    return '';
}

const rowFieldBuilder = (field: string, data: ITRecord): ReactElement => {
    switch (field) {
        case Fields.PLAYER_NAME: // TODO return anchor element that goes to a page with all stats of player
        case Fields.GAME_TITLE: // TODO return anchor element that goes to a page with the stats of players that own this title
        case Fields.HOURS_PLAYED: return <label>{data[field]}</label>;
        case Fields.GAME_RELEASE: 
        case Fields.DATE_PURCHASED: return <label>{new Date(data[field]).toLocaleDateString()}</label>;
    }
    return <label>Error</label>;
}

export function PlayerStatsAllPage() {
    const rowFields: string[] = [Fields.PLAYER_NAME, Fields.GAME_TITLE, Fields.HOURS_PLAYED, Fields.DATE_PURCHASED, Fields.GAME_RELEASE];

    return <InfoTable auth={false} endpoint="player_stats/all" rowFields={rowFields} 
                    columnName={columnNames} rowFieldBuilder={rowFieldBuilder}/>
}