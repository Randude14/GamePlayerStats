import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
    } from "react";
import "./toast.css";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastData {
    message: string;
    type: ToastType;
    duration: number;
};

interface ToastContextType {
    showToast: (message: string, type?: ToastType, duration?: number) => void;
    toast: {
        success: (msg: string, duration?: number) => void;
        error: (msg: string, duration?: number) => void;
        info: (msg: string, duration?: number) => void;
        warning: (msg: string, duration?: number) => void;
    };
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const FADE_OUT_MS = 300;


export function ToastProvider({ children }: { children: ReactNode }) {
    const [toast, setToast] = useState<ToastData | null>(null);
    const [visible, setVisible] = useState(false);

    const hideTimer = useRef<number | null>(null);
    const removeTimer = useRef<number | null>(null);

    const clearTimers = () => {
        if (hideTimer.current) window.clearTimeout(hideTimer.current);
        if (removeTimer.current) window.clearTimeout(removeTimer.current);
    };

    const hideToast = useCallback(() => {
        setVisible(false);

        removeTimer.current = window.setTimeout(() => {
            setToast(null);
        }, FADE_OUT_MS);
    }, []);

    const showToast = useCallback(
        (message: string, type: ToastType = "info", duration: number = 5000) => {
            clearTimers();

            setToast({ message, type, duration });
            setVisible(true);

            hideTimer.current = window.setTimeout(() => {
                hideToast();
            }, duration);
        },
        [hideToast]
    );

    useEffect(() => {
        return () => clearTimers();
    }, []);

    const toastHelpers = useMemo(
        () => ({
        success: (msg: string, duration?: number) =>
            showToast(msg, "success", duration),
        error: (msg: string, duration?: number) =>
            showToast(msg, "error", duration),
        info: (msg: string, duration?: number) =>
            showToast(msg, "info", duration),
        warning: (msg: string, duration?: number) =>
            showToast(msg, "warning", duration),
        }),
        [showToast]
    );

    const value = useMemo(
        () => ({
            showToast,
            toast: toastHelpers,
        }),
        [showToast, toastHelpers]
    );

    return (
        <ToastContext.Provider value={value}>
            {children}

            {toast && (
                <div className={`toast ${toast.type} ${visible ? "show" : "hide"}`}>
                    <span className="toast-message">{toast.message}</span>
                </div>
            )}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);

    if (!context) {
        throw new Error("useToast must be used within ToastProvider");
    }

    return context;
}