"use client";

import React, { useState, useContext, useCallback, useEffect, useMemo } from "react";

export type NotificationType = "info" | "success" | "warning";

export interface DashboardNotification {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    date: Date;
    read: boolean;
}

interface DashboardContextType {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (val: boolean) => void;
    notifications: DashboardNotification[];
    addNotification: (title: string, message: string, type?: NotificationType) => void;
    markAllAsRead: () => void;
    
    // Global User State
    userProfile: {
        name: string;
        customAvatarUrl: string | null;
        customCoverUrl: string | null;
        avatarGrad: string;
    };
    setUserProfile: React.Dispatch<React.SetStateAction<{
        name: string;
        customAvatarUrl: string | null;
        customCoverUrl: string | null;
        avatarGrad: string;
    }>>;
}

const DashboardContext = React.createContext<DashboardContextType>({
    isSidebarOpen: false,
    setIsSidebarOpen: (val) => {},
    notifications: [],
    addNotification: () => {},
    markAllAsRead: () => {},
    userProfile: { name: "Eduardo Mora", customAvatarUrl: "/images/profile/avatar_eduardo\.webp", customCoverUrl: "/images/profile/cover_eduardo\.webp", avatarGrad: "from-[#C39767] to-amber-600" },
    setUserProfile: () => {},
});

export const useDashboard = () => useContext(DashboardContext);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [notifications, setNotifications] = useState<DashboardNotification[]>([
        {
            id: "initial",
            title: "Bienvenido a BitacorIA",
            message: "El sistema de notificaciones ha sido inicializado correctamente.",
            type: "success",
            date: new Date(),
            read: false
        }
    ]);

    const [userProfile, setUserProfile] = useState<{
        name: string;
        customAvatarUrl: string | null;
        customCoverUrl: string | null;
        avatarGrad: string;
    }>({
        name: "Eduardo Mora",
        customAvatarUrl: "/images/profile/avatar_eduardo\.webp",
        customCoverUrl: "/images/profile/cover_eduardo\.webp",
        avatarGrad: "from-[#C39767] to-amber-600",
    });

    useEffect(() => {
        const stored = localStorage.getItem("bitacoria_user_profile_v2");
        if (stored) {
            try {
                setUserProfile(JSON.parse(stored));
            } catch {
                // invalid stored value — ignore
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("bitacoria_user_profile_v2", JSON.stringify(userProfile));
    }, [userProfile]);

    const addNotification = useCallback((title: string, message: string, type: NotificationType = "info") => {
        const newNotif: DashboardNotification = {
            id: Date.now().toString() + Math.random().toString(),
            title,
            message,
            type,
            date: new Date(),
            read: false,
        };
        setNotifications(prev => [newNotif, ...prev]);
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }, []);

    useEffect(() => {
        const timer1 = setTimeout(() => {
            addNotification("Firma Pendiente", "El contratista ha subido la estimación #4. Requiere tu firma electrónica.", "warning");
        }, 8000);

        const timer2 = setTimeout(() => {
            addNotification("Recordatorio de Cierre", "La base de colado en la Torre 2 debe completarse en 24 horas.", "info");
        }, 15000);

        const timer3 = setTimeout(() => {
            addNotification("Reporte Semanal Generado", "El resumen de avance de la semana ya está disponible para revisión y descarga.", "success");
        }, 22000);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, [addNotification]);

    const contextValue = useMemo(() => ({
        isSidebarOpen,
        setIsSidebarOpen,
        notifications,
        addNotification,
        markAllAsRead,
        userProfile,
        setUserProfile,
    }), [isSidebarOpen, notifications, addNotification, markAllAsRead, userProfile]);

    return (
        <DashboardContext.Provider value={contextValue}>
            {children}
        </DashboardContext.Provider>
    );
}
