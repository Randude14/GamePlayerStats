
interface NavbarSettings {
    navButtons: string[],
    setPageId: (index: number) => void
}

export default function Navbar({navButtons, setPageId}: NavbarSettings) {

    const clickHandler = (index: number) => {
        setPageId(index);
    }

    return <>
        <div className="navbar">
            {
                navButtons.map((nb: string, index: number) => <button onClick={() => clickHandler(index)}>{nb}</button>)
            } 
        </div> 
    </>
}