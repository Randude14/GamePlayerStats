import { useEffect, useState } from "react"
import { useApi } from "../../context/ApiContext"
import { useEditPopup, type EditPopupSettings } from "../../context/EditPopupContext"
import { blankImage } from "../../util/Helpers"
import type { Game, PlayerStat } from "../../util/Models"
import { GameCardDetails } from "../cards/GameCardDetailsComponent"
import { PlayerStatPopupGenerator } from "../PlayerStatPopupGenerator"
import { useAuth } from "../../context/useAuth"

const DetailsType = {
    Image: 'Image',
    Button: 'Button'
}

interface GameDetailsProps {
    game: Game,
    detailsType: string,
    successCallback?: () => void
}

function ViewGameDetailsButton( {game, detailsType, successCallback } : GameDetailsProps ) {
    const { showPopup } = useEditPopup();
    const { importExternalGame, getPlayerStat, updatePlayerStat, addPlayerStat } = useApi();
    const { user, doesPlayerHaveStatFor } = useAuth();

    if(!game) {
        return <></>
    }

    const elementBuilder = () => {
        return <>
            <GameCardDetails game={game} fullDetails={true} />
        </>
    }

    const clickCallback = () => {

        const clickAction = async () => {
            if(game.isImported) {
                const stat: PlayerStat = await getPlayerStat(user.id, game.id, true);

                const playerStatSaveHandler = async (statId: number, gameId: number, date_purchased: string, hours_played: number) => {
                    if(statId > 0) {
                        await updatePlayerStat(statId, date_purchased, hours_played);
                    }
                    else {
                        await addPlayerStat(gameId, date_purchased, hours_played);
                    }

                    if(successCallback) {
                        successCallback();
                    }
                }

                const popupSettings: EditPopupSettings = await PlayerStatPopupGenerator({
                    stat,
                    game,
                    userId: user.id,
                    submitCallback: playerStatSaveHandler
                });

                showPopup(popupSettings);
            }
            else {
                await importExternalGame(game.external_id);
                if(successCallback) {
                    successCallback();
                }
            }
        }

        clickAction();
        return true;
    }

    const userHaveGame: boolean = doesPlayerHaveStatFor(game.id);
    const submitLabel: string = game?.isImported ? 
            (userHaveGame ? 'Update Game Stat' : 'Add To Profile')
             : 'Import Game';

    const popupSettings: EditPopupSettings = {
        elementBuilder,
        clickCallback,
        submitLabel
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
    detailsType: string,
    successCallback?: () => void
}

function ViewGameDetailsAsyncButton( {gameId, detailsType, successCallback } : GameDetailsAsyncProps) {
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

    return <ViewGameDetailsButton game={game} detailsType={detailsType} successCallback={successCallback} />
}

export { DetailsType, ViewGameDetailsAsyncButton, ViewGameDetailsButton };
