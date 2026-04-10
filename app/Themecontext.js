import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

// ─── DARK MODE (unchanged) ────────────────────────────────────────────────────
export const DARK = {
    mode: 'dark',
    bg: '#050e1a',
    bg2: '#0d1f3a',
    card: 'rgba(255,255,255,0.07)',
    cardBorder: 'rgba(255,255,255,0.12)',
    text: '#ffffff',
    textSub: 'rgba(255,255,255,0.55)',
    textMuted: 'rgba(255,255,255,0.35)',
    accent: '#2ec482',
    accentLight: '#7eeab4',
    accentBtn: '#0a1628',
    inputBg: 'rgba(255,255,255,0.07)',
    inputBorder: 'rgba(255,255,255,0.1)',
    inputFocusBg: 'rgba(46,196,130,0.05)',
    inputFocusBorder: 'rgba(46,196,130,0.6)',
    placeholder: 'rgba(255,255,255,0.3)',
    divider: 'rgba(255,255,255,0.08)',
    orb1: 'rgba(46,196,130,0.08)',
    orb2: 'rgba(56,130,246,0.07)',
    orb3: 'rgba(168,85,247,0.06)',
    modal: '#0d1f3a',
    modalBorder: 'rgba(255,255,255,0.1)',
    header: 'rgba(5,14,26,0.98)',
    statusBar: 'light-content',
    navBg: '#111827',
    navBorder: 'rgba(255,255,255,0.08)',
    iconInactive: '#6b7280',
    farmerCard: 'rgba(46,196,130,0.1)',
    farmerBorder: 'rgba(46,196,130,0.2)',
    priceBadge: '#2ec482',
    priceBadgeText: '#0a1628',
    newBadge: '#2ec482',
    popularBadge: 'rgba(255,215,0,0.9)',
    popularBadgeText: '#0a1628',
    activeBadge: 'rgba(46,196,130,0.2)',
    activeBadgeText: '#2ec482',
    success: '#2ec482',
    danger: '#ef4444',
    dangerBg: 'rgba(239,68,68,0.15)',
    weatherCard: 'rgba(255,255,255,0.06)',
    switchTrack: '#86efac',
    switchThumb: '#2ec482',
    cover: '#0d1f3a',
    coverAccent: 'rgba(46,196,130,0.15)',
    profileRing: 'rgba(46,196,130,0.4)',
    sectionBg: 'rgba(255,255,255,0.04)',
    menuIcon: 'rgba(46,196,130,0.15)',
    emptyIcon: 'rgba(255,255,255,0.1)',
};

// ─── LIGHT MODE — Rich Modern Gradient Theme ──────────────────────────────────
//
// Design language:
//   • Background: soft violet-tinted white (#f5f3ff → #faf9ff)
//   • Cards: pure white with vivid left-border accents
//   • Accent: vibrant emerald-to-teal #059669
//   • Secondary accents: violet #7c3aed, amber #d97706
//   • Headers: deep indigo gradient feel (#1e1b4b)
//   • Inputs: lavender-tinted bg with vivid focus ring
//   • Badges: saturated, bold colours
//   • Nav bar: deep indigo #1e1b4b (same as dark — premium pill feel)
//
export const LIGHT = {
    mode: 'light',

    // ── Backgrounds ──────────────────────────────────────────
    bg:  '#f5f3ff',          // soft violet page bg
    bg2: '#ede9fe',          // slightly deeper violet surface

    // ── Cards ────────────────────────────────────────────────
    card:       '#ffffff',
    cardBorder: '#e0d9f7',   // lavender border

    // ── Typography ───────────────────────────────────────────
    text:      '#1e1b4b',    // deep indigo — rich, not harsh black
    textSub:   '#6d28d9',    // violet mid-tone
    textMuted: '#a78bfa',    // soft violet muted

    // ── Primary Accent — Emerald ─────────────────────────────
    accent:      '#059669',  // vivid emerald
    accentLight: '#34d399',  // lighter emerald
    accentBtn:   '#ffffff',  // white text on accent buttons

    // ── Inputs ───────────────────────────────────────────────
    inputBg:         '#f0ebff',  // lavender tint
    inputBorder:     '#c4b5fd',  // violet border
    inputFocusBg:    '#ede9fe',
    inputFocusBorder:'#059669',  // emerald focus ring
    placeholder:     '#a78bfa',

    // ── Dividers & Structure ─────────────────────────────────
    divider: '#ede9fe',

    // ── Orbs / Glows ─────────────────────────────────────────
    orb1: 'rgba(5,150,105,0.10)',   // emerald glow
    orb2: 'rgba(124,58,237,0.08)',  // violet glow
    orb3: 'rgba(217,119,6,0.07)',   // amber glow

    // ── Modal ────────────────────────────────────────────────
    modal:       '#ffffff',
    modalBorder: '#e0d9f7',

    // ── Header ───────────────────────────────────────────────
    header:    '#ffffff',
    statusBar: 'dark-content',

    // ── Navigation bar ───────────────────────────────────────
    navBg:       '#1e1b4b',             // deep indigo pill
    navBorder:   'rgba(255,255,255,0.1)',
    iconInactive:'rgba(255,255,255,0.4)',

    // ── Farmer info card ─────────────────────────────────────
    farmerCard:   '#f0fdf9',  // mint tint
    farmerBorder: '#6ee7b7',

    // ── Badges ───────────────────────────────────────────────
    priceBadge:       '#059669',
    priceBadgeText:   '#ffffff',
    newBadge:         '#7c3aed',   // violet NEW badge
    popularBadge:     '#d97706',   // amber HOT badge
    popularBadgeText: '#ffffff',
    activeBadge:      '#d1fae5',
    activeBadgeText:  '#065f46',

    // ── Semantic ─────────────────────────────────────────────
    success:   '#059669',
    danger:    '#dc2626',
    dangerBg:  '#fef2f2',

    // ── Weather card (fallback, unused if images are shown) ──
    weatherCard: '#1e1b4b',

    // ── Switch ───────────────────────────────────────────────
    switchTrack: '#6ee7b7',
    switchThumb: '#059669',

    // ── Profile cover ────────────────────────────────────────
    cover:        '#ede9fe',
    coverAccent:  'rgba(124,58,237,0.14)',
    profileRing:  '#7c3aed',

    // ── Miscellaneous ────────────────────────────────────────
    sectionBg:  '#f0ebff',
    menuIcon:   '#f0fdf9',
    emptyIcon:  '#ede9fe',

    // ── Extra gradient helpers (used in screen-level overrides) ──
    gradientStart: '#7c3aed',   // violet
    gradientMid:   '#059669',   // emerald
    gradientEnd:   '#0891b2',   // cyan
    headerGrad1:   '#4f46e5',   // indigo
    headerGrad2:   '#7c3aed',   // violet
    cardAccent1:   '#059669',
    cardAccent2:   '#7c3aed',
    cardAccent3:   '#d97706',
};

// ─── Provider ─────────────────────────────────────────────────────────────────
export function ThemeProvider({ children }) {
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        AsyncStorage.getItem('appTheme').then(v => {
            if (v !== null) setIsDark(v === 'dark');
        });
    }, []);

    const toggleTheme = async () => {
        const next = !isDark;
        setIsDark(next);
        await AsyncStorage.setItem('appTheme', next ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ theme: isDark ? DARK : LIGHT, isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);