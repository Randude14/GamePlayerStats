import { getFirstObject } from "../../util/Helpers";
import type { Game } from "../../util/Models";
import { HighlighLabelTag } from "../HighlightLabelTag";
import { ImportGameButton } from "../buttons/ImportGameButton";
import { PlayerStatEditButton } from "../buttons/PlayerStatEditButton";
import type { ReactElement } from "react";
import { DetailsType, ViewGameDetailsButton } from "../buttons/ViewGameDetailsButton";
import { useAuth } from "../../context/useAuth";
import { DeletePlayerStatButton } from "../buttons/DeletePlayerStatButton";

interface GameDetailsProps {
    game: Game,
    fullDetails: boolean,
    highlightedText?: string,
    onImport?: () => void
}

const buildLabelArray = (prefix: string, labels: string[]): ReactElement => {

    if(labels && labels.length > 0) {
        return <div><label>{prefix}
        {
            labels.join(', ')
        }
        </label></div>
    }
    return <></>
}

const FullDetailsInfo = ( {game} : {game: Game} ) =>{
    return <>
        {game.game_type && <div><label>{ game.game_type }</label></div>}
        { buildLabelArray('Game Modes: ', game.game_modes) }
        { buildLabelArray('Platforms: ', game.platforms) }
        { buildLabelArray('Player Perspectives: ', game.player_perspectives) }
        { buildLabelArray('Themes: ', game.themes) }
        { buildLabelArray('Genre: ', game.genres) }
    </>
}

export function GameCardDetails( { game, fullDetails, highlightedText, onImport } : GameDetailsProps ) {

    const { doesPlayerHaveStatFor } = useAuth();
    const userHaveGame: boolean = doesPlayerHaveStatFor(game.id);

    return <div className="info-card-fields">
        { !fullDetails && <ViewGameDetailsButton game={game} detailsType={DetailsType.Image} /> }
        { fullDetails && <div><img src={game.cover_url} className="info-card-image" /></div> }
        <div><HighlighLabelTag className="" text={game.title} highlightedText={highlightedText}/></div>
        <div><label>{ getFirstObject(game.developers) }</label></div>
        <div><label>{ getFirstObject(game.publishers) }</label></div>
        <div><label>{ game.release ? new Date(game.release).toLocaleDateString() : 'N/A' }</label></div>

        { fullDetails && <FullDetailsInfo game={game} /> }

        {/* Only show these buttons on the info card page */}
        { !fullDetails && <ViewGameDetailsButton game={game} detailsType={DetailsType.Button} /> }
        { !fullDetails && <div><ImportGameButton game_external_id={game.external_id} isImported={game.isImported} canImport={game.canImport} onImport={onImport} /></div> }

        { !fullDetails && game.isImported && <PlayerStatEditButton game={game} buttonLabel={userHaveGame ? "Update To Profile" : "Add To Profile"} successCallback={onImport} /> }
        { !fullDetails && userHaveGame && <DeletePlayerStatButton game_id={game.id} successCallback={onImport} /> }

    </div>
}