import React, {useEffect, useState, useRef} from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ImageBackground,
    Image,
    Animated
} from 'react-native';
import { Link, useNavigation } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {

    const navigation = useNavigation();
    const [number, setNumber] = useState('');
    const [password, setPassword] = useState('');
    const url = `http://10.178.147.199:1012`;

    const [showSuccess, setShowSuccess] = useState(false);
    const successScale = useRef(new Animated.Value(0)).current;
    const successOpacity = useRef(new Animated.Value(0)).current;

    const dumpAsyncStorage = async () => {
        const keys = await AsyncStorage.getAllKeys();
        const items = await AsyncStorage.multiGet(keys);
        console.log('AsyncStorage Contents:', items);
    };

    useEffect(() => {
        dumpAsyncStorage();
    }, []);

    const playSuccessAnimation = (onDone) => {

        setShowSuccess(true);
        successScale.setValue(0);
        successOpacity.setValue(0);

        Animated.parallel([

            Animated.timing(successOpacity, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true
            }),

            Animated.spring(successScale, {
                toValue: 1,
                friction: 5,
                useNativeDriver: true
            })

        ]).start(() => {

            setTimeout(() => {
                setShowSuccess(false);
                onDone && onDone();
            }, 600);

        });
    };

    const handleLogin = async () => {
        try {

            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('isLogin');

            const response = await fetch(`${url}/api/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    number: number,
                    password: password
                })
            });

            if (response.ok) {

                const json = await response.json();
                const user = json.data;

                if (user?.id) {

                    await AsyncStorage.setItem('user', JSON.stringify(user));
                    await AsyncStorage.setItem('isLogin', 'true');

                    playSuccessAnimation(() => {
                        navigation.navigate('Home');
                    });

                } else {
                    alert('User data missing in response.');
                }

            } else {
                const responseText = await response.text();
                alert(responseText || 'Invalid credentials');
            }

        } catch (error) {
            console.error(error);
            alert(error.message || 'Network error');
        }
    };

    return (
        <ImageBackground
            source={require('../assets/images/farming.jpg')}
            style={styles.bg}
            resizeMode="cover"
        >
            <View style={styles.overlay}>

                <View style={styles.logoOuter}>
                    <View style={styles.logoCircle}>
                        <Image
                            source={require('../assets/images/Logo.png')}
                            style={styles.logo}
                        />
                    </View>
                </View>

                <Text style={styles.appTitle}>Kisan Seva</Text>
                <Text style={styles.subTitle}>Farm to Doorstep</Text>

                <View style={styles.card}>

                    <TextInput
                        placeholder="Enter your number"
                        placeholderTextColor="#999"
                        style={styles.input}
                        value={number}
                        onChangeText={setNumber}
                        autoCapitalize="none"
                    />

                    <TextInput
                        placeholder="Enter your password"
                        placeholderTextColor="#999"
                        style={styles.input}
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />

                    <View style={styles.row}>
                        <Text style={styles.remember}>Remember me</Text>
                        <Text style={styles.forgot}>Forgot Password?</Text>
                    </View>

                    <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
                        <Text style={styles.loginText}>Login</Text>
                    </TouchableOpacity>

                    <View style={styles.signupRow}>
                        <Text style={styles.signupLabel}>Don’t have an account?</Text>
                        <Link href="/SignUp" style={styles.signupLink}> Sign up</Link>
                    </View>

                </View>

            </View>

            {showSuccess && (
                <View style={styles.successOverlay}>
                    <Animated.View
                        style={[
                            styles.successCircle,
                            {
                                opacity: successOpacity,
                                transform: [{ scale: successScale }]
                            }
                        ]}
                    >
                        <Text style={styles.successCheck}>✓</Text>
                    </Animated.View>
                </View>
            )}

        </ImageBackground>
    );
}

const styles = StyleSheet.create({

    bg: {
        flex: 1
    },

    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.35)',
        justifyContent: 'center',
        paddingHorizontal: 22
    },

    appTitle: {
        textAlign: 'center',
        fontSize: 36,
        color: '#ffffff',
        fontWeight: '800',
        letterSpacing: 1.5,
        marginBottom: 4,
        textShadowColor: 'rgba(0,0,0,0.4)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 6
    },

    subTitle: {
        textAlign: 'center',
        fontSize: 15,
        color: 'rgba(255,255,255,0.9)',
        letterSpacing: 2,
        marginBottom: 26
    },

    card: {
        backgroundColor: 'rgba(255,255,255,0.18)',
        borderRadius: 24,
        padding: 18,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.35)'
    },

    input: {
        backgroundColor: 'rgba(255,255,255,0.75)',
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 15,
        marginBottom: 12
    },

    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16
    },

    remember: {
        fontSize: 13,
        color: '#555'
    },

    forgot: {
        fontSize: 13,
        color: '#2f6df6'
    },

    loginBtn: {
        backgroundColor: '#2f6df6',
        height: 46,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center'
    },

    loginText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600'
    },

    signupRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 16
    },

    signupLabel: {
        color: '#555'
    },

    signupLink: {
        color: '#2f6df6',
        fontWeight: '600'
    },

    logoOuter: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10
    },

    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        overflow: 'hidden',
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center'
    },

    logo: {
        width: 110,
        height: 110,
        resizeMode: 'cover'
    },

    successOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.35)',
        zIndex: 9999,
        elevation: 9999
    },

    successCircle: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#2ecc71',
        justifyContent: 'center',
        alignItems: 'center'
    },

    successCheck: {
        color: '#fff',
        fontSize: 72,
        fontWeight: '900'
    }

});
