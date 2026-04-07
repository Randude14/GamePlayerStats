import { type ReactElement } from "react"
import { InfoTable } from "../components/InfoTable";

type GameDataRow = {
    title: string,
    publisher: string,
    developer: string,
    release: Date
}

const Fields = {
    GAME_TITLE: 'title',
    PUBLISHER: 'publisher',
    DEVELOPER: 'developer',
    GAME_RELEASE: 'release'
}

const columnNames = (field: string): string => {
    switch (field) {
        case Fields.GAME_TITLE: return 'Title';
        case Fields.PUBLISHER: return 'Publisher';
        case Fields.DEVELOPER: return 'Developer';
        case Fields.GAME_RELEASE: return 'Game Release';
    }
    return '';
}

const rowFieldBuilder = (field: string, data: GameDataRow): ReactElement => {
    let labelString: string = 'Error';
    switch (field) {
        case Fields.GAME_TITLE: 
        case Fields.PUBLISHER: 
        case Fields.DEVELOPER: labelString = data[field]; break;
        case Fields.GAME_RELEASE: labelString = new Date(data[field]).toLocaleDateString(); break;
    }
    return <label key={field}>{labelString}</label>;
}

export function AllGamesScreen() {
    const rowFields: string[] = [Fields.GAME_TITLE, Fields.DEVELOPER, Fields.PUBLISHER, Fields.GAME_RELEASE];

    return <InfoTable<GameDataRow> auth={true} endpoint="games" rowFields={rowFields} rowFieldBuilder={rowFieldBuilder} columnName={columnNames} />
}