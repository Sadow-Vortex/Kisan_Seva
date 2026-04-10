import React, { useEffect, useState, useRef } from 'react';
import {
    View, Text, TextInput, Switch, StyleSheet,
    ScrollView, Alert, TouchableOpacity, Dimensions, Image, StatusBar
} from 'react-native';
import { router } from "expo-router";
import axios from 'axios';
import * as Location from 'expo-location';
import RNPickerSelect from 'react-native-picker-select';
import { useRoute, useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './Themecontext';

const { width } = Dimensions.get('window');

const Advertisement = () => {
    const scrollRef = useRef();
    const route     = useRoute();
    const navigation = useNavigation();
    const { userId, subCategoryId } = route.params || {};
    const { theme: T, isDark } = useTheme();

    const [categories, setCategories]     = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [uploading, setUploading]       = useState(false);
    const [focusedField, setFocusedField] = useState(null);

    const url  = "https://kisan-seva-subcategory.onrender.com";
    const urll = "https://advertisment-jfil.onrender.com";

    const [formData, setFormData] = useState({
        adv_CategoryID: '', adv_subCategoryID: subCategoryId || '',
        adv_Title: '', adv_Description: '', adv_Unit: '', adv_Price: '',
        adv_Address: '', adv_Image: '', adv_Status: true,
        adv_UserID: userId, adv_Latitude: null, adv_Longitude: null,
    });

    useEffect(() => {
        axios.get(`${url}/category`)
            .then(r => setCategories(Array.isArray(r.data) ? r.data : r.data?.data || []))
            .catch(() => setCategories([]));
    }, []);

    useEffect(() => {
        if (formData.adv_CategoryID) {
            axios.get(`${url}/subcategory/by-category/${formData.adv_CategoryID}`)
                .then(r => setSubcategories(Array.isArray(r.data) ? r.data : r.data?.data || []))
                .catch(() => setSubcategories([]));
        }
    }, [formData.adv_CategoryID]);

    useFocusEffect(useCallback(() => {
        const get = async () => {
            const stored = await AsyncStorage.getItem("selectedLocation");
            if (stored) {
                const coords = JSON.parse(stored);
                await reverseGeocode(coords);
                await AsyncStorage.removeItem("selectedLocation");
            }
        };
        get();
    }, []));

    const reverseGeocode = async ({ latitude, longitude }) => {
        try {
            const geo = await Location.reverseGeocodeAsync({ latitude, longitude });
            let addr = 'Unknown location';
            if (geo.length > 0) {
                const p = geo[0];
                addr = [p.name, p.street, p.city || p.subregion, p.region, p.postalCode, p.country].filter(Boolean).join(', ');
            }
            setFormData(prev => ({ ...prev, adv_Latitude: latitude, adv_Longitude: longitude, adv_Address: addr }));
        } catch {
            setFormData(prev => ({ ...prev, adv_Latitude: latitude, adv_Longitude: longitude, adv_Address: `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}` }));
        }
    };

    const PickImage = async () => {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) { alert("Permission required!"); return; }
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 1 });
        if (!result.canceled) {
            const localUri = result.assets[0].uri;
            const filename = localUri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename ?? '');
            const type = match ? `image/${match[1]}` : `image`;
            const fd = new FormData();
            fd.append('file', { uri: localUri, name: filename, type });
            try {
                setUploading(true);
                const res = await axios.post(`${urll}/adv/upload`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                const file = res.data?.filename;
                if (file) setFormData(prev => ({ ...prev, adv_Image: file }));
                else Alert.alert('Upload Failed', 'No filename returned.');
            } catch { Alert.alert('Upload Error', 'Failed to upload image.'); }
            finally { setUploading(false); }
        }
    };

    const handleSubmit = async () => {
        const { adv_CategoryID, adv_subCategoryID, adv_Title, adv_Unit, adv_Price } = formData;
        if (!adv_CategoryID || !adv_subCategoryID || !adv_Title || !adv_Unit || !adv_Price) {
            Alert.alert('Validation Error', 'Please fill all required fields.'); return;
        }
        let finalUserId = userId;
        if (!finalUserId) {
            try {
                const stored = await AsyncStorage.getItem('user');
                finalUserId = stored ? JSON.parse(stored)?.id : null;
                if (!finalUserId) { Alert.alert("Error", "User ID missing."); return; }
            } catch { Alert.alert("Error", "Login session invalid."); return; }
        }
        const payload = {
            advUserID: parseInt(finalUserId), adv_CategoryID: parseInt(formData.adv_CategoryID),
            advSubCategoryID: parseInt(formData.adv_subCategoryID), adv_Title: formData.adv_Title,
            adv_Description: formData.adv_Description, adv_Unit: parseInt(formData.adv_Unit),
            adv_Price: parseFloat(formData.adv_Price), adv_Address: formData.adv_Address,
            adv_Image: formData.adv_Image, adv_Date: new Date().toISOString(), adv_Status: formData.adv_Status,
            adv_Location: { latitude: formData.adv_Latitude || 0, longitude: formData.adv_Longitude || 0 },
        };
        axios.post(`${urll}/adv`, payload)
            .then(() => { Alert.alert('Success', 'Advertisement posted!'); router.replace("/Home"); })
            .catch(() => Alert.alert('Error', 'Something went wrong.'));
    };

    const pickerStyles = {
        inputIOS: { fontSize: 14, paddingVertical: 12, paddingHorizontal: 12, color: T.text, paddingRight: 30 },
        inputAndroid: { fontSize: 14, paddingHorizontal: 12, paddingVertical: 10, color: T.text, paddingRight: 30 },
        placeholder: { color: T.placeholder },
    };

    const inputStyle = (field) => [
        styles.input,
        { backgroundColor: T.inputBg, borderColor: focusedField === field ? T.accent : T.inputBorder, color: T.text },
        focusedField === field && { backgroundColor: T.inputFocusBg },
    ];

    return (
        <View style={[styles.fullContainer, { backgroundColor: T.bg }]}>
            <StatusBar barStyle={T.statusBar} />
            {isDark && <View style={styles.bgLayer2} />}

            <View style={[styles.header, { backgroundColor: T.card, borderBottomColor: T.divider }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: T.inputBg }]}>
                    <Ionicons name="arrow-back" size={22} color={T.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: T.text }]}>Post Advertisement</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView ref={scrollRef} contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

                {/* Category */}
                <View style={[styles.sectionCard, { backgroundColor: T.card, borderColor: T.cardBorder }]}>
                    <Text style={[styles.sectionTitle, { color: T.text }]}>📂 Category</Text>
                    <Text style={[styles.label, { color: T.textSub }]}>Category *</Text>
                    <View style={[styles.pickerWrap, { borderColor: T.inputBorder, backgroundColor: T.inputBg }]}>
                        <RNPickerSelect
                            onValueChange={v => setFormData(prev => ({ ...prev, adv_CategoryID: v }))}
                            items={categories.filter(c => c?.categoryId != null).map(c => ({ key: String(c.categoryId), label: String(c.categoryName ?? ''), value: c.categoryId }))}
                            value={formData.adv_CategoryID}
                            placeholder={{ label: "Select Category", value: null }}
                            style={pickerStyles}
                        />
                    </View>
                    {!subCategoryId && (
                        <>
                            <Text style={[styles.label, { color: T.textSub }]}>Subcategory *</Text>
                            <View style={[styles.pickerWrap, { borderColor: T.inputBorder, backgroundColor: T.inputBg }]}>
                                <RNPickerSelect
                                    onValueChange={v => setFormData(prev => ({ ...prev, adv_subCategoryID: v }))}
                                    items={subcategories.filter(s => s?.subCategoryId != null).map(s => ({ key: String(s.subCategoryId), label: String(s.subCategoryName ?? ''), value: s.subCategoryId }))}
                                    value={formData.adv_subCategoryID}
                                    placeholder={{ label: "Select Subcategory", value: null }}
                                    style={pickerStyles}
                                />
                            </View>
                        </>
                    )}
                </View>

                {/* Details */}
                <View style={[styles.sectionCard, { backgroundColor: T.card, borderColor: T.cardBorder }]}>
                    <Text style={[styles.sectionTitle, { color: T.text }]}>📝 Ad Details</Text>
                    <Text style={[styles.label, { color: T.textSub }]}>Title *</Text>
                    <TextInput style={inputStyle('title')} value={formData.adv_Title} onChangeText={t => setFormData(prev => ({ ...prev, adv_Title: t }))} placeholder="What are you selling?" placeholderTextColor={T.placeholder} onFocus={() => setFocusedField('title')} onBlur={() => setFocusedField(null)} />
                    <Text style={[styles.label, { color: T.textSub }]}>Description</Text>
                    <TextInput style={[...inputStyle('desc'), styles.textArea]} value={formData.adv_Description} onChangeText={t => setFormData(prev => ({ ...prev, adv_Description: t }))} placeholder="Describe your product…" placeholderTextColor={T.placeholder} multiline onFocus={() => setFocusedField('desc')} onBlur={() => setFocusedField(null)} />
                    <View style={styles.row2}>
                        <View style={styles.col}>
                            <Text style={[styles.label, { color: T.textSub }]}>Unit *</Text>
                            <TextInput style={inputStyle('unit')} value={formData.adv_Unit} onChangeText={t => setFormData(prev => ({ ...prev, adv_Unit: t }))} keyboardType="numeric" placeholder="Qty" placeholderTextColor={T.placeholder} onFocus={() => setFocusedField('unit')} onBlur={() => setFocusedField(null)} />
                        </View>
                        <View style={styles.col}>
                            <Text style={[styles.label, { color: T.textSub }]}>Price *</Text>
                            <TextInput style={inputStyle('price')} value={formData.adv_Price} onChangeText={t => setFormData(prev => ({ ...prev, adv_Price: t }))} keyboardType="numeric" placeholder="₹ Price" placeholderTextColor={T.placeholder} onFocus={() => setFocusedField('price')} onBlur={() => setFocusedField(null)} />
                        </View>
                    </View>
                </View>

                {/* Location */}
                <View style={[styles.sectionCard, { backgroundColor: T.card, borderColor: T.cardBorder }]}>
                    <Text style={[styles.sectionTitle, { color: T.text }]}>📍 Location</Text>
                    <Text style={[styles.label, { color: T.textSub }]}>Address</Text>
                    <View style={[styles.inputWithIcon, { borderColor: T.inputBorder, backgroundColor: T.inputBg }]}>
                        <TextInput style={[styles.inputFlex, { color: T.text }]} value={formData.adv_Address} onChangeText={t => setFormData(prev => ({ ...prev, adv_Address: t }))} placeholder="Enter address or tap map pin" placeholderTextColor={T.placeholder} />
                        <TouchableOpacity onPress={() => navigation.navigate("Map")} style={[styles.mapPinBtn, { backgroundColor: `${T.accent}22` }]}>
                            <Ionicons name="location" size={20} color={T.accent} />
                        </TouchableOpacity>
                    </View>
                    {formData.adv_Latitude !== null && (
                        <View style={[styles.locationPill, { backgroundColor: `${T.accent}15` }]}>
                            <Ionicons name="checkmark-circle" size={14} color={T.accent} />
                            <Text style={[styles.locationPillText, { color: T.accent }]}>
                                {formData.adv_Latitude.toFixed(4)}, {formData.adv_Longitude.toFixed(4)}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Image */}
                <View style={[styles.sectionCard, { backgroundColor: T.card, borderColor: T.cardBorder }]}>
                    <Text style={[styles.sectionTitle, { color: T.text }]}>🖼 Product Image</Text>
                    <TouchableOpacity
                        onPress={PickImage}
                        style={[styles.imagePickerBtn, { borderColor: T.accent, backgroundColor: `${T.accent}10` }]}
                        disabled={uploading}
                    >
                        <Ionicons name="camera" size={22} color={T.accent} />
                        <Text style={[styles.imagePickerText, { color: T.accent }]}>{uploading ? "Uploading…" : "Choose Image"}</Text>
                    </TouchableOpacity>
                    {formData.adv_Image ? (
                        <Image source={{ uri: `${urll}/uploads/${formData.adv_Image}` }} style={styles.previewImage} />
                    ) : null}
                </View>

                {/* Status */}
                <View style={[styles.sectionCard, { backgroundColor: T.card, borderColor: T.cardBorder }]}>
                    <View style={styles.switchRow}>
                        <View>
                            <Text style={[styles.label, { color: T.text }]}>Status</Text>
                            <Text style={{ fontSize: 12, color: T.textSub }}>Make ad visible to buyers</Text>
                        </View>
                        <Switch
                            value={formData.adv_Status}
                            onValueChange={v => setFormData(prev => ({ ...prev, adv_Status: v }))}
                            trackColor={{ false: T.inputBorder, true: `${T.accent}66` }}
                            thumbColor={formData.adv_Status ? T.accent : T.textMuted}
                        />
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.submitBtn, { backgroundColor: T.accent, shadowColor: T.accent }]}
                    onPress={handleSubmit}
                >
                    <Ionicons name="megaphone" size={20} color={T.accentBtn} />
                    <Text style={[styles.submitText, { color: T.accentBtn }]}>Post Advertisement</Text>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    fullContainer: { flex: 1 },
    bgLayer2: {
        position: 'absolute', top: 0, left: 0, right: 0, height: 200,
        backgroundColor: '#0d1f3a', borderBottomLeftRadius: 50, borderBottomRightRadius: 50,
    },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingTop: 52, paddingBottom: 14, paddingHorizontal: 16, borderBottomWidth: 1,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 4,
    },
    backBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '800' },
    scrollContainer: { padding: 14, paddingBottom: 60 },
    sectionCard: { borderRadius: 20, padding: 16, marginBottom: 14, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
    sectionTitle: { fontSize: 14, fontWeight: '800', marginBottom: 14 },
    label: { fontSize: 13, fontWeight: '700', marginBottom: 6 },
    pickerWrap: { borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 4, marginBottom: 14, overflow: 'hidden' },
    input: { borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11, marginBottom: 14, fontSize: 14 },
    textArea: { height: 88, textAlignVertical: 'top' },
    row2: { flexDirection: 'row', gap: 10 },
    col: { flex: 1 },
    inputWithIcon: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 14, marginBottom: 10 },
    inputFlex: { flex: 1, paddingVertical: 11, fontSize: 14 },
    mapPinBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    locationPill: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, alignSelf: 'flex-start' },
    locationPillText: { fontSize: 12, fontWeight: '600' },
    imagePickerBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 2, borderStyle: 'dashed', borderRadius: 16, paddingVertical: 16, justifyContent: 'center', marginBottom: 12 },
    imagePickerText: { fontWeight: '700', fontSize: 14 },
    previewImage: { width: '100%', height: 200, borderRadius: 14 },
    switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, borderRadius: 18, marginTop: 4, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 14, elevation: 10 },
    submitText: { fontSize: 16, fontWeight: '800' },
});

export default Advertisement;