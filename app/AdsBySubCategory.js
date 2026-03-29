import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
    View, Text, Image, FlatList, Modal,
    TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Linking, Dimensions
} from 'react-native';
import axios from 'axios';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Footer from "./Footer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "expo-router";

const { width, height } = Dimensions.get("window");

export default function AdsBySubCategory() {

    const navigation = useNavigation();
    const route = useRoute();
    const { subCategoryId } = route.params;

    const [ads, setAds] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedAd, setSelectedAd] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);

    const url = `https://advertisment-jfil.onrender.com`;
    const userUrl = `https://kisan-seva-user.onrender.com`;

    useLayoutEffect(() => {
        navigation.setOptions({ headerShown: false });
    });

    const fetchAds = async () => {
        try {
            const response = await axios.get(`${url}/adv/subCategory/${subCategoryId}`);
            setAds(Array.isArray(response.data.data) ? response.data.data : []);
        } catch (error) {
            console.error('Failed to fetch ads:');
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${userUrl}/api/users/`, {
                timeout: 10000
            });

            const list = response?.data?.data;
            setUsers(Array.isArray(list) ? list : []);

        } catch (error) {

            if (error.response) {
                console.log("Failed to fetch users - response:", error.response.status);
                console.log("data:", error.response.data);
            } else if (error.request) {
                console.log("Failed to fetch users - no response (network)");
            } else {
                console.log("Failed to fetch users - axios error:", error.message);
            }
        }
    };

    useEffect(() => {
        if (subCategoryId) {
            fetchAds();
            fetchUsers();
        }
    }, [subCategoryId]);

    const openModal = async (ad) => {
        try {
            const storedUser = await AsyncStorage.getItem('user');
            const viewerId = storedUser ? JSON.parse(storedUser)?.id : null;

            if (!viewerId) {
                Alert.alert("Login Error", "Please log in to view this ad.");
                return;
            }

            const response = await axios.get(
                `${url}/adv/${ad.adv_id}?viewerId=${viewerId}`
            );

            const updatedAd = response.data?.data;

            const farmer = users.find(
                user => String(user.id) === String(updatedAd.advUserID)
            );

            const selected = { ...updatedAd, farmer };

            setSelectedAd(selected);
            setModalVisible(true);

        } catch (error) {
            console.error("Failed to open ad modal:", error);
            Alert.alert("Error", "Failed to load ad. Try again.");
        }
    };

    const closeModal = () => {
        setModalVisible(false);
        setSelectedAd(null);
    };

    const openDialer = (number) => {
        if (number) Linking.openURL(`tel:${number}`);
    };

    const openMap = (lat, lng) => {
        if (lat && lng) {
            const url = `https://www.google.com/maps?q=${lat},${lng}`;
            Linking.openURL(url);
        }
    };

    const renderItem = ({ item }) => (

        <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => openModal(item)}
            style={styles.card}
        >

            <View style={styles.imageWrapper}>
                {item.adv_Image ? (
                    <Image
                        source={{ uri: `${url}/uploads/${item.adv_Image}` }}
                        style={styles.image}
                    />
                ) : (
                    <View style={styles.imagePlaceholder}>
                        <Ionicons name="image-outline" size={40} color="#94a3b8" />
                    </View>
                )}

                <View style={styles.priceBadge}>
                    <Text style={styles.priceBadgeText}>₹{item.adv_Price}</Text>
                </View>
            </View>

            <View style={styles.cardBody}>
                <Text numberOfLines={1} style={styles.title}>
                    {item.adv_Title}
                </Text>

                <View style={styles.locationRow}>
                    <Ionicons name="location" size={14} color="#4d7c0f" />
                    <Text numberOfLines={1} style={styles.location}>
                        {item.adv_Address}
                    </Text>
                </View>
            </View>

        </TouchableOpacity>
    );

    if (loading)
        return <ActivityIndicator size="large" style={{ marginTop: 40 }} />;

    return (
        <View style={styles.container}>

            <View style={styles.header}>

                <View style={styles.logoRow}>
                    <Image
                        source={require("../assets/images/Logo.png")}
                        style={styles.logo}
                    />
                    <View>
                        <Text style={styles.brand}>Kisan Seva</Text>
                        <Text style={styles.tagline}>your trusted farmer platform</Text>
                    </View>
                </View>

            </View>

            {ads.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No Ads are posted</Text>
                </View>
            ) : (
                <FlatList
                    data={ads}
                    keyExtractor={(item) => item.adv_id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={{ paddingBottom: 120 }}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* ================= MODAL ================= */}

            <Modal visible={modalVisible} transparent animationType="slide">

                <View style={styles.modalBackground}>

                    <View style={styles.modalSheet}>

                        {selectedAd && (
                            <>

                                <View style={styles.modalHandle} />

                                <TouchableOpacity
                                    onPress={closeModal}
                                    style={styles.closeBtn}
                                >
                                    <Ionicons name="close" size={22} color="#334155" />
                                </TouchableOpacity>

                                <View style={styles.modalImageWrap}>
                                    {selectedAd.adv_Image ? (
                                        <Image
                                            source={{ uri: `${url}/uploads/${selectedAd.adv_Image}` }}
                                            style={styles.modalImage}
                                        />
                                    ) : (
                                        <View style={styles.modalNoImage}>
                                            <Ionicons name="image-outline" size={40} color="#94a3b8" />
                                        </View>
                                    )}

                                    <View style={styles.viewCountOverlay}>
                                        <Ionicons name="eye" size={14} color="#fff" />
                                        <Text style={styles.viewCountText}>
                                            {selectedAd.count || 0}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.modalBody}>

                                    <Text style={styles.modalTitle}>
                                        {selectedAd.adv_Title}
                                    </Text>

                                    <Text style={styles.modalPrice}>
                                        ₹{selectedAd.adv_Price}
                                    </Text>

                                    <View style={styles.modalLocationRow}>
                                        <Ionicons name="location" size={16} color="#4d7c0f" />
                                        <Text style={styles.modalLocation}>
                                            {selectedAd.adv_Address}
                                        </Text>
                                    </View>

                                    <Text style={styles.modalDesc}>
                                        {selectedAd.adv_Description || "No description provided."}
                                    </Text>

                                    {/* -------- Farmer Card -------- */}

                                    <View style={styles.farmerCard}>

                                        <Text style={styles.farmerHeader}>
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
                                                <Ionicons name="person-circle" size={52} color="#94a3b8" />
                                            )}

                                            <View style={{ marginLeft: 10 }}>
                                                <Text style={styles.farmerName}>
                                                    {selectedAd.farmer?.name || "Unknown"}
                                                </Text>
                                                <Text style={styles.farmerSub}>
                                                    Verified farmer
                                                </Text>
                                            </View>

                                        </View>

                                    </View>

                                </View>

                                <View style={styles.actionRow}>

                                    <TouchableOpacity
                                        style={[styles.actionBtn, styles.callBtn]}
                                        onPress={() => openDialer(selectedAd.farmer?.number)}
                                    >
                                        <Ionicons name="call" size={18} color="#fff" />
                                        <Text style={styles.actionText}>Call</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.actionBtn, styles.chatBtn]}
                                        onPress={() => Alert.alert("Chat", "Chat with farmer coming soon.")}
                                    >
                                        <Ionicons name="chatbubble-ellipses" size={18} color="#365314" />
                                        <Text style={styles.actionTextDark}>Chat</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.actionBtn, styles.navBtn]}
                                        onPress={() => openMap(
                                            selectedAd.adv_Location?.latitude,
                                            selectedAd.adv_Location?.longitude
                                        )}
                                    >
                                        <Ionicons name="navigate" size={18} color="#365314" />
                                        <Text style={styles.actionTextDark}>Navigate</Text>
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

    container: {
        flex: 1,
        backgroundColor: "#f8dec4"
    },

    header: {
        paddingTop: 48,
        paddingBottom: 16,
        paddingHorizontal: 16
    },

    logoRow: {
        flexDirection: "row",
        alignItems: "center"
    },

    logo: {
        width: 42,
        height: 42,
        borderRadius: 21,
        marginRight: 10
    },

    brand: {
        fontSize: 22,
        fontWeight: "800",
        color: "#3f6212"
    },

    tagline: {
        fontSize: 13,
        color: "#365314"
    },

    card: {
        marginHorizontal: 14,
        marginBottom: 14,
        borderRadius: 18,
        backgroundColor: "#fff",
        overflow: "hidden",
        elevation: 6
    },

    imageWrapper: {
        width: "100%",
        height: 170
    },

    image: {
        width: "100%",
        height: "100%"
    },

    imagePlaceholder: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#e5e7eb"
    },

    priceBadge: {
        position: "absolute",
        right: 10,
        bottom: 10,
        backgroundColor: "#4d7c0f",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16
    },

    priceBadgeText: {
        color: "#fff",
        fontWeight: "800"
    },

    cardBody: {
        padding: 12
    },

    title: {
        fontSize: 16,
        fontWeight: "800",
        color: "#1f2937"
    },

    locationRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4
    },

    location: {
        marginLeft: 4,
        fontSize: 12,
        color: "#4b5563",
        flex: 1
    },

    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },

    emptyText: {
        fontSize: 16,
        color: "#64748b"
    },

    modalBackground: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "flex-end"
    },

    modalSheet: {
        height: height * 0.85,
        backgroundColor: "#fef3e8",
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        overflow: "hidden"
    },

    modalHandle: {
        width: 60,
        height: 5,
        backgroundColor: "#cbd5e1",
        borderRadius: 3,
        alignSelf: "center",
        marginTop: 8,
        marginBottom: 6
    },

    closeBtn: {
        position: "absolute",
        right: 16,
        top: 10,
        zIndex: 10
    },

    modalImageWrap: {
        width: "100%",
        height: 220
    },

    modalImage: {
        width: "100%",
        height: "100%"
    },

    modalNoImage: {
        flex: 1,
        backgroundColor: "#e5e7eb",
        justifyContent: "center",
        alignItems: "center"
    },

    viewCountOverlay: {
        position: "absolute",
        top: 12,
        left: 12,
        backgroundColor: "rgba(0,0,0,0.55)",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 14
    },

    viewCountText: {
        color: "#fff",
        marginLeft: 4,
        fontSize: 12
    },

    modalBody: {
        padding: 16
    },

    modalTitle: {
        fontSize: 20,
        fontWeight: "900",
        color: "#1f2937"
    },

    modalPrice: {
        marginTop: 4,
        fontSize: 18,
        fontWeight: "800",
        color: "#4d7c0f"
    },

    modalLocationRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 6
    },

    modalLocation: {
        marginLeft: 6,
        fontSize: 13,
        color: "#374151",
        flex: 1
    },

    modalDesc: {
        marginTop: 10,
        fontSize: 14,
        color: "#374151"
    },

    farmerCard: {
        marginTop: 16,
        backgroundColor: "#ecfccb",
        borderRadius: 16,
        padding: 12
    },

    farmerHeader: {
        fontWeight: "800",
        color: "#365314",
        marginBottom: 8
    },

    farmerRow: {
        flexDirection: "row",
        alignItems: "center"
    },

    farmerAvatar: {
        width: 52,
        height: 52,
        borderRadius: 26
    },

    farmerName: {
        fontSize: 15,
        fontWeight: "800",
        color: "#1f2937"
    },

    farmerSub: {
        fontSize: 12,
        color: "#4d7c0f"
    },

    actionRow: {
        flexDirection: "row",
        paddingHorizontal: 12,
        paddingBottom: 16,
        paddingTop: 10,
        justifyContent: "space-between"
    },

    actionBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 12,
        borderRadius: 14,
        marginHorizontal: 4
    },

    callBtn: {
        backgroundColor: "#4d7c0f"
    },

    chatBtn: {
        backgroundColor: "#ecfccb"
    },

    navBtn: {
        backgroundColor: "#ecfccb"
    },

    actionText: {
        marginLeft: 6,
        color: "#fff",
        fontWeight: "800"
    },

    actionTextDark: {
        marginLeft: 6,
        color: "#365314",
        fontWeight: "800"
    }

});
