import React, { useEffect, useState } from 'react';
import {
    View, Text, TextInput, Alert, ScrollView,
    KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, Image, StatusBar
} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import Footer from './Footer';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './Themecontext';

export default function EditProfile() {
    const navigation = useNavigation();
    const { userId } = useLocalSearchParams();
    const { theme: T, isDark } = useTheme();

    const [userData, setUserData]       = useState(null);
    const [loading, setLoading]         = useState(true);
    const [focusedField, setFocusedField] = useState(null);

    const API_BASE_URL = 'https://kisan-seva-user.onrender.com';

    useEffect(() => { if (userId) fetchUserDetails(); }, [userId]);

    const fetchUserDetails = async () => {
        try {
            const res    = await fetch(`${API_BASE_URL}/api/users/${userId}`);
            const result = await res.json();
            if (result.status_code === 200 && result.data) setUserData(result.data);
            else setUserData(null);
        } catch { Alert.alert('Error', 'Failed to load user data.'); }
        finally { setLoading(false); }
    };

    const handleUpdate = async () => {
        try {
            const payload = {
                name: userData.name, email: userData.email,
                password: userData.password, number: userData.number,
                profileImage: userData.profileImage, backImage: userData.backImage,
            };
            const res    = await fetch(`${API_BASE_URL}/api/users/update/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const result = JSON.parse(await res.text());
            if (result.status_code === 200) { Alert.alert('Success', 'Profile updated.'); navigation.goBack(); }
            else Alert.alert('Error', JSON.stringify(result));
        } catch (error) { Alert.alert('Error', error.message); }
    };

    if (loading) return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: T.bg }}>
            <Text style={{ color: T.textSub }}>Loading…</Text>
        </View>
    );
    if (!userData) return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: T.bg }}>
            <Text style={{ color: T.textSub }}>User data not found</Text>
        </View>
    );

    const fields = [
        { key: 'name',     label: 'Full Name',     icon: 'person-outline',      keyboard: 'default',       secure: false },
        { key: 'email',    label: 'Email Address',  icon: 'mail-outline',         keyboard: 'email-address', secure: false },
        { key: 'password', label: 'Password',       icon: 'lock-closed-outline',  keyboard: 'default',       secure: true  },
        { key: 'number',   label: 'Phone Number',   icon: 'call-outline',         keyboard: 'phone-pad',     secure: false },
    ];

    return (
        <View style={[styles.root, { backgroundColor: T.bg }]}>
            <StatusBar barStyle={T.statusBar} />
            {isDark && <View style={styles.bgLayer2} />}

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
                <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

                    {/* Header */}
                    <View style={[styles.header, { backgroundColor: T.card, borderBottomColor: T.divider }]}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: T.inputBg }]}>
                            <Ionicons name="arrow-back" size={22} color={T.text} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: T.text }]}>Edit Profile</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    {/* Profile card */}
                    <View style={[styles.profileCard, { backgroundColor: T.card, borderColor: T.cardBorder }]}>
                        {userData.backImage ? (
                            <Image source={{ uri: `${API_BASE_URL}/uploads/${userData.backImage}` }} style={styles.coverImage} />
                        ) : (
                            <View style={[styles.coverPlaceholder, { backgroundColor: isDark ? '#0d2040' : '#d1fae5', overflow: 'hidden' }]}>
                                <View style={[styles.coverDeco, { backgroundColor: isDark ? 'rgba(46,196,130,0.15)' : 'rgba(22,163,74,0.12)' }]} />
                            </View>
                        )}
                        <View style={[styles.avatarWrap, { borderColor: T.bg, backgroundColor: T.inputBg }]}>
                            {userData.profileImage ? (
                                <Image source={{ uri: `${API_BASE_URL}/uploads/${userData.profileImage}` }} style={styles.avatar} />
                            ) : (
                                <View style={[styles.avatarPlaceholder, { backgroundColor: T.inputBg }]}>
                                    <Ionicons name="person" size={36} color={T.textMuted} />
                                </View>
                            )}
                        </View>
                        <Text style={[styles.profileName, { color: T.text }]}>{userData.name || 'Your Name'}</Text>
                        <Text style={[styles.profileHandle, { color: T.textMuted }]}>
                            @{(userData.name || 'user').toLowerCase().replace(' ', '')}
                        </Text>
                    </View>

                    {/* Form */}
                    <View style={[styles.formCard, { backgroundColor: T.card, borderColor: T.cardBorder }]}>
                        <Text style={[styles.formTitle, { color: T.text }]}>Personal Information</Text>
                        {fields.map(f => (
                            <View key={f.key} style={{ marginBottom: 14 }}>
                                <Text style={[styles.label, { color: T.textSub }]}>{f.label}</Text>
                                <View style={[
                                    styles.inputRow,
                                    { backgroundColor: T.inputBg, borderColor: focusedField === f.key ? T.accent : T.inputBorder },
                                    focusedField === f.key && { backgroundColor: T.inputFocusBg },
                                ]}>
                                    <Ionicons name={f.icon} size={18} color={focusedField === f.key ? T.accent : T.textMuted} />
                                    <TextInput
                                        style={[styles.input, { color: T.text }]}
                                        placeholder={f.label}
                                        placeholderTextColor={T.placeholder}
                                        value={userData[f.key] || ''}
                                        onChangeText={(text) => setUserData({ ...userData, [f.key]: text })}
                                        keyboardType={f.keyboard}
                                        secureTextEntry={f.secure}
                                        onFocus={() => setFocusedField(f.key)}
                                        onBlur={() => setFocusedField(null)}
                                    />
                                </View>
                            </View>
                        ))}

                        <TouchableOpacity
                            style={[styles.updateButton, { backgroundColor: T.accent, shadowColor: T.accent }]}
                            onPress={handleUpdate}
                            activeOpacity={0.85}
                        >
                            <Ionicons name="checkmark-circle" size={20} color={T.accentBtn} />
                            <Text style={[styles.updateText, { color: T.accentBtn }]}>Update Profile</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
            <Footer />
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    bgLayer2: {
        position: 'absolute', top: 0, left: 0, right: 0, height: 220,
        backgroundColor: '#0d1f3a', borderBottomLeftRadius: 50, borderBottomRightRadius: 50,
    },
    scrollContainer: { paddingBottom: 120 },

    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 52, paddingBottom: 14, paddingHorizontal: 16, borderBottomWidth: 1,
    },
    backBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '800' },

    profileCard: {
        marginTop: 16, marginHorizontal: 16, borderRadius: 24, overflow: 'hidden',
        alignItems: 'center', paddingBottom: 20, borderWidth: 1,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 8,
    },
    coverImage: { width: '100%', height: 130 },
    coverPlaceholder: { width: '100%', height: 130 },
    coverDeco: { position: 'absolute', width: 250, height: 250, borderRadius: 125, top: -80, right: -60 },

    avatarWrap: {
        marginTop: -44, width: 88, height: 88, borderRadius: 44,
        borderWidth: 4, overflow: 'hidden',
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 8,
    },
    avatar: { width: '100%', height: '100%' },
    avatarPlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
    profileName: { marginTop: 10, fontSize: 18, fontWeight: '800' },
    profileHandle: { marginTop: 2, fontSize: 13 },

    formCard: {
        marginTop: 16, marginHorizontal: 16, borderRadius: 24, padding: 20, borderWidth: 1,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 6,
    },
    formTitle: { fontSize: 15, fontWeight: '800', marginBottom: 18 },
    label: { fontSize: 12, fontWeight: '600', marginBottom: 6, marginLeft: 2 },
    inputRow: {
        flexDirection: 'row', alignItems: 'center', gap: 10,
        borderRadius: 14, paddingHorizontal: 14, height: 50, borderWidth: 1.5,
    },
    input: { flex: 1, fontSize: 14, fontWeight: '500' },

    updateButton: {
        marginTop: 8, flexDirection: 'row', alignItems: 'center',
        justifyContent: 'center', gap: 8, height: 52, borderRadius: 16,
        shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8,
    },
    updateText: { fontSize: 16, fontWeight: '800' },
});