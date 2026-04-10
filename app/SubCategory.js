import React, { useEffect, useLayoutEffect, useState, useRef } from "react";
import {
    View, Image, FlatList, StyleSheet, Dimensions,
    ActivityIndicator, Text, TouchableOpacity, TextInput,
    ImageBackground, Animated, StatusBar
} from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import Footer from "./Footer";
import { useTheme } from "./Themecontext";

const { width, height } = Dimensions.get("window");
const IMAGE_WIDTH = width / 3 - 20;

export default function SubCategory() {
    const navigation = useNavigation();
    const { categoryId } = useLocalSearchParams();
    const { theme: T, isDark } = useTheme();

    const [subCategory, setSubCategory]       = useState([]);
    const [loading, setLoading]               = useState(true);
    const [categoryImage, setCategoryImage]   = useState(null);
    const [categoryName, setCategoryName]     = useState("Sub Categories");
    const [searchText, setSearchText]         = useState("");
    const [filteredSub, setFilteredSub]       = useState([]);
    const [searchFocused, setSearchFocused]   = useState(false);

    const orb1Y = useRef(new Animated.Value(0)).current;
    const url = `https://kisan-seva-subcategory.onrender.com`;

    useLayoutEffect(() => { navigation.setOptions({ headerShown: false }); }, [navigation]);

    useEffect(() => {
        if (categoryId) { fetchSubCategory(); fetchCategoryInfo(); }
        Animated.loop(Animated.sequence([
            Animated.timing(orb1Y, { toValue: 16, duration: 3000, useNativeDriver: true }),
            Animated.timing(orb1Y, { toValue: -16, duration: 3000, useNativeDriver: true }),
        ])).start();
    }, [categoryId]);

    const fetchSubCategory = async () => {
        try {
            const res  = await fetch(`${url}/subcategory/by-category/${categoryId}`);
            const data = await res.json();
            const arr  = Array.isArray(data?.data) ? data.data : [];
            setSubCategory(arr); setFilteredSub(arr);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const fetchCategoryInfo = async () => {
        try {
            const res  = await fetch(`${url}/category`);
            const json = await res.json();
            const list = Array.isArray(json?.data) ? json.data : [];
            const curr = list.find(c => String(c.categoryId) === String(categoryId));
            if (curr) { setCategoryImage(curr.imageLink || null); setCategoryName(curr.categoryName || "Sub Categories"); }
        } catch { }
    };

    const handleSearch = (text) => {
        setSearchText(text);
        if (!text.trim()) { setFilteredSub(subCategory); return; }
        setFilteredSub(subCategory.filter(item =>
            item.subCategoryName?.toLowerCase().includes(text.toLowerCase())
        ));
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: T.card, borderColor: T.cardBorder }]}
            onPress={() => navigation.navigate("AdsBySubCategory", { subCategoryId: item.subCategoryId })}
        >
            <Image source={{ uri: item.subCategoryImageLink }} style={styles.image} />
            <Text style={[styles.cardTitle, { color: T.text }]}>{item.subCategoryName}</Text>
        </TouchableOpacity>
    );

    if (loading) return (
        <View style={[{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: T.bg }]}>
            <ActivityIndicator size="large" color={T.accent} />
        </View>
    );

    return (
        <View style={[styles.root, { backgroundColor: T.bg }]}>
            <StatusBar barStyle={T.statusBar} />

            {isDark && (
                <Animated.View style={[styles.orb1, { backgroundColor: T.orb1, transform: [{ translateY: orb1Y }] }]} />
            )}

            {/* Banner */}
            <ImageBackground
                source={categoryImage ? { uri: categoryImage } : require('../assets/images/farm.jpg')}
                style={styles.banner}
                imageStyle={styles.bannerImage}
            >
                <View style={styles.bannerOverlay}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.bannerBack}>
                        <Ionicons name="arrow-back" size={22} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.bannerTitle}>{categoryName}</Text>
                    <Text style={styles.bannerSub}>Select your favourites</Text>
                </View>
            </ImageBackground>

            {/* Search */}
            <View style={[styles.searchWrapper, {
                backgroundColor: T.card, borderColor: searchFocused ? T.accent : T.cardBorder,
            }]}>
                <Ionicons name="search" size={16} color={searchFocused ? T.accent : T.textMuted} style={{ marginRight: 8 }} />
                <TextInput
                    placeholder="Search sub categories"
                    placeholderTextColor={T.placeholder}
                    style={[styles.searchInput, { color: T.text }]}
                    value={searchText}
                    onChangeText={handleSearch}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                />
            </View>

            {/* Section header */}
            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: T.text }]}>Browse Subcategories</Text>
                <View style={[styles.sectionLine, { backgroundColor: T.accent }]} />
                <Text style={[styles.sectionSub, { color: T.textSub }]}>Choose the type you want.</Text>
            </View>

            {filteredSub.length === 0 ? (
                <View style={{ flex: 1, alignItems: 'center', paddingTop: 60 }}>
                    <Text style={{ fontSize: 40 }}>🌿</Text>
                    <Text style={[{ marginTop: 14, fontSize: 15, fontWeight: '600', color: T.textSub }]}>
                        No sub-categories found
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={filteredSub}
                    keyExtractor={(item, i) => item?.subCategoryId ? item.subCategoryId.toString() : i.toString()}
                    renderItem={renderItem}
                    numColumns={3}
                    contentContainerStyle={styles.container}
                />
            )}

            <Footer />
        </View>
    );
}

// Need Ionicons for back button
import { Ionicons } from "@expo/vector-icons";

const styles = StyleSheet.create({
    root: { flex: 1 },
    orb1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, top: -30, right: -30, zIndex: 0 },

    banner: { height: height / 4, width: "100%", justifyContent: "flex-end" },
    bannerImage: { borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
    bannerOverlay: {
        padding: 18, backgroundColor: "rgba(0,0,0,0.3)",
        borderBottomLeftRadius: 28, borderBottomRightRadius: 28,
    },
    bannerBack: {
        position: 'absolute', top: 14, left: 14,
        backgroundColor: 'rgba(0,0,0,0.35)', padding: 8, borderRadius: 12,
    },
    bannerTitle: { fontSize: 26, fontWeight: "800", color: "#ffffff", marginTop: 8 },
    bannerSub: { marginTop: 4, fontSize: 14, color: "#f1f5f9", fontWeight: "600" },

    searchWrapper: {
        marginTop: 14, marginHorizontal: 16,
        borderRadius: 20, paddingHorizontal: 16, height: 48,
        justifyContent: "center", flexDirection: 'row', alignItems: 'center',
        borderWidth: 1.5,
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12, shadowRadius: 10, elevation: 6,
    },
    searchInput: { flex: 1, fontSize: 14 },

    sectionHeader: { marginTop: 18, marginBottom: 14, alignItems: "center" },
    sectionTitle: { fontSize: 20, fontWeight: "800" },
    sectionLine: { width: 40, height: 2.5, borderRadius: 2, marginVertical: 6 },
    sectionSub: { fontSize: 13 },

    container: { paddingHorizontal: 10, paddingBottom: 100 },
    card: {
        width: IMAGE_WIDTH, margin: 6, borderRadius: 18, overflow: "hidden", borderWidth: 1,
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 6,
    },
    image: { width: "100%", height: 110 },
    cardTitle: { paddingVertical: 10, textAlign: "center", fontSize: 13, fontWeight: "700" },
});