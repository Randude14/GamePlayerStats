import  './label-tag.css'

interface LabelTagProps {
    className: string,
    text: string;
    highlightedText: string;
}

export function HighlighLabelTag({className, text, highlightedText} : LabelTagProps ) {
    if(!text) {
        return <></>
    }

    if(highlightedText && highlightedText.length > 0) {
        const index: number = text.toLowerCase().indexOf(highlightedText.toLowerCase());

        if(index >= 0) {
            const uh1: string = text.substring(0, index);
            const highlighted: string = text.substring(index, index + highlightedText.length);
            const uh2: string  = text.substring(index + highlightedText.length, text.length);

            return <label className={className}> {uh1}<span className="hightlighted-text">{highlighted}</span>{uh2} </label>
        }
    }
    return <label className={className}>{text}</label>
}