import { useAuth } from "../../context/useAuth";
import { HighlighLabelTag } from "../HighlightLabelTag";
import { DetailsType, ViewGameDetailsAsyncButton } from "../buttons/ViewGameDetailsButton";
import type { Game, RowObject } from "../../util/Models";
import { PlayerStatEditButton } from "../buttons/PlayerStatEditButton";
import { DeletePlayerStatButton } from "../buttons/DeletePlayerStatButton";

interface StatIdLabelProps {
    condition: boolean; 
    className: string; 
    text: string; 
    highlightedText: string;
}

const StatIdLabel = ( { condition, className, text, highlightedText } : StatIdLabelProps) => {
    return <HighlighLabelTag className={className} text={text} highlightedText={ condition ? highlightedText : null} />;
}

export interface PlayerStatRow extends RowObject {
    id: number,
    player_id: number,
    game_id: number,
    username: string,
    is_favorite: boolean,
    rating: number,
    hours_played: number,
    date_purchased: Date,
    game_title: string,
    game_publishers: string[],
    game_developers: string[],
    game_cover_url: string,
    game_release: string
}

interface PlayerStatCardProps {
    playerStat: PlayerStatRow,
    highlightUsername?: boolean,
    highlightGame?: boolean,
    highlightedText?: string,
    refreshData: () => void
}

export function PlayerStatCardDetails( { playerStat, highlightUsername, highlightGame, highlightedText, refreshData } : PlayerStatCardProps) {
    const { user } = useAuth();

    const datePurchased: string = new Date(playerStat.date_purchased).toLocaleDateString();
    const gameRelease: string = new Date(playerStat.game_release).toLocaleDateString();
    const isCurrentUser = (user) ? user.id === playerStat.player_id : false

    const game: Game = {
        id: playerStat.game_id,
        external_id: -1,
        cover_url: playerStat.game_cover_url,
        title: playerStat.game_title,
        publishers: playerStat.game_publishers,
        developers: playerStat.game_developers,
        release: playerStat.game_release,
        canImport: false,
        isImported: true,
        created_at: null
    }

    return <div className="info-card-fields">
        <ViewGameDetailsAsyncButton gameId={playerStat.game_id} detailsType={DetailsType.Image} stat_id={playerStat.id} player_id={playerStat.player_id} is_favorite={playerStat.is_favorite} />
        <div><label>{`User: `}</label> <StatIdLabel className="" condition={highlightUsername} 
                text={playerStat.username} highlightedText={highlightedText} /> </div>
        <div><StatIdLabel className="" condition={highlightGame} 
                text={playerStat.game_title} highlightedText={highlightedText} /></div>
        <div><label>{`Hours Played: ${playerStat.hours_played}`}</label></div>
        <div><label>{ `Date Purchased: ${datePurchased}` }</label></div>
        <div><label>{`Rating (1-10): ${playerStat.rating ?? 'N/A'}`}</label></div>
        <div><label>{ `Game Release: ${gameRelease}` }</label></div>
        <ViewGameDetailsAsyncButton gameId={playerStat.game_id} detailsType={DetailsType.Button} successCallback={refreshData} />
        {isCurrentUser && <PlayerStatEditButton game={game} buttonLabel="Update Stat" successCallback={refreshData} />}
        {isCurrentUser && <DeletePlayerStatButton stat_id={playerStat.id} game_id={playerStat.game_id} successCallback={refreshData}/>}

    </div>
}