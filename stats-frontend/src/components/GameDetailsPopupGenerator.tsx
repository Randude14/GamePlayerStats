import type { ReactElement } from "react";
import { blankImage, getFirstObject } from "../util/Helpers";
import type { Game } from "../util/Models";
import type { EditPopupSettings } from "../context/EditPopupContext";
import { ImportButton } from "./ImportButton";

interface GamePopupSettings {
    game: Game,
    game_external_id: number,
    userId: string,
    toastMessage: (success: boolean, message: string) => void
}

const MESSAGE_LABEL_ID: string = 'game-details-label';

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

function GameDetailsPopup({ game, userId, game_external_id }: GamePopupSettings): ReactElement {

    return <>
        <div><img className="info-card-image" src={game.cover_url || blankImage()}/></div>
        <div><label>{game.title}</label></div>
        <div><label>{ getFirstObject(game.developers) }</label></div>
        <div><label>{ getFirstObject(game.publishers) }</label></div>
        {game.game_type && <div><label>{ game.game_type }</label></div>}
        { buildLabelArray('Game Modes: ', game.game_modes) }
        { buildLabelArray('Platforms: ', game.platforms) }
        { buildLabelArray('Player Perspectives: ', game.player_perspectives) }
        { buildLabelArray('Themes: ', game.themes) }
        { buildLabelArray('Genre: ', game.genres) }
        <div><label>{ game.release ? new Date(game.release).toLocaleDateString() : 'N/A' }</label></div>
        {!!userId && <div><ImportButton game_external_id={game_external_id} isImported={game.isImported} canImport={game.canImport} /></div>}
        <label id={MESSAGE_LABEL_ID}>{''}</label>
    </>

}

export function GameDetailsPopupGenerator(settings: GamePopupSettings) {

    const elementBuilder = () => {
        return GameDetailsPopup(settings);
    }

    const clickCallback = () => {
        return true;
    }

    const popupSettings: EditPopupSettings = {
        submitLabel: 'Yes',
        elementBuilder,
        clickCallback
    }

    return popupSettings;
}