import { useEffect, useState } from "react"
import { fetchWithAuth, HttpMethod } from "../util/serverRequests";
import type { PlayerStat } from "../util/Models";

export function PlayerInfoScreen() {

    const [data, setData] = useState<PlayerStat[]>([])
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        console.log('Fetching data...');
        const fetchPlayerStats = async () => {

            const res = await fetchWithAuth('player_stats/me', HttpMethod.GET);

            if(res.ok) {
                const statRows: PlayerStat[] = await res.json();
                setError(false);
                setData(statRows);
            }
            else {
                setError(false);
            }
            setLoading(false);
        }

        fetchPlayerStats();
    }, []);

    if(error) {
        return <strong>An error occured while attempting to get your game info.</strong>
    }

    return <>
        
        {!isLoading &&
            data.map(ps => {
                return (
                <div key={ps.id}>
                    Game: {ps.title} | Hours: {ps.hours_played} | Purchased: {new Date(ps.date_purchased).toLocaleDateString()}
                </div>
                );
            })
        }
    </>
}