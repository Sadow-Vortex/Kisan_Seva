import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
    View, Text, FlatList, Image, ActivityIndicator,
    StyleSheet, Alert, TouchableOpacity
} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Footer from "./Footer";
import {useFocusEffect} from "@react-navigation/native";

const BACKEND_URL = 'https://advertisment-jfil.onrender.com';

export default function UserAdvertisements() {
    const navigation = useNavigation();
    const { userId } = useLocalSearchParams();
    const [ads, setAds] = useState([]);
    const [loading, setLoading] = useState(true);

    useLayoutEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    useFocusEffect(
        React.useCallback(() => {
            fetchAds();
        }, [userId])
    );

    const fetchAds = () => {
        if (!userId) return;
        setLoading(true);
        fetch(`${BACKEND_URL}/adv/userID/${userId}`)
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch advertisements');
                return res.json();
            })
            .then((data) => {
                setAds(Array.isArray(data.data) ? data.data : []);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching ads:');
                setLoading(false);
            });
    };

    const handleDelete = (adv_id) => {
        Alert.alert(
            'Delete Advertisement',
            'Are you sure you want to delete this ad?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        fetch(`${BACKEND_URL}/adv/${adv_id}`, {
                            method: 'DELETE',
                        })
                            .then((res) => {
                                if (!res.ok) throw new Error('Failed to delete ad');
                                fetchAds();
                            })
                            .catch((err) => {
                                console.error('Delete error:', err);
                                Alert.alert('Error', 'Failed to delete advertisement.');
                            });
                    },
                },
            ]
        );
    };

    const handleUpdate = (ad) => {
        console.log(ad);
        navigation.navigate('UpdateAdvertisement', { adData: ad });
    };

    const renderAd = ({ item }) => (
        <View style={styles.card}>
            <Image
                source={{ uri: `${BACKEND_URL}/uploads/${item.adv_Image}` }}
                style={styles.image}
            />

            <View style={styles.details}>
                <Text style={styles.title}>{item.adv_Title}</Text>
                <Text style={styles.price}>₹ {item.adv_Price}</Text>

                {item.adv_Location && (
                    <Text style={styles.location}>
                        📍 {item.adv_Location.latitude}, {item.adv_Location.longitude}
                    </Text>
                )}

                {/* ACTION BUTTONS */}
                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={[styles.button, styles.updateBtn]}
                        onPress={() => handleUpdate(item)}
                    >
                        <Text style={styles.btnText}>Update</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.deleteBtn]}
                        onPress={() => handleDelete(item.adv_id)}
                    >
                        <Text style={styles.btnText}>Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    if (loading) return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;

    return (
        <View style={styles.container}>
            <View style={styles.headerBox}>
                <Text style={styles.brand}>Kisan Seva</Text>
                <Text style={styles.tagline}>Your trusted farmer platform</Text>
            </View>

            <Text style={styles.sectionTitle}>Your Posted Advertisements</Text>
            {ads.length === 0 ? (
                <Text style={styles.empty}>No ads posted yet.</Text>
            ) : (
                <FlatList
                    data={ads}
                    keyExtractor={(item) => item.adv_id.toString()}
                    renderItem={renderAd}
                    contentContainerStyle={styles.list}
                    refreshing={loading}
                    onRefresh={fetchAds}
                />
            )}
            <Footer/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9f5',
        paddingTop: 50
    },

    headerBox: {
        alignItems: 'center',
        marginBottom: 20
    },

    brand: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#2e7d32'
    },

    tagline: {
        fontSize: 14,
        color: '#666'
    },

    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10
    },

    card: {
        marginBottom: 15,
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 3,
    },

    image: {
        width: '100%',
        height: 150,
    },

    details: {
        padding: 12,
    },

    title: {
        fontSize: 18,
        fontWeight: '600',
    },

    price: {
        fontSize: 16,
        color: '#2e7d32',
        marginTop: 4,
    },

    location: {
        fontSize: 13,
        color: '#777',
        marginTop: 4,
    },

    /* BUTTONS */
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },

    button: {
        flex: 1,
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
    },

    updateBtn: {
        backgroundColor: '#4CAF50',
        marginRight: 5,
    },

    deleteBtn: {
        backgroundColor: '#e53935',
        marginLeft: 5,
    },

    btnText: {
        color: '#fff',
        fontWeight: '600',
    },
});
