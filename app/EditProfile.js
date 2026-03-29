import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    Alert,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    TouchableOpacity,
    Image
} from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import Footer from './Footer';
import { Ionicons } from '@expo/vector-icons';

export default function EditProfile() {

    const navigation = useNavigation();
    const { userId } = useLocalSearchParams();

    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_BASE_URL = 'https://kisan-seva-user.onrender.com';

    useEffect(() => {
        if (userId) {
            fetchUserDetails();
        } else {
            console.log("NA");
        }
    }, [userId]);

    const fetchUserDetails = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/users/${userId}`);
            const result = await response.json();

            if (result.status_code === 200 && result.data) {
                setUserData(result.data);
            } else {
                setUserData(null);
            }
        } catch (error) {
            console.error('Fetch error:', error);
            Alert.alert('Error', 'Failed to load user data.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        try {
            const payload = {
                name: userData.name,
                email: userData.email,
                password: userData.password,
                number: userData.number,
                profileImage: userData.profileImage,
                backImage: userData.backImage,
            };

            console.log("Payload:", payload);

            const response = await fetch(`${API_BASE_URL}/api/users/update/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const text = await response.text(); // 🔥 important
            console.log("RAW RESPONSE:", text);

            const result = JSON.parse(text);

            if (result.status_code === 200) {
                Alert.alert('Success', 'Profile updated successfully.');
                navigation.goBack();
            } else {
                Alert.alert('Error', text); // show REAL error
            }

        } catch (error) {
            console.error("Update error:", error);
            Alert.alert('Error', error.message);
        }
    };

    if (loading) return <Text style={{ marginTop: 40, textAlign: 'center' }}>Loading...</Text>;
    if (!userData) return <Text>User data not found or empty</Text>;

    return (
        <View style={styles.root}>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={80}
            >

                <ScrollView
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                >

                    {/* ---------- HEADER ---------- */}
                    <View style={styles.topBar}>
                        <View style={styles.logoRow}>
                            <Image
                                source={require('../assets/images/Logo.png')}
                                style={styles.logo}
                            />
                            <Text style={styles.brandText}>Kisan Seva</Text>
                        </View>
                    </View>

                    {/* ---------- COVER + PROFILE ---------- */}
                    <View style={styles.headerCard}>

                        {userData.backImage ? (
                            <Image
                                source={{ uri: `${API_BASE_URL}/uploads/${userData.backImage}` }}
                                style={styles.coverImage}
                            />
                        ) : (
                            <View style={styles.coverPlaceholder} />
                        )}

                        <View style={styles.profileWrapper}>
                            {userData.profileImage ? (
                                <Image
                                    source={{ uri: `${API_BASE_URL}/uploads/${userData.profileImage}` }}
                                    style={styles.profileImage}
                                />
                            ) : (
                                <View style={styles.profilePlaceholder}>
                                    <Ionicons name="person" size={40} color="#9ca3af" />
                                </View>
                            )}
                        </View>

                        <Text style={styles.profileName}>
                            {userData.name || 'Your Name'}
                        </Text>

                        <Text style={styles.profileUsername}>
                            @{userData.name || 'user'}
                        </Text>

                    </View>

                    {/* ---------- FORM CARD ---------- */}
                    <View style={styles.formCard}>

                        {/* Name */}
                        <View style={styles.inputRow}>
                            <Ionicons name="person-outline" size={20} color="#6b7f3f" />
                            <TextInput
                                style={styles.input}
                                placeholder="Name"
                                value={userData.name || ''}
                                onChangeText={(text) =>
                                    setUserData({ ...userData, name: text })
                                }
                            />
                        </View>

                        {/* Email */}
                        <View style={styles.inputRow}>
                            <Ionicons name="mail-outline" size={20} color="#6b7f3f" />
                            <TextInput
                                style={styles.input}
                                placeholder="Email"
                                keyboardType="email-address"
                                value={userData.email || ''}
                                onChangeText={(text) =>
                                    setUserData({ ...userData, email: text })
                                }
                            />
                        </View>

                        {/* Password */}
                        <View style={styles.inputRow}>
                            <Ionicons name="lock-closed-outline" size={20} color="#6b7f3f" />
                            <TextInput
                                style={styles.input}
                                placeholder="Password"
                                secureTextEntry
                                value={userData.password || ''}
                                onChangeText={(text) =>
                                    setUserData({ ...userData, password: text })
                                }
                            />
                        </View>

                        {/* Phone */}
                        <View style={styles.inputRow}>
                            <Ionicons name="call-outline" size={20} color="#6b7f3f" />
                            <TextInput
                                style={styles.input}
                                placeholder="Phone number"
                                keyboardType="phone-pad"
                                value={userData.number || ''}
                                onChangeText={(text) =>
                                    setUserData({ ...userData, number: text })
                                }
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.updateButton}
                            onPress={handleUpdate}
                        >
                            <Text style={styles.updateText}>
                                Update Profile
                            </Text>
                        </TouchableOpacity>

                    </View>

                </ScrollView>

            </KeyboardAvoidingView>

            <Footer />

        </View>
    );
}

export const options = {
    headerShown: false,
};

const styles = StyleSheet.create({

    root: {
        flex: 1,
        backgroundColor: '#FCEFE4'
    },

    scrollContainer: {
        paddingBottom: 120
    },

    topBar: {
        paddingTop: 50,
        paddingHorizontal: 18
    },

    logoRow: {
        flexDirection: 'row',
        alignItems: 'center'
    },

    logo: {
        width: 38,
        height: 38,
        borderRadius: 19,
        marginRight: 10
    },

    brandText: {
        fontSize: 22,
        fontWeight: '800',
        color: '#3f5f2a'
    },

    headerCard: {
        marginTop: 14,
        marginHorizontal: 16,
        backgroundColor: '#ffffff',
        borderRadius: 22,
        overflow: 'hidden',
        alignItems: 'center',
        paddingBottom: 18,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 14,
        elevation: 10
    },

    coverImage: {
        width: '100%',
        height: 140
    },

    coverPlaceholder: {
        width: '100%',
        height: 140,
        backgroundColor: '#e5e7eb'
    },

    profileWrapper: {
        marginTop: -40,
        width: 86,
        height: 86,
        borderRadius: 43,
        borderWidth: 4,
        borderColor: '#ffffff',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center'
    },

    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40
    },

    profilePlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f3f4f6'
    },

    profileName: {
        marginTop: 10,
        fontSize: 18,
        fontWeight: '800',
        color: '#1f2937'
    },

    profileUsername: {
        marginTop: 2,
        fontSize: 13,
        color: '#6b7280'
    },

    formCard: {
        marginTop: 18,
        marginHorizontal: 16,
        backgroundColor: '#ffffff',
        borderRadius: 22,
        padding: 16,

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 8
    },

    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        borderRadius: 14,
        paddingHorizontal: 14,
        height: 48,
        marginBottom: 14
    },

    input: {
        flex: 1,
        marginLeft: 10,
        fontSize: 14,
        color: '#111827'
    },

    updateButton: {
        marginTop: 8,
        backgroundColor: '#6b7f3f',
        height: 50,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center'
    },

    updateText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: '800',
        letterSpacing: 0.3
    }

});
