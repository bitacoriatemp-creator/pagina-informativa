"use client";

import React, { useState, useContext } from "react";

const DashboardContext = React.createContext({
    isSidebarOpen: false,
    setIsSidebarOpen: (val: boolean) => { },
});

export const useDashboard = () => useContext(DashboardContext);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <DashboardContext.Provider value={{ isSidebarOpen, setIsSidebarOpen }}>
            {children}
        </DashboardContext.Provider>
    );
}
