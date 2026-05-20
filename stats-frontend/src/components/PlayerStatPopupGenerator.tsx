import { type EditPopupSettings } from "../context/EditPopupContext";
import { getFirstObject, isValidDate } from "../util/Helpers";
import type { Game, PlayerStat } from "../util/Models";
import './player-stat-edit.css'

interface PlayerStatEditSettings {
    stat?: PlayerStat,
    game: Game,
    submitCallback: (statId: number, gameId: number, update: PlayerStatFields) => void;
    userId: number;
}

export interface PlayerStatFields {
    date_purchased: string;
    hours_played: number;
    rating: number;
}

const DATE_PURCHASED_ID: string = "edit-date-purchased";
const HOURS_PLAYED_ID: string = "hours-played-purchased";
const RATING_ID: string = "rating-title";

const MIN_HOURS_PLAYED: number = 0;
const MAX_HOURS_PLAYED: number = 100000;

const BuildPlayerStatPopup = (game: Game, datePurchased: string, hoursPlayed: number, rating: number) => {

    return <div className="player-stat-edit">
        <label>{`Title: ${game.title}`}</label>
        <label>{`Developer: ${getFirstObject(game.developers)}`}</label>
        <label>{`Publisher: ${getFirstObject(game.publishers)}`}</label>
        <label>{`Release Date: ${new Date(game.release).toLocaleDateString()}`}</label>
        <label>Date Purchased: </label> <input type="date" id={DATE_PURCHASED_ID} defaultValue={datePurchased ?? ''}/>
        <label>Hours Played: </label> <input type="number" min={MIN_HOURS_PLAYED} max={MAX_HOURS_PLAYED} step="0.1" id={HOURS_PLAYED_ID} defaultValue={hoursPlayed ?? 0} />
        <label>Rating: </label> <input type="number" step="0.1" max={10} min={1} id={RATING_ID} defaultValue={rating ?? 1} />
    </div>
}

export async function PlayerStatPopupGenerator(settings : PlayerStatEditSettings): Promise<EditPopupSettings> {

    let datePurchased: string = settings.stat?.date_purchased?.replaceAll('/', '-') ?? settings.game?.release;
    const hoursPlayed: number = settings.stat?.hours_played ?? 0;
    const rating: number = settings.stat?.rating ?? 1;

    if(!datePurchased) {
        datePurchased = new Date().toISOString();
    }
    const Tindex = datePurchased.indexOf('T');
    if(Tindex >= 0) {
        datePurchased = datePurchased.substring(0, Tindex);
    }

    const elementBuilder = () => {
        return BuildPlayerStatPopup(settings.game, datePurchased, hoursPlayed, rating);
    }

    const clickCallback = () => {
        const datePurchasedInput: HTMLInputElement = document.getElementById(DATE_PURCHASED_ID) as HTMLInputElement;
        const hoursPlayedInput: HTMLInputElement = document.getElementById(HOURS_PLAYED_ID) as HTMLInputElement;
        const ratingInput: HTMLInputElement = document.getElementById(RATING_ID) as HTMLInputElement;

        if(datePurchasedInput && hoursPlayedInput && ratingInput) {
            const datePurchased = datePurchasedInput.value;
            const hoursPlayed = hoursPlayedInput.value;
            const rating = ratingInput.value;

            if(! datePurchased || !isValidDate(datePurchased)) {
                return false;
            }
            if(! hoursPlayed || isNaN(Number(hoursPlayed))) {
                return false;
            }
            if(! rating || isNaN(Number(rating))) {
                return false;
            }

            // Ensure rating is between 1 and 10
            const ratingNum: number = Math.max( 1, Math.min(10, Number(rating) ) );
            const hoursPlayedNum: number = Math.max( MIN_HOURS_PLAYED, Math.min(MAX_HOURS_PLAYED, Number(hoursPlayed) ) );

            settings.submitCallback(settings.stat?.id, settings.game.id, {
                date_purchased: datePurchasedInput.value, 
                hours_played: hoursPlayedNum, 
                rating: ratingNum
            }); 
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