"use client";

import { useState, useContext, createContext } from "react";

interface Theme {
    theme: any;
    setTheme: any;
}

const ThemeContext = createContext<Theme | null>(null);

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({children,}) => {
    const [theme, setTheme] = useState<any>(null);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext)!;
