import { useEditPopup, type EditPopupSettings } from "../context/EditPopupContext"
import { blankImage } from "../util/Helpers"
import type { Game } from "../util/Models"
import { GameCardDetails } from "./CardDetailsComponents"

const DetailsType = {
    Image: 'Image',
    Button: 'Button'
}

interface GameDetailsProps {
    game: Game,
    detailsType: string
}

interface GameDetailsAsyncProps {
    gameId: number,
    detailsType: string
}

async function ViewGameDetailsAsyncButton( {gameId } : GameDetailsAsyncProps) {

    if(!gameId) {
        return <></>
    }

    // TODO grab game and call the ViewGameDetailsButton function below
}

function ViewGameDetailsButton( {game, detailsType } : GameDetailsProps ) {
    const { showPopup } = useEditPopup();

    if(!game) {
        return <></>
    }

    const elementBuilder = () => {
        return <GameCardDetails game={game} fullDetails={true} />
    }

    const clickCallback = () => {
        return true;
    }

    const popupSettings: EditPopupSettings = {
        submitLabel: game.isImported ? 'Add To Profile' : 'Import Game',
        elementBuilder,
        clickCallback
    }

    const onViewButtonHandler = () => {
        showPopup(popupSettings);
    }

    if(String(detailsType) === DetailsType.Button) {
        return <div><button onClick={onViewButtonHandler}>View Game Details</button></div>
    }

    if(String(detailsType) === DetailsType.Image) {
        return <div><img className="info-card-image" src={game.cover_url || blankImage()} onClick={onViewButtonHandler}/></div>
    }

    return <></>
}

export { DetailsType, ViewGameDetailsAsyncButton, ViewGameDetailsButton };
