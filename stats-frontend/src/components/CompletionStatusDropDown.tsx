import { useApi } from "../context/ApiContext";
import { useAuth } from "../context/useAuth"
import { completionStatuses, type PlayerStat } from "../util/Models"

interface CompletionProps {
    stat: PlayerStat
}

export function CompletionStatusDropDown( {stat} : CompletionProps) {

    const { user } = useAuth();
    const { updatePlayerStatCompletion } = useApi();
    const isCurrentUser: boolean = user?.id === stat.player_id;

    if(isCurrentUser) {
        return <div>Status: <select onChange={(e) => {
            updatePlayerStatCompletion(stat.id, e.target.value);
        }} defaultValue={stat.completion_status}>
            {
                completionStatuses.map(status => {
                    const statusNorm: string = normalize(status);

                    if(statusNorm) {
                        return <option key={status} value={status}>{statusNorm}</option>
                    }
                    return <></>;
                })
            }
        </select></div>;
    }
    
    const statusShown: string = capitlizeFirstLetter(stat.completion_status);
    return <div><label>{`Completion Status: ${statusShown}`}</label></div>;
}

function capitlizeFirstLetter(status: string): string {
    if(!status || status.length === 0) {
        return '';
    }
    return status.charAt(0).toUpperCase() + status.slice(1);
}

function normalize(status: string): string {
    if(!status || status.length === 0) {
        return null;
    }

    const words: string[] = status.split('_');
    let stringBuilder: string = '';

    words.forEach( (word, index) => {
        stringBuilder += capitlizeFirstLetter(word);
        if(index !== (words.length-1) ) {
            stringBuilder += ' ';
        }
    } )

    return stringBuilder;
}