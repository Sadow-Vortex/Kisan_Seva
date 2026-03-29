import React, { useEffect, useState, useRef } from 'react';
import {
    View, Text, TextInput, Button, Switch, StyleSheet,
    ScrollView, Alert, TouchableOpacity, Dimensions, Image
} from 'react-native';
import { router } from "expo-router";
import axios from 'axios';
import * as Location from 'expo-location';
import RNPickerSelect from 'react-native-picker-select';
import { useRoute, useNavigation } from "@react-navigation/native";
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";

const Advertisement = () => {

    const scrollRef = useRef();
    const route = useRoute();
    const navigation = useNavigation();
    const { userId, subCategoryId } = route.params || {};

    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const url = "https://kisan-seva-subcategory.onrender.com";
    const urll = "https://advertisment-jfil.onrender.com";

    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        adv_CategoryID: '',
        adv_subCategoryID: subCategoryId || '',
        adv_Title: '',
        adv_Description: '',
        adv_Unit: '',
        adv_Price: '',
        adv_Address: '',
        adv_Image: '',
        adv_Status: true,
        adv_UserID: userId,
        adv_Latitude: null,
        adv_Longitude: null,
    });

    useEffect(() => {
        axios.get(`${url}/category`)
            .then(response => {
                const categoryArray = Array.isArray(response.data)
                    ? response.data
                    : response.data?.data || [];
                setCategories(categoryArray);
            })
            .catch(error => {
                console.error('Category fetch error:', error);
                setCategories([]);
            });
    }, []);

    useEffect(() => {
        if (formData.adv_CategoryID) {
            axios.get(`${url}/subcategory/by-category/${formData.adv_CategoryID}`)
                .then(response => {
                    const subArray = Array.isArray(response.data)
                        ? response.data
                        : response.data?.data || [];
                    setSubcategories(subArray);
                })
                .catch(() => setSubcategories([]));
        }
    }, [formData.adv_CategoryID]);

    useFocusEffect(
        useCallback(() => {
            const getLocationFromStorage = async () => {
                const storedLocation = await AsyncStorage.getItem("selectedLocation");

                if (storedLocation) {
                    const coords = JSON.parse(storedLocation);
                    await reverseGeocodeAndSetLocation(coords);
                    await AsyncStorage.removeItem("selectedLocation");
                }
            };

            getLocationFromStorage();
        }, [])
    );

    const reverseGeocodeAndSetLocation = async ({ latitude, longitude }) => {
        try {
            const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
            let addressString = 'Unknown location';

            if (geocode.length > 0) {
                const place = geocode[0];
                addressString = [
                    place.name,
                    place.street,
                    place.city || place.subregion,
                    place.region,
                    place.postalCode,
                    place.country
                ].filter(Boolean).join(', ');
            }

            setFormData(prev => ({
                ...prev,
                adv_Latitude: latitude,
                adv_Longitude: longitude,
                adv_Address: addressString,
            }));
        } catch (error) {
            console.error("Reverse geocoding failed:", error);

            setFormData(prev => ({
                ...prev,
                adv_Latitude: latitude,
                adv_Longitude: longitude,
                adv_Address: `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`
            }));
        }
    };

    const handleLocationSelect = () => {
        navigation.navigate("Map");
    };

    const PickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
            alert("Permission to access camera roll is required!");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            const localUri = result.assets[0].uri;
            const filename = localUri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename ?? '');
            const type = match ? `image/${match[1]}` : `image`;

            const formDataImage = new FormData();
            formDataImage.append('file', {
                uri: localUri,
                name: filename,
                type,
            });

            try {
                setUploading(true);

                const response = await axios.post(`${urll}/adv/upload`, formDataImage, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });

                console.log("UPLOAD RESPONSE:", response.data);

                const file = response.data?.filename;

                if (file) {
                    setFormData(prev => ({
                        ...prev,
                        adv_Image: file
                    }));
                } else {
                    Alert.alert('Upload Failed', 'No filename returned from server.');
                }

            } catch (error) {
                console.error('❌ Image upload failed:', error);
                Alert.alert('Upload Error', 'Failed to upload image. Try again.');
            } finally {
                setUploading(false);
            }
        }
    };

    const validateForm = () => {
        const { adv_CategoryID, adv_subCategoryID, adv_Title, adv_Unit, adv_Price } = formData;
        if (!adv_CategoryID || !adv_subCategoryID || !adv_Title || !adv_Unit || !adv_Price) {
            Alert.alert('Validation Error', 'Please fill all required fields.');
            return false;
        }
        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        let finalUserId = userId;

        if (!finalUserId || finalUserId === 0 || isNaN(finalUserId)) {
            try {
                const storedUser = await AsyncStorage.getItem('user');
                const parsed = storedUser ? JSON.parse(storedUser) : null;
                finalUserId = parsed?.id;

                if (!finalUserId || finalUserId === 0) {
                    Alert.alert("Error", "User ID missing. Please log in again.");
                    return;
                }
            } catch (err) {
                Alert.alert("Error", "Login session invalid. Please log in again.");
                return;
            }
        }

        const payload = {
            advUserID: parseInt(finalUserId),
            adv_CategoryID: parseInt(formData.adv_CategoryID),
            advSubCategoryID: parseInt(formData.adv_subCategoryID),
            adv_Title: formData.adv_Title,
            adv_Description: formData.adv_Description,
            adv_Unit: parseInt(formData.adv_Unit),
            adv_Price: parseFloat(formData.adv_Price),
            adv_Address: formData.adv_Address,
            adv_Image: formData.adv_Image,
            adv_Date: new Date().toISOString(),
            adv_Status: formData.adv_Status,
            adv_Location: {
                latitude: formData.adv_Latitude || 0,
                longitude: formData.adv_Longitude || 0
            },
        };

        axios.post(`${urll}/adv`, payload)
            .then(() => {

                Alert.alert('Success', 'Advertisement posted successfully');

                scrollRef.current?.scrollTo({ y: 0, animated: true });

                setFormData(prev => ({
                    ...prev,
                    adv_Title: '',
                    adv_Description: '',
                    adv_Unit: '',
                    adv_Price: '',
                    adv_Address: '',
                    adv_Image: '',
                    adv_Status: true,
                    adv_Latitude: null,
                    adv_Longitude: null,
                    adv_subCategoryID: subCategoryId || ''
                }));

                router.replace("/Home");
            })
            .catch(error => {
                Alert.alert('Error', 'Something went wrong while posting.');
                console.error("❌ Post failed:", error);
            });
    };

    return (
        <View style={styles.fullContainer}>

            <ScrollView
                ref={scrollRef}
                contentContainerStyle={styles.scrollContainer}
            >

                <View style={styles.card}>

                    <View style={styles.row2}>

                        <View style={styles.col}>
                            <Text style={styles.label}>Category *</Text>
                            <View style={styles.inputBox}>
                                <RNPickerSelect
                                    onValueChange={value =>
                                        setFormData(prev => ({ ...prev, adv_CategoryID: value }))
                                    }
                                    items={categories
                                        .filter(c => c?.categoryId != null)
                                        .map(c => ({
                                            key: String(c.categoryId),
                                            label: String(c.categoryName ?? ''),
                                            value: c.categoryId
                                        }))}
                                    value={formData.adv_CategoryID}
                                    placeholder={{ label: "Select Category", value: null }}
                                />
                            </View>
                        </View>

                        {!subCategoryId && (
                            <View style={styles.col}>
                                <Text style={styles.label}>Subcategory *</Text>
                                <View style={styles.inputBox}>
                                    <RNPickerSelect
                                        onValueChange={value =>
                                            setFormData(prev => ({ ...prev, adv_subCategoryID: value }))
                                        }
                                        items={subcategories
                                            .filter(s => s?.subCategoryId != null)
                                            .map(s => ({
                                                key: String(s.subCategoryId),
                                                label: String(s.subCategoryName ?? ''),
                                                value: s.subCategoryId
                                            }))}
                                        value={formData.adv_subCategoryID}
                                        placeholder={{ label: "Select Subcategory", value: null }}
                                    />
                                </View>
                            </View>
                        )}

                    </View>

                    <Text style={styles.label}>Title *</Text>
                    <TextInput
                        style={styles.input}
                        value={formData.adv_Title}
                        onChangeText={text => setFormData(prev => ({ ...prev, adv_Title: text }))}
                        placeholder="Title"
                    />

                    <Text style={styles.label}>Description</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={formData.adv_Description}
                        onChangeText={text => setFormData(prev => ({ ...prev, adv_Description: text }))}
                        placeholder="Description"
                        multiline
                    />

                    <View style={styles.row2}>

                        <View style={styles.col}>
                            <Text style={styles.label}>Unit *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.adv_Unit}
                                onChangeText={text => setFormData(prev => ({ ...prev, adv_Unit: text }))}
                                keyboardType="numeric"
                                placeholder="Unit"
                            />
                        </View>

                        <View style={styles.col}>
                            <Text style={styles.label}>Price *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.adv_Price}
                                onChangeText={text => setFormData(prev => ({ ...prev, adv_Price: text }))}
                                keyboardType="numeric"
                                placeholder="₹ Price"
                            />
                        </View>

                    </View>

                    <Text style={styles.label}>Address</Text>
                    <View style={styles.inputWithIcon}>
                        <TextInput
                            style={styles.inputFlex}
                            value={formData.adv_Address}
                            onChangeText={text => setFormData(prev => ({ ...prev, adv_Address: text }))}
                            placeholder="Enter address or select from map"
                        />
                        <TouchableOpacity onPress={handleLocationSelect}>
                            <Icon name="location-on" size={24} color="#2563eb" />
                        </TouchableOpacity>
                    </View>

                    {formData.adv_Latitude !== null && formData.adv_Longitude !== null && (
                        <View style={styles.locationPill}>
                            <Text style={styles.locationText}>
                                Selected Location: Lat: {formData.adv_Latitude.toFixed(4)}, Lon: {formData.adv_Longitude.toFixed(4)}
                            </Text>
                        </View>
                    )}

                    <Text style={styles.label}>Select Image</Text>

                    <TouchableOpacity
                        onPress={PickImage}
                        style={styles.chooseBtn}
                        disabled={uploading}
                    >
                        <Text style={styles.chooseText}>
                            {uploading ? "Uploading..." : "Choose Image"}
                        </Text>
                    </TouchableOpacity>

                    {formData.adv_Image && (
                        <Image
                            source={{ uri: `${urll}/uploads/${formData.adv_Image}` }}
                            style={styles.previewImage}
                        />
                    )}

                    <View style={styles.switchRow}>
                        <Text style={styles.label}>Status (Active)</Text>
                        <Switch
                            value={formData.adv_Status}
                            onValueChange={val => setFormData(prev => ({ ...prev, adv_Status: val }))}
                        />
                    </View>

                </View>

                <TouchableOpacity
                    style={styles.submitBtn}
                    onPress={handleSubmit}
                >
                    <Text style={styles.submitText}>Post Advertisement</Text>
                </TouchableOpacity>

            </ScrollView>

        </View>
    );
};

const styles = StyleSheet.create({

    fullContainer: {
        flex: 1,
        backgroundColor: "#FCEFE4"
    },

    scrollContainer: {
        padding: 16,
        paddingBottom: 120
    },

    card: {
        backgroundColor: "#fff",
        borderRadius: 22,
        padding: 16,

        marginTop: 100,

        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 14,
        elevation: 8
    },

    row2: {
        flexDirection: "row",
        gap: 10
    },

    col: {
        flex: 1
    },

    label: {
        fontSize: 13,
        fontWeight: "700",
        color: "#374151",
        marginBottom: 6
    },

    inputBox: {
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 14,
        paddingHorizontal: 10,
        backgroundColor: "#fafafa",
        marginBottom: 14
    },

    input: {
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: "#fafafa",
        marginBottom: 14
    },

    textArea: {
        height: 90,
        textAlignVertical: "top"
    },

    inputWithIcon: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 14,
        paddingHorizontal: 12,
        marginBottom: 10,
        backgroundColor: '#fafafa',
        justifyContent: 'space-between',
    },

    inputFlex: {
        flex: 1,
        paddingVertical: 10,
        fontSize: 14
    },

    locationPill: {
        alignSelf: "flex-start",
        backgroundColor: "#f1f5f9",
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        marginBottom: 14
    },

    locationText: {
        fontSize: 12,
        color: "#475569"
    },

    chooseBtn: {
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 14,
        paddingVertical: 12,
        alignItems: "center",
        marginBottom: 12
    },

    chooseText: {
        color: "#2563eb",
        fontWeight: "700"
    },

    previewImage: {
        width: "100%",
        height: 220,
        borderRadius: 16,
        marginBottom: 14
    },

    switchRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 4
    },

    submitBtn: {
        marginTop: 20,
        backgroundColor: "#6b7f3f",
        paddingVertical: 16,
        borderRadius: 18,
        alignItems: "center"
    },

    submitText: {
        color: "#ffffff",
        fontSize: 16,
        fontWeight: "800"
    }

});

export default Advertisement;
