import { useApi } from "../../context/ApiContext"

interface ImportButtonProps {
    game_external_id: number,
    isImported: boolean,
    canImport: boolean,
    onImport?: () => void
}

export function ImportButton( { game_external_id, isImported, canImport, onImport } : ImportButtonProps ) {
    const { importExternalGame } = useApi();

    const onClickHandler = async () => {
        const imported: boolean = await importExternalGame(game_external_id);

        if(imported && onImport) {
            onImport();
        }
    }

    if(isImported) {
        return <></>
    }

    if(canImport) {
        return <button onClick={onClickHandler}>Import Game</button> 
    }

    return <button disabled={true}>Cannot Import</button>
}