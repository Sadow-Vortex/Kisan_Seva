// import React, {useEffect, useState, useRef} from 'react';
// import {
//     View,
//     Text,
//     TextInput,
//     StyleSheet,
//     TouchableOpacity,
//     ImageBackground,
//     Image,
//     Animated
// } from 'react-native';
// import { Link, useNavigation } from 'expo-router';
// import AsyncStorage from '@react-native-async-storage/async-storage';
//
// export default function LoginScreen() {
//
//     const navigation = useNavigation();
//     const [number, setNumber] = useState('');
//     const [password, setPassword] = useState('');
//     const url = `https://kisan-seva-user.onrender.com`;
//
//     const [showSuccess, setShowSuccess] = useState(false);
//     const successScale = useRef(new Animated.Value(0)).current;
//     const successOpacity = useRef(new Animated.Value(0)).current;
//
//     const dumpAsyncStorage = async () => {
//         const keys = await AsyncStorage.getAllKeys();
//         const items = await AsyncStorage.multiGet(keys);
//         console.log('AsyncStorage Contents:', items);
//     };
//
//     useEffect(() => {
//         dumpAsyncStorage();
//     }, []);
//
//     const playSuccessAnimation = (onDone) => {
//
//         setShowSuccess(true);
//         successScale.setValue(0);
//         successOpacity.setValue(0);
//
//         Animated.parallel([
//
//             Animated.timing(successOpacity, {
//                 toValue: 1,
//                 duration: 150,
//                 useNativeDriver: true
//             }),
//
//             Animated.spring(successScale, {
//                 toValue: 1,
//                 friction: 5,
//                 useNativeDriver: true
//             })
//
//         ]).start(() => {
//
//             setTimeout(() => {
//                 setShowSuccess(false);
//                 onDone && onDone();
//             }, 600);
//
//         });
//     };
//
//     const handleLogin = async () => {
//         try {
//
//             await AsyncStorage.removeItem('user');
//             await AsyncStorage.removeItem('isLogin');
//
//             const response = await fetch(`${url}/api/users/login`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({
//                     number: number,
//                     password: password
//                 })
//             });
//
//             if (response.ok) {
//
//                 const json = await response.json();
//                 const user = json.data;
//
//                 if (user?.id) {
//
//                     await AsyncStorage.setItem('user', JSON.stringify(user));
//                     await AsyncStorage.setItem('isLogin', 'true');
//
//                     playSuccessAnimation(() => {
//                         navigation.navigate('Home');
//                     });
//
//                 } else {
//                     alert('User data missing in response.');
//                 }
//
//             } else {
//                 const responseText = await response.text();
//                 alert(responseText || 'Invalid credentials');
//             }
//
//         } catch (error) {
//             console.error(error);
//             alert(error.message || 'Network error');
//         }
//     };
//
//     return (
//         <ImageBackground
//             source={require('../assets/images/farming.jpg')}
//             style={styles.bg}
//             resizeMode="cover"
//         >
//             <View style={styles.overlay}>
//
//                 <View style={styles.logoOuter}>
//                     <View style={styles.logoCircle}>
//                         <Image
//                             source={require('../assets/images/Logo.png')}
//                             style={styles.logo}
//                         />
//                     </View>
//                 </View>
//
//                 <Text style={styles.appTitle}>Kisan Seva</Text>
//                 <Text style={styles.subTitle}>Farm to Doorstep</Text>
//
//                 <View style={styles.card}>
//
//                     <TextInput
//                         placeholder="Enter your number"
//                         placeholderTextColor="#999"
//                         style={styles.input}
//                         value={number}
//                         onChangeText={setNumber}
//                         autoCapitalize="none"
//                     />
//
//                     <TextInput
//                         placeholder="Enter your password"
//                         placeholderTextColor="#999"
//                         style={styles.input}
//                         secureTextEntry
//                         value={password}
//                         onChangeText={setPassword}
//                     />
//
//                     <View style={styles.row}>
//                         <Text style={styles.remember}>Remember me</Text>
//                         <Text style={styles.forgot}>Forgot Password?</Text>
//                     </View>
//
//                     <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
//                         <Text style={styles.loginText}>Login</Text>
//                     </TouchableOpacity>
//
//                     <View style={styles.signupRow}>
//                         <Text style={styles.signupLabel}>Don’t have an account?</Text>
//                         <Link href="/SignUp" style={styles.signupLink}> Sign up</Link>
//                     </View>
//
//                 </View>
//
//             </View>
//
//             {showSuccess && (
//                 <View style={styles.successOverlay}>
//                     <Animated.View
//                         style={[
//                             styles.successCircle,
//                             {
//                                 opacity: successOpacity,
//                                 transform: [{ scale: successScale }]
//                             }
//                         ]}
//                     >
//                         <Text style={styles.successCheck}>✓</Text>
//                     </Animated.View>
//                 </View>
//             )}
//
//         </ImageBackground>
//     );
// }
//
// const styles = StyleSheet.create({
//
//     bg: {
//         flex: 1
//     },
//
//     overlay: {
//         flex: 1,
//         backgroundColor: 'rgba(0,0,0,0.35)',
//         justifyContent: 'center',
//         paddingHorizontal: 22
//     },
//
//     appTitle: {
//         textAlign: 'center',
//         fontSize: 36,
//         color: '#ffffff',
//         fontWeight: '800',
//         letterSpacing: 1.5,
//         marginBottom: 4,
//         textShadowColor: 'rgba(0,0,0,0.4)',
//         textShadowOffset: { width: 0, height: 2 },
//         textShadowRadius: 6
//     },
//
//     subTitle: {
//         textAlign: 'center',
//         fontSize: 15,
//         color: 'rgba(255,255,255,0.9)',
//         letterSpacing: 2,
//         marginBottom: 26
//     },
//
//     card: {
//         backgroundColor: 'rgba(255,255,255,0.18)',
//         borderRadius: 24,
//         padding: 18,
//         borderWidth: 1,
//         borderColor: 'rgba(255,255,255,0.35)'
//     },
//
//     input: {
//         backgroundColor: 'rgba(255,255,255,0.75)',
//         borderRadius: 14,
//         paddingHorizontal: 16,
//         paddingVertical: 12,
//         fontSize: 15,
//         marginBottom: 12
//     },
//
//     row: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         marginBottom: 16
//     },
//
//     remember: {
//         fontSize: 13,
//         color: '#555'
//     },
//
//     forgot: {
//         fontSize: 13,
//         color: '#2f6df6'
//     },
//
//     loginBtn: {
//         backgroundColor: '#2f6df6',
//         height: 46,
//         borderRadius: 14,
//         alignItems: 'center',
//         justifyContent: 'center'
//     },
//
//     loginText: {
//         color: '#fff',
//         fontSize: 16,
//         fontWeight: '600'
//     },
//
//     signupRow: {
//         flexDirection: 'row',
//         justifyContent: 'center',
//         marginTop: 16
//     },
//
//     signupLabel: {
//         color: '#555'
//     },
//
//     signupLink: {
//         color: '#2f6df6',
//         fontWeight: '600'
//     },
//
//     logoOuter: {
//         alignItems: 'center',
//         justifyContent: 'center',
//         marginBottom: 10
//     },
//
//     logoCircle: {
//         width: 80,
//         height: 80,
//         borderRadius: 40,
//         overflow: 'hidden',
//         backgroundColor: 'transparent',
//         alignItems: 'center',
//         justifyContent: 'center'
//     },
//
//     logo: {
//         width: 110,
//         height: 110,
//         resizeMode: 'cover'
//     },
//
//     successOverlay: {
//         position: 'absolute',
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         justifyContent: 'center',
//         alignItems: 'center',
//         backgroundColor: 'rgba(0,0,0,0.35)',
//         zIndex: 9999,
//         elevation: 9999
//     },
//
//     successCircle: {
//         width: 120,
//         height: 120,
//         borderRadius: 60,
//         backgroundColor: '#2ecc71',
//         justifyContent: 'center',
//         alignItems: 'center'
//     },
//
//     successCheck: {
//         color: '#fff',
//         fontSize: 72,
//         fontWeight: '900'
//     }
//
// });

import React, { useEffect, useState, useRef } from 'react';
import {
    View, Text, TextInput, StyleSheet, TouchableOpacity,
    ImageBackground, Image, Animated, Dimensions, StatusBar, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { Link, useNavigation } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
    const navigation = useNavigation();
    const [number, setNumber] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const url = `https://kisan-seva-user.onrender.com`;

    const [showSuccess, setShowSuccess] = useState(false);
    const successScale = useRef(new Animated.Value(0)).current;
    const successOpacity = useRef(new Animated.Value(0)).current;

    // Floating orb animations
    const orb1Y = useRef(new Animated.Value(0)).current;
    const orb2Y = useRef(new Animated.Value(0)).current;
    const orb3X = useRef(new Animated.Value(0)).current;
    const cardAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Card entrance
        Animated.spring(cardAnim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }).start();

        // Floating orbs
        const floatOrb = (anim, duration, range) => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(anim, { toValue: range, duration, useNativeDriver: true }),
                    Animated.timing(anim, { toValue: -range, duration, useNativeDriver: true }),
                ])
            ).start();
        };
        floatOrb(orb1Y, 3200, 18);
        floatOrb(orb2Y, 2600, 14);
        floatOrb(orb3X, 2900, 12);
    }, []);

    const playSuccessAnimation = (onDone) => {
        setShowSuccess(true);
        successScale.setValue(0);
        successOpacity.setValue(0);
        Animated.parallel([
            Animated.timing(successOpacity, { toValue: 1, duration: 150, useNativeDriver: true }),
            Animated.spring(successScale, { toValue: 1, friction: 5, useNativeDriver: true })
        ]).start(() => {
            setTimeout(() => { setShowSuccess(false); onDone && onDone(); }, 600);
        });
    };

    const handleLogin = async () => {
        try {
            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('isLogin');
            const response = await fetch(`${url}/api/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ number, password })
            });
            if (response.ok) {
                const json = await response.json();
                const user = json.data;
                if (user?.id) {
                    await AsyncStorage.setItem('user', JSON.stringify(user));
                    await AsyncStorage.setItem('isLogin', 'true');
                    playSuccessAnimation(() => navigation.navigate('Home'));
                } else {
                    alert('User data missing in response.');
                }
            } else {
                const responseText = await response.text();
                alert(responseText || 'Invalid credentials');
            }
        } catch (error) {
            alert(error.message || 'Network error');
        }
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" />

            {/* Gradient background */}
            <View style={styles.bgGradient}>
                <View style={styles.bgLayer1} />
                <View style={styles.bgLayer2} />
                <View style={styles.bgLayer3} />
            </View>

            {/* Floating orbs */}
            <Animated.View style={[styles.orb, styles.orb1, { transform: [{ translateY: orb1Y }] }]} />
            <Animated.View style={[styles.orb, styles.orb2, { transform: [{ translateY: orb2Y }] }]} />
            <Animated.View style={[styles.orb, styles.orb3, { transform: [{ translateX: orb3X }] }]} />
            <View style={styles.gridLines} />

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

                    {/* Logo section */}
                    <View style={styles.logoSection}>
                        <View style={styles.logoGlow}>
                            <View style={styles.logoRing}>
                                <Image source={require('../assets/images/Logo.png')} style={styles.logo} />
                            </View>
                        </View>
                        <Text style={styles.appTitle}>KISAN SEVA</Text>
                        <View style={styles.titleUnderline} />
                        <Text style={styles.subTitle}>Farm · Connect · Grow</Text>
                    </View>

                    {/* Glass Card */}
                    <Animated.View style={[styles.glassCard, {
                        opacity: cardAnim,
                        transform: [{ translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }]
                    }]}>
                        <View style={styles.cardInner}>
                            <Text style={styles.cardTitle}>Welcome Back</Text>
                            <Text style={styles.cardSub}>Sign in to your account</Text>

                            {/* Phone field */}
                            <View style={[styles.inputWrap, focusedField === 'phone' && styles.inputFocused]}>
                                <Ionicons name="phone-portrait-outline" size={18} color={focusedField === 'phone' ? '#7eeab4' : 'rgba(255,255,255,0.5)'} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Phone number"
                                    placeholderTextColor="rgba(255,255,255,0.35)"
                                    value={number}
                                    onChangeText={setNumber}
                                    keyboardType="phone-pad"
                                    onFocus={() => setFocusedField('phone')}
                                    onBlur={() => setFocusedField(null)}
                                />
                            </View>

                            {/* Password field */}
                            <View style={[styles.inputWrap, focusedField === 'pass' && styles.inputFocused]}>
                                <Ionicons name="lock-closed-outline" size={18} color={focusedField === 'pass' ? '#7eeab4' : 'rgba(255,255,255,0.5)'} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Password"
                                    placeholderTextColor="rgba(255,255,255,0.35)"
                                    secureTextEntry={!showPass}
                                    value={password}
                                    onChangeText={setPassword}
                                    onFocus={() => setFocusedField('pass')}
                                    onBlur={() => setFocusedField(null)}
                                />
                                <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                                    <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color="rgba(255,255,255,0.5)" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.forgotRow}>
                                <Text style={styles.forgotText}>Forgot Password?</Text>
                            </View>

                            {/* Login button */}
                            <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} activeOpacity={0.85}>
                                <View style={styles.loginBtnInner}>
                                    <Text style={styles.loginBtnText}>Sign In</Text>
                                    <Ionicons name="arrow-forward" size={18} color="#0a1628" />
                                </View>
                            </TouchableOpacity>

                            <View style={styles.dividerRow}>
                                <View style={styles.dividerLine} />
                                <Text style={styles.dividerText}>OR</Text>
                                <View style={styles.dividerLine} />
                            </View>

                            <View style={styles.signupRow}>
                                <Text style={styles.signupLabel}>Don't have an account? </Text>
                                <Link href="/SignUp" style={styles.signupLink}>Create one</Link>
                            </View>
                        </View>
                    </Animated.View>

                </ScrollView>
            </KeyboardAvoidingView>

            {/* Success overlay */}
            {showSuccess && (
                <View style={styles.successOverlay}>
                    <Animated.View style={[styles.successCircle, { opacity: successOpacity, transform: [{ scale: successScale }] }]}>
                        <Text style={styles.successCheck}>✓</Text>
                    </Animated.View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#050e1a' },

    bgGradient: { ...StyleSheet.absoluteFillObject },
    bgLayer1: { ...StyleSheet.absoluteFillObject, backgroundColor: '#050e1a' },
    bgLayer2: { position: 'absolute', top: 0, left: 0, right: 0, height: height * 0.55, backgroundColor: '#0d1f3a', borderBottomLeftRadius: 80, borderBottomRightRadius: 80 },
    bgLayer3: { position: 'absolute', top: 0, left: 0, right: 0, height: height * 0.3, backgroundColor: '#0a2240', borderBottomLeftRadius: 60, borderBottomRightRadius: 120, opacity: 0.6 },

    orb: { position: 'absolute', borderRadius: 999 },
    orb1: { width: 220, height: 220, backgroundColor: 'rgba(46,196,130,0.08)', top: -60, right: -60, borderRadius: 110 },
    orb2: { width: 160, height: 160, backgroundColor: 'rgba(56,130,246,0.07)', top: height * 0.25, left: -50, borderRadius: 80 },
    orb3: { width: 120, height: 120, backgroundColor: 'rgba(168,85,247,0.06)', bottom: 100, right: 20, borderRadius: 60 },

    gridLines: {
        ...StyleSheet.absoluteFillObject,
        borderWidth: 0,
        opacity: 0.03,
    },

    scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },

    logoSection: { alignItems: 'center', paddingTop: 70, paddingBottom: 30 },

    logoGlow: {
        width: 110, height: 110, borderRadius: 55,
        backgroundColor: 'rgba(46,196,130,0.12)',
        justifyContent: 'center', alignItems: 'center',
        shadowColor: '#2ec482', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 20, elevation: 20,
    },
    logoRing: {
        width: 90, height: 90, borderRadius: 45,
        borderWidth: 2, borderColor: 'rgba(46,196,130,0.4)',
        overflow: 'hidden', justifyContent: 'center', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    logo: { width: 100, height: 100, resizeMode: 'cover' },

    appTitle: { marginTop: 16, fontSize: 28, fontWeight: '900', color: '#ffffff', letterSpacing: 6 },
    titleUnderline: { width: 50, height: 2, backgroundColor: '#2ec482', borderRadius: 1, marginTop: 6 },
    subTitle: { marginTop: 8, fontSize: 13, color: 'rgba(255,255,255,0.45)', letterSpacing: 3, fontWeight: '500' },

    glassCard: {
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 28,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        overflow: 'hidden',
        shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.4, shadowRadius: 30, elevation: 20,
    },
    cardInner: { padding: 28 },

    cardTitle: { fontSize: 24, fontWeight: '800', color: '#ffffff', marginBottom: 4 },
    cardSub: { fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 28, fontWeight: '400' },

    inputWrap: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.07)',
        borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 16, height: 52, marginBottom: 14, gap: 10,
    },
    inputFocused: { borderColor: 'rgba(46,196,130,0.6)', backgroundColor: 'rgba(46,196,130,0.05)' },
    input: { flex: 1, color: '#ffffff', fontSize: 15, fontWeight: '500' },

    forgotRow: { alignItems: 'flex-end', marginBottom: 22 },
    forgotText: { fontSize: 13, color: '#7eeab4', fontWeight: '600' },

    loginBtn: {
        borderRadius: 16, overflow: 'hidden',
        backgroundColor: '#2ec482',
        shadowColor: '#2ec482', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.5, shadowRadius: 16, elevation: 10,
    },
    loginBtnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 52 },
    loginBtnText: { color: '#0a1628', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },

    dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 22, gap: 12 },
    dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
    dividerText: { color: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: '600', letterSpacing: 1 },

    signupRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    signupLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
    signupLink: { color: '#7eeab4', fontWeight: '700', fontSize: 14 },

    successOverlay: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'center', alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999,
    },
    successCircle: {
        width: 120, height: 120, borderRadius: 60,
        backgroundColor: '#2ec482', justifyContent: 'center', alignItems: 'center',
        shadowColor: '#2ec482', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 30,
    },
    successCheck: { color: '#fff', fontSize: 72, fontWeight: '900' },
});