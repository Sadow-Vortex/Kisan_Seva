import React, { useEffect, useLayoutEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
    Modal,
    Alert,
    Linking
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import Footer from "./Footer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";


const { width,height } = Dimensions.get("window");

export default function Popular() {

    const navigation = useNavigation();

    const [ads, setAds] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedAd, setSelectedAd] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const url = "http://10.194.243.199:2012";
    const userUrl = "http://10.194.243.199:1012";

    useLayoutEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    useEffect(() => {
        fetchPopularAds();
        fetchUsers();
    }, []);

    const fetchPopularAds = async () => {
        try {
            const res = await fetch(`${url}/adv`);
            const json = await res.json();

            const list = Array.isArray(json?.data) ? json.data : [];

            const popularOnly = list
                .filter(a => (a.count || 0) > 0)
                .sort((a, b) => (b.count || 0) - (a.count || 0));

            setAds(popularOnly);

        } catch (e) {
            console.log("Popular ads load error:", e);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${userUrl}/api/users`);
            setUsers(Array.isArray(response.data.data) ? response.data.data : []);
        } catch (error) {
            console.log("Failed to fetch users");
        }
    };

    const openModal = async (ad) => {
        try {
            const storedUser = await AsyncStorage.getItem('user');
            const viewerId = storedUser ? JSON.parse(storedUser)?.id : null;

            if (!viewerId) {
                Alert.alert("Login Error", "Please log in to view this ad.");
                return;
            }

            const response = await axios.get(
                `${url}/adv/${ad.adv_id}?viewerId=${viewerId}`
            );

            const updatedAd = response.data?.data;

            const farmer = users.find(
                user => user.id === updatedAd.advUserID
            );

            const selected = { ...updatedAd, farmer };

            setSelectedAd(selected);
            setModalVisible(true);

        } catch (error) {
            console.error("Failed to open ad modal:", error);
            Alert.alert("Error", "Failed to load ad. Try again.");
        }
    };


    const closeModal = () => {
        setModalVisible(false);
        setSelectedAd(null);
    };


    const openDialer = (number) => {
        if (number) Linking.openURL(`tel:${number}`);
    };

    const openMap = (lat, lng) => {
        if (lat && lng) {
            const link = `https://www.google.com/maps?q=${lat},${lng}`;
            Linking.openURL(link);
        }
    };

    const renderItem = ({ item }) => {

        const imageUrl =
            item.adv_Image && item.adv_Image.length > 0
                ? `${url}/uploads/${item.adv_Image}`
                : null;

        return (
            <TouchableOpacity
                style={styles.card}
                activeOpacity={0.85}
                onPress={() => openModal(item)}
            >

                {imageUrl ? (
                    <Image source={{ uri: imageUrl }} style={styles.image} />
                ) : (
                    <View style={styles.noImageBox}>
                        <Ionicons name="image-outline" size={34} color="#9ca3af" />
                    </View>
                )}

                <View style={styles.popularBadge}>
                    <Text style={styles.popularBadgeText}>POPULAR</Text>
                </View>

                <View style={styles.cardBody}>
                    <Text numberOfLines={1} style={styles.title}>
                        {item.adv_Title}
                    </Text>

                    <Text style={styles.price}>₹{item.adv_Price}</Text>

                    <View style={styles.bottomRow}>
                        <View style={styles.locationRow}>
                            <Ionicons name="location-outline" size={14} color="#6b7f3f" />
                            <Text numberOfLines={1} style={styles.location}>
                                {item.adv_Address || "Location not set"}
                            </Text>
                        </View>

                        <View style={styles.viewRow}>
                            <Ionicons name="eye-outline" size={14} color="#6b7f3f" />
                            <Text style={styles.viewText}>{item.count}</Text>
                        </View>
                    </View>
                </View>

            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <View style={styles.container}>

            <View style={styles.header}>
                <View style={styles.logoRow}>
                    <Image
                        source={require("../assets/images/Logo.png")}
                        style={styles.logo}
                    />
                    <Text style={styles.brand}>Kisan Seva</Text>
                </View>

                <Text style={styles.subTitle}>Most viewed ads from farmers</Text>
                <Text style={styles.pageTitle}>Popular Ads</Text>
            </View>

            {ads.length === 0 ? (
                <View style={{ marginTop: 40, alignItems: "center" }}>
                    <Text>No popular ads yet.</Text>
                </View>
            ) : (
                <FlatList
                    data={ads}
                    keyExtractor={(item) => item.adv_id.toString()}
                    renderItem={renderItem}
                    numColumns={2}
                    contentContainerStyle={styles.list}
                />
            )}

            {/* ---------- SAME MODAL DESIGN ---------- */}

            <Modal visible={modalVisible} transparent animationType="slide">

                <View style={styles.modalBackground}>

                    <View style={styles.modalSheet}>

                        {selectedAd && (
                            <>

                                <View style={styles.modalHandle} />

                                <TouchableOpacity
                                    onPress={closeModal}
                                    style={styles.closeBtn}
                                >
                                    <Ionicons name="close" size={22} color="#334155" />
                                </TouchableOpacity>

                                <View style={styles.modalImageWrap}>
                                    {selectedAd.adv_ImageLink ? (
                                        <Image
                                            source={{ uri: selectedAd.adv_ImageLink }}
                                            style={styles.modalImage}
                                        />
                                    ) : (
                                        <View style={styles.modalNoImage}>
                                            <Ionicons name="image-outline" size={40} color="#94a3b8" />
                                        </View>
                                    )}

                                    <View style={styles.viewCountOverlay}>
                                        <Ionicons name="eye" size={14} color="#fff" />
                                        <Text style={styles.viewCountText}>
                                            {selectedAd.count || 0}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.modalBody}>

                                    <Text style={styles.modalTitle}>
                                        {selectedAd.adv_Title}
                                    </Text>

                                    <Text style={styles.modalPrice}>
                                        ₹{selectedAd.adv_Price}
                                    </Text>

                                    <View style={styles.modalLocationRow}>
                                        <Ionicons name="location" size={16} color="#4d7c0f" />
                                        <Text style={styles.modalLocation}>
                                            {selectedAd.adv_Address}
                                        </Text>
                                    </View>

                                    <Text style={styles.modalDesc}>
                                        {selectedAd.adv_Description || "No description provided."}
                                    </Text>

                                    <View style={styles.farmerCard}>

                                        <Text style={styles.farmerHeader}>
                                            Farmer Information
                                        </Text>

                                        <View style={styles.farmerRow}>

                                            {selectedAd.farmer?.profilePic ? (
                                                <Image
                                                    source={{ uri: selectedAd.farmer.profilePic }}
                                                    style={styles.farmerAvatar}
                                                />
                                            ) : (
                                                <Ionicons name="person-circle" size={52} color="#94a3b8" />
                                            )}

                                            <View style={{ marginLeft: 10 }}>
                                                <Text style={styles.farmerName}>
                                                    {selectedAd.farmer?.name || "Unknown"}
                                                </Text>
                                                <Text style={styles.farmerSub}>
                                                    Verified farmer
                                                </Text>
                                            </View>

                                        </View>

                                    </View>

                                </View>

                                <View style={styles.actionRow}>

                                    <TouchableOpacity
                                        style={[styles.actionBtn, styles.callBtn]}
                                        onPress={() =>
                                            openDialer(selectedAd.farmer?.phoneNumber)
                                        }
                                    >
                                        <Ionicons name="call" size={18} color="#fff" />
                                        <Text style={styles.actionText}>Call</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.actionBtn, styles.chatBtn]}
                                        onPress={() =>
                                            Alert.alert("Chat", "Chat with farmer coming soon.")
                                        }
                                    >
                                        <Ionicons name="chatbubble-ellipses" size={18} color="#365314" />
                                        <Text style={styles.actionTextDark}>Chat</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.actionBtn, styles.navBtn]}
                                        onPress={() =>
                                            openMap(
                                                selectedAd.adv_Location?.latitude,
                                                selectedAd.adv_Location?.longitude
                                            )
                                        }
                                    >
                                        <Ionicons name="navigate" size={18} color="#365314" />
                                        <Text style={styles.actionTextDark}>Navigate</Text>
                                    </TouchableOpacity>

                                </View>

                            </>
                        )}

                    </View>
                </View>

            </Modal>


            <Footer />
        </View>
    );
}

const CARD_WIDTH = width / 2 - 20;

const styles = StyleSheet.create({

    container: { flex: 1, backgroundColor: "#f8dec4" },

    loader: { flex: 1, justifyContent: "center", alignItems: "center" },

    header: { paddingTop: 48, paddingBottom: 10, paddingHorizontal: 16 },

    logoRow: { flexDirection: "row", alignItems: "center" },

    logo: { width: 66, height: 66, borderRadius: 28, marginRight: 10 },

    brand: { fontSize: 22, fontWeight: "800", color: "#5a7d3a" },

    subTitle: { marginTop: 4, fontSize: 13, color: "#7c6b5e" },

    pageTitle: { marginTop: 10, fontSize: 28, fontWeight: "800", color: "#5a4a42" },

    list: { paddingHorizontal: 10, paddingBottom: 90, paddingTop: 10 },

    card: {
        width: CARD_WIDTH,
        backgroundColor: "#fff",
        borderRadius: 18,
        margin: 6,
        overflow: "hidden",
        elevation: 8
    },

    image: { width: "100%", height: 120 },

    noImageBox: {
        width: "100%",
        height: 120,
        backgroundColor: "#eee",
        justifyContent: "center",
        alignItems: "center"
    },

    popularBadge: {
        position: "absolute",
        top: 10,
        left: 10,
        backgroundColor: "#6b7f3f",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10
    },

    popularBadgeText: {
        fontSize: 10,
        fontWeight: "800",
        color: "#fff"
    },

    cardBody: { padding: 10 },

    title: { fontSize: 14, fontWeight: "800", color: "#1f2937" },

    price: { marginTop: 4, fontSize: 15, fontWeight: "800", color: "#2f7d32" },

    bottomRow: {
        marginTop: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },

    locationRow: { flexDirection: "row", alignItems: "center", flex: 1, marginRight: 6 },

    location: { marginLeft: 4, fontSize: 11, color: "#6b7280" },

    viewRow: { flexDirection: "row", alignItems: "center" },

    viewText: { marginLeft: 4, fontSize: 12, fontWeight: "700", color: "#6b7f3f" },

    /* ---------- MODAL STYLES (same as AdsBySubCategory) ---------- */

    modalContent: {
        margin: 20,
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 15,
        alignItems: "center"
    },

    farmerText: {
        marginTop: 10,
        fontSize: 16,
        fontWeight: "500",
        color: "#333"
    },

    farmerImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginTop: 10
    },

    iconRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        width: "70%",
        marginTop: 12
    },

    iconButton: {
        backgroundColor: "#eef",
        padding: 10,
        borderRadius: 50
    },

    chatText: { fontSize: 20 },

    crossIcon: {
        position: "absolute",
        top: 10,
        right: 10,
        zIndex: 10,
        padding: 5
    },

    modalBackground: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "flex-end"
    },

    modalSheet: {
        height: height * 0.85,
        backgroundColor: "#fef3e8",
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        overflow: "hidden"
    },

    modalHandle: {
        width: 60,
        height: 5,
        backgroundColor: "#cbd5e1",
        borderRadius: 3,
        alignSelf: "center",
        marginTop: 8,
        marginBottom: 6
    },

    closeBtn: {
        position: "absolute",
        right: 16,
        top: 10,
        zIndex: 10
    },

    modalImageWrap: {
        width: "100%",
        height: 220
    },

    modalImage: {
        width: "100%",
        height: "100%"
    },

    modalNoImage: {
        flex: 1,
        backgroundColor: "#e5e7eb",
        justifyContent: "center",
        alignItems: "center"
    },

    viewCountOverlay: {
        position: "absolute",
        top: 12,
        left: 12,
        backgroundColor: "rgba(0,0,0,0.55)",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 14
    },

    viewCountText: {
        color: "#fff",
        marginLeft: 4,
        fontSize: 12
    },

    modalBody: {
        padding: 16
    },

    modalTitle: {
        fontSize: 20,
        fontWeight: "900",
        color: "#1f2937"
    },

    modalPrice: {
        marginTop: 4,
        fontSize: 18,
        fontWeight: "800",
        color: "#4d7c0f"
    },

    modalLocationRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 6
    },

    modalLocation: {
        marginLeft: 6,
        fontSize: 13,
        color: "#374151",
        flex: 1
    },

    modalDesc: {
        marginTop: 10,
        fontSize: 14,
        color: "#374151"
    },

    farmerCard: {
        marginTop: 16,
        backgroundColor: "#ecfccb",
        borderRadius: 16,
        padding: 12
    },

    farmerHeader: {
        fontWeight: "800",
        color: "#365314",
        marginBottom: 8
    },

    farmerRow: {
        flexDirection: "row",
        alignItems: "center"
    },

    farmerAvatar: {
        width: 52,
        height: 52,
        borderRadius: 26
    },

    farmerName: {
        fontSize: 15,
        fontWeight: "800",
        color: "#1f2937"
    },

    farmerSub: {
        fontSize: 12,
        color: "#4d7c0f"
    },

    actionRow: {
        flexDirection: "row",
        paddingHorizontal: 12,
        paddingBottom: 16,
        paddingTop: 10,
        justifyContent: "space-between"
    },

    actionBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        borderRadius: 14,
        marginHorizontal: 4
    },

    callBtn: {
        backgroundColor: "#4d7c0f"
    },

    chatBtn: {
        backgroundColor: "#ecfccb"
    },

    navBtn: {
        backgroundColor: "#ecfccb"
    },

    actionText: {
        marginLeft: 6,
        color: "#fff",
        fontWeight: "800"
    },

    actionTextDark: {
        marginLeft: 6,
        color: "#365314",
        fontWeight: "800"
    }


});
