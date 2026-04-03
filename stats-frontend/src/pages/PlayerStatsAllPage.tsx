import type { ReactElement } from "react";
import { ColumnInfo } from "../components/ColumnInfo";

const Fields = {
    PLAYER_ID: 'player_id',
    GAME_ID: 'game_id',
    HOURS_PLAYED: 'hours_played',
    DATE_PURCHASED: 'date_purchased'
}

const columnNames = (field: string): string => {
    switch (field) {
        case Fields.PLAYER_ID: return 'Player ID';
        case Fields.GAME_ID: return 'Game ID';
        case Fields.HOURS_PLAYED: return 'Hours Played';
        case Fields.DATE_PURCHASED: return 'Date Purchased';
    }
    return '';
}

const rowFieldBuilder = (field: string, data: any): ReactElement => {
    switch (field) {
        case Fields.PLAYER_ID: return <label>{data[field]}</label>;
        case Fields.GAME_ID: return <label>{data[field]}</label>;
        case Fields.HOURS_PLAYED: return <label>{data[field]}</label>;
        case Fields.DATE_PURCHASED: return <label>{new Date(data[field]).toLocaleDateString()}</label>;
    }
    return <label>Error</label>;
}

export function PlayerStatsAllPage() {
    const rowFields: string[] = [Fields.PLAYER_ID, Fields.GAME_ID, Fields.HOURS_PLAYED, Fields.DATE_PURCHASED];



    return <ColumnInfo auth={false} endpoint="player_stats/all" rowFields={rowFields} 
                    columnName={columnNames} rowFieldBuilder={rowFieldBuilder}/>
}