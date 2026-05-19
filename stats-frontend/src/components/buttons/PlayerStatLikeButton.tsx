import { useState } from "react";
import { useApi } from "../../context/ApiContext";
import './LikeButton.css'
import { useAuth } from "../../context/useAuth";

interface LikeButtonProps {
    stat_id: number;
    player_id: number;
    liked: boolean;
}

const LIKED_IMAGE_PATH: string = "liked-star.png";
const UNLIKED_IMAGE_PATH: string = "unliked-star.png";

export function PlayerStatLikeButton( {stat_id, player_id, liked} : LikeButtonProps ) {
    const { likePlayerStat, unlikePlayerStat } = useApi();
    const [isLiked, setIsLiked] = useState(liked);
    const { user } = useAuth();
    const isCurrentUser: boolean = user.id === player_id;

    if(!isCurrentUser) {
        return <div></div>
    }

    const onClickHandler = () => {
        if(isLiked) {
            unlikePlayerStat(stat_id);
        }
        else {
            likePlayerStat(stat_id);
        }

        setIsLiked(!isLiked);
    }

    return <button className="like-button" onClick={onClickHandler}>
            <img className="like-image" src={isLiked ? LIKED_IMAGE_PATH : UNLIKED_IMAGE_PATH} />
        </button>
}