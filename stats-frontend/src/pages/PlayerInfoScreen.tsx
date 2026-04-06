import { type ReactElement } from "react"
import { InfoTable } from "../components/InfoTable";

type ITRecord = Record<string, any>

const Fields = {
    GAME_TITLE: 'title',
    HOURS_PLAYED: 'hours_played',
    DATE_PURCHASED: 'date_purchased',
    GAME_RELEASE: 'release'
}

const columnNames = (field: string): string => {
    switch (field) {
        case Fields.GAME_TITLE: return 'Title';
        case Fields.HOURS_PLAYED: return 'Hours Played';
        case Fields.DATE_PURCHASED: return 'Date Purchased';
        case Fields.GAME_RELEASE: return 'Game Release';
    }
    return '';
}

const rowFieldBuilder = (field: string, data: ITRecord): ReactElement => {
    switch (field) {
        case Fields.GAME_TITLE: // TODO return anchor element that goes to a page with the stats of players that own this title
        case Fields.HOURS_PLAYED: return <label>{data[field]}</label>;
        case Fields.GAME_RELEASE: 
        case Fields.DATE_PURCHASED: return <label>{new Date(data[field]).toLocaleDateString()}</label>;
    }
    return <label>Error</label>;
}

export function PlayerInfoScreen() {
    const rowFields: string[] = [Fields.GAME_TITLE, Fields.HOURS_PLAYED, Fields.GAME_RELEASE, Fields.DATE_PURCHASED];

    return <InfoTable auth={true} endpoint="player_stats/me" rowFields={rowFields} rowFieldBuilder={rowFieldBuilder} columnName={columnNames} />
}