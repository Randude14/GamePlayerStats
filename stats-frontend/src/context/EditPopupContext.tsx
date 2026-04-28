// src/context/AuthContext.tsx
import { createContext, useContext, useState, type ReactElement } from "react";
import './edit_popup.css'

export const EditPopupContext = createContext(null);

export interface EditPopupSettings {
    submitLabel: string,
    elementBuilder: () => ReactElement
    clickCallback: () => boolean
}

const BuildPopup = (settings: EditPopupSettings, closeHandler: () => void) => {
    if(settings.elementBuilder && settings.clickCallback) {
        return <div className="edit-popup-background" onClick={closeHandler}> 
            <form className="edit-popup-window" onSubmit={(e) => {
                    e.preventDefault(); 
                    
                    if(settings.clickCallback()) {
                        closeHandler();
                    }
                }}>

                {settings.elementBuilder()}
                {<div className="edit-popup-actions">
                    <button type="submit">{settings.submitLabel}</button>
                    <button onClick={closeHandler}>Cancel</button>
                </div>}
            </form>
        </div>
    }
    return <></>
}

export const EditPopupProvider = ({ children }) => {

    const [popupSettings, setPopupSettings] = useState(null);

    const showPopup = (settings: EditPopupSettings) => {
        setPopupSettings(settings);
    }

    const hidePopup = () => {
        setPopupSettings(null);
    }

    return (
        <EditPopupContext.Provider value={{ showPopup, hidePopup }}>
            {children}
            {popupSettings && BuildPopup(popupSettings, hidePopup)}
        </EditPopupContext.Provider>
    );
};

export function useEditPopup() {
    const context = useContext(EditPopupContext);

    if (!context) {
        throw new Error("useToast must be used within ToastProvider");
    }

    return context;
}