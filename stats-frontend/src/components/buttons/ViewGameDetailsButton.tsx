import { useEffect, useState } from "react"
import { useApi } from "../../context/ApiContext"
import { useEditPopup, type EditPopupSettings } from "../../context/EditPopupContext"
import { blankImage } from "../../util/Helpers"
import type { Game } from "../../util/Models"
import { GameCardDetails } from "../cards/GameCardDetailsComponent"

const DetailsType = {
    Image: 'Image',
    Button: 'Button'
}

interface GameDetailsProps {
    game: Game,
    detailsType: string
}

function ViewGameDetailsButton( {game, detailsType } : GameDetailsProps ) {
    const { showPopup } = useEditPopup();

    if(!game) {
        return <></>
    }

    const elementBuilder = () => {
        return <>
            <GameCardDetails game={game} fullDetails={true} />
        </>
    }

    const clickCallback = () => {
        if(game.isImported) {
            
        }
        else {

        }

        return true;
    }

    const popupSettings: EditPopupSettings = {
        elementBuilder,
        clickCallback,
        submitLabel: 'Add To Profile'
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



interface GameDetailsAsyncProps {
    gameId: number,
    detailsType: string
}

function ViewGameDetailsAsyncButton( {gameId, detailsType } : GameDetailsAsyncProps) {
    const { getGameById } = useApi();
    const [game, setGame] = useState(null);

    useEffect( () => {
        const fetchGame = async () => {
            const game: Game = await getGameById(gameId);
            setGame(game);
        }

        fetchGame();
    }, [gameId, getGameById]);

    if(!gameId) {
        return <></>
    }

    if(!game) {
        return <>Loading...</>
    }

    return <ViewGameDetailsButton game={game} detailsType={detailsType} />
}

export { DetailsType, ViewGameDetailsAsyncButton, ViewGameDetailsButton };
