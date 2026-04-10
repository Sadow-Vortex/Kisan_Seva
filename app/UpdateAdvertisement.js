import React, { useEffect, useRef, useState } from 'react';
import {
    View, Text, TextInput, Switch, StyleSheet,
    ScrollView, Alert, TouchableOpacity, Image, StatusBar
} from 'react-native';
import axios from 'axios';
import RNPickerSelect from 'react-native-picker-select';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './Themecontext';

const UpdateAdvertisement = () => {
    const scrollRef  = useRef();
    const navigation = useNavigation();
    const route      = useRoute();
    const { adData } = route.params;
    const { theme: T, isDark } = useTheme();

    const url  = "https://kisan-seva-subcategory.onrender.com";
    const urll = "https://advertisment-jfil.onrender.com";

    const [categories, setCategories]     = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [focusedField, setFocusedField] = useState(null);

    const [formData, setFormData] = useState({
        adv_id: adData.adv_id, advUserID: adData.advUserID,
        adv_CategoryID: adData.adv_CategoryID?.toString(),
        advSubCategoryID: adData.advSubCategoryID?.toString(),
        adv_Title: adData.adv_Title || '', adv_Description: adData.adv_Description || '',
        adv_Unit: adData.adv_Unit?.toString() || '', adv_Price: adData.adv_Price?.toString() || '',
        adv_Address: adData.adv_Address || '', adv_Image: adData.adv_Image || '',
        adv_Status: adData.adv_Status,
        adv_Latitude: adData.adv_Location?.latitude || 0,
        adv_Longitude: adData.adv_Location?.longitude || 0,
    });

    useEffect(() => {
        axios.get(`${url}/category`).then(r => setCategories(r.data?.data || [])).catch(() => {});
    }, []);

    useEffect(() => {
        if (formData.adv_CategoryID) {
            axios.get(`${url}/subcategory/by-category/${formData.adv_CategoryID}`)
                .then(r => setSubcategories(r.data?.data || []))
                .catch(() => setSubcategories([]));
        }
    }, [formData.adv_CategoryID]);

    const PickImage = async () => {
        const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!perm.granted) { alert("Permission required!"); return; }
        const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 1 });
        if (!result.canceled) setFormData(prev => ({ ...prev, adv_Image: result.assets[0].uri }));
    };

    const handleUpdate = () => {
        if (!formData.adv_Title || !formData.adv_Unit || !formData.adv_Price) {
            Alert.alert('Validation', 'Title, Unit, and Price are required.'); return;
        }
        const payload = {
            adv_id: formData.adv_id, advUserID: formData.advUserID,
            adv_CategoryID: parseInt(formData.adv_CategoryID),
            advSubCategoryID: parseInt(formData.advSubCategoryID),
            adv_Title: formData.adv_Title, adv_Description: formData.adv_Description,
            adv_Unit: parseInt(formData.adv_Unit), adv_Price: parseFloat(formData.adv_Price),
            adv_Address: formData.adv_Address, adv_Image: formData.adv_Image,
            adv_Date: new Date().toISOString(), adv_Status: formData.adv_Status,
            adv_Location: { latitude: formData.adv_Latitude, longitude: formData.adv_Longitude }
        };
        axios.put(`${urll}/adv/${formData.adv_id}`, payload)
            .then(r => {
                if (r.data.status_code === 200) { Alert.alert('Success', 'Updated!'); navigation.goBack(); }
                else Alert.alert('Error', r.data.status_msg || 'Update failed.');
            })
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
        <View style={[styles.container, { backgroundColor: T.bg }]}>
            <StatusBar barStyle={T.statusBar} />
            {isDark && <View style={styles.bgLayer2} />}

            <View style={[styles.header, { backgroundColor: T.card, borderBottomColor: T.divider }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: T.inputBg }]}>
                    <Ionicons name="arrow-back" size={22} color={T.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: T.text }]}>Update Ad</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView ref={scrollRef} contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>

                <View style={[styles.sectionCard, { backgroundColor: T.card, borderColor: T.cardBorder }]}>
                    <Text style={[styles.sectionTitle, { color: T.text }]}>📂 Category</Text>
                    <Text style={[styles.label, { color: T.textSub }]}>Category</Text>
                    <View style={[styles.pickerWrap, { borderColor: T.inputBorder, backgroundColor: T.inputBg }]}>
                        <RNPickerSelect
                            onValueChange={v => setFormData(prev => ({ ...prev, adv_CategoryID: v }))}
                            items={categories.filter(c => c?.categoryId != null).map(c => ({ key: String(c.categoryId), label: String(c.categoryName ?? ''), value: c.categoryId }))}
                            value={formData.adv_CategoryID}
                            placeholder={{ label: "Select Category", value: null }}
                            style={pickerStyles}
                        />
                    </View>
                    <Text style={[styles.label, { color: T.textSub }]}>Subcategory</Text>
                    <View style={[styles.pickerWrap, { borderColor: T.inputBorder, backgroundColor: T.inputBg }]}>
                        <RNPickerSelect
                            onValueChange={v => setFormData(prev => ({ ...prev, advSubCategoryID: v }))}
                            items={subcategories.filter(s => s?.subCategoryId != null).map(s => ({ key: String(s.subCategoryId), label: String(s.subCategoryName ?? ''), value: s.subCategoryId }))}
                            value={formData.advSubCategoryID}
                            placeholder={{ label: "Select Subcategory", value: null }}
                            style={pickerStyles}
                        />
                    </View>
                </View>

                <View style={[styles.sectionCard, { backgroundColor: T.card, borderColor: T.cardBorder }]}>
                    <Text style={[styles.sectionTitle, { color: T.text }]}>📝 Ad Details</Text>
                    <Text style={[styles.label, { color: T.textSub }]}>Title *</Text>
                    <TextInput style={inputStyle('title')} value={formData.adv_Title} onChangeText={t => setFormData(prev => ({ ...prev, adv_Title: t }))} placeholder="Ad title" placeholderTextColor={T.placeholder} onFocus={() => setFocusedField('title')} onBlur={() => setFocusedField(null)} />
                    <Text style={[styles.label, { color: T.textSub }]}>Description</Text>
                    <TextInput style={[...inputStyle('desc'), styles.textArea]} value={formData.adv_Description} onChangeText={t => setFormData(prev => ({ ...prev, adv_Description: t }))} placeholder="Description" placeholderTextColor={T.placeholder} multiline onFocus={() => setFocusedField('desc')} onBlur={() => setFocusedField(null)} />
                    <View style={styles.row2}>
                        <View style={styles.col}>
                            <Text style={[styles.label, { color: T.textSub }]}>Unit *</Text>
                            <TextInput style={inputStyle('unit')} value={formData.adv_Unit} keyboardType="numeric" onChangeText={t => setFormData(prev => ({ ...prev, adv_Unit: t }))} placeholder="Qty" placeholderTextColor={T.placeholder} onFocus={() => setFocusedField('unit')} onBlur={() => setFocusedField(null)} />
                        </View>
                        <View style={styles.col}>
                            <Text style={[styles.label, { color: T.textSub }]}>Price *</Text>
                            <TextInput style={inputStyle('price')} value={formData.adv_Price} keyboardType="numeric" onChangeText={t => setFormData(prev => ({ ...prev, adv_Price: t }))} placeholder="₹ Price" placeholderTextColor={T.placeholder} onFocus={() => setFocusedField('price')} onBlur={() => setFocusedField(null)} />
                        </View>
                    </View>
                </View>

                <View style={[styles.sectionCard, { backgroundColor: T.card, borderColor: T.cardBorder }]}>
                    <Text style={[styles.sectionTitle, { color: T.text }]}>📍 Location</Text>
                    <Text style={[styles.label, { color: T.textSub }]}>Address</Text>
                    <View style={[styles.inputWithIcon, { borderColor: T.inputBorder, backgroundColor: T.inputBg }]}>
                        <TextInput style={[styles.inputFlex, { color: T.text }]} value={formData.adv_Address} onChangeText={t => setFormData(prev => ({ ...prev, adv_Address: t }))} placeholder="Enter address" placeholderTextColor={T.placeholder} />
                        <TouchableOpacity onPress={() => navigation.navigate('Map')} style={[styles.mapBtn, { backgroundColor: `${T.accent}22` }]}>
                            <Ionicons name="location" size={20} color={T.accent} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={[styles.sectionCard, { backgroundColor: T.card, borderColor: T.cardBorder }]}>
                    <Text style={[styles.sectionTitle, { color: T.text }]}>🖼 Product Image</Text>
                    <TouchableOpacity onPress={PickImage} style={[styles.imagePickerBtn, { borderColor: T.accent, backgroundColor: `${T.accent}10` }]}>
                        <Ionicons name="camera" size={22} color={T.accent} />
                        <Text style={[styles.imagePickerText, { color: T.accent }]}>Choose Image</Text>
                    </TouchableOpacity>
                    {formData.adv_Image ? (
                        <Image source={{ uri: formData.adv_Image.startsWith('http') ? formData.adv_Image : `${urll}/uploads/${formData.adv_Image}` }} style={styles.previewImage} />
                    ) : null}
                </View>

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

                <TouchableOpacity style={[styles.submitBtn, { backgroundColor: T.accent, shadowColor: T.accent }]} onPress={handleUpdate}>
                    <Ionicons name="checkmark-circle" size={20} color={T.accentBtn} />
                    <Text style={[styles.submitText, { color: T.accentBtn }]}>Update Advertisement</Text>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    bgLayer2: { position: 'absolute', top: 0, left: 0, right: 0, height: 200, backgroundColor: '#0d1f3a', borderBottomLeftRadius: 50, borderBottomRightRadius: 50 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingBottom: 14, paddingHorizontal: 16, borderBottomWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 4 },
    backBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '800' },
    scrollContainer: { padding: 14, paddingBottom: 40 },
    sectionCard: { borderRadius: 20, padding: 16, marginBottom: 14, borderWidth: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
    sectionTitle: { fontSize: 14, fontWeight: '800', marginBottom: 14 },
    label: { fontSize: 13, fontWeight: '700', marginBottom: 6 },
    pickerWrap: { borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 4, marginBottom: 14, overflow: 'hidden' },
    input: { borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11, marginBottom: 14, fontSize: 14 },
    inputFocused: {},
    textArea: { height: 88, textAlignVertical: 'top' },
    row2: { flexDirection: 'row', gap: 10 },
    col: { flex: 1 },
    inputWithIcon: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 14, marginBottom: 10 },
    inputFlex: { flex: 1, paddingVertical: 11, fontSize: 14 },
    mapBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    imagePickerBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 2, borderStyle: 'dashed', borderRadius: 16, paddingVertical: 16, justifyContent: 'center', marginBottom: 12 },
    imagePickerText: { fontWeight: '700', fontSize: 14 },
    previewImage: { width: '100%', height: 180, borderRadius: 14 },
    switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, borderRadius: 18, marginTop: 4, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 14, elevation: 10 },
    submitText: { fontSize: 16, fontWeight: '800' },
});

export default UpdateAdvertisement;