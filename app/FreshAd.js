import React, { useEffect, useLayoutEffect, useState, useCallback, useRef } from "react";
import {
    View, Text, StyleSheet, FlatList, Image, TouchableOpacity,
    ActivityIndicator, Dimensions, Modal, Alert, Linking, RefreshControl,
    Animated, StatusBar, ScrollView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import Footer from "./Footer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useTheme } from "./Themecontext";
import ScreenHeader from "./Screenheader";

const { width, height } = Dimensions.get("window");
const CARD_WIDTH = width / 2 - 20;
const EXPANDED_H  = 200;
const COLLAPSED_H = 90;

export default function FreshAd() {
    const navigation = useNavigation();
    const { theme: T, isDark } = useTheme();

    const [ads, setAds]               = useState([]);
    const [users, setUsers]           = useState([]);
    const [loading, setLoading]       = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedAd, setSelectedAd] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const scrollY = useRef(new Animated.Value(0)).current;

    const url     = "https://advertisment-jfil.onrender.com";
    const userUrl = "https://kisan-seva-user.onrender.com";

    useLayoutEffect(() => { navigation.setOptions({ headerShown: false }); }, []);

    useEffect(() => { fetchFreshAds(); fetchUsers(); }, []);

    const fetchFreshAds = async () => {
        try {
            const res  = await fetch(`${url}/adv`);
            const json = await res.json();
            const list = Array.isArray(json?.data) ? json.data : [];
            setAds(list.filter(a => a.adv_Status === true).sort((a, b) => new Date(b.adv_Date) - new Date(a.adv_Date)));
        } catch (e) { console.log(e); }
        finally { setLoading(false); setRefreshing(false); }
    };

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${userUrl}/api/users`);
            setUsers(Array.isArray(response.data.data) ? response.data.data : []);
        } catch { }
    };

    const onRefresh = useCallback(() => { setRefreshing(true); fetchFreshAds(); }, []);

    const openModal = async (ad) => {
        try {
            if (users.length === 0) {
                await fetchUsers();   // ✅ ensure users exist
            }

            const storedUser = await AsyncStorage.getItem('user');
            const viewerId   = storedUser ? JSON.parse(storedUser)?.id : null;

            if (!viewerId) {
                Alert.alert("Login Error", "Please log in to view this ad.");
                return;
            }

            const response  = await axios.get(`${url}/adv/${ad.adv_id}?viewerId=${viewerId}`);
            const updatedAd = response.data?.data;

            let farmer = users.find(u => u.id === updatedAd.advUserID);

            if (!farmer) {
                try {
                    const ur = await axios.get(`${userUrl}/api/users/${updatedAd.advUserID}`);
                    farmer = ur.data?.data;
                } catch {}
            }

            setSelectedAd({
                ...updatedAd,
                farmer,
                adv_ImageLink: updatedAd.adv_Image
                    ? `${url}/uploads/${updatedAd.adv_Image}`
                    : null
            });

            setModalVisible(true);

        } catch {
            Alert.alert("Error", "Failed to load ad. Try again.");
        }
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
                {/* NEW badge */}
                <View style={styles.newBadge}>
                    <View style={styles.newBadgeDot} />
                    <Text style={styles.newBadgeText}>NEW</Text>
                </View>
                <View style={styles.cardBody}>
                    <Text numberOfLines={1} style={[styles.title, { color: T.text }]}>{item.adv_Title}</Text>
                    <Text style={[styles.price, { color: '#059669' }]}>₹{item.adv_Price}</Text>
                </View>
            </TouchableOpacity>
        );
    };

    if (loading) return (
        <View style={[styles.loader, { backgroundColor: T.bg }]}>
            <ActivityIndicator size="large" color="#34d399" />
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: T.bg }]}>
            <StatusBar barStyle="light-content" />

            {/* ── Next-gen Header ── */}
            <ScreenHeader
                screen="FreshAd"
                scrollY={scrollY}
                logo
                badge={{ value: ads.length, label: 'fresh ads today' }}
                EXPANDED_H={EXPANDED_H}
                COLLAPSED_H={COLLAPSED_H}
            />

            <Animated.FlatList
                data={ads}
                keyExtractor={(item) => item.adv_id.toString()}
                renderItem={renderItem}
                numColumns={2}
                contentContainerStyle={[styles.list, { paddingTop: 14 }]}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#34d399"]} tintColor="#34d399" />}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                    { useNativeDriver: false }
                )}
                scrollEventThrottle={16}
                showsVerticalScrollIndicator={false}
            />

            {/* ── Ad Detail Modal ── */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                statusBarTranslucent
            >
                <View style={styles.modalBackground}>

                    {/* ✅ Tap outside to close */}
                    <TouchableOpacity
                        style={{ flex: 1 }}
                        activeOpacity={1}
                        onPress={closeModal}
                    />

                    <View style={[
                        styles.modalSheet,
                        { backgroundColor: T.modal, borderColor: T.modalBorder }
                    ]}>

                        {selectedAd && (
                            <>
                                {/* Handle */}
                                <View style={[
                                    styles.modalHandle,
                                    { backgroundColor: T.divider }
                                ]} />

                                {/* Close Button */}
                                <TouchableOpacity
                                    onPress={closeModal}
                                    style={styles.closeBtn}
                                >
                                    <View style={[
                                        styles.closeBtnInner,
                                        { backgroundColor: T.inputBg }
                                    ]}>
                                        <Ionicons name="close" size={20} color={T.text} />
                                    </View>
                                </TouchableOpacity>

                                <ScrollView
                                    showsVerticalScrollIndicator={false}
                                    bounces={false}
                                >
                                    {/* Image */}
                                    <View style={styles.modalImageWrap}>
                                        {selectedAd.adv_ImageLink ? (
                                            <Image
                                                source={{ uri: selectedAd.adv_ImageLink }}
                                                style={styles.modalImage}
                                            />
                                        ) : (
                                            <View style={[
                                                styles.modalNoImage,
                                                { backgroundColor: T.inputBg }
                                            ]}>
                                                <Ionicons
                                                    name="image-outline"
                                                    size={40}
                                                    color={T.textMuted}
                                                />
                                            </View>
                                        )}

                                        {/* Views */}
                                        <View style={styles.viewCountOverlay}>
                                            <Ionicons name="eye" size={14} color="#fff" />
                                            <Text style={styles.viewCountText}>
                                                {selectedAd.count || 0} views
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Body */}
                                    <View style={styles.modalBody}>
                                        <Text style={[
                                            styles.modalTitle,
                                            { color: T.text }
                                        ]}>
                                            {selectedAd.adv_Title}
                                        </Text>

                                        <Text style={[
                                            styles.modalPrice,
                                            { color: '#059669' }
                                        ]}>
                                            ₹{selectedAd.adv_Price}
                                        </Text>

                                        {/* Location */}
                                        <View style={styles.modalLocationRow}>
                                            <Ionicons
                                                name="location"
                                                size={16}
                                                color="#059669"
                                            />
                                            <Text style={[
                                                styles.modalLocation,
                                                { color: T.textSub }
                                            ]}>
                                                {selectedAd.adv_Address || "No location"}
                                            </Text>
                                        </View>

                                        {/* Description */}
                                        <Text style={[
                                            styles.modalDesc,
                                            { color: T.textSub }
                                        ]}>
                                            {selectedAd.adv_Description || "No description provided."}
                                        </Text>

                                        {/* Farmer */}
                                        <View style={[
                                            styles.farmerCard,
                                            {
                                                backgroundColor: T.farmerCard,
                                                borderColor: T.farmerBorder
                                            }
                                        ]}>
                                            <Text style={[
                                                styles.farmerHeader,
                                                { color: T.text }
                                            ]}>
                                                Farmer Information
                                            </Text>

                                            <View style={styles.farmerRow}>
                                                {selectedAd.farmer?.profileImage ? (
                                                    <Image
                                                        source={{
                                                            uri: `${userUrl}/uploads/${selectedAd.farmer.profileImage}`
                                                        }}
                                                        style={styles.farmerAvatar}
                                                    />
                                                ) : (
                                                    <View style={[
                                                        styles.farmerAvatarPlaceholder,
                                                        { backgroundColor: T.inputBg }
                                                    ]}>
                                                        <Ionicons
                                                            name="person"
                                                            size={26}
                                                            color={T.textMuted}
                                                        />
                                                    </View>
                                                )}

                                                <View style={{ marginLeft: 12 }}>
                                                    <Text style={[
                                                        styles.farmerName,
                                                        { color: T.text }
                                                    ]}>
                                                        {selectedAd.farmer?.name || "Unknown Farmer"}
                                                    </Text>

                                                    <Text style={[
                                                        styles.farmerSub,
                                                        { color: '#059669' }
                                                    ]}>
                                                        ✓ Verified farmer
                                                    </Text>
                                                </View>
                                            </View>

                                            {/* Phone */}
                                            {selectedAd.farmer?.number && (
                                                <Text style={{
                                                    marginTop: 10,
                                                    color: T.textSub,
                                                    fontWeight: '600'
                                                }}>
                                                    📞 {selectedAd.farmer.number}
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                </ScrollView>

                                {/* Actions */}
                                <View style={[
                                    styles.actionRow,
                                    { borderTopColor: T.divider }
                                ]}>

                                    <TouchableOpacity
                                        style={[styles.actionBtn, { backgroundColor: '#059669' }]}
                                        onPress={() => openDialer(selectedAd.farmer?.number)}
                                    >
                                        <Ionicons name="call" size={18} color="#fff" />
                                        <Text style={[styles.actionText, { color: '#fff' }]}>
                                            Call
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.actionBtn, { backgroundColor: T.inputBg }]}
                                        onPress={() => Alert.alert("Chat", "Coming soon.")}
                                    >
                                        <Ionicons name="chatbubble-ellipses" size={18} color={T.text} />
                                        <Text style={[styles.actionText, { color: T.text }]}>
                                            Chat
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.actionBtn, { backgroundColor: T.inputBg }]}
                                        onPress={() =>
                                            openMap(
                                                selectedAd.adv_Location?.latitude,
                                                selectedAd.adv_Location?.longitude
                                            )
                                        }
                                    >
                                        <Ionicons name="navigate" size={18} color={T.text} />
                                        <Text style={[styles.actionText, { color: T.text }]}>
                                            Navigate
                                        </Text>
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

    card: {
        width: CARD_WIDTH, borderRadius: 20, margin: 6, overflow: "hidden",
        borderWidth: 1, elevation: 6,
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10,
    },
    image: { width: "100%", height: 140 },
    noImageBox: { width: "100%", height: 140, justifyContent: "center", alignItems: "center" },

    newBadge: {
        position: 'absolute', top: 10, left: 10,
        flexDirection: 'row', alignItems: 'center', gap: 5,
        backgroundColor: '#059669', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 10,
    },
    newBadgeDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#a7f3d0' },
    newBadgeText: { fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },

    cardBody: { padding: 10 },
    title: { fontSize: 13, fontWeight: "800" },
    price: { marginTop: 4, fontSize: 15, fontWeight: "800" },

    // Modal
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