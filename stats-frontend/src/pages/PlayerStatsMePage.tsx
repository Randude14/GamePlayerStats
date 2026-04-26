import { useState, type ReactElement } from "react"
import { InfoTable } from "../components/InfoCardPage";
import { blankImage, getFirstObject } from "../util/Helpers";
import { PlayerStatEditButton } from "../components/PlayerStatEditButton";
import { useAuth } from "../context/useAuth";

type PlayerStatRow = {
    player_id: number,
    game_id: number,
    hours_played: number,
    date_purchased: Date,
    game_title: string,
    game_publishers: string[],
    game_developers: string[],
    game_cover_url: string,
    game_release: string
}

const infoCardBuilder = (data: PlayerStatRow, updateGameCallback: () => void): ReactElement => {

    const datePurchased: string = new Date(data.date_purchased).toLocaleDateString();
    const gameRelease: string = new Date(data.game_release).toLocaleDateString();

    return <div className="info-card-fields">
        <div><img className="info-card-image" src={data.game_cover_url || blankImage()}/></div>
        <div><label>{data.game_title}</label></div>
        <div><label>{`Hours Played: ${data.hours_played}`}</label></div>
        <div><label>{ `Date Purchased: ${datePurchased}` }</label></div>
        <div><label>{ `Game Release: ${gameRelease}` }</label></div>
        <PlayerStatEditButton 
        game={{
            id: data.game_id,
            title: data.game_title,
            release: data.game_release || '1999-10-28',
            developer: getFirstObject(data.game_developers) || '',
            publisher: getFirstObject(data.game_publishers) || '',
            created_at: null
        }} 
        disabled={false} buttonLabel="Update" successCallback={updateGameCallback}/>
    </div>
}

export function PlayerStatsMePage() {

    const { user } = useAuth();
    const [refreshKey, setRefreshKey] = useState<number>(1);

    const updateGameCallback = () => {
        setRefreshKey(refreshKey+1);
    }

    const cardGenerator = (data: PlayerStatRow) => {
        return infoCardBuilder(data, updateGameCallback);
    }

    return <div>
        {user && <h1><span className="highlight">{user.username}</span> Stats</h1>}
        <InfoTable<PlayerStatRow> key={`PlayerStatMe-${refreshKey}`} auth={true} endpoint="player_stats/me/search" infoCardBuilder={cardGenerator} />
    </div>
}