import type { ReactElement } from "react";
import { InfoTable } from "../components/InfoCardPage";

type PlayerStatRow = {
    username: string,
    title: string,
    hours_played: number,
    date_purchased: Date,
    release: Date
}

const infoCardBuilder = (data: PlayerStatRow): ReactElement => {


    return <div>
        <div><label>{data.username}</label></div>
        <div><label>{data.title}</label></div>
        <div><label>{data.hours_played}</label></div>
        <div><label>{ new Date(data.release).toLocaleDateString() }</label></div>
        <div><label>{ new Date(data.release).toLocaleDateString() }</label></div>
    </div>
}

export function PlayerStatsAllPage() {

    return <InfoTable<PlayerStatRow> auth={false} endpoint="player_stats/all" infoCardBuilder={infoCardBuilder}/>
}