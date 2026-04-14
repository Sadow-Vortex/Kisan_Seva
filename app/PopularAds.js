import React, { useEffect, useLayoutEffect, useState, useRef } from "react";
import {
    View, Text, StyleSheet, FlatList, Image, TouchableOpacity,
    ActivityIndicator, Dimensions, Modal, Alert, Linking, Animated, StatusBar, ScrollView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import Footer from "./Footer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useTheme } from "./Themecontext";
import ScreenHeader from "./Screenheader";

const { width, height } = Dimensions.get("window");
const CARD_WIDTH  = width / 2 - 20;
const EXPANDED_H  = 200;
const COLLAPSED_H = 90;

export default function Popular() {
    const navigation = useNavigation();
    const { theme: T, isDark } = useTheme();

    const [ads, setAds]               = useState([]);
    const [users, setUsers]           = useState([]);
    const [loading, setLoading]       = useState(true);
    const [selectedAd, setSelectedAd] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const scrollY = useRef(new Animated.Value(0)).current;

    const url     = "https://advertisment-jfil.onrender.com";
    const userUrl = "https://kisan-seva-user.onrender.com";

    useLayoutEffect(() => { navigation.setOptions({ headerShown: false }); }, [navigation]);

    useEffect(() => { fetchPopularAds(); fetchUsers(); }, []);

    const fetchPopularAds = async () => {
        try {
            const res  = await fetch(`${url}/adv`);
            const json = await res.json();
            const list = Array.isArray(json?.data) ? json.data : [];
            setAds(list.filter(a => (a.count || 0) > 0).sort((a, b) => (b.count || 0) - (a.count || 0)));
        } catch (e) { console.log(e); }
        finally { setLoading(false); }
    };

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${userUrl}/api/users`);
            setUsers(Array.isArray(res.data.data) ? res.data.data : []);
        } catch { }
    };

    const openModal = async (ad) => {
        try {
            const storedUser = await AsyncStorage.getItem('user');
            const viewerId   = storedUser ? JSON.parse(storedUser)?.id : null;
            if (!viewerId) { Alert.alert("Login Error", "Please log in to view this ad."); return; }
            const res        = await axios.get(`${url}/adv/${ad.adv_id}?viewerId=${viewerId}`);
            const updatedAd  = res.data?.data;
            let farmer = users.find(u => u.id === updatedAd.advUserID);
            if (!farmer) {
                try { const ur = await axios.get(`${userUrl}/api/users/${updatedAd.advUserID}`); farmer = ur.data?.data; } catch {}
            }
            setSelectedAd({ ...updatedAd, farmer });
            setModalVisible(true);
        } catch { Alert.alert("Error", "Failed to load ad."); }
    };

    const closeModal = () => { setModalVisible(false); setSelectedAd(null); };
    const openDialer = (number) => { if (number) Linking.openURL(`tel:${number}`); };
    const openMap    = (lat, lng) => { if (lat && lng) Linking.openURL(`https://www.google.com/maps?q=${lat},${lng}`); };

    const renderItem = ({ item }) => {
        const imageUrl = item.adv_Image?.length ? `${url}/uploads/${item.adv_Image}` : null;
        return (
            <TouchableOpacity
                style={[styles.card, { backgroundColor: T.card, borderColor: T.cardBorder }]}
                activeOpacity={0.85}
                onPress={() => openModal(item)}
            >
                {imageUrl ? (
                    <Image source={{ uri: imageUrl }} style={styles.image} />
                ) : (
                    <View style={[styles.noImageBox, { backgroundColor: T.inputBg }]}>
                        <Ionicons name="image-outline" size={34} color={T.textMuted} />
                    </View>
                )}
                {/* HOT badge */}
                <View style={styles.hotBadge}>
                    <Ionicons name="flame" size={10} color="#fff" />
                    <Text style={styles.hotBadgeText}>HOT</Text>
                </View>
                <View style={styles.cardBody}>
                    <Text numberOfLines={1} style={[styles.title, { color: T.text }]}>{item.adv_Title}</Text>
                    <Text style={[styles.price, { color: '#c2410c' }]}>₹{item.adv_Price}</Text>
                    <View style={styles.bottomRow}>
                        <View style={styles.locationRow}>
                            <Ionicons name="location-outline" size={12} color="#fb923c" />
                            <Text numberOfLines={1} style={[styles.location, { color: T.textSub }]}>
                                {item.adv_Address || "Location not set"}
                            </Text>
                        </View>
                        <View style={styles.viewRow}>
                            <Ionicons name="eye-outline" size={12} color="#fb923c" />
                            <Text style={[styles.viewText, { color: '#fb923c' }]}>{item.count}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) return (
        <View style={[styles.loader, { backgroundColor: T.bg }]}>
            <ActivityIndicator size="large" color="#fb923c" />
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: T.bg }]}>
            <StatusBar barStyle="light-content" />

            {/* ── Next-gen Header ── */}
            <ScreenHeader
                screen="PopularAds"
                scrollY={scrollY}
                logo
                badge={{ value: ads.length, label: 'trending ads' }}
                EXPANDED_H={EXPANDED_H}
                COLLAPSED_H={COLLAPSED_H}
            />

            <Animated.FlatList
                data={ads}
                keyExtractor={(item) => item.adv_id.toString()}
                renderItem={renderItem}
                numColumns={2}
                contentContainerStyle={[styles.list, { paddingTop: 14 }]}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={{ fontSize: 48 }}>🔥</Text>
                        <Text style={[styles.emptyText, { color: T.textSub }]}>No popular ads yet</Text>
                    </View>
                }
            />

            {/* ── Polished Modal ── */}
            <Modal visible={modalVisible} transparent animationType="slide" statusBarTranslucent>
                <View style={styles.modalBackground}>
                    <TouchableOpacity style={styles.modalDismissArea} onPress={closeModal} activeOpacity={1} />

                    <View style={[styles.modalSheet, { backgroundColor: T.modal, borderColor: T.modalBorder }]}>
                        {selectedAd && (
                            <>
                                <View style={[styles.modalHandle, { backgroundColor: T.divider }]} />
                                <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
                                    <View style={[styles.closeBtnInner, { backgroundColor: T.inputBg }]}>
                                        <Ionicons name="close" size={18} color={T.text} />
                                    </View>
                                </TouchableOpacity>

                                <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                                    {/* Hero Image */}
                                    <View style={styles.modalImageWrap}>
                                        {selectedAd.adv_Image ? (
                                            <Image source={{ uri: `${url}/uploads/${selectedAd.adv_Image}` }} style={styles.modalImage} />
                                        ) : (
                                            <View style={[styles.modalNoImage, { backgroundColor: T.inputBg }]}>
                                                <Ionicons name="image-outline" size={48} color={T.textMuted} />
                                            </View>
                                        )}
                                        <View style={styles.viewCountOverlay}>
                                            <Ionicons name="eye" size={13} color="#fff" />
                                            <Text style={styles.viewCountText}>{selectedAd.count || 0} views</Text>
                                        </View>
                                        {/* HOT badge on modal too */}
                                        <View style={styles.hotBadgeModal}>
                                            <Ionicons name="flame" size={12} color="#fff" />
                                            <Text style={styles.hotBadgeText}>HOT</Text>
                                        </View>
                                    </View>

                                    {/* Product Details */}
                                    <View style={[styles.section, { backgroundColor: T.modal }]}>
                                        <View style={styles.titlePriceRow}>
                                            <Text style={[styles.modalTitle, { color: T.text, flex: 1, marginRight: 12 }]}>
                                                {selectedAd.adv_Title}
                                            </Text>
                                            <View style={[styles.pricePill, { backgroundColor: isDark ? 'rgba(194,65,12,0.18)' : 'rgba(194,65,12,0.09)' }]}>
                                                <Text style={[styles.modalPrice, { color: '#c2410c' }]}>₹{selectedAd.adv_Price}</Text>
                                            </View>
                                        </View>

                                        <View style={[styles.infoRow, { marginTop: 12 }]}>
                                            <View style={[styles.infoIconWrap, { backgroundColor: isDark ? 'rgba(251,146,60,0.15)' : 'rgba(251,146,60,0.1)' }]}>
                                                <Ionicons name="location" size={14} color="#fb923c" />
                                            </View>
                                            <Text style={[styles.infoText, { color: T.textSub }]} numberOfLines={2}>
                                                {selectedAd.adv_Address || "Location not provided"}
                                            </Text>
                                        </View>

                                        <View style={[styles.sectionDivider, { backgroundColor: T.divider }]} />

                                        <Text style={[styles.sectionLabel, { color: T.textMuted }]}>DESCRIPTION</Text>
                                        <Text style={[styles.modalDesc, { color: T.textSub }]}>
                                            {selectedAd.adv_Description || "No description provided."}
                                        </Text>
                                    </View>

                                    {/* Farmer Card */}
                                    <View style={[styles.farmerSection, { backgroundColor: T.farmerCard, borderColor: T.farmerBorder }]}>
                                        <Text style={[styles.sectionLabel, { color: T.textMuted, marginBottom: 12 }]}>SELLER INFORMATION</Text>

                                        <View style={styles.farmerRow}>
                                            {selectedAd.farmer?.profileImage ? (
                                                <Image source={{ uri: `${userUrl}/uploads/${selectedAd.farmer.profileImage}` }} style={styles.farmerAvatar} />
                                            ) : (
                                                <View style={[styles.farmerAvatarPlaceholder, { backgroundColor: T.inputBg }]}>
                                                    <Ionicons name="person" size={26} color={T.textMuted} />
                                                </View>
                                            )}
                                            <View style={styles.farmerInfo}>
                                                <Text style={[styles.farmerName, { color: T.text }]}>{selectedAd.farmer?.name || "Unknown Farmer"}</Text>
                                                <View style={styles.verifiedRow}>
                                                    <View style={[styles.verifiedDot, { backgroundColor: '#fb923c' }]} />
                                                    <Text style={[styles.farmerSub, { color: '#fb923c' }]}>Verified Farmer</Text>
                                                </View>
                                            </View>
                                            <TouchableOpacity
                                                style={[styles.quickCallBtn, { backgroundColor: isDark ? 'rgba(194,65,12,0.2)' : 'rgba(194,65,12,0.1)' }]}
                                                onPress={() => openDialer(selectedAd.farmer?.number)}
                                            >
                                                <Ionicons name="call" size={16} color="#c2410c" />
                                            </TouchableOpacity>
                                        </View>

                                        {selectedAd.farmer?.number && (
                                            <View style={[styles.phoneRow, { borderTopColor: T.divider }]}>
                                                <View style={[styles.infoIconWrap, { backgroundColor: isDark ? 'rgba(251,146,60,0.15)' : 'rgba(251,146,60,0.1)' }]}>
                                                    <Ionicons name="call-outline" size={13} color="#fb923c" />
                                                </View>
                                                <Text style={[styles.infoText, { color: T.textSub }]}>{selectedAd.farmer.number}</Text>
                                            </View>
                                        )}
                                    </View>
                                    <View style={{ height: 20 }} />
                                </ScrollView>

                                {/* Action Bar */}
                                <View style={[styles.actionRow, { borderTopColor: T.divider, backgroundColor: T.modal }]}>
                                    <TouchableOpacity
                                        style={[styles.actionBtnPrimary, { backgroundColor: '#c2410c' }]}
                                        onPress={() => openDialer(selectedAd.farmer?.number)}
                                        activeOpacity={0.85}
                                    >
                                        <Ionicons name="call" size={18} color="#fff" />
                                        <Text style={[styles.actionText, { color: '#fff' }]}>Call Farmer</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.actionBtnSecondary, { backgroundColor: T.inputBg, borderColor: T.cardBorder }]}
                                        onPress={() => Alert.alert("Chat", "Coming soon.")}
                                        activeOpacity={0.85}
                                    >
                                        <Ionicons name="chatbubble-ellipses" size={18} color={T.text} />
                                        <Text style={[styles.actionText, { color: T.text }]}>Chat</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.actionBtnSecondary, { backgroundColor: T.inputBg, borderColor: T.cardBorder }]}
                                        onPress={() => openMap(selectedAd.adv_Location?.latitude, selectedAd.adv_Location?.longitude)}
                                        activeOpacity={0.85}
                                    >
                                        <Ionicons name="navigate" size={18} color={T.text} />
                                        <Text style={[styles.actionText, { color: T.text }]}>Map</Text>
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

const styles = StyleSheet.create({
    container: { flex: 1 },
    loader: { flex: 1, justifyContent: "center", alignItems: "center" },

    list: { paddingHorizontal: 10, paddingBottom: 100 },
    emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 80, gap: 12 },
    emptyText: { fontSize: 16, fontWeight: '600' },

    card: {
        width: CARD_WIDTH, borderRadius: 20, margin: 6, overflow: "hidden",
        borderWidth: 1, elevation: 6,
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10,
    },
    image: { width: "100%", height: 140 },
    noImageBox: { width: "100%", height: 140, justifyContent: "center", alignItems: "center" },

    hotBadge: {
        position: 'absolute', top: 10, left: 10,
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: '#c2410c', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 10,
    },
    hotBadgeText: { fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },

    cardBody: { padding: 10 },
    title: { fontSize: 13, fontWeight: "800" },
    price: { marginTop: 4, fontSize: 15, fontWeight: "800" },
    bottomRow: { marginTop: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    locationRow: { flexDirection: "row", alignItems: "center", flex: 1, marginRight: 6, gap: 3 },
    location: { fontSize: 11, flex: 1 },
    viewRow: { flexDirection: "row", alignItems: "center", gap: 3 },
    viewText: { fontSize: 12, fontWeight: "700" },

    modalBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "flex-end" },
    modalDismissArea: { flex: 1 },
    modalSheet: { height: height * 0.88, borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: "hidden", borderWidth: 1, borderBottomWidth: 0 },
    modalHandle: { width: 44, height: 4, borderRadius: 2, alignSelf: "center", marginTop: 10, marginBottom: 4 },
    closeBtn: { position: "absolute", right: 16, top: 10, zIndex: 10 },
    closeBtnInner: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    modalImageWrap: { width: "100%", height: 230 },
    modalImage: { width: "100%", height: "100%" },
    modalNoImage: { flex: 1, justifyContent: "center", alignItems: "center" },
    viewCountOverlay: { position: "absolute", top: 12, left: 12, backgroundColor: "rgba(0,0,0,0.55)", flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, gap: 5 },
    viewCountText: { color: "#fff", fontSize: 12, fontWeight: '600' },
    hotBadgeModal: { position: 'absolute', top: 12, right: 12, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#c2410c', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
    section: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 4 },
    titlePriceRow: { flexDirection: 'row', alignItems: 'flex-start' },
    modalTitle: { fontSize: 21, fontWeight: "900", lineHeight: 27 },
    pricePill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, alignSelf: 'flex-start' },
    modalPrice: { fontSize: 17, fontWeight: "800" },
    infoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    infoIconWrap: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    infoText: { fontSize: 13, flex: 1, lineHeight: 18 },
    sectionDivider: { height: 1, marginVertical: 14 },
    sectionLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginBottom: 6 },
    modalDesc: { fontSize: 14, lineHeight: 22 },
    farmerSection: { marginHorizontal: 18, marginTop: 14, borderRadius: 20, padding: 16, borderWidth: 1 },
    farmerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    farmerAvatar: { width: 54, height: 54, borderRadius: 18 },
    farmerAvatarPlaceholder: { width: 54, height: 54, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    farmerInfo: { flex: 1 },
    farmerName: { fontSize: 16, fontWeight: "800" },
    verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
    verifiedDot: { width: 7, height: 7, borderRadius: 4 },
    farmerSub: { fontSize: 12, fontWeight: '600' },
    quickCallBtn: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1 },
    actionRow: { flexDirection: "row", paddingHorizontal: 16, paddingBottom: 28, paddingTop: 12, gap: 10, borderTopWidth: 1 },
    actionBtnPrimary: { flex: 2, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 18, gap: 7 },
    actionBtnSecondary: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 18, gap: 6, borderWidth: 1 },
    actionText: { fontWeight: "800", fontSize: 13 },
});