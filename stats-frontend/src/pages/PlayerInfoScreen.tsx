import { type ReactElement } from "react"
import { InfoTable } from "../components/InfoCardPage";

type PlayerStatRow = {
    title: string,
    hours_played: number,
    date_purchased: Date,
    release: Date
}

const infoCardBuilder = (data: PlayerStatRow): ReactElement => {

    return <div>
        <div><label>{data.title}</label></div>
        <div><label>{data.hours_played}</label></div>
        <div><label>{ new Date(data.date_purchased).toLocaleDateString() }</label></div>
        <div><label>{ new Date(data.release).toLocaleDateString() }</label></div>
    </div>
}

export function PlayerInfoScreen() {

    return <InfoTable<PlayerStatRow> auth={true} endpoint="player_stats/me" infoCardBuilder={infoCardBuilder} />
}