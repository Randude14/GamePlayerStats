import { useRef, useState, type ReactElement } from "react"
import { InfoTable } from "../components/InfoTable";
import { HttpMethod } from "../util/serverRequests";

type GameDataRow = {
    title: string,
    publishers: string,
    developers: string,
    release: Date,
    cover_url: string
}

const Fields = {
    GAME_TITLE: 'title',
    PUBLISHERS: 'publishers',
    DEVELOPERS: 'developers',
    GAME_RELEASE: 'release_date',
    COVER: 'cover_url'
}

const columnNames = (field: string): string => {
    switch (field) {
        case Fields.GAME_TITLE: return 'Title';
        case Fields.PUBLISHERS: return 'Publishers';
        case Fields.DEVELOPERS: return 'Developers';
        case Fields.GAME_RELEASE: return 'Game Release';
        case Fields.COVER: return 'Thumbnail';
    }
    return '';
}

const rowFieldBuilder = (field: string, data: GameDataRow): ReactElement => {
    let labelString: string = 'Error';
    if(field === Fields.GAME_RELEASE) {
        console.log(data[field]);
    }
    switch (field) {
        case Fields.GAME_TITLE: labelString = data[field]; break;
        case Fields.PUBLISHERS: labelString = data[field].length > 0 ? data[field][0] : 'N/A'; break;
        case Fields.DEVELOPERS: labelString = data[field].length > 0 ? data[field][0] : 'N/A'; break;
        case Fields.GAME_RELEASE: labelString = new Date(data[field]).toLocaleDateString(); break;
        case Fields.COVER: return <img src={data[field]}/>;
    }
    return <label key={field}>{labelString}</label>;
}

const getSearchPoint = (text: string) => {
    if(!text) {
        return null;
    }
    return `games/external/search?query=${text}`;
}

export function GameSearchScreen() {
    const rowFields: string[] = [Fields.GAME_TITLE, Fields.DEVELOPERS, Fields.PUBLISHERS, Fields.GAME_RELEASE, Fields.COVER];
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