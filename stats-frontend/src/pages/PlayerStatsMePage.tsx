import { useState, type ReactElement } from "react"
import { InfoTable, QUERY_PARAM_ID } from "../components/InfoCardPage";
import { useAuth } from "../context/useAuth";
import { ApiRoutes } from "../util/ApiRoutes";
import { PlayerStatCardDetails, type PlayerStatRow } from "../components/cards/PlayerStatCardDetailsComponent";

const infoCardBuilder = (data: PlayerStatRow, refreshData: () => void): ReactElement => {
    const params: URLSearchParams = new URLSearchParams(window.location.search);
    const highlightedText: string = params.get(QUERY_PARAM_ID);

    return <PlayerStatCardDetails playerStat={data} highlightGame={true} 
            highlightedText={highlightedText} refreshData={refreshData} />;
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
                endpoint={ApiRoutes.SEARCH_PLAYER_STATS_ME} infoCardBuilder={cardGenerator} />
    </div>
}