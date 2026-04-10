// import React from "react";
// import {
//     View,
//     Text,
//     TouchableOpacity,
//     Alert,
//     TextInput,
//     StyleSheet,
//     ImageBackground,
//     Image,
//     Animated
// } from "react-native";
// import { Link, useNavigation } from "expo-router";
//
// export default function SignUp() {
//
//     const navigation = useNavigation();
//     const [name, setName] = React.useState('');
//     const [email, setEmail] = React.useState('');
//     const [number, setNumber] = React.useState('');
//     const [password, setPassword] = React.useState('');
//
//     const [showSuccess, setShowSuccess] = React.useState(false);
//     const successScale = React.useRef(new Animated.Value(0)).current;
//     const successOpacity = React.useRef(new Animated.Value(0)).current;
//
//     const url = `https://kisan-seva-user.onrender.com/api/users/`;
//
//
//
//
//     const [loading, setLoading] = React.useState(false);
//
// // ✅ Validation
//     const validate = () => {
//         if (!name.trim()) {
//             Alert.alert("Error", "Enter your name");
//             return false;
//         }
//         if (!email.includes("@")) {
//             Alert.alert("Error", "Enter valid email");
//             return false;
//         }
//         if (number.length !== 10) {
//             Alert.alert("Error", "Enter valid number");
//             return false;
//         }
//         if (password.length < 6) {
//             Alert.alert("Error", "Password must be 6+ chars");
//             return false;
//         }
//         return true;
//     };
//
// // ✅ SEND OTP
//     const handleSendOtp = async () => {
//
//         if (!validate()) return;
//
//         setLoading(true);
//
//         try {
//             const response = await fetch(`${url}send-otp`, {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json"
//                 },
//                 body: JSON.stringify({
//                     email: email.trim().toLowerCase()
//                 })
//             });
//
//             const data = await response.json();
//
//             if (data.status_code === 200) {
//
//                 // ✅ Navigate to OTP screen with data
//                 navigation.navigate("OtpVerification", {
//                     name,
//                     email,
//                     number,
//                     password
//                 });
//
//             } else {
//                 Alert.alert("Error", data.status_msg);
//             }
//
//         } catch (err) {
//             Alert.alert("Error", err.message);
//         } finally {
//             setLoading(false);
//         }
//     };
//
//     return (
//
//         <ImageBackground
//             source={require('../assets/images/farming.jpg')}
//             style={styles.bg}
//             resizeMode="cover"
//         >
//
//             <View style={styles.overlay}>
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
//                         placeholder="Enter your name"
//                         placeholderTextColor="#777"
//                         style={styles.input}
//                         value={name}
//                         onChangeText={setName}
//                         autoCapitalize="words"
//                     />
//
//                     <TextInput
//                         placeholder="Enter your email"
//                         placeholderTextColor="#777"
//                         style={styles.input}
//                         value={email}
//                         onChangeText={setEmail}
//                         autoCapitalize="none"
//                     />
//
//                     <TextInput
//                         placeholder="Enter your number"
//                         placeholderTextColor="#777"
//                         style={styles.input}
//                         value={number}
//                         onChangeText={setNumber}
//                         keyboardType="numeric"
//                         autoCapitalize="none"
//                     />
//
//                     <TextInput
//                         placeholder="Create password"
//                         placeholderTextColor="#777"
//                         style={styles.input}
//                         value={password}
//                         onChangeText={setPassword}
//                         secureTextEntry
//                     />
//                     <View style={{
//                         backgroundColor: 'rgba(47,109,246,0.25)',
//                         padding: 10,
//                         borderRadius: 10,
//                         marginBottom: 10
//                     }}>
//                         <Text style={{ color: '#fff', fontSize: 12, textAlign: 'center' }}>
//                             📧 OTP will be sent to your email
//                         </Text>
//                     </View>
//
//                     <TouchableOpacity onPress={handleSendOtp}>
//                         <Text>
//                             {loading ? "Sending..." : "Send OTP"}
//                         </Text>
//                     </TouchableOpacity>
//
//                     <View style={styles.loginRow}>
//                         <Text style={styles.loginLabel}>Already have an account?</Text>
//                         <Link href="./LoginScreen" style={styles.loginLink}> Login</Link>
//                     </View>
//
//                 </View>
//
//             </View>
//
//             {/* ✅ new success animation overlay */}
//             {showSuccess && (
//                 <View style={styles.successOverlay}>
//
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
//
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
//     signupBtn: {
//         backgroundColor: '#2f6df6',
//         height: 46,
//         borderRadius: 14,
//         alignItems: 'center',
//         justifyContent: 'center',
//         marginTop: 6
//     },
//
//     signupText: {
//         color: '#fff',
//         fontSize: 16,
//         fontWeight: '600'
//     },
//
//     loginRow: {
//         flexDirection: 'row',
//         justifyContent: 'center',
//         marginTop: 16
//     },
//
//     loginLabel: {
//         color: '#ffffff'
//     },
//
//     loginLink: {
//         color: '#9ec1ff',
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

import React, { useRef, useState, useEffect } from "react";
import {
    View, Text, TouchableOpacity, Alert, TextInput, StyleSheet,
    Image, Animated, Dimensions, StatusBar, KeyboardAvoidingView, Platform, ScrollView
} from "react-native";
import { Link, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get('window');

export default function SignUp() {
    const navigation = useNavigation();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [number, setNumber] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [focusedField, setFocusedField] = useState(null);
    const [loading, setLoading] = useState(false);

    const url = `https://kisan-seva-user.onrender.com/api/users/`;

    const cardAnim = useRef(new Animated.Value(0)).current;
    const orb1Y = useRef(new Animated.Value(0)).current;
    const orb2X = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(cardAnim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }).start();
        const floatOrb = (anim, duration, range) => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(anim, { toValue: range, duration, useNativeDriver: true }),
                    Animated.timing(anim, { toValue: -range, duration, useNativeDriver: true }),
                ])
            ).start();
        };
        floatOrb(orb1Y, 3000, 16);
        floatOrb(orb2X, 2700, 12);
    }, []);

    const validate = () => {
        if (!name.trim()) { Alert.alert("Error", "Enter your name"); return false; }
        if (!email.includes("@")) { Alert.alert("Error", "Enter valid email"); return false; }
        if (number.length !== 10) { Alert.alert("Error", "Enter valid 10-digit number"); return false; }
        if (password.length < 6) { Alert.alert("Error", "Password must be 6+ characters"); return false; }
        return true;
    };

    const handleSendOtp = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            const response = await fetch(`${url}send-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim().toLowerCase() })
            });
            const data = await response.json();
            if (data.status_code === 200) {
                navigation.navigate("OtpVerification", { name, email, number, password });
            } else {
                Alert.alert("Error", data.status_msg);
            }
        } catch (err) {
            Alert.alert("Error", err.message);
        } finally {
            setLoading(false);
        }
    };

    const fields = [
        { key: 'name', placeholder: 'Full name', icon: 'person-outline', value: name, setter: setName, keyboard: 'default' },
        { key: 'email', placeholder: 'Email address', icon: 'mail-outline', value: email, setter: setEmail, keyboard: 'email-address' },
        { key: 'number', placeholder: 'Phone number', icon: 'phone-portrait-outline', value: number, setter: setNumber, keyboard: 'phone-pad' },
    ];

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" />

            <View style={styles.bgLayer1} />
            <View style={styles.bgLayer2} />

            <Animated.View style={[styles.orb1, { transform: [{ translateY: orb1Y }] }]} />
            <Animated.View style={[styles.orb2, { transform: [{ translateX: orb2X }] }]} />

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

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

                    <Animated.View style={[styles.glassCard, {
                        opacity: cardAnim,
                        transform: [{ translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }]
                    }]}>
                        <Text style={styles.cardTitle}>Create Account</Text>
                        <Text style={styles.cardSub}>Join thousands of farmers today</Text>

                        {fields.map(f => (
                            <View key={f.key} style={[styles.inputWrap, focusedField === f.key && styles.inputFocused]}>
                                <Ionicons name={f.icon} size={18} color={focusedField === f.key ? '#7eeab4' : 'rgba(255,255,255,0.45)'} />
                                <TextInput
                                    style={styles.input}
                                    placeholder={f.placeholder}
                                    placeholderTextColor="rgba(255,255,255,0.3)"
                                    value={f.value}
                                    onChangeText={f.setter}
                                    keyboardType={f.keyboard}
                                    autoCapitalize={f.key === 'name' ? 'words' : 'none'}
                                    onFocus={() => setFocusedField(f.key)}
                                    onBlur={() => setFocusedField(null)}
                                />
                            </View>
                        ))}

                        <View style={[styles.inputWrap, focusedField === 'pass' && styles.inputFocused]}>
                            <Ionicons name="lock-closed-outline" size={18} color={focusedField === 'pass' ? '#7eeab4' : 'rgba(255,255,255,0.45)'} />
                            <TextInput
                                style={styles.input}
                                placeholder="Create password"
                                placeholderTextColor="rgba(255,255,255,0.3)"
                                secureTextEntry={!showPass}
                                value={password}
                                onChangeText={setPassword}
                                onFocus={() => setFocusedField('pass')}
                                onBlur={() => setFocusedField(null)}
                            />
                            <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                                <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={18} color="rgba(255,255,255,0.45)" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.otpNotice}>
                            <Ionicons name="mail" size={14} color="#7eeab4" />
                            <Text style={styles.otpNoticeText}>OTP verification will be sent to your email</Text>
                        </View>

                        <TouchableOpacity style={styles.signupBtn} onPress={handleSendOtp} disabled={loading} activeOpacity={0.85}>
                            <View style={styles.signupBtnInner}>
                                <Text style={styles.signupBtnText}>{loading ? "Sending OTP…" : "Continue"}</Text>
                                <Ionicons name="arrow-forward" size={18} color="#0a1628" />
                            </View>
                        </TouchableOpacity>

                        <View style={styles.loginRow}>
                            <Text style={styles.loginLabel}>Already have an account? </Text>
                            <Link href="./LoginScreen" style={styles.loginLink}>Sign in</Link>
                        </View>
                    </Animated.View>

                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#050e1a' },
    bgLayer1: { ...StyleSheet.absoluteFillObject, backgroundColor: '#050e1a' },
    bgLayer2: { position: 'absolute', top: 0, left: 0, right: 0, height: height * 0.45, backgroundColor: '#0d1f3a', borderBottomLeftRadius: 80, borderBottomRightRadius: 80 },

    orb1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(46,196,130,0.07)', top: -40, right: -40 },
    orb2: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(126,85,246,0.06)', bottom: 80, left: -30 },

    scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },

    logoSection: { alignItems: 'center', paddingTop: 55, paddingBottom: 24 },
    logoGlow: {
        width: 96, height: 96, borderRadius: 48,
        backgroundColor: 'rgba(46,196,130,0.12)',
        justifyContent: 'center', alignItems: 'center',
        shadowColor: '#2ec482', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.35, shadowRadius: 18, elevation: 18,
    },
    logoRing: {
        width: 78, height: 78, borderRadius: 39,
        borderWidth: 2, borderColor: 'rgba(46,196,130,0.4)',
        overflow: 'hidden', justifyContent: 'center', alignItems: 'center',
    },
    logo: { width: 90, height: 90, resizeMode: 'cover' },
    appTitle: { marginTop: 14, fontSize: 26, fontWeight: '900', color: '#fff', letterSpacing: 5 },
    titleUnderline: { width: 46, height: 2, backgroundColor: '#2ec482', borderRadius: 1, marginTop: 6 },
    subTitle: { marginTop: 6, fontSize: 12, color: 'rgba(255,255,255,0.4)', letterSpacing: 3 },

    glassCard: {
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 28, borderWidth: 1, borderColor: 'rgba(255,255,255,0.11)',
        padding: 26,
        shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.4, shadowRadius: 30, elevation: 20,
    },
    cardTitle: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 4 },
    cardSub: { fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 24 },

    inputWrap: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.07)',
        borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 16, height: 50, marginBottom: 12, gap: 10,
    },
    inputFocused: { borderColor: 'rgba(46,196,130,0.55)', backgroundColor: 'rgba(46,196,130,0.04)' },
    input: { flex: 1, color: '#fff', fontSize: 14, fontWeight: '500' },

    otpNotice: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: 'rgba(46,196,130,0.08)', borderRadius: 12,
        paddingHorizontal: 12, paddingVertical: 8, marginBottom: 20,
    },
    otpNoticeText: { color: 'rgba(126,234,180,0.9)', fontSize: 12, fontWeight: '500' },

    signupBtn: {
        borderRadius: 16, backgroundColor: '#2ec482',
        shadowColor: '#2ec482', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.45, shadowRadius: 14, elevation: 10,
        marginBottom: 22,
    },
    signupBtnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 50 },
    signupBtnText: { color: '#0a1628', fontSize: 15, fontWeight: '800', letterSpacing: 0.4 },

    loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    loginLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 14 },
    loginLink: { color: '#7eeab4', fontWeight: '700', fontSize: 14 },
});