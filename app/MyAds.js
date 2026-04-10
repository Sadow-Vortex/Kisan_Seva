import React, { useLayoutEffect, useState } from 'react';
import {
    View, Text, FlatList, Image, ActivityIndicator,
    StyleSheet, Alert, TouchableOpacity, StatusBar
} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Footer from "./Footer";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "./Themecontext";

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

    const renderAd = ({ item }) => (
        <View style={[styles.card, { backgroundColor: T.card, borderColor: T.cardBorder }]}>
            <Image source={{ uri: `${BACKEND_URL}/uploads/${item.adv_Image}` }} style={styles.image} />
            <View style={[styles.statusBadge, {
                backgroundColor: item.adv_Status ? T.activeBadge : T.dangerBg
            }]}>
                <Text style={[styles.statusBadgeText, {
                    color: item.adv_Status ? T.activeBadgeText : T.danger
                }]}>
                    {item.adv_Status ? 'ACTIVE' : 'INACTIVE'}
                </Text>
            </View>
            <View style={styles.details}>
                <Text style={[styles.title, { color: T.text }]} numberOfLines={1}>{item.adv_Title}</Text>
                <Text style={[styles.price, { color: T.accent }]}>₹ {item.adv_Price}</Text>
                {item.adv_Address ? (
                    <View style={styles.locationRow}>
                        <Ionicons name="location-outline" size={13} color={T.textMuted} />
                        <Text style={[styles.location, { color: T.textSub }]} numberOfLines={1}>
                            {item.adv_Address}
                        </Text>
                    </View>
                ) : null}
                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: T.accent }]}
                        onPress={() => handleUpdate(item)}
                    >
                        <Ionicons name="create-outline" size={15} color={T.accentBtn} />
                        <Text style={[styles.btnText, { color: T.accentBtn }]}>Update</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: T.dangerBg, borderWidth: 1, borderColor: T.danger }]}
                        onPress={() => handleDelete(item.adv_id)}
                    >
                        <Ionicons name="trash-outline" size={15} color={T.danger} />
                        <Text style={[styles.btnText, { color: T.danger }]}>Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

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
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: T.inputBg }]}>
                    <Ionicons name="arrow-back" size={22} color={T.text} />
                </TouchableOpacity>
                <View>
                    <Text style={[styles.headerTitle, { color: T.text }]}>My Advertisements</Text>
                    <Text style={[styles.headerSub, { color: T.textMuted }]}>
                        {ads.length} ad{ads.length !== 1 ? 's' : ''} posted
                    </Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            {ads.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={{ fontSize: 48 }}>🌾</Text>
                    <Text style={[styles.emptyTitle, { color: T.text }]}>No ads yet</Text>
                    <Text style={[styles.emptySub, { color: T.textSub }]}>
                        Start selling by posting your first ad
                    </Text>
                    <TouchableOpacity
                        style={[styles.emptyBtn, { backgroundColor: T.accent }]}
                        onPress={() => navigation.navigate('Advertisement', { userId })}
                    >
                        <Text style={[styles.emptyBtnText, { color: T.accentBtn }]}>Post an Ad</Text>
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
        backgroundColor: '#0d1f3a', borderBottomLeftRadius: 50, borderBottomRightRadius: 50,
    },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 52, paddingBottom: 14, paddingHorizontal: 16,
        borderBottomWidth: 1,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08, shadowRadius: 6, elevation: 4,
    },
    backBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center' },
    headerSub: { fontSize: 12, textAlign: 'center', marginTop: 2 },

    list: { padding: 14, paddingBottom: 110 },
    card: {
        marginBottom: 14, borderRadius: 20, overflow: 'hidden', borderWidth: 1,
        shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5,
    },
    image: { width: '100%', height: 165 },
    statusBadge: {
        position: 'absolute', top: 12, left: 12,
        paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10,
    },
    statusBadgeText: { fontSize: 10, fontWeight: '800' },

    details: { padding: 14 },
    title: { fontSize: 16, fontWeight: '800' },
    price: { fontSize: 17, fontWeight: '800', marginTop: 4 },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
    location: { fontSize: 12, flex: 1 },

    buttonRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
    button: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 6, paddingVertical: 10, borderRadius: 12,
    },
    btnText: { fontWeight: '700', fontSize: 13 },

    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    emptyTitle: { fontSize: 20, fontWeight: '800', marginTop: 14 },
    emptySub: { fontSize: 14, textAlign: 'center', marginTop: 8 },
    emptyBtn: { marginTop: 20, paddingHorizontal: 28, paddingVertical: 12, borderRadius: 14 },
    emptyBtnText: { fontWeight: '700', fontSize: 14 },
});