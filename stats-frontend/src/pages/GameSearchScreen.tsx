import { useRef, useState, type ReactElement } from "react"
import { InfoTable } from "../components/InfoCardPage";
import { fetchWithNoAuth, HttpMethod } from "../util/serverRequests";
import './GameSearchScreen.css';
import type { RowObject, SearchResults } from "../util/Models";

const gameSearchPageToken = 'game-search-page';

const blankImage = import.meta.env.VITE_BLANK_IMAGE || './BlankGameCard.png';

type GameDataRow = {
    title: string,
    publishers: string[],
    developers: string[],
    release_date: string,
    cover_url: string,
    isImported: boolean,
    external_id: number,
    internal_id: number
}

const getFirstObject = (items: string[]): string => {
    return (items && items.length > 0) 
            ? items[0] : 'N/A';
}

const importGame = async (external_id: number): Promise<boolean> => {
    const res = await fetchWithNoAuth(`games/external/import/${external_id}`, HttpMethod.PUT);
    return res.ok;
}

const GameInfoCard = ({ data, onImport }: { data: GameDataRow, onImport: () => void }): ReactElement => {

    const importButtonHandler = async () =>{
            const imported = await importGame(data.external_id);

            const message: string = imported ? 'Game imported!' : 'Something went wrong!';
            console.log(message);

            if(imported) {
                onImport();
            }
        };

    return <>
        <div><img className="game-card-image" src={data.cover_url || blankImage}/></div>
        <div><label>{data.title}</label></div>
        <div><label>{ getFirstObject(data.developers) }</label></div>
        <div><label>{ getFirstObject(data.publishers) }</label></div>
        <div><label>{ data.release_date ? new Date(data.release_date).toLocaleDateString() : 'N/A' }</label></div>

        {!data.isImported && <button onClick={importButtonHandler}>Import Game</button>}
        {data.isImported && <button disabled>Game Imported</button>}
    </>
}

type ClickHandler = () => void;
function buildPageButtons<T extends RowObject>(onPrevClickHandler: ClickHandler, onNextClickHandler: ClickHandler) {

    return (searchResults: SearchResults<T>) => {
            return <div>
                <button className="info-card-navigation" disabled={!searchResults.hasPreviousPage} onClick={onPrevClickHandler}>Previous</button>
                <label className="info-card-navigation">{`Page ${searchResults.page} / ${searchResults.totalPages}`}</label>
                <button className="info-card-navigation" disabled={!searchResults.hasNextPage} onClick={onNextClickHandler}>Next</button>
            </div>
    }
}

function getPageNum(pageNumToken: string): number {
    if(pageNumToken) {
       const pageToken: string = localStorage.getItem(pageNumToken);
       const page: number = +pageToken;
       return isNaN(page) ? 1 : Math.max(page, 1);
    }
    return 1;
}


const getSearchPoint = (text: string, page: number, pageSize: number) => {
    if(!text) {
        return null;
    }
    return `games/external/search?query=${text}&pageSize=${pageSize}&page=${page}`;
}

export function GameSearchScreen() {
    const gameSearchText = useRef<HTMLInputElement | null>(null);
    const buttonSearchRef = useRef<HTMLButtonElement | null>(null);
    const [searchText, setSearchText] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState<number>(1);
    const [page, setPage] = useState<number>( getPageNum(gameSearchPageToken) );
    const pageSize: number = 30;

    const onTextChangeHandler = () => {
        if(buttonSearchRef.current && gameSearchText.current) {
            buttonSearchRef.current.disabled = gameSearchText.current.value.length === 0;
        }
    }

    const infoCardBuilder = (data: GameDataRow) => {
        return <GameInfoCard data={data} onImport={onImportHandler}/>
    }

    // Button handlers
    const onClickHandler = () => {
        setSearchText(gameSearchText.current ? gameSearchText.current.value : '');
        setPage(1);
    }

    const onPrevClickHandler = () => {
        setPage(Math.max(page-1, 1));
    }
    const onNextClickHandler = () => {
        setPage(page+1);
    }

    const onImportHandler = () => {
        setRefreshKey(v => v + 1);
    }

    const searchPoint = getSearchPoint(searchText, page, pageSize);

    return <>
        <div>
                <input type="search" ref={gameSearchText} onChange={onTextChangeHandler} placeholder="Enter game name here"></input>
                <button onClick={onClickHandler} ref={buttonSearchRef}>Search</button>
        </div>
        <InfoTable<GameDataRow> key={`${searchPoint}-${refreshKey}`} auth={false} endpoint={searchPoint} 
                httpMethod={HttpMethod.POST} infoCardBuilder={infoCardBuilder} pageNavBuilder={buildPageButtons<GameDataRow>(onPrevClickHandler, onNextClickHandler)} />
    </>

}