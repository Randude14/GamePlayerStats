import { useRef, useState, type ReactElement } from "react"
import { InfoTable } from "../components/InfoCardPage";
import { fetchWithAuth, fetchWithNoAuth, HttpMethod } from "../util/serverRequests";
import './GameSearchScreen.css';
import type { Game, RowObject, SearchResults } from "../util/Models";
import { useToast } from "../context/ToastContext";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { PlayerStatEdit } from "../components/PlayerStatEdit";
import { EditType, useEditPopup, type EditPopupSettings } from "../context/EditPopupContext";

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

const GameInfoCard = ({ data, onImport, addGameStatHandler }: { data: GameDataRow, onImport: () => void, addGameStatHandler: () => void }): ReactElement => {
    const { token } = useAuth();
    const { toast } = useToast();
    const isLoggedIn = !!token;

    const importButtonHandler = async () =>{
            const imported = await importGame(data.external_id);

            if(imported) {
                onImport();
                toast.success('Game imported!');
            }
            else {
                toast.error('Something went wrong. Could not import game.');
            }
        };

    return <div className="game-card">
        <div><img className="game-card-image" src={data.cover_url || blankImage}/></div>
        <div><label>{data.title}</label></div>
        <div><label>{ getFirstObject(data.developers) }</label></div>
        <div><label>{ getFirstObject(data.publishers) }</label></div>
        <div><label>{ data.release_date ? new Date(data.release_date).toLocaleDateString() : 'N/A' }</label></div>

        {!data.isImported && <div><button onClick={importButtonHandler}>Import Game</button></div>}
        {data.isImported && <div><button disabled>Game Imported</button></div>}
        {data.isImported && <div><button disabled={!isLoggedIn} onClick={addGameStatHandler}>Add To Profile</button></div>}
    </div>
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

const getSearchPoint = (text: string, page: number, pageSize: number) => {
    if(!text) {
        return null;
    }
    return `games/external/search?query=${text}&pageSize=${pageSize}&page=${page}`;
}

export function GameSearchScreen() {
    const gameSearchText = useRef<HTMLInputElement | null>(null);
    const buttonSearchRef = useRef<HTMLButtonElement | null>(null);

    const [refreshKey, setRefreshKey] = useState<number>(1);
    const [searchParams, setSearchParams] = useSearchParams();

    const { showPopup } = useEditPopup();
    const { toast } = useToast();

    const page: number = Number(searchParams.get('page') || 1);
    const pageSize: number = Number(searchParams.get('pageSize') || 30);
    const searchText: string = searchParams.get('query') || "";


    const onTextChangeHandler = () => {
        if(buttonSearchRef.current && gameSearchText.current) {
            buttonSearchRef.current.disabled = gameSearchText.current.value.length === 0;
        }
    }

    const playerStatSaveHandler = async (gameId: number, date_purchased: string, hours_played: number) => {
        const body = JSON.stringify({ game_id: gameId, date_purchased, hours_played });
        const res = await fetchWithAuth('player_stats', HttpMethod.POST, body);

        if(res.ok) {
            toast.success('Game added to profile.');
        }
        else {
            toast.error('Failed to add to profile.');
        }
    }

    const infoCardBuilder = (data: GameDataRow) => {

        const addGameStatHandler = () => {
            const game: Game = {
                title: data.title,
                publisher: data.publishers.length ? data.publishers[0] : 'N/A',
                developer: data.developers.length ? data.developers[0] : 'N/A',
                release: data.release_date,
                id: data.internal_id,
                created_at: null
            }

            const popupSettings: EditPopupSettings = PlayerStatEdit({
                game,
                type: EditType.ADD,
                submitCallback: playerStatSaveHandler
            });

            showPopup(popupSettings);
        }
        return <GameInfoCard data={data} onImport={onImportHandler} addGameStatHandler={addGameStatHandler}/>
    }

    const updateSearchParams = (_page: number | string, _pageSize: number | string) => {
        const query = gameSearchText.current?.value || '';

        setSearchParams({
            query,
            pageSize: String(_pageSize),
            page: String(_page),
        })
    }

    // Button handlers
    const onClickHandler = () => {
        updateSearchParams(page, pageSize);
    }

    const onPrevClickHandler = () => {
        updateSearchParams(page-1, pageSize);
    }
    const onNextClickHandler = () => {
        updateSearchParams(page+1, pageSize);
    }

    const onImportHandler = () => {
        setRefreshKey(v => v + 1);
    }

    const searchPoint = getSearchPoint(searchText, page, pageSize);

    return <>
        <div>
            <form onSubmit={(e) => {
                e.preventDefault();
                onClickHandler();
            }}>
                <input type="search" ref={gameSearchText} onChange={onTextChangeHandler} 
                        placeholder="Enter game name here" defaultValue={searchText} /> 
                <button type="submit" ref={buttonSearchRef}>Search</button>
                <select value={String(pageSize)} onChange={(e) => {

                    updateSearchParams(page, e.target.value)
                }}>
                    Page Size: 
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="30">30</option>
                    <option value="40">40</option>
                    <option value="50">50</option>
                </select>
            </form>
        </div>
        <InfoTable<GameDataRow> key={`${searchPoint}-${refreshKey}`} auth={false} endpoint={searchPoint} 
                httpMethod={HttpMethod.POST} infoCardBuilder={infoCardBuilder} 
                pageNavBuilder={buildPageButtons<GameDataRow>(onPrevClickHandler, onNextClickHandler)} />
    </>

}