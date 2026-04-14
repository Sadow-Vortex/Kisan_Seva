import React, { useLayoutEffect, useState } from 'react';
import {
    View, Text, FlatList, Image, ActivityIndicator,
    StyleSheet, Alert, TouchableOpacity, StatusBar, Dimensions
} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Footer from "./Footer";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "./Themecontext";

const { width } = Dimensions.get('window');
const BACKEND_URL = 'https://advertisment-jfil.onrender.com';

export default function UserAdvertisements() {
    const navigation = useNavigation();
    const { userId } = useLocalSearchParams();
    const { theme: T, isDark } = useTheme();

    const [ads, setAds]         = useState([]);
    const [loading, setLoading] = useState(true);

    useLayoutEffect(() => { navigation.setOptions({ headerShown: false }); }, [navigation]);

    useFocusEffect(
        React.useCallback(() => { fetchAds(); }, [userId])
    );

    const fetchAds = () => {
        if (!userId) return;
        setLoading(true);
        fetch(`${BACKEND_URL}/adv/userID/${userId}`)
            .then(res => { if (!res.ok) throw new Error('Failed'); return res.json(); })
            .then(data => { setAds(Array.isArray(data.data) ? data.data : []); setLoading(false); })
            .catch(() => setLoading(false));
    };

    const handleDelete = (adv_id) => {
        Alert.alert('Delete Advertisement', 'Are you sure you want to delete this ad?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive',
                onPress: () => {
                    fetch(`${BACKEND_URL}/adv/${adv_id}`, { method: 'DELETE' })
                        .then(res => { if (!res.ok) throw new Error('Failed'); fetchAds(); })
                        .catch(() => Alert.alert('Error', 'Failed to delete advertisement.'));
                },
            },
        ]);
    };

    const handleUpdate = (ad) => navigation.navigate('UpdateAdvertisement', { adData: ad });

    const renderAd = ({ item, index }) => {
        const isActive = item.adv_Status;
        return (
            <View style={[
                styles.card,
                { backgroundColor: T.card, borderColor: T.cardBorder },
                index === 0 && { marginTop: 6 }
            ]}>
                {/* Image */}
                <View style={styles.imageContainer}>
                    <Image
                        source={{ uri: `${BACKEND_URL}/uploads/${item.adv_Image}` }}
                        style={styles.image}
                    />
                    {/* Gradient-like overlay at bottom */}
                    <View style={styles.imageOverlay} />

                    {/* Status badge — top left */}
                    <View style={[
                        styles.statusBadge,
                        { backgroundColor: isActive ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.12)' },
                        { borderColor: isActive ? '#10b981' : '#ef4444' }
                    ]}>
                        <View style={[styles.statusDot, { backgroundColor: isActive ? '#10b981' : '#ef4444' }]} />
                        <Text style={[styles.statusBadgeText, { color: isActive ? '#10b981' : '#ef4444' }]}>
                            {isActive ? 'ACTIVE' : 'INACTIVE'}
                        </Text>
                    </View>

                    {/* Price chip — bottom right */}
                    <View style={[styles.priceChip, { backgroundColor: T.accent }]}>
                        <Text style={[styles.priceChipText, { color: T.accentBtn }]}>₹ {item.adv_Price}</Text>
                    </View>
                </View>

                {/* Body */}
                <View style={styles.cardBody}>
                    <Text style={[styles.title, { color: T.text }]} numberOfLines={1}>
                        {item.adv_Title}
                    </Text>

                    {item.adv_Address ? (
                        <View style={styles.locationRow}>
                            <View style={[styles.locationIconWrap, { backgroundColor: isDark ? 'rgba(129,140,248,0.12)' : 'rgba(67,56,202,0.08)' }]}>
                                <Ionicons name="location" size={12} color="#818cf8" />
                            </View>
                            <Text style={[styles.location, { color: T.textSub }]} numberOfLines={1}>
                                {item.adv_Address}
                            </Text>
                        </View>
                    ) : null}

                    {/* Divider */}
                    <View style={[styles.divider, { backgroundColor: T.divider }]} />

                    {/* Action buttons */}
                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.button, styles.updateButton, { backgroundColor: T.accent }]}
                            onPress={() => handleUpdate(item)}
                            activeOpacity={0.82}
                        >
                            <Ionicons name="create-outline" size={15} color={T.accentBtn} />
                            <Text style={[styles.btnText, { color: T.accentBtn }]}>Update</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, styles.deleteButton, {
                                backgroundColor: isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.07)',
                                borderColor: '#ef4444'
                            }]}
                            onPress={() => handleDelete(item.adv_id)}
                            activeOpacity={0.82}
                        >
                            <Ionicons name="trash-outline" size={15} color="#ef4444" />
                            <Text style={[styles.btnText, { color: '#ef4444' }]}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    if (loading) return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: T.bg }}>
            <ActivityIndicator size="large" color={T.accent} />
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: T.bg }]}>
            <StatusBar barStyle={T.statusBar} />

            {isDark && <View style={styles.bgLayer2} />}

            {/* Header */}
            <View style={[styles.header, { backgroundColor: T.card, borderBottomColor: T.divider }]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={[styles.backBtn, { backgroundColor: T.inputBg }]}
                >
                    <Ionicons name="arrow-back" size={20} color={T.text} />
                </TouchableOpacity>

                <View style={styles.headerCenter}>
                    <Text style={[styles.headerTitle, { color: T.text }]}>My Advertisements</Text>
                    <View style={styles.headerBadgeRow}>
                        <View style={[styles.headerBadge, { backgroundColor: isDark ? 'rgba(129,140,248,0.15)' : 'rgba(67,56,202,0.08)' }]}>
                            <Text style={[styles.headerBadgeText, { color: T.accent }]}>
                                {ads.length} {ads.length !== 1 ? 'ads' : 'ad'} posted
                            </Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.addBtn, { backgroundColor: T.accent }]}
                    onPress={() => navigation.navigate('Advertisement', { userId })}
                >
                    <Ionicons name="add" size={20} color={T.accentBtn} />
                </TouchableOpacity>
            </View>

            {ads.length === 0 ? (
                <View style={styles.emptyState}>
                    <View style={[styles.emptyIconWrap, { backgroundColor: isDark ? 'rgba(129,140,248,0.1)' : 'rgba(67,56,202,0.06)' }]}>
                        <Text style={{ fontSize: 42 }}>🌾</Text>
                    </View>
                    <Text style={[styles.emptyTitle, { color: T.text }]}>No Ads Yet</Text>
                    <Text style={[styles.emptySub, { color: T.textSub }]}>
                        Start selling by posting your first ad to reach thousands of buyers
                    </Text>
                    <TouchableOpacity
                        style={[styles.emptyBtn, { backgroundColor: T.accent }]}
                        onPress={() => navigation.navigate('Advertisement', { userId })}
                        activeOpacity={0.85}
                    >
                        <Ionicons name="add-circle-outline" size={18} color={T.accentBtn} />
                        <Text style={[styles.emptyBtnText, { color: T.accentBtn }]}>Post Your First Ad</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={ads}
                    keyExtractor={(item) => item.adv_id.toString()}
                    renderItem={renderAd}
                    contentContainerStyle={styles.list}
                    refreshing={loading}
                    onRefresh={fetchAds}
                    showsVerticalScrollIndicator={false}
                />
            )}
            <Footer />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },

    bgLayer2: {
        position: 'absolute', top: 0, left: 0, right: 0, height: 200,
        backgroundColor: '#0d1f3a',
        borderBottomLeftRadius: 50, borderBottomRightRadius: 50,
    },

    /* ── Header ── */
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 52, paddingBottom: 14, paddingHorizontal: 16,
        borderBottomWidth: 1,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08, shadowRadius: 6, elevation: 4,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center',
    },
    addBtn: {
        width: 40, height: 40, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center',
    },
    headerCenter: { alignItems: 'center', flex: 1 },
    headerTitle: { fontSize: 18, fontWeight: '800' },
    headerBadgeRow: { flexDirection: 'row', marginTop: 4 },
    headerBadge: {
        paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20,
    },
    headerBadgeText: { fontSize: 11, fontWeight: '700' },

    /* ── List ── */
    list: { padding: 14, paddingBottom: 110 },

    /* ── Card ── */
    card: {
        marginBottom: 16, borderRadius: 22, overflow: 'hidden', borderWidth: 1,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12, shadowRadius: 10, elevation: 6,
    },
    imageContainer: { width: '100%', height: 185, position: 'relative' },
    image: { width: '100%', height: '100%' },
    imageOverlay: {
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 70,
        // faux gradient fade (use LinearGradient if expo-linear-gradient is available)
        backgroundColor: 'transparent',
    },
    statusBadge: {
        position: 'absolute', top: 12, left: 12,
        flexDirection: 'row', alignItems: 'center', gap: 5,
        paddingHorizontal: 10, paddingVertical: 5,
        borderRadius: 20, borderWidth: 1,
    },
    statusDot: { width: 6, height: 6, borderRadius: 3 },
    statusBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

    priceChip: {
        position: 'absolute', bottom: 12, right: 12,
        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14,
    },
    priceChipText: { fontSize: 14, fontWeight: '800' },

    /* ── Card Body ── */
    cardBody: { padding: 14 },
    title: { fontSize: 16, fontWeight: '800', letterSpacing: -0.2 },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
    locationIconWrap: {
        width: 22, height: 22, borderRadius: 6,
        justifyContent: 'center', alignItems: 'center',
    },
    location: { fontSize: 12, flex: 1 },

    divider: { height: 1, marginVertical: 12 },

    buttonRow: { flexDirection: 'row', gap: 10 },
    button: {
        flex: 1, flexDirection: 'row', alignItems: 'center',
        justifyContent: 'center', gap: 6, paddingVertical: 11, borderRadius: 14,
    },
    updateButton: {},
    deleteButton: { borderWidth: 1 },
    btnText: { fontWeight: '700', fontSize: 13 },

    /* ── Empty State ── */
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    emptyIconWrap: {
        width: 90, height: 90, borderRadius: 28,
        justifyContent: 'center', alignItems: 'center', marginBottom: 16,
    },
    emptyTitle: { fontSize: 22, fontWeight: '800', marginTop: 4 },
    emptySub: { fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 20 },
    emptyBtn: {
        marginTop: 24, flexDirection: 'row', alignItems: 'center', gap: 8,
        paddingHorizontal: 28, paddingVertical: 13, borderRadius: 16,
    },
    emptyBtnText: { fontWeight: '700', fontSize: 14 },
});