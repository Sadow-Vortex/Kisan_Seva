// AdsBySubCategory.js
import React, { useEffect, useLayoutEffect, useState, useRef } from 'react';
import {
    View, Text, Image, FlatList, Modal,
    TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Linking, Dimensions,
    Animated, StatusBar, ScrollView
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import Footer from "./Footer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useLocalSearchParams } from "expo-router";
import { useTheme } from "./Themecontext";
import ScreenHeader from "./Screenheader";

const { width, height } = Dimensions.get("window");
const EXPANDED_H  = 180;
const COLLAPSED_H = 88;

export default function AdsBySubCategory() {
    const navigation = useNavigation();
    const { subCategoryId } = useLocalSearchParams();
    const { theme: T, isDark } = useTheme();

    const [ads, setAds]               = useState([]);
    const [users, setUsers]           = useState([]);
    const [loading, setLoading]       = useState(true);
    const [selectedAd, setSelectedAd] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const scrollY = useRef(new Animated.Value(0)).current;
    const url     = `https://advertisment-jfil.onrender.com`;
    const userUrl = `https://kisan-seva-user.onrender.com`;

    useLayoutEffect(() => { navigation.setOptions({ headerShown: false }); });

    useEffect(() => {
        if (subCategoryId) { fetchAds(); fetchUsers(); }
    }, [subCategoryId]);

    const fetchAds = async () => {
        try {
            const res = await axios.get(`${url}/adv/subCategory/${subCategoryId}`);
            setAds(Array.isArray(res.data.data) ? res.data.data : []);
        } catch { } finally { setLoading(false); }
    };

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${userUrl}/api/users/`, { timeout: 10000 });
            setUsers(Array.isArray(res?.data?.data) ? res.data.data : []);
        } catch { }
    };

    const openModal = async (ad) => {
        try {
            const storedUser = await AsyncStorage.getItem('user');
            const viewerId   = storedUser ? JSON.parse(storedUser)?.id : null;
            if (!viewerId) { Alert.alert("Login Error", "Please log in to view this ad."); return; }
            const res        = await axios.get(`${url}/adv/${ad.adv_id}?viewerId=${viewerId}`);
            const updatedAd  = res.data?.data;
            const farmer = users.find(u => String(u.id) === String(updatedAd.advUserID));
            setSelectedAd({ ...updatedAd, farmer });
            setModalVisible(true);
        } catch { Alert.alert("Error", "Failed to load ad. Try again."); }
    };

    const closeModal = () => { setModalVisible(false); setSelectedAd(null); };
    const openDialer = (number) => { if (number) Linking.openURL(`tel:${number}`); };
    const openMap    = (lat, lng) => { if (lat && lng) Linking.openURL(`https://www.google.com/maps?q=${lat},${lng}`); };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            activeOpacity={0.88}
            onPress={() => openModal(item)}
            style={[styles.card, { backgroundColor: T.card, borderColor: T.cardBorder }]}
        >
            <View style={styles.imageWrapper}>
                {item.adv_Image ? (
                    <Image source={{ uri: `${url}/uploads/${item.adv_Image}` }} style={styles.image} />
                ) : (
                    <View style={[styles.imagePlaceholder, { backgroundColor: T.inputBg }]}>
                        <Ionicons name="image-outline" size={40} color={T.textMuted} />
                    </View>
                )}
                {/* Price chip */}
                <View style={styles.priceChip}>
                    <Text style={styles.priceChipText}>₹{item.adv_Price}</Text>
                </View>
            </View>
            <View style={styles.cardBody}>
                <Text numberOfLines={1} style={[styles.title, { color: T.text }]}>{item.adv_Title}</Text>
                <View style={styles.locationRow}>
                    <Ionicons name="location" size={13} color="#818cf8" />
                    <Text numberOfLines={1} style={[styles.location, { color: T.textSub }]}>{item.adv_Address}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    if (loading) return (
        <View style={[styles.loader, { backgroundColor: T.bg }]}>
            <ActivityIndicator size="large" color="#818cf8" />
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: T.bg }]}>
            <StatusBar barStyle="light-content" />

            <ScreenHeader
                screen="Home"
                scrollY={scrollY}
                title="Browse Ads"
                subtitle="Tap an ad to view details"
                showBack
                onBack={() => navigation.goBack()}
                badge={ads.length > 0 ? { value: ads.length, label: 'ads available' } : null}
                EXPANDED_H={EXPANDED_H}
                COLLAPSED_H={COLLAPSED_H}
            />

            {ads.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={{ fontSize: 48 }}>🌾</Text>
                    <Text style={[styles.emptyText, { color: T.textSub }]}>No Ads posted here yet</Text>
                </View>
            ) : (
                <Animated.FlatList
                    data={ads}
                    keyExtractor={(item) => item.adv_id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 120, paddingTop: 14 }}
                    showsVerticalScrollIndicator={false}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: false }
                    )}
                    scrollEventThrottle={16}
                />
            )}

            {/* ── Polished Modal ── */}
            <Modal visible={modalVisible} transparent animationType="slide" statusBarTranslucent>
                <View style={styles.modalBackground}>
                    <TouchableOpacity style={styles.modalDismissArea} onPress={closeModal} activeOpacity={1} />

                    <View style={[styles.modalSheet, { backgroundColor: T.modal, borderColor: T.modalBorder }]}>
                        {selectedAd && (
                            <>
                                {/* Drag handle */}
                                <View style={[styles.modalHandle, { backgroundColor: T.divider }]} />

                                {/* Close button */}
                                <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
                                    <View style={[styles.closeBtnInner, { backgroundColor: T.inputBg }]}>
                                        <Ionicons name="close" size={18} color={T.text} />
                                    </View>
                                </TouchableOpacity>

                                <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                                    {/* ── Hero Image ── */}
                                    <View style={styles.modalImageWrap}>
                                        {selectedAd.adv_Image ? (
                                            <Image
                                                source={{ uri: `${url}/uploads/${selectedAd.adv_Image}` }}
                                                style={styles.modalImage}
                                            />
                                        ) : (
                                            <View style={[styles.modalNoImage, { backgroundColor: T.inputBg }]}>
                                                <Ionicons name="image-outline" size={48} color={T.textMuted} />
                                            </View>
                                        )}
                                        {/* View count pill */}
                                        <View style={styles.viewCountOverlay}>
                                            <Ionicons name="eye" size={13} color="#fff" />
                                            <Text style={styles.viewCountText}>{selectedAd.count || 0} views</Text>
                                        </View>
                                    </View>

                                    {/* ── Product Details Section ── */}
                                    <View style={[styles.section, { backgroundColor: T.modal }]}>
                                        {/* Title + Price Row */}
                                        <View style={styles.titlePriceRow}>
                                            <Text style={[styles.modalTitle, { color: T.text, flex: 1, marginRight: 12 }]}>
                                                {selectedAd.adv_Title}
                                            </Text>
                                            <View style={[styles.pricePill, { backgroundColor: isDark ? 'rgba(99,102,241,0.18)' : 'rgba(67,56,202,0.09)' }]}>
                                                <Text style={[styles.modalPrice, { color: '#4338ca' }]}>₹{selectedAd.adv_Price}</Text>
                                            </View>
                                        </View>

                                        {/* Location row */}
                                        <View style={[styles.infoRow, { marginTop: 12 }]}>
                                            <View style={[styles.infoIconWrap, { backgroundColor: isDark ? 'rgba(129,140,248,0.15)' : 'rgba(129,140,248,0.1)' }]}>
                                                <Ionicons name="location" size={14} color="#818cf8" />
                                            </View>
                                            <Text style={[styles.infoText, { color: T.textSub }]} numberOfLines={2}>
                                                {selectedAd.adv_Address || "Location not provided"}
                                            </Text>
                                        </View>

                                        {/* Divider */}
                                        <View style={[styles.sectionDivider, { backgroundColor: T.divider }]} />

                                        {/* Description label */}
                                        <Text style={[styles.sectionLabel, { color: T.textMuted }]}>DESCRIPTION</Text>
                                        <Text style={[styles.modalDesc, { color: T.textSub }]}>
                                            {selectedAd.adv_Description || "No description provided."}
                                        </Text>
                                    </View>

                                    {/* ── Farmer Card ── */}
                                    <View style={[styles.farmerSection, { backgroundColor: T.farmerCard, borderColor: T.farmerBorder }]}>
                                        <Text style={[styles.sectionLabel, { color: T.textMuted, marginBottom: 12 }]}>SELLER INFORMATION</Text>

                                        <View style={styles.farmerRow}>
                                            {/* Avatar */}
                                            {selectedAd.farmer?.profileImage ? (
                                                <Image
                                                    source={{ uri: `${userUrl}/uploads/${selectedAd.farmer.profileImage}` }}
                                                    style={styles.farmerAvatar}
                                                />
                                            ) : (
                                                <View style={[styles.farmerAvatarPlaceholder, { backgroundColor: T.inputBg }]}>
                                                    <Ionicons name="person" size={26} color={T.textMuted} />
                                                </View>
                                            )}

                                            {/* Info */}
                                            <View style={styles.farmerInfo}>
                                                <Text style={[styles.farmerName, { color: T.text }]}>
                                                    {selectedAd.farmer?.name || "Unknown Farmer"}
                                                </Text>
                                                <View style={styles.verifiedRow}>
                                                    <View style={styles.verifiedDot} />
                                                    <Text style={[styles.farmerSub, { color: '#818cf8' }]}>Verified Farmer</Text>
                                                </View>
                                            </View>

                                            {/* Quick call button inside farmer card */}
                                            <TouchableOpacity
                                                style={[styles.quickCallBtn, { backgroundColor: isDark ? 'rgba(67,56,202,0.2)' : 'rgba(67,56,202,0.1)' }]}
                                                onPress={() => openDialer(selectedAd.farmer?.number)}
                                            >
                                                <Ionicons name="call" size={16} color="#4338ca" />
                                            </TouchableOpacity>
                                        </View>

                                        {/* Phone number row */}
                                        {selectedAd.farmer?.number && (
                                            <View style={[styles.phoneRow, { borderTopColor: T.divider }]}>
                                                <View style={[styles.infoIconWrap, { backgroundColor: isDark ? 'rgba(129,140,248,0.15)' : 'rgba(129,140,248,0.1)' }]}>
                                                    <Ionicons name="call-outline" size={13} color="#818cf8" />
                                                </View>
                                                <Text style={[styles.infoText, { color: T.textSub }]}>
                                                    {selectedAd.farmer.number}
                                                </Text>
                                            </View>
                                        )}
                                    </View>

                                    <View style={{ height: 20 }} />
                                </ScrollView>

                                {/* ── Action Bar ── */}
                                <View style={[styles.actionRow, { borderTopColor: T.divider, backgroundColor: T.modal }]}>
                                    <TouchableOpacity
                                        style={[styles.actionBtnPrimary, { backgroundColor: '#4338ca' }]}
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

    /* ── Cards ── */
    card: {
        marginBottom: 14, borderRadius: 20, overflow: "hidden", borderWidth: 1,
        elevation: 6, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10,
    },
    imageWrapper: { width: "100%", height: 180 },
    image: { width: "100%", height: "100%" },
    imagePlaceholder: { flex: 1, justifyContent: "center", alignItems: "center" },
    priceChip: {
        position: 'absolute', right: 12, bottom: 12,
        backgroundColor: '#4338ca', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
    },
    priceChipText: { fontWeight: '800', fontSize: 15, color: '#fff' },
    cardBody: { padding: 14 },
    title: { fontSize: 16, fontWeight: "800" },
    locationRow: { flexDirection: "row", alignItems: "center", marginTop: 6, gap: 4 },
    location: { fontSize: 12, flex: 1 },

    emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
    emptyText: { fontSize: 16, fontWeight: '600' },

    /* ── Modal ── */
    modalBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.65)", justifyContent: "flex-end" },
    modalDismissArea: { flex: 1 },
    modalSheet: {
        height: height * 0.88,
        borderTopLeftRadius: 30, borderTopRightRadius: 30,
        overflow: "hidden", borderWidth: 1, borderBottomWidth: 0,
    },
    modalHandle: {
        width: 44, height: 4, borderRadius: 2,
        alignSelf: "center", marginTop: 10, marginBottom: 4,
    },
    closeBtn: { position: "absolute", right: 16, top: 10, zIndex: 10 },
    closeBtnInner: {
        width: 32, height: 32, borderRadius: 16,
        justifyContent: 'center', alignItems: 'center',
    },

    /* ── Modal Hero Image ── */
    modalImageWrap: { width: "100%", height: 230 },
    modalImage: { width: "100%", height: "100%" },
    modalNoImage: { flex: 1, justifyContent: "center", alignItems: "center" },
    viewCountOverlay: {
        position: "absolute", top: 12, left: 12,
        backgroundColor: "rgba(0,0,0,0.55)",
        flexDirection: "row", alignItems: "center",
        paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, gap: 5,
    },
    viewCountText: { color: "#fff", fontSize: 12, fontWeight: '600' },

    /* ── Product Details Section ── */
    section: { paddingHorizontal: 18, paddingTop: 18, paddingBottom: 4 },
    titlePriceRow: { flexDirection: 'row', alignItems: 'flex-start' },
    modalTitle: { fontSize: 21, fontWeight: "900", lineHeight: 27 },
    pricePill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, alignSelf: 'flex-start' },
    modalPrice: { fontSize: 17, fontWeight: "800" },

    infoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    infoIconWrap: {
        width: 28, height: 28, borderRadius: 8,
        justifyContent: 'center', alignItems: 'center',
    },
    infoText: { fontSize: 13, flex: 1, lineHeight: 18 },

    sectionDivider: { height: 1, marginVertical: 14 },
    sectionLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginBottom: 6 },
    modalDesc: { fontSize: 14, lineHeight: 22 },

    /* ── Farmer Card ── */
    farmerSection: {
        marginHorizontal: 18, marginTop: 14,
        borderRadius: 20, padding: 16, borderWidth: 1,
    },
    farmerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
    farmerAvatar: { width: 54, height: 54, borderRadius: 18 },
    farmerAvatarPlaceholder: {
        width: 54, height: 54, borderRadius: 18,
        justifyContent: 'center', alignItems: 'center',
    },
    farmerInfo: { flex: 1 },
    farmerName: { fontSize: 16, fontWeight: "800" },
    verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
    verifiedDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#818cf8' },
    farmerSub: { fontSize: 12, fontWeight: '600' },
    quickCallBtn: {
        width: 38, height: 38, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center',
    },
    phoneRow: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        marginTop: 12, paddingTop: 12, borderTopWidth: 1,
    },

    /* ── Action Bar ── */
    actionRow: {
        flexDirection: "row", paddingHorizontal: 16,
        paddingBottom: 28, paddingTop: 12, gap: 10, borderTopWidth: 1,
    },
    actionBtnPrimary: {
        flex: 2, flexDirection: "row", alignItems: "center",
        justifyContent: "center", paddingVertical: 14,
        borderRadius: 18, gap: 7,
    },
    actionBtnSecondary: {
        flex: 1, flexDirection: "row", alignItems: "center",
        justifyContent: "center", paddingVertical: 14,
        borderRadius: 18, gap: 6, borderWidth: 1,
    },
    actionText: { fontWeight: "800", fontSize: 13 },
});