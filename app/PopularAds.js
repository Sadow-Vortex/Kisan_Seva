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

const { width, height } = Dimensions.get("window");
const CARD_WIDTH = width / 2 - 20;

export default function Popular() {
    const navigation = useNavigation();
    const { theme: T, isDark } = useTheme();

    const [ads, setAds]               = useState([]);
    const [users, setUsers]           = useState([]);
    const [loading, setLoading]       = useState(true);
    const [selectedAd, setSelectedAd] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const orb1Y = useRef(new Animated.Value(0)).current;
    const orb2X = useRef(new Animated.Value(0)).current;

    const url     = "https://advertisment-jfil.onrender.com";
    const userUrl = "https://kisan-seva-user.onrender.com";

    useLayoutEffect(() => { navigation.setOptions({ headerShown: false }); }, [navigation]);

    useEffect(() => {
        fetchPopularAds(); fetchUsers();
        const floatOrb = (anim, dur, range) =>
            Animated.loop(Animated.sequence([
                Animated.timing(anim, { toValue: range,  duration: dur, useNativeDriver: true }),
                Animated.timing(anim, { toValue: -range, duration: dur, useNativeDriver: true }),
            ])).start();
        floatOrb(orb1Y, 3200, 18);
        floatOrb(orb2X, 2700, 14);
    }, []);

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

    const closeModal  = () => { setModalVisible(false); setSelectedAd(null); };
    const openDialer  = (number) => { if (number) Linking.openURL(`tel:${number}`); };
    const openMap     = (lat, lng) => { if (lat && lng) Linking.openURL(`https://www.google.com/maps?q=${lat},${lng}`); };

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
                <View style={[styles.popularBadge, { backgroundColor: T.popularBadge }]}>
                    <Ionicons name="flame" size={10} color={T.popularBadgeText} />
                    <Text style={[styles.popularBadgeText, { color: T.popularBadgeText }]}>HOT</Text>
                </View>
                <View style={styles.cardBody}>
                    <Text numberOfLines={1} style={[styles.title, { color: T.text }]}>{item.adv_Title}</Text>
                    <Text style={[styles.price, { color: T.accent }]}>₹{item.adv_Price}</Text>
                    <View style={styles.bottomRow}>
                        <View style={styles.locationRow}>
                            <Ionicons name="location-outline" size={13} color={T.accent} />
                            <Text numberOfLines={1} style={[styles.location, { color: T.textSub }]}>
                                {item.adv_Address || "Location not set"}
                            </Text>
                        </View>
                        <View style={styles.viewRow}>
                            <Ionicons name="eye-outline" size={13} color={T.accent} />
                            <Text style={[styles.viewText, { color: T.accent }]}>{item.count}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) return (
        <View style={[styles.loader, { backgroundColor: T.bg }]}>
            <ActivityIndicator size="large" color={T.accent} />
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: T.bg }]}>
            <StatusBar barStyle={T.statusBar} />
            {isDark && (
                <>
                    <View style={styles.bgLayer2} />
                    <Animated.View style={[styles.orb1, { backgroundColor: T.orb1, transform: [{ translateY: orb1Y }] }]} />
                    <Animated.View style={[styles.orb2, { backgroundColor: T.orb2, transform: [{ translateX: orb2X }] }]} />
                </>
            )}

            <View style={styles.header}>
                <View style={styles.logoRow}>
                    <View style={[styles.logoGlow, { backgroundColor: isDark ? 'rgba(46,196,130,0.12)' : '#dcfce7' }]}>
                        <View style={[styles.logoRing, { borderColor: isDark ? 'rgba(46,196,130,0.4)' : '#86efac' }]}>
                            <Image source={require("../assets/images/Logo.png")} style={styles.logo} />
                        </View>
                    </View>
                    <View>
                        <Text style={[styles.brand, { color: T.accent }]}>Kisan Seva</Text>
                        <Text style={[styles.brandSub, { color: T.textSub }]}>Farm · Connect · Grow</Text>
                    </View>
                </View>
                <Text style={[styles.pageTitle, { color: T.text }]}>Popular Ads</Text>
                <View style={[styles.titleUnderline, { backgroundColor: T.accent }]} />
                <Text style={[styles.pageSub, { color: T.textSub }]}>Most viewed ads from farmers</Text>
            </View>

            {ads.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={{ fontSize: 48 }}>🔥</Text>
                    <Text style={[styles.emptyText, { color: T.textSub }]}>No popular ads yet</Text>
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

            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalBackground}>
                    <View style={[styles.modalSheet, { backgroundColor: T.modal, borderColor: T.modalBorder }]}>
                        {selectedAd && (
                            <>
                                <View style={[styles.modalHandle, { backgroundColor: T.divider }]} />
                                <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
                                    <View style={[styles.closeBtnInner, { backgroundColor: T.inputBg }]}>
                                        <Ionicons name="close" size={20} color={T.text} />
                                    </View>
                                </TouchableOpacity>
                                <ScrollView showsVerticalScrollIndicator={false}>
                                    <View style={styles.modalImageWrap}>
                                        {selectedAd.adv_Image ? (
                                            <Image source={{ uri: `${url}/uploads/${selectedAd.adv_Image}` }} style={styles.modalImage} />
                                        ) : (
                                            <View style={[styles.modalNoImage, { backgroundColor: T.inputBg }]}>
                                                <Ionicons name="image-outline" size={40} color={T.textMuted} />
                                            </View>
                                        )}
                                        <View style={styles.viewCountOverlay}>
                                            <Ionicons name="eye" size={14} color="#fff" />
                                            <Text style={styles.viewCountText}>{selectedAd.count || 0}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.modalBody}>
                                        <Text style={[styles.modalTitle, { color: T.text }]}>{selectedAd.adv_Title}</Text>
                                        <Text style={[styles.modalPrice, { color: T.accent }]}>₹{selectedAd.adv_Price}</Text>
                                        <View style={styles.modalLocationRow}>
                                            <Ionicons name="location" size={16} color={T.accent} />
                                            <Text style={[styles.modalLocation, { color: T.textSub }]}>{selectedAd.adv_Address}</Text>
                                        </View>
                                        <Text style={[styles.modalDesc, { color: T.textSub }]}>
                                            {selectedAd.adv_Description || "No description provided."}
                                        </Text>
                                        <View style={[styles.farmerCard, { backgroundColor: T.farmerCard, borderColor: T.farmerBorder }]}>
                                            <Text style={[styles.farmerHeader, { color: T.farmerText }]}>Farmer Information</Text>
                                            <View style={styles.farmerRow}>
                                                {selectedAd.farmer?.profileImage ? (
                                                    <Image source={{ uri: `${userUrl}/uploads/${selectedAd.farmer.profileImage}` }} style={styles.farmerAvatar} />
                                                ) : (
                                                    <View style={[styles.farmerAvatarPlaceholder, { backgroundColor: T.inputBg }]}>
                                                        <Ionicons name="person" size={26} color={T.textMuted} />
                                                    </View>
                                                )}
                                                <View style={{ marginLeft: 12 }}>
                                                    <Text style={[styles.farmerName, { color: T.text }]}>{selectedAd.farmer?.name || "Unknown"}</Text>
                                                    <Text style={[styles.farmerSub, { color: T.accent }]}>✓ Verified farmer</Text>
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                </ScrollView>
                                <View style={[styles.actionRow, { borderTopColor: T.divider }]}>
                                    {[
                                        { icon: 'call',                label: 'Call',     bg: T.accent,  textColor: T.accentBtn, onPress: () => openDialer(selectedAd.farmer?.number) },
                                        { icon: 'chatbubble-ellipses', label: 'Chat',     bg: T.inputBg, textColor: T.text,      onPress: () => Alert.alert("Chat", "Coming soon.") },
                                        { icon: 'navigate',            label: 'Navigate', bg: T.inputBg, textColor: T.text,      onPress: () => openMap(selectedAd.adv_Location?.latitude, selectedAd.adv_Location?.longitude) },
                                    ].map(btn => (
                                        <TouchableOpacity key={btn.label} style={[styles.actionBtn, { backgroundColor: btn.bg }]} onPress={btn.onPress}>
                                            <Ionicons name={btn.icon} size={18} color={btn.textColor} />
                                            <Text style={[styles.actionText, { color: btn.textColor }]}>{btn.label}</Text>
                                        </TouchableOpacity>
                                    ))}
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
    bgLayer2: { position: 'absolute', top: 0, left: 0, right: 0, height: 260, backgroundColor: '#0d1f3a', borderBottomLeftRadius: 60, borderBottomRightRadius: 60 },
    orb1: { position: 'absolute', width: 220, height: 220, borderRadius: 110, top: -60, right: -60 },
    orb2: { position: 'absolute', width: 160, height: 160, borderRadius: 80, top: 200, left: -50 },

    header: { paddingTop: 52, paddingBottom: 14, paddingHorizontal: 16 },
    logoRow: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
    logoGlow: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    logoRing: { width: 44, height: 44, borderRadius: 13, borderWidth: 1.5, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
    logo: { width: 50, height: 50, resizeMode: 'cover' },
    brand: { fontSize: 18, fontWeight: "900", letterSpacing: 1 },
    brandSub: { fontSize: 11, fontWeight: "500", letterSpacing: 1.5 },
    pageTitle: { fontSize: 30, fontWeight: "900" },
    titleUnderline: { width: 40, height: 2.5, borderRadius: 2, marginTop: 6, marginBottom: 6 },
    pageSub: { fontSize: 13, fontWeight: "500" },

    list: { paddingHorizontal: 10, paddingBottom: 100, paddingTop: 10 },
    emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
    emptyText: { fontSize: 16, fontWeight: '600' },

    card: { width: CARD_WIDTH, borderRadius: 20, margin: 6, overflow: "hidden", borderWidth: 1, elevation: 6, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10 },
    image: { width: "100%", height: 130 },
    noImageBox: { width: "100%", height: 130, justifyContent: "center", alignItems: "center" },
    popularBadge: { position: "absolute", top: 10, left: 10, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
    popularBadgeText: { fontSize: 10, fontWeight: "800" },
    cardBody: { padding: 10 },
    title: { fontSize: 13, fontWeight: "800" },
    price: { marginTop: 4, fontSize: 15, fontWeight: "800" },
    bottomRow: { marginTop: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    locationRow: { flexDirection: "row", alignItems: "center", flex: 1, marginRight: 6, gap: 3 },
    location: { fontSize: 11, flex: 1 },
    viewRow: { flexDirection: "row", alignItems: "center", gap: 3 },
    viewText: { fontSize: 12, fontWeight: "700" },

    modalBackground: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
    modalSheet: { height: height * 0.86, borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: "hidden", borderWidth: 1, borderBottomWidth: 0 },
    modalHandle: { width: 50, height: 4, borderRadius: 2, alignSelf: "center", marginTop: 10, marginBottom: 6 },
    closeBtn: { position: "absolute", right: 16, top: 10, zIndex: 10 },
    closeBtnInner: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
    modalImageWrap: { width: "100%", height: 220 },
    modalImage: { width: "100%", height: "100%" },
    modalNoImage: { flex: 1, justifyContent: "center", alignItems: "center" },
    viewCountOverlay: { position: "absolute", top: 12, left: 12, backgroundColor: "rgba(0,0,0,0.6)", flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 14 },
    viewCountText: { color: "#fff", marginLeft: 4, fontSize: 12, fontWeight: '600' },
    modalBody: { padding: 18 },
    modalTitle: { fontSize: 20, fontWeight: "900" },
    modalPrice: { marginTop: 4, fontSize: 19, fontWeight: "800" },
    modalLocationRow: { flexDirection: "row", alignItems: "center", marginTop: 8, gap: 6 },
    modalLocation: { fontSize: 13, flex: 1 },
    modalDesc: { marginTop: 10, fontSize: 14, lineHeight: 20 },
    farmerCard: { marginTop: 16, borderRadius: 16, padding: 14, borderWidth: 1 },
    farmerHeader: { fontWeight: "800", marginBottom: 10, fontSize: 13 },
    farmerRow: { flexDirection: "row", alignItems: "center" },
    farmerAvatar: { width: 52, height: 52, borderRadius: 26 },
    farmerAvatarPlaceholder: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
    farmerName: { fontSize: 15, fontWeight: "800" },
    farmerSub: { fontSize: 12, fontWeight: '600', marginTop: 2 },
    actionRow: { flexDirection: "row", paddingHorizontal: 14, paddingBottom: 20, paddingTop: 12, justifyContent: "space-between", gap: 10, borderTopWidth: 1 },
    actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 13, borderRadius: 16, gap: 6 },
    actionText: { fontWeight: "800", fontSize: 13 },
});