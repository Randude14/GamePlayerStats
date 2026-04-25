import { useEditPopup, type EditPopupSettings } from "../context/EditPopupContext";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/useAuth";
import type { Game } from "../util/Models";
import { fetchWithAuth, HttpMethod } from "../util/serverRequests";
import { PlayerStatPopupGenerator } from "./PlayerStatPopupGenerator";

interface PlayerStatEditProps {
    game: Game;
    disabled: boolean;
    buttonLabel: string;
    successCallback?: () => void;
}

export function PlayerStatEditButton({ game, disabled, buttonLabel, successCallback=null }: PlayerStatEditProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const { showPopup } = useEditPopup(); 

    if(! user || ! game) {
        return <div><button disabled={true}>{buttonLabel}</button></div>
    }

    const playerStatSaveHandler = async (statId: number, gameId: number, date_purchased: string, hours_played: number) => {
        const statEndpoint = statId >= 1 ? `player_stats/${statId}` : 'player_stats';
        const body = JSON.stringify({ game_id: gameId, date_purchased, hours_played });
        const res = await fetchWithAuth(statEndpoint, statId >= 1 ? HttpMethod.PATCH : HttpMethod.POST, body);

        if(res.ok) {
            const toastMessage = statId >= 1 ?
                'Updated game to profile.' :
                'Game stat updated.';

            toast.success(toastMessage);
            if(successCallback) {
                successCallback();
            }
        }
        else {
            toast.error('Failed to update game to profile.');
        }
    }

    const addGameStatHandler = async () => {

        const popupSettings: EditPopupSettings = await PlayerStatPopupGenerator({
            game,
            userId: user.id,
            submitCallback: playerStatSaveHandler
        });

        showPopup(popupSettings);
    }
    
    
    return <div><button disabled={disabled} onClick={addGameStatHandler}>{buttonLabel}</button></div>
}