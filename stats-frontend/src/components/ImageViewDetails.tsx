import { useEditPopup, type EditPopupSettings } from "../context/EditPopupContext";
import { useAuth } from "../context/useAuth";
import { blankImage } from "../util/Helpers";
import type { Game } from "../util/Models";
import { GameDetailsPopupGenerator } from "./GameDetailsPopupGenerator";

interface ImageViewProps {
    game: Game
}

export function ImageViewProps({ game }: ImageViewProps) {

    const { showPopup } = useEditPopup();
    const { user } = useAuth();

    const onImgClickHandler = () => {
        const popupSettings: EditPopupSettings = GameDetailsPopupGenerator({game, userId: user?.id});

        if(popupSettings) {
            showPopup(popupSettings);
        }
    }

    return <img className="info-card-image" onClick={onImgClickHandler} src={game.cover_url || blankImage()}></img>
}