import { useApi } from "../../context/ApiContext";
import { useEditPopup, type EditPopupSettings } from "../../context/EditPopupContext";
import { useAuth } from "../../context/useAuth";
import type { Game, PlayerStat } from "../../util/Models";
import { PlayerStatPopupGenerator } from "../PlayerStatPopupGenerator";

interface PlayerStatEditProps {
    game: Game;
    disabled?: boolean;
    buttonLabel: string;
    successCallback?: () => void;
}

export function PlayerStatEditButton({ game, disabled, buttonLabel, successCallback=null }: PlayerStatEditProps) {
    const { user, doesPlayerHaveStatFor, refreshPlayerStats } = useAuth();
    const { showPopup } = useEditPopup(); 
    const { addPlayerStat, updatePlayerStat, getPlayerStat } = useApi();

    if(! user || ! game) {
        return <div><button disabled={true}>{buttonLabel}</button></div>
    }

    const playerStatSaveHandler = async (statId: number, gameId: number, date_purchased: string, hours_played: number) => {
        const status = statId > 0 ? await updatePlayerStat(statId, date_purchased, hours_played) : 
                                    await addPlayerStat(gameId, date_purchased, hours_played);

        if(status) {
            refreshPlayerStats();

            if(successCallback) {
                successCallback();
            }
        }
    }

    const addGameStatHandler = async () => {

        const stat: PlayerStat = (doesPlayerHaveStatFor(game?.id) 
                                        ? 
                                            await getPlayerStat(user.id, game.id, true) 
                                        : 
                                            null);

        const popupSettings: EditPopupSettings = await PlayerStatPopupGenerator({
            stat,
            game,
            userId: user.id,
            submitCallback: playerStatSaveHandler
        });

        showPopup(popupSettings);
    }
    
    
    return <div><button disabled={disabled} onClick={addGameStatHandler}>{buttonLabel}</button></div>
}