import { useState, type ReactElement } from "react"
import { InfoTable, QUERY_PARAM_ID } from "../components/InfoCardPage";
import { blankImage } from "../util/Helpers";
import { PlayerStatEditButton } from "../components/PlayerStatEditButton";
import { useAuth } from "../context/useAuth";
import { HighlighLabelTag } from "../components/HighlightLabelTag";

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
    const params: URLSearchParams = new URLSearchParams(window.location.search);
    const highlightedText: string = params.get(QUERY_PARAM_ID);

    return <div className="info-card-fields">
        <div><img className="info-card-image" src={data.game_cover_url || blankImage()}/></div>
        <div><label> <HighlighLabelTag className="" text={data.game_title} highlightedText={highlightedText} /> </label></div>
        <div><label>{`Hours Played: ${data.hours_played}`}</label></div>
        <div><label>{ `Date Purchased: ${datePurchased}` }</label></div>
        <div><label>{ `Game Release: ${gameRelease}` }</label></div>
        <PlayerStatEditButton 
        game={{
            id: data.game_id,
            cover_url: data.game_cover_url,
            title: data.game_title,
            release: data.game_release || '1999-10-28',
            developers: data.game_developers,
            publishers: data.game_publishers,
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
        {user && <h1><span className="highlight">{`${user.username}'s`}</span> Stats</h1>}
        <InfoTable<PlayerStatRow> key={`PlayerStatMe-${refreshKey}`} auth={true} searchInputPlaceholder="Enter text to search games for."
                endpoint="player_stats/me/search" infoCardBuilder={cardGenerator} />
    </div>
}