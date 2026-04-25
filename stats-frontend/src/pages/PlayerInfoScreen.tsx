import { useState, type ReactElement } from "react"
import { InfoTable } from "../components/InfoCardPage";
import { blankImage, getFirstObject } from "../util/Helpers";
import { PlayerStatEditButton } from "../components/PlayerStatEditButton";

type PlayerStatRow = {
    title: string,
    player_id: number,
    game_id: number,
    hours_played: number,
    date_purchased: Date,
    game_publishers: string[],
    game_developers: string[],
    game_cover_url: string,
    game_release: string
}

const infoCardBuilder = (data: PlayerStatRow, updateGameCallback: () => void): ReactElement => {

    const datePurchased: string = new Date(data.date_purchased).toLocaleDateString();
    const gameRelease: string = new Date(data.game_release).toLocaleDateString();

    return <div>
        <div><img className="game-card-image" src={data.game_cover_url || blankImage()}/></div>
        <div><label>{data.title}</label></div>
        <div><label>{`Hours Played: ${data.hours_played}`}</label></div>
        <div><label>{ `Date Purchased: ${datePurchased}` }</label></div>
        <div><label>{ `Release Date: ${gameRelease}` }</label></div>
        <PlayerStatEditButton 
        game={{
            id: data.game_id,
            title: data.title,
            release: data.game_release || '1999-10-28',
            developer: getFirstObject(data.game_publishers) || '',
            publisher: getFirstObject(data.game_publishers) || '',
            created_at: null
        }} 
        disabled={false} buttonLabel="Update" successCallback={updateGameCallback}/>
    </div>
}

export function PlayerInfoScreen() {

    const [refreshKey, setRefreshKey] = useState<number>(1);

    const updateGameCallback = () => {
        setRefreshKey(refreshKey+1);
    }

    const cardGenerator = (data: PlayerStatRow) => {
        return infoCardBuilder(data, updateGameCallback);
    }

    return <InfoTable<PlayerStatRow> key={`PlayerStatMe-${refreshKey}`} auth={true} endpoint="player_stats/me" infoCardBuilder={cardGenerator} />
}