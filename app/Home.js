import React, { useEffect, useState, useLayoutEffect, useRef } from "react";
import {
    View, Image, ImageBackground, FlatList, StyleSheet, Dimensions,
    ActivityIndicator, Text, TouchableOpacity,
    TextInput, Animated, StatusBar,
} from "react-native";
import { useNavigation, router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import Footer from "./Footer";
import { useTheme } from "./Themecontext";

const { width } = Dimensions.get("window");

function extractArray(json) {
    if (!json) return [];
    if (Array.isArray(json)) return json;
    if (Array.isArray(json.data)) return json.data;
    if (json.data && typeof json.data === "object") return [json.data];
    if (Array.isArray(json.categories)) return json.categories;
    return [];
}

// ─── Weather helpers ──────────────────────────────────────────────────────────

const WEATHER_BACKGROUNDS = {
    rain:    require("../assets/weather/rainy.png"),
    drizzle: require("../assets/weather/rainy.png"),
    snow:    require("../assets/weather/snow.png"),
    cloud:   require("../assets/weather/cloud.png"),
    clear:   require("../assets/weather/clear.png"),
    sunny:   require("../assets/weather/sunny.png"),
};

const WEATHER_OVERLAYS = {
    rain:    "rgba(20,40,80,0.45)",
    drizzle: "rgba(20,40,80,0.45)",
    snow:    "rgba(60,80,120,0.35)",
    cloud:   "rgba(40,55,80,0.38)",
    clear:   "rgba(0,80,160,0.18)",
    sunny:   "rgba(180,80,0,0.22)",
    night:   "rgba(5,10,30,0.55)",
};

const WEATHER_EMOJIS = {
    rain:    "🌧️",
    drizzle: "🌦️",
    snow:    "❄️",
    cloud:   "☁️",
    clear:   "🌤️",
    sunny:   "☀️",
    night:   "🌙",
};

function getWeatherKey(weather) {
    if (!weather?.weather?.[0]) return "clear";
    const m = weather.weather[0].main.toLowerCase();
    if (m.includes("rain"))    return "rain";
    if (m.includes("drizzle")) return "drizzle";
    if (m.includes("snow"))    return "snow";
    if (m.includes("cloud"))   return "cloud";
    if (m.includes("clear"))   return "clear";
    return "sunny";
}

function isNightTime(weather) {
    if (!weather?.sys) return false;
    const now = Date.now() / 1000;
    return now < weather.sys.sunrise || now > weather.sys.sunset;
}

function formatTime() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const STAR_POSITIONS = Array.from({ length: 22 }, (_, i) => ({
    top:     5 + ((i * 37) % 65),
    left:    (i * 53) % 95,
    opacity: 0.3 + (i % 4) * 0.18,
    size:    i % 3 === 0 ? 3 : 2,
}));

// ─── WeatherCard component ────────────────────────────────────────────────────

function WeatherCard({ weather }) {
    const key     = getWeatherKey(weather);
    const night   = isNightTime(weather);
    const mode    = night ? "night" : key;
    const overlay = WEATHER_OVERLAYS[mode];
    const emoji   = WEATHER_EMOJIS[mode];
    const bgImg   = WEATHER_BACKGROUNDS[key];

    const stats = [
        { label: "Humidity",   value: `${weather.main.humidity}%` },
        { label: "Wind",       value: `${weather.wind.speed} m/s` },
        { label: "Feels like", value: `${Math.round(weather.main.feels_like)}°C` },
        { label: "Min/Max",    value: `${Math.round(weather.main.temp_min)}°/${Math.round(weather.main.temp_max)}°` },
    ];

    const Inner = () => (
        <>
            <View style={[styles.wOverlay, { backgroundColor: overlay }]} />
            {night && (
                <>
                    {STAR_POSITIONS.map((s, i) => (
                        <View key={i} style={[styles.wStar, {
                            top:     `${s.top}%`,
                            left:    `${s.left}%`,
                            opacity: s.opacity,
                            width:   s.size,
                            height:  s.size,
                        }]} />
                    ))}
                    <View style={styles.wMoon} />
                    <View style={styles.wMoonCover} />
                </>
            )}
            <View style={styles.wContent}>
                <View style={styles.wTopRow}>
                    <View>
                        <Text style={styles.wCity}>{weather.name}</Text>
                        <Text style={styles.wDate}>
                            {new Date().toLocaleDateString([], { weekday: "long", day: "numeric", month: "short" })}
                        </Text>
                    </View>
                    <View style={styles.wTimeBadge}>
                        <Text style={styles.wTimeBadgeText}>{formatTime()}</Text>
                    </View>
                </View>
                <View style={styles.wMidRow}>
                    <Text style={styles.wTemp}>
                        {Math.round(weather.main.temp)}<Text style={styles.wTempUnit}>°</Text>
                    </Text>
                    <View style={styles.wCondCol}>
                        <Text style={styles.wEmoji}>{emoji}</Text>
                        <Text style={styles.wCondText} numberOfLines={2}>
                            {weather.weather[0].description}
                        </Text>
                    </View>
                </View>
                <View style={styles.wStatsRow}>
                    {stats.map((s, i) => (
                        <View key={i} style={[styles.wStat, i > 0 && styles.wStatBorder]}>
                            <Text style={styles.wStatVal}>{s.value}</Text>
                            <Text style={styles.wStatLbl}>{s.label}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </>
    );

    if (night) {
        return (
            <View style={[styles.weatherCard, { backgroundColor: "#0a1020" }]}>
                <Inner />
            </View>
        );
    }

    return (
        <ImageBackground
            source={bgImg}
            style={styles.weatherCard}
            imageStyle={{ borderRadius: 24 }}
            resizeMode="cover"
        >
            <Inner />
        </ImageBackground>
    );
}

// ─── HomeScreen ───────────────────────────────────────────────────────────────

export default function HomeScreen() {
    const navigation = useNavigation();
    const { theme: T, isDark } = useTheme();

    const [categories,     setCategories]    = useState([]);
    const [loading,        setLoading]       = useState(true);
    const [searchText,     setSearchText]    = useState("");
    const [suggestions,    setSuggestions]   = useState([]);
    const [showSuggestion, setShowSuggestion]= useState(false);
    const [searching,      setSearching]     = useState(false);
    const [weather,        setWeather]       = useState(null);
    const [weatherLoading, setWeatherLoading]= useState(true);

    const suggestionAnim = useRef(new Animated.Value(0)).current;
    const orb1Y = useRef(new Animated.Value(0)).current;
    const orb2X = useRef(new Animated.Value(0)).current;
    const orb3Y = useRef(new Animated.Value(0)).current;

    const url = "https://kisan-seva-subcategory.onrender.com";

    useLayoutEffect(() => { navigation.setOptions({ headerShown: false }); }, [navigation]);

    useEffect(() => {
        fetchCategories();
        fetchWeather();
        const floatOrb = (anim, dur, range) =>
            Animated.loop(Animated.sequence([
                Animated.timing(anim, { toValue: range,  duration: dur, useNativeDriver: true }),
                Animated.timing(anim, { toValue: -range, duration: dur, useNativeDriver: true }),
            ])).start();
        floatOrb(orb1Y, 3200, 18);
        floatOrb(orb2X, 2700, 14);
        floatOrb(orb3Y, 3600, 22);
    }, []);

    useEffect(() => {
        Animated.timing(suggestionAnim, {
            toValue: showSuggestion ? 1 : 0, duration: 200, useNativeDriver: true,
        }).start();
    }, [showSuggestion]);

    const fetchCategories = async () => {
        try {
            const res  = await fetch(`${url}/category`);
            const json = await res.json();
            setCategories(extractArray(json));
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const fetchWeather = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") { setWeatherLoading(false); return; }
            const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            const res = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${loc.coords.latitude}&lon=${loc.coords.longitude}&appid=32bea71aad47a04557f738d027a4c1de&units=metric`
            );
            setWeather(await res.json());
        } catch (e) { console.log("Weather error:", e); }
        finally { setWeatherLoading(false); }
    };

    const handleSearchInput = async (text) => {
        setSearchText(text);
        if (!text || text.trim().length < 1) { setSuggestions([]); setShowSuggestion(false); return; }
        setSearching(true);
        try {
            const encoded = encodeURIComponent(text.trim());
            const [catRes, subRes] = await Promise.allSettled([
                fetch(`${url}/category/by-name/${encoded}`).then(r => r.json()),
                fetch(`${url}/subcategory/by-name/${encoded}`).then(r => r.json()),
            ]);
            const catList = catRes.status === "fulfilled" ? extractArray(catRes.value) : [];
            const subList = subRes.status === "fulfilled" ? extractArray(subRes.value) : [];
            const merged = [
                ...catList.map(c => ({ type: "category",    id: c.categoryId ?? c.id,    name: c.categoryName  ?? c.name ?? "" })),
                ...subList.map(s => ({ type: "subcategory", id: s.subCategoryId ?? s.id, name: s.subCategoryName ?? s.name ?? "" })),
            ].filter(item => item.name);
            setSuggestions(merged);
            setShowSuggestion(merged.length > 0);
        } catch (e) { console.log(e); }
        finally { setSearching(false); }
    };

    const handleSuggestionPress = (item) => {
        setShowSuggestion(false); setSearchText("");
        if (item.type === "category")
            router.push({ pathname: "/SubCategory",      params: { categoryId: item.id } });
        else
            router.push({ pathname: "/AdsBySubCategory", params: { subCategoryId: item.id } });
    };

    if (loading) return (
        <View style={[styles.loadingScreen, { backgroundColor: T.bg }]}>
            <ActivityIndicator size="large" color={T.accent} />
            <Text style={[styles.loadingText, { color: T.textSub }]}>Loading Kisan Seva…</Text>
        </View>
    );

    return (
        <View style={[styles.root, { backgroundColor: T.bg }]}>
            <StatusBar barStyle={T.statusBar} />

            {/* ── Dark mode background layers ── */}
            {isDark && (
                <>
                    <View style={styles.bgLayer2} />
                    <Animated.View style={[styles.orb1, { backgroundColor: T.orb1, transform: [{ translateY: orb1Y }] }]} />
                    <Animated.View style={[styles.orb2, { backgroundColor: T.orb2, transform: [{ translateX: orb2X }] }]} />
                </>
            )}

            {/* ── Light mode vivid gradient orbs ── */}
            {!isDark && (
                <>
                    {/* Violet blob — top right */}
                    <Animated.View style={[styles.lightOrb1, { transform: [{ translateY: orb1Y }] }]} />
                    {/* Emerald blob — mid left */}
                    <Animated.View style={[styles.lightOrb2, { transform: [{ translateX: orb2X }] }]} />
                    {/* Amber blob — bottom right */}
                    <Animated.View style={[styles.lightOrb3, { transform: [{ translateY: orb3Y }] }]} />
                    {/* Indigo header wash */}
                    <View style={styles.lightHeaderWash} />
                </>
            )}

            <FlatList
                data={categories}
                keyExtractor={(item) => item.categoryId?.toString() ?? Math.random().toString()}
                numColumns={3}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                ListHeaderComponent={
                    <>
                        {/* ── Weather card ── */}
                        <View style={styles.weatherSection}>
                            {weatherLoading ? (
                                <View style={[styles.weatherCard, styles.weatherCardLoading, { backgroundColor: T.card }]}>
                                    <ActivityIndicator color={T.accent} />
                                </View>
                            ) : weather ? (
                                <WeatherCard weather={weather} />
                            ) : null}
                        </View>

                        {/* ── Search bar ── */}
                        <View style={[styles.searchSection, { zIndex: 100 }]}>
                            <View style={[styles.searchBar, {
                                backgroundColor: isDark ? T.card : '#ffffff',
                                borderColor: isDark ? T.cardBorder : '#c4b5fd',
                                shadowColor: isDark ? '#000' : '#7c3aed',
                            }]}>
                                <Ionicons name="search" size={18} color={T.accent} style={{ marginRight: 10 }} />
                                <TextInput
                                    value={searchText}
                                    onChangeText={handleSearchInput}
                                    placeholder="Search categories & sub-categories…"
                                    placeholderTextColor={T.placeholder}
                                    style={[styles.searchInput, { color: T.text }]}
                                    returnKeyType="search"
                                />
                                {searching && <ActivityIndicator size="small" color={T.accent} style={{ marginLeft: 6 }} />}
                                {searchText.length > 0 && !searching && (
                                    <TouchableOpacity onPress={() => { setSearchText(""); setSuggestions([]); setShowSuggestion(false); }}>
                                        <Ionicons name="close-circle" size={18} color={T.textMuted} />
                                    </TouchableOpacity>
                                )}
                            </View>

                            {showSuggestion && suggestions.length > 0 && (
                                <Animated.View style={[styles.suggestionBox, {
                                    backgroundColor: isDark ? T.card : '#ffffff',
                                    borderColor: isDark ? T.cardBorder : '#e0d9f7',
                                    opacity: suggestionAnim,
                                    transform: [{ translateY: suggestionAnim.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] }) }],
                                }]}>
                                    {suggestions.map((item, index) => (
                                        <TouchableOpacity
                                            key={item.type + (item.id ?? index)}
                                            style={[styles.suggestionItem, index < suggestions.length - 1 && { borderBottomWidth: 1, borderBottomColor: T.divider }]}
                                            onPress={() => handleSuggestionPress(item)}
                                            activeOpacity={0.7}
                                        >
                                            <View style={[styles.suggestionIcon, {
                                                backgroundColor: item.type === "category"
                                                    ? (isDark ? `${T.accent}22` : '#d1fae5')
                                                    : (isDark ? `${T.orb3}44` : '#ede9fe'),
                                            }]}>
                                                <Ionicons
                                                    name={item.type === "category" ? "grid-outline" : "leaf-outline"}
                                                    size={13} color={T.accent}
                                                />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={[styles.suggestionName, { color: T.text }]}>{item.name}</Text>
                                                <Text style={[styles.suggestionType, { color: T.textMuted }]}>
                                                    {item.type === "category" ? "Category" : "Sub-category"}
                                                </Text>
                                            </View>
                                            <Ionicons name="chevron-forward" size={14} color={T.textMuted} />
                                        </TouchableOpacity>
                                    ))}
                                </Animated.View>
                            )}
                        </View>

                        {/* ── Section heading ── */}
                        <View style={styles.sectionHeader}>
                            <View>
                                <Text style={[styles.sectionTitle, { color: T.text }]}>Browse Categories</Text>
                                <Text style={[styles.sectionSub, { color: T.textSub }]}>Tap a category to explore</Text>
                            </View>
                            {/* Gradient accent pill */}
                            <View style={[styles.sectionAccent, {
                                backgroundColor: isDark ? T.accent : '#7c3aed',
                            }]} />
                        </View>
                    </>
                }
                renderItem={({ item, index }) => <CategoryCard item={item} index={index} theme={T} isDark={isDark} />}
                ListFooterComponent={<View style={{ height: 110 }} />}
            />

            <Footer />
        </View>
    );
}

// ─── CategoryCard ─────────────────────────────────────────────────────────────

function CategoryCard({ item, index, theme: T, isDark }) {
    const fadeAnim  = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.85)).current;
    const pressAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim,  { toValue: 1, duration: 380, delay: index * 50, useNativeDriver: true }),
            Animated.spring(scaleAnim, { toValue: 1, delay: index * 50, useNativeDriver: true }),
        ]).start();
    }, []);

    // Light mode: cycle card accent colours for vibrancy
    const LIGHT_ACCENTS = ['#059669', '#7c3aed', '#d97706', '#0891b2', '#db2777', '#4f46e5'];
    const accentColor = isDark ? T.accent : LIGHT_ACCENTS[index % LIGHT_ACCENTS.length];

    return (
        <Animated.View style={{
            opacity: fadeAnim,
            transform: [{ scale: Animated.multiply(scaleAnim, pressAnim) }],
            width: (width - 48) / 3, margin: 6,
        }}>
            <TouchableOpacity
                onPressIn={() => Animated.spring(pressAnim, { toValue: 0.93, useNativeDriver: true }).start()}
                onPressOut={() => Animated.spring(pressAnim, { toValue: 1, useNativeDriver: true }).start()}
                onPress={() => router.push({ pathname: "/SubCategory", params: { categoryId: item.categoryId } })}
                activeOpacity={1}
            >
                <View style={[
                    styles.catCard,
                    {
                        backgroundColor: T.card,
                        borderColor: isDark ? T.cardBorder : `${accentColor}30`,
                        // Light mode: vivid left-border accent
                        borderLeftWidth: isDark ? 1 : 3,
                        borderLeftColor: isDark ? T.cardBorder : accentColor,
                    },
                ]}>
                    <View style={styles.catImgWrap}>
                        <Image source={{ uri: item.imageLink }} style={styles.catImg} />
                        <View style={[styles.catImgOverlay, { backgroundColor: `${accentColor}15` }]} />
                    </View>
                    <Text style={[styles.catLabel, { color: T.text }]} numberOfLines={2}>
                        {item.categoryName}
                    </Text>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    root: { flex: 1 },

    // Dark mode bg layers
    bgLayer2: {
        position: "absolute", top: 0, left: 0, right: 0, height: 260,
        backgroundColor: "#0d1f3a", borderBottomLeftRadius: 60, borderBottomRightRadius: 60,
    },
    orb1: { position: "absolute", width: 220, height: 220, borderRadius: 110, top: -60, right: -60 },
    orb2: { position: "absolute", width: 160, height: 160, borderRadius: 80, top: 200, left: -50 },

    // Light mode gradient orbs
    lightOrb1: {
        position: "absolute", width: 280, height: 280, borderRadius: 140,
        backgroundColor: "rgba(124,58,237,0.13)", top: -80, right: -80,
    },
    lightOrb2: {
        position: "absolute", width: 200, height: 200, borderRadius: 100,
        backgroundColor: "rgba(5,150,105,0.10)", top: 220, left: -60,
    },
    lightOrb3: {
        position: "absolute", width: 160, height: 160, borderRadius: 80,
        backgroundColor: "rgba(217,119,6,0.09)", bottom: 200, right: -40,
    },
    lightHeaderWash: {
        position: "absolute", top: 0, left: 0, right: 0, height: 280,
        backgroundColor: "rgba(79,70,229,0.06)",
        borderBottomLeftRadius: 60, borderBottomRightRadius: 60,
    },

    loadingScreen: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
    loadingText:   { fontSize: 14, fontWeight: "600" },

    listContent: { paddingHorizontal: 12 },

    // ── Weather ──────────────────────────────────────────────
    weatherSection: { paddingTop: 52, paddingHorizontal: 4, paddingBottom: 14 },
    weatherCard: {
        borderRadius: 24, overflow: "hidden", minHeight: 195,
        shadowColor: "#000", shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3, shadowRadius: 20, elevation: 14,
    },
    weatherCardLoading: { alignItems: "center", justifyContent: "center" },
    wOverlay: { ...StyleSheet.absoluteFillObject },
    wStar: { position: "absolute", borderRadius: 99, backgroundColor: "#fff" },
    wMoon: { position: "absolute", top: 16, right: 16, width: 36, height: 36, borderRadius: 18, backgroundColor: "#e8dfc8" },
    wMoonCover: { position: "absolute", top: 14, right: 10, width: 30, height: 30, borderRadius: 15, backgroundColor: "#0a1020" },
    wContent: { flex: 1, padding: 18, justifyContent: "space-between", minHeight: 195 },
    wTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
    wCity: { fontSize: 20, fontWeight: "800", color: "#fff", letterSpacing: 0.2 },
    wDate: { fontSize: 11, color: "rgba(255,255,255,0.6)", marginTop: 2, fontWeight: "500" },
    wTimeBadge: { backgroundColor: "rgba(255,255,255,0.18)", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
    wTimeBadgeText: { color: "rgba(255,255,255,0.9)", fontSize: 11, fontWeight: "600" },
    wMidRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginVertical: 6 },
    wTemp: { fontSize: 64, fontWeight: "900", color: "#fff", lineHeight: 68, letterSpacing: -3 },
    wTempUnit: { fontSize: 28, fontWeight: "500", letterSpacing: 0 },
    wCondCol: { alignItems: "flex-end", justifyContent: "flex-end", paddingBottom: 6 },
    wEmoji: { fontSize: 32, textAlign: "right" },
    wCondText: { fontSize: 12, color: "rgba(255,255,255,0.85)", textTransform: "capitalize", fontWeight: "600", textAlign: "right", maxWidth: 110, marginTop: 4 },
    wStatsRow: { flexDirection: "row", backgroundColor: "rgba(0,0,0,0.25)", borderRadius: 16, overflow: "hidden", paddingVertical: 10 },
    wStat: { flex: 1, alignItems: "center" },
    wStatBorder: { borderLeftWidth: 0.5, borderLeftColor: "rgba(255,255,255,0.15)" },
    wStatVal: { fontSize: 12, fontWeight: "700", color: "#fff" },
    wStatLbl: { fontSize: 9.5, color: "rgba(255,255,255,0.55)", marginTop: 2 },

    // ── Search ───────────────────────────────────────────────
    searchSection: { paddingHorizontal: 4, paddingBottom: 4 },
    searchBar: {
        flexDirection: "row", alignItems: "center",
        borderRadius: 16, borderWidth: 1.5,
        paddingHorizontal: 14, height: 50,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12, shadowRadius: 10, elevation: 6,
    },
    searchInput: { flex: 1, fontSize: 14, fontWeight: "500" },

    suggestionBox: {
        borderRadius: 16, marginTop: 6, overflow: "hidden",
        shadowColor: "#000", shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15, shadowRadius: 16, elevation: 10, borderWidth: 1,
    },
    suggestionItem: { flexDirection: "row", alignItems: "center", paddingVertical: 11, paddingHorizontal: 14, gap: 10 },
    suggestionIcon: { width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center" },
    suggestionName: { fontSize: 13.5, fontWeight: "700" },
    suggestionType: { fontSize: 11, fontWeight: "500", marginTop: 1 },

    // ── Section header ───────────────────────────────────────
    sectionHeader: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        paddingHorizontal: 4, paddingTop: 18, paddingBottom: 10,
    },
    sectionTitle: { fontSize: 22, fontWeight: "800" },
    sectionSub:   { fontSize: 12.5, fontWeight: "500", marginTop: 2 },
    sectionAccent: { width: 10, height: 10, borderRadius: 5 },

    // ── Category cards ───────────────────────────────────────
    catCard: {
        borderRadius: 18, overflow: "hidden", borderWidth: 1,
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12, shadowRadius: 10, elevation: 5,
        alignItems: "center", paddingBottom: 10,
    },
    catImgWrap: {
        width: "100%", height: (width - 48) / 3,
        overflow: "hidden", borderTopLeftRadius: 18, borderTopRightRadius: 18,
    },
    catImg:        { width: "100%", height: "100%", resizeMode: "cover" },
    catImgOverlay: { ...StyleSheet.absoluteFillObject },
    catLabel: { marginTop: 8, paddingHorizontal: 6, fontSize: 11.5, fontWeight: "700", textAlign: "center", lineHeight: 16 },
});