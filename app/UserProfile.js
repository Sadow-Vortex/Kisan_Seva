import React, { useEffect, useLayoutEffect, useState, useRef } from 'react';
import {
    View, Text, StyleSheet, Image, TouchableOpacity, Alert,
    ActivityIndicator, Dimensions, ScrollView, StatusBar, Animated
} from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import * as ImagePicker from 'expo-image-picker';
import Footer from "./Footer";
import axios from "axios";
import { useTheme } from "./Themecontext";

const { width } = Dimensions.get("window");

export default function UserProfile() {
    const navigation = useNavigation();
    const { theme, isDark, toggleTheme } = useTheme();

    const [user, setUser]                     = useState(null);
    const [loading, setLoading]               = useState(true);
    const [activeAdsCount, setActiveAdsCount] = useState(0);

    const orb1Y    = useRef(new Animated.Value(0)).current;
    const orb2X    = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    const apiURL = `https://kisan-seva-user.onrender.com`;
    const adsURL = "https://advertisment-jfil.onrender.com";

    useLayoutEffect(() => { navigation.setOptions({ headerShown: false }); }, [navigation]);

    useEffect(() => {
        Animated.spring(fadeAnim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }).start();
        const floatOrb = (anim, dur, range) =>
            Animated.loop(Animated.sequence([
                Animated.timing(anim, { toValue: range,  duration: dur, useNativeDriver: true }),
                Animated.timing(anim, { toValue: -range, duration: dur, useNativeDriver: true }),
            ])).start();
        floatOrb(orb1Y, 3200, 18);
        floatOrb(orb2X, 2700, 14);
    }, []);

    useEffect(() => {
        const loadUser = async () => {
            try {
                await ImagePicker.requestMediaLibraryPermissionsAsync();
                const stored = await AsyncStorage.getItem('user');
                if (stored) setUser(JSON.parse(stored));
                else navigation.reset({ index: 0, routes: [{ name: 'LoginScreen' }] });
            } catch { Alert.alert("Error", "Could not load user data."); }
            finally { setLoading(false); }
        };
        loadUser();
    }, []);

    useEffect(() => {
        if (!user?.id) return;
        axios.get(`${adsURL}/adv/userID/${user.id}`)
            .then(res => {
                const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
                setActiveAdsCount(list.length);
            })
            .catch(() => setActiveAdsCount(0));
    }, [user?.id]);

    const updateImage = async (field) => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: field === 'backImage' ? [4, 2] : [1, 1],
                quality: 0.6,
            });
            if (!result.canceled) {
                const imageUri = result.assets[0].uri;
                const filename = imageUri.split('/').pop();
                const match    = /\.(\w+)$/.exec(filename ?? '');
                const type     = match ? `image/${match[1]}` : `image`;
                const formData = new FormData();
                formData.append('file', { uri: imageUri, name: filename, type });
                const uploadRes = await axios.post(`${apiURL}/api/users/upload`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                const imageUrl = uploadRes.data?.filename;
                if (!imageUrl) throw new Error("Upload failed");
                const updatedUser = { ...user, [field]: imageUrl };
                const updateRes = await axios.put(`${apiURL}/api/users/update/${user.id}`, updatedUser, {
                    headers: { 'Content-Type': 'application/json' },
                });
                const updatedData = updateRes.data?.data;
                if (updatedData) {
                    const final = Array.isArray(updatedData) ? updatedData[0] : updatedData;
                    setUser(final);
                    await AsyncStorage.setItem('user', JSON.stringify(final));
                    Alert.alert('Success', `${field === 'profileImage' ? 'Profile' : 'Cover'} picture updated`);
                }
            }
        } catch { Alert.alert('Error', 'Failed to update picture.'); }
    };

    const handleLogOut = async () => {
        Alert.alert('Log Out', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Log Out', style: 'destructive',
                onPress: async () => {
                    await AsyncStorage.multiRemove(['user', 'isLogin', 'userId']);
                    navigation.reset({ index: 0, routes: [{ name: 'LoginScreen' }] });
                }
            }
        ]);
    };

    const T = theme;

    if (loading || !user) return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: T.bg }}>
            <ActivityIndicator size="large" color={T.accent} />
        </View>
    );

    const menuItems = [
        {
            icon: 'megaphone', title: 'My Advertisements',
            sub: 'View, edit & delete your ads',
            onPress: () => navigation.navigate('MyAds', { userId: user?.id }),
            badge: activeAdsCount,
            color: '#059669',
        },
        {
            icon: 'location', title: 'My Location',
            sub: 'Your pickup / farm location',
            onPress: () => {},
            color: '#0891b2',
        },
        {
            icon: 'person-circle', title: 'Account Info',
            sub: 'Name, phone, email',
            onPress: () => navigation.navigate('EditProfile', { userId: user?.id }),
            color: '#7c3aed',
        },
        {
            icon: 'help-circle', title: 'Help & Support',
            sub: 'Privacy & Terms',
            onPress: () => {},
            color: '#d97706',
        },
    ];

    return (
        <View style={[styles.container, { backgroundColor: T.bg }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'light-content'} />

            {/* Dark mode orbs */}
            {isDark && (
                <>
                    <View style={styles.bgLayer2} />
                    <Animated.View style={[styles.orb1, { backgroundColor: T.orb1, transform: [{ translateY: orb1Y }] }]} />
                    <Animated.View style={[styles.orb2, { backgroundColor: T.orb2, transform: [{ translateX: orb2X }] }]} />
                </>
            )}

            {/* Light mode gradient header */}
            {!isDark && (
                <>
                    <View style={styles.lightHeaderGrad} />
                    <Animated.View style={[styles.lightOrb1, { transform: [{ translateY: orb1Y }] }]} />
                    <Animated.View style={[styles.lightOrb2, { transform: [{ translateX: orb2X }] }]} />
                </>
            )}

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 130 }}>

                {/* ── Cover ── */}
                <View style={styles.coverWrapper}>
                    {user.backImage ? (
                        <Image source={{ uri: `${apiURL}/uploads/${user.backImage}` }} style={styles.cover} />
                    ) : (
                        <View style={[
                            styles.coverPlaceholder,
                            {
                                backgroundColor: isDark ? '#0d2040' : '#4f46e5',
                                overflow: 'hidden',
                            }
                        ]}>
                            {/* Light mode: decorative cover pattern */}
                            {!isDark && (
                                <>
                                    <View style={[styles.coverDeco1, { backgroundColor: 'rgba(124,58,237,0.5)' }]} />
                                    <View style={[styles.coverDeco2, { backgroundColor: 'rgba(5,150,105,0.3)' }]} />
                                    <View style={styles.coverDeco3} />
                                </>
                            )}
                            {isDark && (
                                <>
                                    <View style={[styles.coverDeco1, { backgroundColor: T.coverAccent }]} />
                                    <View style={[styles.coverDeco2, { backgroundColor: T.orb1 }]} />
                                </>
                            )}
                        </View>
                    )}

                    {/* Theme toggle */}
                    <TouchableOpacity
                        style={[styles.themeToggle, {
                            backgroundColor: isDark ? 'rgba(46,196,130,0.2)' : 'rgba(255,255,255,0.22)',
                            borderColor: isDark ? T.accent : 'rgba(255,255,255,0.5)',
                        }]}
                        onPress={toggleTheme}
                        activeOpacity={0.8}
                    >
                        <Ionicons name={isDark ? 'sunny' : 'moon'} size={18} color={isDark ? T.accent : '#fff'} />
                        <Text style={[styles.themeToggleText, { color: isDark ? T.accent : '#fff' }]}>
                            {isDark ? 'Light' : 'Dark'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.coverCameraBtn} onPress={() => updateImage('backImage')}>
                        <Ionicons name="camera" size={17} color="#fff" />
                    </TouchableOpacity>

                    <View style={[styles.coverCurve, { backgroundColor: T.bg }]} />
                </View>

                {/* ── Profile pic ── */}
                <View style={styles.profilePicOuter}>
                    <View style={[styles.profilePicRing, {
                        borderColor: isDark ? 'rgba(46,196,130,0.5)' : '#7c3aed',
                        backgroundColor: T.card,
                    }]}>
                        {user.profileImage ? (
                            <Image source={{ uri: `${apiURL}/uploads/${user.profileImage}` }} style={styles.profilePic} />
                        ) : (
                            <View style={[styles.profilePicPlaceholder, { backgroundColor: T.inputBg }]}>
                                <Ionicons name="person" size={48} color={T.textMuted} />
                            </View>
                        )}
                    </View>
                    <TouchableOpacity
                        style={[styles.profileCameraBtn, { backgroundColor: isDark ? T.accent : '#7c3aed', borderColor: T.bg }]}
                        onPress={() => updateImage('profileImage')}
                    >
                        <Ionicons name="camera" size={13} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* ── Name & info ── */}
                <View style={styles.infoBlock}>
                    <Text style={[styles.name, { color: T.text }]}>{user.name || 'No Name'}</Text>
                    <View style={styles.verifiedRow}>
                        <View style={[styles.verifiedBadge, {
                            backgroundColor: isDark ? 'rgba(46,196,130,0.15)' : '#d1fae5',
                            borderColor:     isDark ? 'rgba(46,196,130,0.3)' : '#6ee7b7',
                        }]}>
                            <Ionicons name="checkmark-circle" size={13} color={T.accent} />
                            <Text style={[styles.verifiedText, { color: T.accent }]}>Verified Farmer</Text>
                        </View>
                    </View>
                    <Text style={[styles.contactText, { color: T.textSub }]}>{user.number || ''}</Text>
                </View>

                {/* ── Stats ── */}
                <Animated.View style={[styles.statsRow, {
                    backgroundColor: isDark ? T.card : '#ffffff',
                    borderColor: isDark ? T.cardBorder : '#e0d9f7',
                    opacity: fadeAnim,
                    shadowColor: isDark ? '#000' : '#7c3aed',
                }]}>
                    {[
                        { label: 'Active Ads', value: activeAdsCount, color: '#059669' },
                        { label: 'Rating',     value: '⭐ 4.8',       color: '#d97706' },
                        { label: 'Trusted',    value: '🏅',            color: '#7c3aed' },
                    ].map((stat, i, arr) => (
                        <React.Fragment key={stat.label}>
                            <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: isDark ? T.text : stat.color }]}>{stat.value}</Text>
                                <Text style={[styles.statLabel, { color: T.textMuted }]}>{stat.label}</Text>
                            </View>
                            {i < arr.length - 1 && <View style={[styles.statDivider, { backgroundColor: T.divider }]} />}
                        </React.Fragment>
                    ))}
                </Animated.View>

                {/* ── Action buttons ── */}
                <View style={styles.actionRow}>
                    {[
                        { icon: 'add-circle',         label: 'Post Ad',  onPress: () => navigation.navigate("Advertisement", { userId: user?.id, subCategoryId: null }), color: '#059669' },
                        { icon: 'chatbubble-ellipses', label: 'Messages', onPress: () => {}, color: '#7c3aed' },
                        { icon: 'share-social',        label: 'Share',    onPress: () => {}, color: '#d97706' },
                    ].map(btn => (
                        <TouchableOpacity
                            key={btn.label}
                            style={[styles.actionBtn, {
                                backgroundColor: isDark ? T.card : '#ffffff',
                                borderColor: isDark ? T.cardBorder : `${btn.color}30`,
                                borderBottomWidth: isDark ? 1 : 3,
                                borderBottomColor: isDark ? T.cardBorder : btn.color,
                                shadowColor: isDark ? '#000' : btn.color,
                            }]}
                            onPress={btn.onPress}
                        >
                            <Ionicons name={btn.icon} size={19} color={isDark ? T.accent : btn.color} />
                            <Text style={[styles.actionBtnText, { color: T.text }]}>{btn.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* ── Menu ── */}
                <View style={[styles.menuCard, {
                    backgroundColor: isDark ? T.card : '#ffffff',
                    borderColor: isDark ? T.cardBorder : '#e0d9f7',
                    shadowColor: isDark ? '#000' : '#7c3aed',
                }]}>
                    {menuItems.map((item, i) => (
                        <TouchableOpacity
                            key={i}
                            style={[styles.menuRow, i < menuItems.length - 1 && { borderBottomWidth: 1, borderBottomColor: T.divider }]}
                            onPress={item.onPress}
                        >
                            <View style={[styles.menuIconWrap, {
                                backgroundColor: isDark ? T.menuIcon : `${item.color}18`,
                            }]}>
                                <Ionicons name={item.icon} size={20} color={isDark ? T.accent : item.color} />
                            </View>
                            <View style={styles.menuTextBlock}>
                                <Text style={[styles.menuTitle, { color: T.text }]}>{item.title}</Text>
                                <Text style={[styles.menuSub, { color: T.textMuted }]}>{item.sub}</Text>
                            </View>
                            {item.badge > 0 && (
                                <View style={[styles.badge, {
                                    backgroundColor: isDark ? T.activeBadge : '#d1fae5',
                                }]}>
                                    <Text style={[styles.badgeText, { color: isDark ? T.accent : '#065f46' }]}>{item.badge}</Text>
                                </View>
                            )}
                            <Ionicons name="chevron-forward" size={16} color={T.textMuted} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* ── Theme toggle row ── */}
                <View style={[styles.menuCard, {
                    backgroundColor: isDark ? T.card : '#ffffff',
                    borderColor: isDark ? T.cardBorder : '#e0d9f7',
                    shadowColor: isDark ? '#000' : '#7c3aed',
                    marginTop: 12,
                }]}>
                    <TouchableOpacity style={styles.menuRow} onPress={toggleTheme}>
                        <View style={[styles.menuIconWrap, {
                            backgroundColor: isDark ? T.menuIcon : 'rgba(124,58,237,0.12)',
                        }]}>
                            <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={20} color={isDark ? T.accent : '#7c3aed'} />
                        </View>
                        <View style={styles.menuTextBlock}>
                            <Text style={[styles.menuTitle, { color: T.text }]}>
                                {isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            </Text>
                            <Text style={[styles.menuSub, { color: T.textMuted }]}>
                                Currently {isDark ? 'dark' : 'light'} theme
                            </Text>
                        </View>
                        <View style={[styles.togglePill, { backgroundColor: isDark ? T.accent : '#7c3aed' }]}>
                            <View style={[styles.toggleDot, {
                                backgroundColor: '#fff',
                                transform: [{ translateX: isDark ? 18 : 2 }]
                            }]} />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* ── Logout ── */}
                <TouchableOpacity
                    style={[styles.logoutBtn, {
                        backgroundColor: isDark ? T.card : '#fff',
                        borderColor: isDark ? T.dangerBg : '#fecaca',
                    }]}
                    onPress={handleLogOut}
                >
                    <Ionicons name="power" size={18} color={T.danger} />
                    <Text style={[styles.logoutText, { color: T.danger }]}>Log Out</Text>
                </TouchableOpacity>

            </ScrollView>
            <Footer />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    bgLayer2: { position: 'absolute', top: 0, left: 0, right: 0, height: 260, backgroundColor: '#0d1f3a', borderBottomLeftRadius: 60, borderBottomRightRadius: 60 },
    orb1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, top: -40, right: -40 },
    orb2: { position: 'absolute', width: 140, height: 140, borderRadius: 70, top: 180, left: -30 },

    // Light mode bg
    lightHeaderGrad: {
        position: 'absolute', top: 0, left: 0, right: 0, height: 280,
        backgroundColor: '#4f46e5',
        borderBottomLeftRadius: 60, borderBottomRightRadius: 60,
    },
    lightOrb1: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(124,58,237,0.35)', top: -50, right: -50 },
    lightOrb2: { position: 'absolute', width: 160, height: 160, borderRadius: 80, backgroundColor: 'rgba(5,150,105,0.25)', top: 160, left: -40 },

    coverWrapper:      { width: '100%', height: 200, position: 'relative' },
    cover:             { width: '100%', height: 200 },
    coverPlaceholder:  { width: '100%', height: 200 },
    coverDeco1: { position: 'absolute', width: 300, height: 300, borderRadius: 150, top: -80, right: -60 },
    coverDeco2: { position: 'absolute', width: 180, height: 180, borderRadius: 90, bottom: -50, left: 20 },
    coverDeco3: { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(217,119,6,0.25)', top: 30, left: '40%' },

    themeToggle: {
        position: 'absolute', top: 48, left: 16,
        flexDirection: 'row', alignItems: 'center', gap: 6,
        paddingHorizontal: 12, paddingVertical: 7,
        borderRadius: 20, borderWidth: 1,
    },
    themeToggleText: { fontSize: 12, fontWeight: '700' },
    coverCameraBtn: { position: 'absolute', bottom: 46, right: 16, backgroundColor: 'rgba(0,0,0,0.55)', padding: 9, borderRadius: 12 },
    coverCurve: { position: 'absolute', bottom: -22, left: 0, right: 0, height: 46, borderTopLeftRadius: 46, borderTopRightRadius: 46 },

    profilePicOuter: { alignSelf: 'center', marginTop: -52, position: 'relative', width: 108, height: 108 },
    profilePicRing: { width: 108, height: 108, borderRadius: 54, borderWidth: 3, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 14, elevation: 12 },
    profilePic: { width: '100%', height: '100%' },
    profilePicPlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
    profileCameraBtn: { position: 'absolute', bottom: 2, right: 2, padding: 7, borderRadius: 12, borderWidth: 2 },

    infoBlock: { alignItems: 'center', marginTop: 10 },
    name: { fontSize: 22, fontWeight: '800' },
    verifiedRow: { marginTop: 6 },
    verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
    verifiedText: { fontSize: 12, fontWeight: '600' },
    contactText: { marginTop: 6, fontSize: 13 },

    statsRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginTop: 18, borderRadius: 20, paddingVertical: 14, borderWidth: 1, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 6 },
    statItem: { flex: 1, alignItems: 'center' },
    statValue: { fontSize: 17, fontWeight: '800' },
    statLabel: { fontSize: 11, fontWeight: '500', marginTop: 2 },
    statDivider: { width: 1, height: 30 },

    actionRow: { flexDirection: 'row', gap: 10, justifyContent: 'center', marginTop: 14, marginHorizontal: 20 },
    actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 16, borderWidth: 1, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 6, elevation: 4 },
    actionBtnText: { fontWeight: '700', fontSize: 12 },

    menuCard: { marginTop: 14, marginHorizontal: 16, borderRadius: 20, borderWidth: 1, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.10, shadowRadius: 8, elevation: 5, overflow: 'hidden' },
    menuRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 15 },
    menuIconWrap: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    menuTextBlock: { flex: 1 },
    menuTitle: { fontSize: 14, fontWeight: '700' },
    menuSub: { fontSize: 12, marginTop: 2 },
    badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, marginRight: 8 },
    badgeText: { fontSize: 11, fontWeight: '700' },

    togglePill: { width: 42, height: 24, borderRadius: 12, justifyContent: 'center', position: 'relative' },
    toggleDot: { position: 'absolute', width: 18, height: 18, borderRadius: 9, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 3, elevation: 2 },

    logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12, marginHorizontal: 16, paddingVertical: 15, paddingHorizontal: 18, borderRadius: 18, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 4 },
    logoutText: { fontSize: 14, fontWeight: '700' },
});