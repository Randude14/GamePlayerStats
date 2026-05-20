import { useAuth } from "../../context/useAuth";
import { HighlighLabelTag } from "../HighlightLabelTag";
import { DetailsType, ViewGameDetailsAsyncButton } from "../buttons/ViewGameDetailsButton";
import type { Game, PlayerStat, RowObject } from "../../util/Models";
import { PlayerStatEditButton } from "../buttons/PlayerStatEditButton";
import { DeletePlayerStatButton } from "../buttons/DeletePlayerStatButton";
import { CompletionStatusDropDown } from "../CompletionStatusDropDown";

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
    date_purchased: string,
    completion_status: string,
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

    const stat: PlayerStat = {
        ...playerStat,
        created_at: null
    }

    return <div className="info-card-fields">
        <ViewGameDetailsAsyncButton gameId={playerStat.game_id} detailsType={DetailsType.Image} stat_id={playerStat.id} player_id={playerStat.player_id} is_favorite={playerStat.is_favorite} />
        <div><label>{`User: `}</label> <StatIdLabel className="" condition={highlightUsername} 
                text={playerStat.username} highlightedText={highlightedText} /> </div>
        <div><StatIdLabel className="" condition={highlightGame} 
                text={playerStat.game_title} highlightedText={highlightedText} /></div>
        <div><label>{`Hours Played: ${formatHours(playerStat.hours_played)}`}</label></div>
        <div><label>{ `Date Purchased: ${datePurchased}` }</label></div>
        <div><label>{`Rating (1-10): ${playerStat.rating ?? 'N/A'}`}</label></div>
        <CompletionStatusDropDown stat={stat} />
        <div><label>{ `Game Release: ${gameRelease}` }</label></div>
        <ViewGameDetailsAsyncButton gameId={playerStat.game_id} detailsType={DetailsType.Button} successCallback={refreshData} />
        {isCurrentUser && <PlayerStatEditButton game={game} buttonLabel="Update Stat" successCallback={refreshData} />}
        {isCurrentUser && <DeletePlayerStatButton stat_id={playerStat.id} game_id={playerStat.game_id} game_name={playerStat.game_title} successCallback={refreshData}/>}

    </div>
}

function formatHours(hoursPlayed: number): string {
    let hoursString: string = String(hoursPlayed);
    let shift: number = 0;

    const index: number = hoursString.indexOf('.');
    if(index >= 0) {
        shift = hoursString.length - index;
    }

    for(let x = hoursString.length - 3 - shift; x > 0; x-=3) {
        hoursString = hoursString.substring(0, x) + ',' + hoursString.substring(x, hoursString.length);
    }

    return hoursString;

}