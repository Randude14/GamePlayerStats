import { type EditPopupSettings } from "../context/EditPopupContext";
import { getFirstObject, isValidDate } from "../util/Helpers";
import type { Game, PlayerStat } from "../util/Models";
import './player-stat-edit.css'

interface PlayerStatEditSettings {
    stat?: PlayerStat,
    game: Game,
    submitCallback: (statId: number, gameId: number, datePurchased: string, hoursPlayed: number) => void;
    userId: number;
}

const DATE_PURCHASED_ID: string = "edit-date-purchased";
const HOURS_PLAYED_ID: string = "hours-played-purchased";

const BuildPlayerStatPopup = (game: Game, datePurchased: string, hoursPlayed: number) => {

    return <div className="player-stat-edit">
        <label>{`Title: ${game.title}`}</label>
        <label>{`Developer: ${getFirstObject(game.developers)}`}</label>
        <label>{`Publisher: ${getFirstObject(game.publishers)}`}</label>
        <label>{`Release Date: ${new Date(game.release).toLocaleDateString()}`}</label>
        <label>Date Purchased: </label> <input type="date" id={DATE_PURCHASED_ID} defaultValue={datePurchased || ''}/>
        <label>Hours Played: </label> <input type="number" step="0.1" id={HOURS_PLAYED_ID} defaultValue={hoursPlayed || 0} />
    </div>
}

export async function PlayerStatPopupGenerator(settings : PlayerStatEditSettings): Promise<EditPopupSettings> {

    let datePurchased: string = settings.stat?.date_purchased?.replaceAll('/', '-') ?? '1999-10-28';
    const hoursPlayed: number = settings.stat?.hours_played ?? 0;

    const Tindex = datePurchased.indexOf('T');
    if(Tindex >= 0) {
        datePurchased = datePurchased.substring(0, Tindex);
    }

    const elementBuilder = () => {
        return BuildPlayerStatPopup(settings.game, datePurchased, hoursPlayed);
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

            settings.submitCallback(settings.stat?.id, settings.game.id, datePurchasedInput.value, Number(hoursPlayedInput.value)); 
        }

        return true;
    }

    const popupSettings: EditPopupSettings = {
        submitLabel: settings.stat ? 'Update' : 'Add',
        elementBuilder,
        clickCallback
    }

    return popupSettings;
}