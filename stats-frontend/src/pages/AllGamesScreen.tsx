import { useRef, useState, type ReactElement } from "react"
import { InfoTable } from "../components/InfoTable";
import { HttpMethod } from "../util/serverRequests";

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
        case Fields.GAME_TITLE: labelString = data[field]; break;
        case Fields.PUBLISHER: labelString = data['publishers'].length > 0 ? data['publishers'][0] : 'N/A'; break;
        case Fields.DEVELOPER: labelString = data['developers'].length > 0 ? data['developers'][0] : 'N/A'; break;
        case Fields.GAME_RELEASE: labelString = new Date(data['release_date']).toLocaleDateString(); break;
    }
    return <label key={field}>{labelString}</label>;
}

const getSearchPoint = (text: string) => {
    if(!text) {
        return null;
    }
    return `games/external/search?query=${text}`;
}

export function AllGamesScreen() {
    const rowFields: string[] = [Fields.GAME_TITLE, Fields.DEVELOPER, Fields.PUBLISHER, Fields.GAME_RELEASE];
    const gameSearchText = useRef<HTMLInputElement | null>(null);
    const buttonSearchRef = useRef<HTMLButtonElement | null>(null);
    const [searchPoint, setSearchPoint] = useState<string | null>(null);

    const onTextChangeHandler = () => {
        if(buttonSearchRef.current && gameSearchText.current) {
            buttonSearchRef.current.disabled = gameSearchText.current.value.length === 0;
        }
    }

    const onClickHandler = () => {
        const searchEndpoint: string = getSearchPoint(gameSearchText.current ? gameSearchText.current.value : '');
        setSearchPoint(searchEndpoint);
    }

    return <>
        <div>
                <input type="search" ref={gameSearchText} onChange={onTextChangeHandler} placeholder="Enter game name here"></input>
                <button onClick={onClickHandler} ref={buttonSearchRef}>Search</button>
        </div>
        <InfoTable<GameDataRow> key={searchPoint} auth={false} pageSize={30} endpoint={searchPoint} httpMethod={HttpMethod.POST} rowFields={rowFields} rowFieldBuilder={rowFieldBuilder} columnName={columnNames} />
    </>

}