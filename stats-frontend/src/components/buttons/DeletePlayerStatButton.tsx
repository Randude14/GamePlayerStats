import { useApi } from "../../context/ApiContext"
import { useAuth } from "../../context/useAuth";
import type { PlayerStat } from "../../util/Models";
import "./DeletePlayerStatButton.css"

interface DeleteButtonProps {
    stat_id?: number;
    game_id?: number;
    successCallback?: () => void
}

export function DeletePlayerStatButton( {stat_id, game_id, successCallback} : DeleteButtonProps ) {
    const { deletePlayerStat } = useApi();
    const { getPlayerStatForGame, refreshPlayerStats } = useAuth();

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
        const stat: PlayerStat = await deletePlayerStat(stat_id);
        await refreshPlayerStats();

        if(stat && successCallback) {
            successCallback();
        }
    }

    return <div><button className="delete-stat-button" onClick={onClickHandler}>Delete Stat</button></div>;
}