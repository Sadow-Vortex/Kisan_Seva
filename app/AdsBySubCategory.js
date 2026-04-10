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

const { width, height } = Dimensions.get("window");

export default function AdsBySubCategory() {
    const navigation = useNavigation();
    const { subCategoryId } = useLocalSearchParams();
    const { theme: T, isDark } = useTheme();

    const [ads, setAds]               = useState([]);
    const [users, setUsers]           = useState([]);
    const [loading, setLoading]       = useState(true);
    const [selectedAd, setSelectedAd] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const orb1Y = useRef(new Animated.Value(0)).current;
    const url     = `https://advertisment-jfil.onrender.com`;
    const userUrl = `https://kisan-seva-user.onrender.com`;

    useLayoutEffect(() => { navigation.setOptions({ headerShown: false }); });

    useEffect(() => {
        if (subCategoryId) { fetchAds(); fetchUsers(); }
        Animated.loop(Animated.sequence([
            Animated.timing(orb1Y, { toValue: 16, duration: 3000, useNativeDriver: true }),
            Animated.timing(orb1Y, { toValue: -16, duration: 3000, useNativeDriver: true }),
        ])).start();
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
        <TouchableOpacity activeOpacity={0.88} onPress={() => openModal(item)}
                          style={[styles.card, { backgroundColor: T.card, borderColor: T.cardBorder }]}>
            <View style={styles.imageWrapper}>
                {item.adv_Image ? (
                    <Image source={{ uri: `${url}/uploads/${item.adv_Image}` }} style={styles.image} />
                ) : (
                    <View style={[styles.imagePlaceholder, { backgroundColor: T.inputBg }]}>
                        <Ionicons name="image-outline" size={40} color={T.textMuted} />
                    </View>
                )}
                <View style={[styles.priceBadge, { backgroundColor: T.priceBadge }]}>
                    <Text style={[styles.priceBadgeText, { color: T.priceBadgeText }]}>₹{item.adv_Price}</Text>
                </View>
            </View>
            <View style={styles.cardBody}>
                <Text numberOfLines={1} style={[styles.title, { color: T.text }]}>{item.adv_Title}</Text>
                <View style={styles.locationRow}>
                    <Ionicons name="location" size={13} color={T.accent} />
                    <Text numberOfLines={1} style={[styles.location, { color: T.textSub }]}>{item.adv_Address}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

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
                </>
            )}

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: T.inputBg }]}>
                    <Ionicons name="arrow-back" size={22} color={T.text} />
                </TouchableOpacity>
                <View style={styles.logoRow}>
                    <View style={[styles.logoGlow, { backgroundColor: isDark ? 'rgba(46,196,130,0.12)' : '#dcfce7' }]}>
                        <View style={[styles.logoRing, { borderColor: isDark ? 'rgba(46,196,130,0.4)' : '#86efac' }]}>
                            <Image source={require("../assets/images/Logo.png")} style={styles.logo} />
                        </View>
                    </View>
                    <View>
                        <Text style={[styles.brand, { color: T.accent }]}>Kisan Seva</Text>
                        <Text style={[styles.brandSub, { color: T.textSub }]}>your trusted farmer platform</Text>
                    </View>
                </View>
            </View>

            {ads.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={{ fontSize: 48 }}>🌾</Text>
                    <Text style={[styles.emptyText, { color: T.textSub }]}>No Ads posted here yet</Text>
                </View>
            ) : (
                <FlatList
                    data={ads}
                    keyExtractor={(item) => item.adv_id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 120, paddingTop: 6 }}
                    showsVerticalScrollIndicator={false}
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
                                        { icon: 'call', label: 'Call', bg: T.accent, tc: T.accentBtn, onPress: () => openDialer(selectedAd.farmer?.number) },
                                        { icon: 'chatbubble-ellipses', label: 'Chat', bg: T.inputBg, tc: T.text, onPress: () => Alert.alert("Chat", "Coming soon.") },
                                        { icon: 'navigate', label: 'Navigate', bg: T.inputBg, tc: T.text, onPress: () => openMap(selectedAd.adv_Location?.latitude, selectedAd.adv_Location?.longitude) },
                                    ].map(btn => (
                                        <TouchableOpacity key={btn.label} style={[styles.actionBtn, { backgroundColor: btn.bg }]} onPress={btn.onPress}>
                                            <Ionicons name={btn.icon} size={18} color={btn.tc} />
                                            <Text style={[styles.actionText, { color: btn.tc }]}>{btn.label}</Text>
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
    bgLayer2: { position: 'absolute', top: 0, left: 0, right: 0, height: 240, backgroundColor: '#0d1f3a', borderBottomLeftRadius: 60, borderBottomRightRadius: 60 },
    orb1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, top: -40, right: -40 },

    header: { paddingTop: 52, paddingBottom: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
    backBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    logoRow: { flexDirection: "row", alignItems: "center", flex: 1 },
    logoGlow: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
    logoRing: { width: 38, height: 38, borderRadius: 11, borderWidth: 1.5, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
    logo: { width: 44, height: 44, resizeMode: 'cover' },
    brand: { fontSize: 16, fontWeight: "900", letterSpacing: 0.5 },
    brandSub: { fontSize: 11, fontWeight: "500" },

    card: { marginBottom: 14, borderRadius: 20, overflow: "hidden", borderWidth: 1, elevation: 6, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10 },
    imageWrapper: { width: "100%", height: 180 },
    image: { width: "100%", height: "100%" },
    imagePlaceholder: { flex: 1, justifyContent: "center", alignItems: "center" },
    priceBadge: { position: "absolute", right: 12, bottom: 12, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
    priceBadgeText: { fontWeight: "800", fontSize: 15 },
    cardBody: { padding: 14 },
    title: { fontSize: 16, fontWeight: "800" },
    locationRow: { flexDirection: "row", alignItems: "center", marginTop: 6, gap: 4 },
    location: { fontSize: 12, flex: 1 },

    emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
    emptyText: { fontSize: 16, fontWeight: '600' },

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