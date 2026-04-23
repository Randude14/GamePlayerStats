import { EditType, type EditPopupSettings } from "../context/EditPopupContext";
import { isValidDate } from "../util/Helpers";
import type { Game } from "../util/Models";
import './PlayerStatEdit.css'

interface PlayerStatEditSettings {
    game: Game;
    submitCallback: (gameId: number, datePurchased: string, hoursPlayed: number) => void;
    type: typeof EditType;
}

const DATE_PURCHASED_ID: string = "edit-date-purchased";
const HOURS_PLAYED_ID: string = "hours-played-purchased";

const BuildPlayerStatPopup = (game: Game) => {

    return <div className="player-stat-edit">
        <label>{`Title: ${game.title}`}</label>
        <label>{`Developer: ${game.developer}`}</label>
        <label>{`Publisher: ${game.publisher}`}</label>
        <label>{`Release Date: ${new Date(game.release).toLocaleDateString()}`}</label>
        <label>Date Purchased: </label> <input type="date" id={DATE_PURCHASED_ID}/>
        <label>Hours Played: </label> <input type="number" step="0.1" id={HOURS_PLAYED_ID} />
    </div>
}

export function PlayerStatEdit(settings : PlayerStatEditSettings): EditPopupSettings {

    const elementBuilder = () => {
        return BuildPlayerStatPopup(settings.game);
    }

    const clickCallback = () => {
        const datePurchasedInput: HTMLInputElement = document.getElementById(DATE_PURCHASED_ID) as HTMLInputElement;
        const hoursPlayedInput: HTMLInputElement = document.getElementById(HOURS_PLAYED_ID) as HTMLInputElement;

        if(datePurchasedInput && hoursPlayedInput) {
            const datePurchased = datePurchasedInput.value;
            const hoursPlayed = hoursPlayedInput.value;

            if(! datePurchased || !isValidDate(datePurchased)) {
                return false;
            }
            if(! hoursPlayed || isNaN(Number(hoursPlayed))) {
                return false;
            }

            settings.submitCallback(settings.game.id, datePurchasedInput.value, Number(hoursPlayedInput.value)); 
        }

        return true;
    }

    const popupSettings: EditPopupSettings = {
        type: settings.type,
        elementBuilder,
        clickCallback
    }

    return popupSettings;
}