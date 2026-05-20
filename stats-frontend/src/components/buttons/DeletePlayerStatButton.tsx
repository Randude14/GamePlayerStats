import { useApi } from "../../context/ApiContext"
import { useEditPopup, type EditPopupSettings } from "../../context/EditPopupContext";
import { useAuth } from "../../context/useAuth";
import type { PlayerStat } from "../../util/Models";
import "./DeletePlayerStatButton.css"

interface DeleteButtonProps {
    stat_id?: number;
    game_id?: number;
    game_name?: string;
    successCallback?: () => void
}

export function DeletePlayerStatButton( {stat_id, game_id, game_name, successCallback} : DeleteButtonProps ) {
    const { deletePlayerStat } = useApi();
    const { getPlayerStatForGame, refreshPlayerStats } = useAuth();
    const { showPopup } = useEditPopup();

    if (!stat_id && !game_id) {
        return <></>
    }

    if(game_id && !stat_id) {
        const stat: PlayerStat = getPlayerStatForGame(game_id);

        if(stat) {
            stat_id = stat.id;
        }
    }

    if(!stat_id) {
        return <></>
    }

    const onClickHandler = async () => {

        const deleteGame = async () => {
            const stat: PlayerStat = await deletePlayerStat(stat_id, game_name);
            await refreshPlayerStats();

            if(stat && successCallback) {
                successCallback();
                return true;
            }

            return false;
        }

        const popupSettings: EditPopupSettings = openDeleteStatPopup(game_name, deleteGame);

        showPopup(popupSettings);
    }

    return <div><button className="delete-stat-button" onClick={onClickHandler}>Delete Game</button></div>;
}

function openDeleteStatPopup(gameName: string, deleteGame: () => Promise<boolean>): EditPopupSettings {

    const labelBuilder = () => <label>{`Are you sure you want to delete ${gameName ? gameName : 'this title'} from your profile?`}</label>

    const clickCallback = () => {
        deleteGame();
        return true;
    }

    return {
        elementBuilder: labelBuilder,
        submitLabel: 'Delete',
        clickCallback
    }
}