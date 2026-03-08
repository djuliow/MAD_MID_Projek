import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export interface ColorScheme{
    bg: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
    primary: string;
    success: string;
    warning: string;
    danger: string;
    shadow: string;
    gradients:{
        background: [string, string];
        surface: [string, string];
        primary: [string, string];
        success: [string, string];
        warning: [string, string];
        danger: [string, string];
        muted: [string, string];
        empty: [string, string];
    };
    backgrounds:{
        input: string;
        editInput: string;
    };
    statusBarStyle: "light-content" | "dark-content";
}

const lightColors: ColorScheme = {
    bg: "#fcfaff",
    surface: "#ffffff",
    text: "#1e1b4b",
    textMuted: "#6b7280",
    border: "#f3e8ff",
    primary: "#461691",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    shadow: "#000000",
    gradients: {
        background: ["#fcfaff", "#f3e8ff"],
        surface: ["#ffffff", "#fcfaff"],
        primary: ["#461691", "#5b21b6"],
        success: ["#10b981", "#059669"],
        warning: ["#f59e0b", "#d97706"],
        danger: ["#ef4444", "#dc2626"],
        muted: ["#9ca3af", "#6b7280"],
        empty: ["#f3f4f6", "#e5e7eb"],
    },
    backgrounds: {
      input: "#f3f4f6",
      editInput: "#ffffff",
    },
    statusBarStyle: "dark-content" as const,
};

const darkColors: ColorScheme = {
    bg: "#0f172a",
    surface: "#1e293b",
    text: "#f1f5f9",
    textMuted: "#94a3b8",
    border: "#334155",
    primary: "#a78bfa",
    success: "#34d399",
    warning: "#fbbf24",
    danger: "#f87171",
    shadow: "#000000",
    gradients: {
      background: ["#0f172a", "#1e293b"],
      surface: ["#1e293b", "#334155"],
      primary: ["#461691", "#5b21b6"],
      success: ["#10b981", "#059669"],
      warning: ["#f59e0b", "#d97706"],
      danger: ["#ef4444", "#dc2626"],
      muted: ["#374151", "#4b5563"],
      empty: ["#374151", "#4b5563"],
    },
    backgrounds: {
      input: "#1e293b",
      editInput: "#0f172a",
    },
    statusBarStyle: "light-content" as const,
};

interface ThemeContextType{
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    colors:ColorScheme
}

const ThemeContext = createContext<undefined | ThemeContextType>(undefined)

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);
  
    useEffect(() => {
      // get the user's choice safely
      const loadTheme = async () => {
        try {
          const value = await AsyncStorage.getItem("darkMode");
          if (value !== null) {
            setIsDarkMode(JSON.parse(value));
          }
        } catch (error) {
          console.warn("AsyncStorage is not available, using default theme.");
        }
      };
      loadTheme();
    }, []);
  
    const toggleDarkMode = async () => {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      try {
        await AsyncStorage.setItem("darkMode", JSON.stringify(newMode));
      } catch (error) {
        console.warn("Could not save theme preference.");
      }
    };
  
    const colors = isDarkMode ? darkColors : lightColors;
  
    return (
      <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, colors }}>
        {children}
      </ThemeContext.Provider>
    );
};

const useTheme = () => {
    const context = useContext(ThemeContext)
    if (context == undefined){
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}

export default useTheme