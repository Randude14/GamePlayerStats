import type { ReactElement } from "react";
import { InfoTable } from "../components/InfoTable";

type PlayerStatRow = {
    title: string,
    hours_played: number,
    date_purchased: Date,
    release: Date
}

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

const rowFieldBuilder = (field: string, data: PlayerStatRow): ReactElement => {
    let labelString: string = 'Error';
    switch (field) {
        case Fields.PLAYER_NAME: // TODO return anchor element that goes to a page with all stats of player
        case Fields.GAME_TITLE: // TODO return anchor element that goes to a page with the stats of players that own this title
        case Fields.HOURS_PLAYED: labelString = data[field]; break;
        case Fields.GAME_RELEASE: 
        case Fields.DATE_PURCHASED: labelString = new Date(data[field]).toLocaleDateString(); break;
    }
    return <label key={field}>{labelString}</label>;
}

export function PlayerStatsAllPage() {
    const rowFields: string[] = [Fields.PLAYER_NAME, Fields.GAME_TITLE, Fields.HOURS_PLAYED, Fields.DATE_PURCHASED, Fields.GAME_RELEASE];

    return <InfoTable<PlayerStatRow> auth={false} endpoint="player_stats/all" rowFields={rowFields} 
                    columnName={columnNames} rowFieldBuilder={rowFieldBuilder}/>
}