import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Dimensions,
    ScrollView
} from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "expo-router";
import * as ImagePicker from 'expo-image-picker';
import Footer from "./Footer";
import { useRoute } from "@react-navigation/native";
import axios from "axios";

const { width } = Dimensions.get("window");

export default function UserProfile() {

    const navigation = useNavigation();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeAdsCount, setActiveAdsCount] = useState(0);

    const apiURL = `http://10.194.243.199:1012`;
    const adsURL = "http://10.194.243.199:2012";


    useLayoutEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permission Denied', 'Please allow access to your photos.');
                }

                const storedUser = await AsyncStorage.getItem('user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                } else {
                    navigation.reset({ index: 0, routes: [{ name: 'LoginScreen' }] });
                }
            } catch (err) {
                console.error("Error loading user:");
                Alert.alert("Error", "Could not load user data.");
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    useEffect(() => {
        if (!user?.id) return;

        axios
            .get(`${adsURL}/adv/userID/${user.id}`)
            .then(res => {

                const list = Array.isArray(res.data)
                    ? res.data
                    : res.data?.data || [];

                setActiveAdsCount(list.length);
            })
            .catch(err => {
                console.log("Failed to load ads count", err);
                setActiveAdsCount(0);
            });

    }, [user?.id]);


    const updateImage = async (field) => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: field === 'coverPic' ? [4, 2] : [1, 1],
                quality: 1,
            });

            if (!result.canceled) {

                const imageUri = result.assets[0].uri;
                const filename = imageUri.split('/').pop();
                const match = /\.(\w+)$/.exec(filename ?? '');
                const type = match ? `image/${match[1]}` : `image`;

                const formData = new FormData();
                formData.append('file', {
                    uri: imageUri,
                    name: filename,
                    type: type,
                });

                const uploadRes = await axios.post(`${apiURL}/users/upload`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                const imageUrl = uploadRes.data?.url;
                if (!imageUrl) throw new Error("Image upload failed");

                const updatedUser = { ...user, [field]: imageUrl };
                const updateRes = await axios.put(`${apiURL}/users/${user.id}`, updatedUser, {
                    headers: { 'Content-Type': 'application/json' },
                });

                const updatedUserData = updateRes.data?.data;

                if (updatedUserData) {
                    const finalUser = Array.isArray(updatedUserData) ? updatedUserData[0] : updatedUserData;
                    setUser(finalUser);
                    await AsyncStorage.setItem('user', JSON.stringify(finalUser));
                    Alert.alert('Success', `${field === 'profilePic' ? 'Profile' : 'Cover'} picture updated`);
                } else {
                    throw new Error("User update response missing data");
                }
            }

        } catch (error) {
            console.error("Upload error:", error);
            Alert.alert('Error', 'Failed to update picture.');
        }
    };

    const handleEdit = () => navigation.navigate('EditProfile', { userId: user?.id });
    const handleAds = () => navigation.navigate('MyAds', { userId: user?.id });

    const handleLogOut = async () => {
        try {
            await AsyncStorage.multiRemove(['user', 'isLogin', 'userId']);
            Alert.alert('You have been logged out');
            navigation.reset({ index: 0, routes: [{ name: 'LoginScreen' }] });
        } catch (err) {
            console.error(err);
            Alert.alert('Error', 'Failed to log out');
        }
    };

    if (loading || !user) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <View style={styles.container}>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
            >

                {/* Cover */}
                <View style={styles.coverWrapper}>

                    {user.coverPic ? (
                        <Image source={{ uri: user.coverPic }} style={styles.cover} />
                    ) : (
                        <View style={styles.coverPlaceholder}>
                            <Ionicons name="image-outline" size={40} color="#bbb" />
                        </View>
                    )}

                    <TouchableOpacity
                        style={styles.cameraCoverIcon}
                        onPress={() => updateImage('coverPic')}
                    >
                        <Ionicons name="camera" size={20} color="#fff" />
                    </TouchableOpacity>

                    {/* wave mask */}
                    <View style={styles.waveMask} />

                </View>

                {/* Profile picture */}
                <View style={styles.profilePicContainer}>

                    {user.profilePic ? (
                        <Image source={{ uri: user.profilePic }} style={styles.profilePic} />
                    ) : (
                        <Ionicons name="person" size={60} color="#999" />
                    )}

                    <TouchableOpacity
                        style={styles.cameraProfileIcon}
                        onPress={() => updateImage('profilePic')}
                    >
                        <Ionicons name="camera" size={16} color="#fff" />
                    </TouchableOpacity>

                </View>

                {/* Info */}
                <View style={styles.infoBlock}>
                    <Text style={styles.name}>
                        {user.name || 'No Name'}
                    </Text>

                    <View style={styles.verifiedRow}>
                        <Ionicons name="checkmark-circle" size={16} color="#6b7f3f" />
                        <Text style={styles.verifiedText}>Verified Farmer</Text>
                    </View>

                    <View style={styles.locationRow}>
                        <Ionicons name="location" size={16} color="#7c8557" />
                        <Text style={styles.locationText}>
                            Location not set
                        </Text>
                    </View>
                </View>

                {/* Top action buttons */}
                <View style={styles.topActionRow}>

                    <TouchableOpacity
                        style={styles.topActionCard}
                        onPress={() =>
                            navigation.navigate("Advertisement", {
                                userId: user?.id,
                                subCategoryId: null
                            })
                        }
                    >
                        <Ionicons name="add-circle-outline" size={22} color="#6b7f3f" />
                        <Text style={styles.topActionText}>Post</Text>
                    </TouchableOpacity>


                    <TouchableOpacity style={styles.topActionCard}>
                        <Ionicons name="chatbubble-ellipses" size={22} color="#6b7f3f" />
                        <Text style={styles.topActionText}>Messages</Text>
                    </TouchableOpacity>

                </View>

                {/* stats */}
                <View style={styles.statRow}>
                    <View style={styles.statLine} />
                    <Text style={styles.statText}>
                        Active Ads : {activeAdsCount}
                    </Text>
                    <View style={styles.statLine} />
                </View>

                {/* menu cards */}
                <View style={styles.menuCard}>

                    <TouchableOpacity style={styles.menuRow} onPress={handleAds}>
                        <Ionicons name="megaphone" size={22} color="#6b7f3f" />
                        <View style={styles.menuTextBlock}>
                            <Text style={styles.menuTitle}>My Advertisements</Text>
                            <Text style={styles.menuSub}>View, edit, and delete your ads.</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuRow}>
                        <Ionicons name="location" size={22} color="#6b7f3f" />
                        <View style={styles.menuTextBlock}>
                            <Text style={styles.menuTitle}>My Location</Text>
                            <Text style={styles.menuSub}>Your pickup / farm location</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuRow} onPress={handleEdit}>
                        <Ionicons name="person" size={22} color="#6b7f3f" />
                        <View style={styles.menuTextBlock}>
                            <Text style={styles.menuTitle}>Account Info</Text>
                            <Text style={styles.menuSub}>Name, phone, email</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuRow}>
                        <Ionicons name="help-circle" size={22} color="#6b7f3f" />
                        <View style={styles.menuTextBlock}>
                            <Text style={styles.menuTitle}>Help & Support</Text>
                            <Text style={styles.menuSub}>Privacy & Terms</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
                    </TouchableOpacity>

                </View>

                {/* logout */}
                <TouchableOpacity
                    style={styles.logoutRow}
                    onPress={handleLogOut}
                >
                    <Ionicons name="power" size={20} color="#7c2d12" />
                    <Text style={styles.logoutText}>Log out</Text>
                </TouchableOpacity>

            </ScrollView>

            <Footer />

        </View>
    );
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#FCEFE4"
    },

    coverWrapper: {
        width: "100%",
        height: 190,
        overflow: "hidden"
    },

    cover: {
        width: "100%",
        height: 190
    },

    coverPlaceholder: {
        width: "100%",
        height: 190,
        backgroundColor: "#e5e7eb",
        justifyContent: "center",
        alignItems: "center"
    },

    waveMask: {
        position: "absolute",
        bottom: -28,
        width: width,
        height: 56,
        backgroundColor: "#FCEFE4",
        borderTopLeftRadius: 60,
        borderTopRightRadius: 60
    },

    cameraCoverIcon: {
        position: 'absolute',
        bottom: 18,
        right: 18,
        backgroundColor: '#0006',
        padding: 8,
        borderRadius: 18
    },

    profilePicContainer: {
        alignSelf: "center",
        marginTop: -60,
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 4,
        borderColor: "#fff",

        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 10,
        elevation: 8
    },

    profilePic: {
        width: 102,
        height: 102,
        borderRadius: 51
    },

    cameraProfileIcon: {
        position: "absolute",
        bottom: 4,
        right: 4,
        backgroundColor: "#0006",
        padding: 5,
        borderRadius: 14
    },

    infoBlock: {
        marginTop: 10,
        alignItems: "center"
    },

    name: {
        fontSize: 22,
        fontWeight: "800",
        color: "#3f3f46"
    },

    verifiedRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 6
    },

    verifiedText: {
        marginLeft: 6,
        fontSize: 13,
        color: "#6b7f3f",
        fontWeight: "600"
    },

    locationRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 6
    },

    locationText: {
        marginLeft: 6,
        fontSize: 13,
        color: "#7c8557"
    },

    topActionRow: {
        flexDirection: "row",
        gap: 12,
        justifyContent: "center",
        marginTop: 18
    },

    topActionCard: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#ffffff",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 18,

        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 5
    },

    topActionText: {
        fontWeight: "700",
        color: "#374151"
    },

    statRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 18,
        marginBottom: 10
    },

    statLine: {
        width: 60,
        height: 1,
        backgroundColor: "#e7d6c9"
    },

    statText: {
        marginHorizontal: 10,
        fontSize: 13,
        color: "#6b7280",
        fontWeight: "600"
    },

    menuCard: {
        marginTop: 12,
        marginHorizontal: 16,
        backgroundColor: "#ffffff",
        borderRadius: 22,
        paddingVertical: 4,

        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        elevation: 7
    },

    menuRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 18,
        paddingVertical: 14
    },

    menuTextBlock: {
        flex: 1,
        marginLeft: 12
    },

    menuTitle: {
        fontSize: 14,
        fontWeight: "800",
        color: "#374151"
    },

    menuSub: {
        fontSize: 12,
        color: "#6b7280",
        marginTop: 2
    },

    logoutRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 16,
        marginHorizontal: 16,
        backgroundColor: "#ffffff",
        borderRadius: 18,
        paddingVertical: 14,
        paddingHorizontal: 18,

        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 5
    },

    logoutText: {
        fontSize: 14,
        fontWeight: "800",
        color: "#7c2d12"
    }

});
