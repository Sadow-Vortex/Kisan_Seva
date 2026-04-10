import { Stack } from "expo-router";
import './globals.css';
import { ThemeProvider } from './Themecontext';

export default function RootLayout() {
    return (
        <ThemeProvider>
            <Stack screenOptions={{ headerShown: false }} />
        </ThemeProvider>
    );
}