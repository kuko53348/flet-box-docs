// database/themes.js
export let colors = {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#3b82f6',
    background: '#ffffff',
    surface: '#f8fafc',
    text: '#0f172a',
    textSecondary: '#64748b',
    textDisabled: '#94a3b8',
    border: '#e2e8f0',
    white: '#ffffff',
    black: '#000000',
    overlay: 'rgba(0, 0, 0, 0.5)',
    shadow: 'rgba(0, 0, 0, 0.1)'
};

export const darkColors = {
    primary: '#818cf8',
    secondary: '#a78bfa',
    success: '#34d399',
    warning: '#fbbf24',
    danger: '#f87171',
    info: '#60a5fa',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    textDisabled: '#64748b',
    border: '#334155',
    white: '#ffffff',
    black: '#000000',
    overlay: 'rgba(0, 0, 0, 0.6)',
    shadow: 'rgba(0, 0, 0, 0.3)'
};

let currentTheme = 'light';
const listeners = [];

export const setTheme = (themeName) => {
    const theme = themeName === 'dark' ? darkColors : colors;
    currentTheme = themeName;
    Object.keys(theme).forEach(key => { 
        if (colors.hasOwnProperty(key)) {
            colors[key] = theme[key];
        }
    });
    const root = document.documentElement;
    Object.keys(colors).forEach(key => {
        root.style.setProperty(`--color-${key}`, colors[key]);
    });
    listeners.forEach(cb => cb(colors, themeName));
};

export const getTheme = () => currentTheme;
export const toggleTheme = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    return newTheme;
};
export const subscribeTheme = (callback) => {
    listeners.push(callback);
    return () => { const i = listeners.indexOf(callback); if(i > -1) listeners.splice(i, 1); };
};

const initTheme = () => {
    const root = document.documentElement;
    Object.keys(colors).forEach(key => root.style.setProperty(`--color-${key}`, colors[key]));
};
initTheme();
