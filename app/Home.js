import React, { useEffect, useState, useLayoutEffect } from "react";
import {
    View,
    Image,
    FlatList,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
    Text,
    TouchableOpacity,
    Alert,
    Linking,
    TextInput,
} from "react-native";
import { useNavigation } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import Footer from "./Footer";
import { ImageBackground } from "react-native";
import * as Font from "expo-font";


const { width, height } = Dimensions.get("window");

export default function HomeScreen() {

    const navigation = useNavigation();

    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState("category");

    const [searchText, setSearchText] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestion, setShowSuggestion] = useState(false);

    const [weather, setWeather] = useState(null);
    const [weatherLoading, setWeatherLoading] = useState(true);
    const [fontsLoaded, setFontsLoaded] = useState(false);

    useEffect(() => {
        Font.loadAsync({
            PoppinsSemi: require("../assets/fonts/Poppins-SemiBold.ttf"),
            PoppinsRegular: require("../assets/fonts/Poppins-Regular.ttf"),
        }).then(() => setFontsLoaded(true));
    }, []);


    const url = "http://10.178.147.199:2001";

    useLayoutEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    useEffect(() => {
        fetchCategories();
        fetchWeather();
    }, []);

    // ---------------- WEATHER ----------------

    const fetchWeather = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                setWeatherLoading(false);
                return;
            }

            const loc = await Location.getCurrentPositionAsync({});
            const lat = loc.coords.latitude;
            const lon = loc.coords.longitude;

            const API_KEY = "32bea71aad47a04557f738d027a4c1de";

            const res = await fetch(
                `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
            );

            const json = await res.json();
            setWeather(json);

        } catch (e) {
            console.log("Weather error:", e);
        } finally {
            setWeatherLoading(false);
        }
    };


    const fetchCategories = async () => {
        try {
            const response = await fetch(`${url}/category`);
            const data = await response.json();
            const categoryArray = Array.isArray(data.data) ? data.data : [];
            setCategories(categoryArray);
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setLoading(false);
        }
    };


    const handleSearchInput = async (text) => {

        setSearchText(text);

        if (!text || text.length < 2) {
            setSuggestions([]);
            setShowSuggestion(false);
            return;
        }

        try {

            const catRes = await fetch(
                `${url}/category/by-name/${text}`
            );
            const catJson = await catRes.json();

            const subRes = await fetch(
                `${url}/subcategory/by-name/${text}`
            );
            const subJson = await subRes.json();

            const catList = Array.isArray(catJson.data) ? catJson.data : [];
            const subList = Array.isArray(subJson.data) ? subJson.data : [];

            const merged = [
                ...catList.map(c => ({
                    type: "category",
                    id: c.categoryId,
                    name: c.categoryName
                })),
                ...subList.map(s => ({
                    type: "subcategory",
                    id: s.subCategoryId,
                    name: s.subCategoryName
                }))
            ];

            setSuggestions(merged);
            setShowSuggestion(true);

        } catch (e) {
            console.log(e);
        }
    };

    if (loading) {
        return (
            <ActivityIndicator
                size="large"
                style={{ flex: 1, justifyContent: "center" }}
            />
        );
    }

    const getWeatherBackground = () => {

        if (!weather || !weather.weather || !weather.weather[0]) {
            return require("../assets/weather/clear.png");
        }

        const main = weather.weather[0].main.toLowerCase();

        if (main.includes("rain") || main.includes("drizzle")) {
            return require("../assets/weather/rainy.png");
        }

        if (main.includes("snow")) {
            return require("../assets/weather/snow.png");
        }

        if (main.includes("cloud")) {
            return require("../assets/weather/cloud.png");
        }

        if (main.includes("clear")) {
            return require("../assets/weather/sunny.png");
        }

        return require("../assets/weather/clear.png");
    };

    if (!fontsLoaded) return null;

    return (
        <View style={{ flex: 1, backgroundColor: "#f8dec4" }}>

            <View style={styles.weatherWrapper}>
                {weatherLoading ? (
                    <ActivityIndicator />
                ) : weather ? (
                    <ImageBackground
                        source={getWeatherBackground()}
                        resizeMode="cover"
                        imageStyle={{ borderRadius: 24 }}
                        style={styles.weatherCard}
                    >

                        <View style={styles.weatherOverlay}>

                            <View style={styles.weatherTop}>
                                <View>
                                    <Text style={styles.weatherCity}>{weather.name}</Text>
                                    <Text style={styles.weatherDesc}>
                                        {weather.weather[0].main}
                                    </Text>
                                </View>

                                <View style={{ flexDirection: "row", alignItems: "center" }}>
                                    <Image
                                        source={{
                                            uri: `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`
                                        }}
                                        style={{ width: 46, height: 46 }}
                                    />
                                    <Text style={styles.weatherTemp}>
                                        {Math.round(weather.main.temp)}°C
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.weatherInfoRow}>
                                <View style={styles.weatherMiniBox}>
                                    <Text style={styles.weatherMiniLabel}>Humidity</Text>
                                    <Text style={styles.weatherMiniValue}>
                                        {weather.main.humidity}%
                                    </Text>
                                </View>

                                <View style={styles.weatherMiniBox}>
                                    <Text style={styles.weatherMiniLabel}>Wind</Text>
                                    <Text style={styles.weatherMiniValue}>
                                        {weather.wind.speed} m/s
                                    </Text>
                                </View>

                                <View style={styles.weatherMiniBox}>
                                    <Text style={styles.weatherMiniLabel}>Sunrise</Text>
                                    <Text style={styles.weatherMiniValue}>
                                        {new Date(weather.sys.sunrise * 1000).toLocaleTimeString()}
                                    </Text>
                                </View>

                                <View style={styles.weatherMiniBox}>
                                    <Text style={styles.weatherMiniLabel}>Sunset</Text>
                                    <Text style={styles.weatherMiniValue}>
                                        {new Date(weather.sys.sunset * 1000).toLocaleTimeString()}
                                    </Text>
                                </View>
                            </View>

                        </View>

                    </ImageBackground>

                ) : null}
            </View>

            <View style={styles.headerWrapper}>
                <View style={styles.greenHeader}>
                    <View style={styles.searchBox}>
                        <Ionicons name="search" size={18} color="#64748b" />
                        <TextInput
                            value={searchText}
                            onChangeText={handleSearchInput}
                            placeholder="Search categories or sub categories"
                            placeholderTextColor="#000000"
                            style={styles.searchInput}
                        />
                    </View>
                </View>
            </View>


            {showSuggestion && (
                <View style={styles.suggestionBox}>
                    <FlatList
                        data={suggestions}
                        keyExtractor={(item, i) => item.type + item.id + i}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.suggestionItem}
                                onPress={() => {

                                    setShowSuggestion(false);
                                    setSearchText("");

                                    if (item.type === "category") {
                                        navigation.navigate("SubCategory", {
                                            categoryId: item.id
                                        });
                                    } else {
                                        navigation.navigate("AdsBySubCategory", {
                                            subCategoryId: item.id
                                        });
                                    }
                                }}
                            >
                                <Ionicons
                                    name={item.type === "category" ? "grid" : "leaf"}
                                    size={16}
                                    color="#14532d"
                                />
                                <Text style={styles.suggestionText}>{item.name}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            )}

            <View style={styles.categoryHeader}>
                <View style={styles.categoryMiddleLine} />

                <Text style={styles.categoryTitle}>Browse Categories</Text>
                <View style={styles.categoryLineRow}>
                    <View style={styles.categoryLineSide} />
                    <View style={styles.categoryLineSide} />
                </View>
                <Text style={styles.categorySubtitle}>Find what you need.</Text>

            </View>




            {activeTab === "category" && (
                <FlatList
                    contentContainerStyle={styles.categoryGrid}
                    data={categories}
                    keyExtractor={(item) => item.categoryId.toString()}
                    numColumns={3}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.categoryItem}
                            onPress={() =>
                                navigation.navigate("SubCategory", {
                                    categoryId: item.categoryId
                                })
                            }
                        >
                            <View style={styles.categoryCircle}>

                                <Image
                                    source={{ uri: item.imageLink }}
                                    style={styles.categoryIcon}
                                />

                            </View>

                            <Text style={styles.categoryLabel} numberOfLines={1}>
                                {item.categoryName}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            )}
            <Footer/>
        </View>
    );
}

const styles = StyleSheet.create({

    headerWrapper: {
        backgroundColor: "transparent"
    },

    greenHeader: {
        paddingTop: 12,
        paddingBottom: 12,
        paddingHorizontal: 16,
        backgroundColor: "transparent"
    },

    headerTitle: {
        color: "#ffffff",
        fontSize: 26,
        fontWeight: "800",
        letterSpacing: 0.5,
        marginBottom: 14
    },

    searchBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#ffffff",
        borderRadius: 18,
        paddingHorizontal: 14,
        height: 46,

        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        elevation: 8
    },


    searchInput: {
        flex: 1,
        marginLeft: 10,
        color: "#0f172a",
        fontSize: 14
    },


    weatherRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 6,
        borderBottomWidth: 0.5,
        borderColor: "#e5e7eb"
    },

    tabRow: {
        flexDirection: "row",
        paddingHorizontal: 14,
        marginTop: 14
    },

    tabItem: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginRight: 10,
        backgroundColor: "#e8f5ee"
    },

    tabItemActive: {
        backgroundColor: "#14532d"
    },

    tabText: {
        color: "#14532d",
        fontSize: 13,
        fontWeight: "700"
    },

    tabTextActive: {
        color: "#ffffff"
    },

    suggestionBox: {
        backgroundColor: "#ffffff",
        marginHorizontal: 14,
        marginTop: 6,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 10,
        maxHeight: 220,
        overflow: "hidden"
    },

    suggestionItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderBottomWidth: 0.5,
        borderColor: "#e5e7eb"
    },

    suggestionText: {
        marginLeft: 10,
        fontSize: 14,
        fontWeight: "600",
        color: "#14532d"
    },

    categoryGrid: {
        paddingHorizontal: 12,
        paddingTop: 18,
        paddingBottom: 90
    },

    categoryItem: {
        width: width / 3 - 18,
        alignItems: "center",
        marginBottom: 22
    },


    weatherWrapper: {
        paddingHorizontal: 14,
        paddingTop: 14
    },


    categoryCircle: {
        width: width / 3 - 28,
        height: width / 3 - 28,
        borderRadius: 20,
        backgroundColor: "#ffffff",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
        overflow: "hidden",

        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        elevation: 8
    },


    categoryIcon: {
        width: "100%",
        height: "100%",
        resizeMode: "cover"
    },


    categoryLabel: {
        fontSize: 13.5,
        fontWeight: "700",
        color: "#0f172a",
        textAlign: "center"
    },

    weatherCard: {
        height: height / 3,
        borderRadius: 28,
        overflow: "hidden",
        justifyContent: "flex-end",

        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 12
    },


    weatherOverlay: {
        flex: 1,
        padding: 16,
        backgroundColor: "rgba(0,0,0,0.25)"
    },

    weatherCity: {
        fontSize: 20,
        fontWeight: "800",
        color: "#ffffff"
    },

    weatherDesc: {
        marginTop: 2,
        fontSize: 13,
        fontWeight: "600",
        color: "#e5e7eb"
    },

    weatherTemp: {
        fontSize: 32,
        fontWeight: "900",
        marginLeft: 8,
        color: "#ffffff"
    },

    weatherTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 14
    },

    weatherInfoRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between"
    },

    weatherMiniBox: {
        width: "48%",
        backgroundColor: "rgba(255,255,255,0.20)",
        borderRadius: 12,
        paddingVertical: 8,
        paddingHorizontal: 10,
        marginBottom: 8
    },

    weatherMiniLabel: {
        fontSize: 11,
        color: "#e5e7eb",
        fontWeight: "600"
    },

    weatherMiniValue: {
        fontSize: 13,
        color: "#ffffff",
        fontWeight: "700",
        marginTop: 2
    },

    categoryHeader: {
        marginTop: 12,
        marginBottom: 12,
        alignItems: "center",
        position: "relative"
    },

    categoryTitle: {
        fontSize: 25,
        fontFamily: "PoppinsSemi",
        color: "#5a4a42"
    },

    categorySubtitle: {
        marginTop: 2,
        fontSize: 18,
        fontFamily: "PoppinsRegular",
        color: "#8b7a70"
    },

    categoryLineRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        width: "80%",
        marginVertical: 4
    },

    categoryLineSide: {
        width: "35%",
        height: 1,
        backgroundColor: "#554333"
    },


    categoryMiddleLine: {
        marginTop: 6,
        marginBottom: 6,
        width: "60%",
        height: 1,
        backgroundColor: "#554333"
    },


    categoryLine: {
        position: "absolute",
        top: 16,
        height: 1,
        width: "35%",
        backgroundColor: "#e6d8cc"
    },


});

