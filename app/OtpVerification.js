// import React, { useState, useRef, useEffect } from 'react';
// import {
//     View,
//     Text,
//     TextInput,
//     TouchableOpacity,
//     StyleSheet,
//     ImageBackground,
//     Image,
//     Animated,
//     Alert,
//     ActivityIndicator,
//     KeyboardAvoidingView,
//     Platform,
//     ScrollView
// } from 'react-native';
// import { useNavigation, useLocalSearchParams } from 'expo-router';
//
// const BASE_URL = `https://kisan-seva-user.onrender.com`;
// const OTP_LENGTH = 6;
// const RESEND_COUNTDOWN = 60; // seconds — longer for email
//
// export default function OtpVerification() {
//
//     const navigation = useNavigation();
//     const params = useLocalSearchParams();
//     const { name, email, number, password } = params;
//
//     // 6 individual OTP digit boxes
//     const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(''));
//     const inputRefs = useRef([]);
//
//     // UI state
//     const [loading,       setLoading]       = useState(false);
//     const [resendLoading, setResendLoading] = useState(false);
//     const [countdown,     setCountdown]     = useState(RESEND_COUNTDOWN);
//     const [canResend,     setCanResend]     = useState(false);
//
//     // Animations
//     const [showSuccess, setShowSuccess] = useState(false);
//     const successScale   = useRef(new Animated.Value(0)).current;
//     const successOpacity = useRef(new Animated.Value(0)).current;
//     const shakeAnim      = useRef(new Animated.Value(0)).current;
//
//     // ─── Countdown ────────────────────────────────────────────────────────────
//     useEffect(() => {
//         if (countdown <= 0) { setCanResend(true); return; }
//         const t = setTimeout(() => setCountdown(c => c - 1), 1000);
//         return () => clearTimeout(t);
//     }, [countdown]);
//
//     // ─── Mask email for display: user***@gmail.com ────────────────────────────
//     const maskedEmail = (() => {
//         if (!email) return '';
//         const [local, domain] = email.split('@');
//         const visible = local.slice(0, 3);
//         return `${visible}${'*'.repeat(Math.max(local.length - 3, 2))}@${domain}`;
//     })();
//
//     // ─── Animations ──────────────────────────────────────────────────────────
//     const playSuccessAnimation = (onDone) => {
//         setShowSuccess(true);
//         successScale.setValue(0);
//         successOpacity.setValue(0);
//         Animated.parallel([
//             Animated.timing(successOpacity, { toValue: 1, duration: 150, useNativeDriver: true }),
//             Animated.spring(successScale,   { toValue: 1, friction: 5,   useNativeDriver: true })
//         ]).start(() => setTimeout(() => { setShowSuccess(false); onDone?.(); }, 700));
//     };
//
//     const playShakeAnimation = () => {
//         shakeAnim.setValue(0);
//         Animated.sequence([
//             Animated.timing(shakeAnim, { toValue: 12,  duration: 60, useNativeDriver: true }),
//             Animated.timing(shakeAnim, { toValue: -12, duration: 60, useNativeDriver: true }),
//             Animated.timing(shakeAnim, { toValue: 8,   duration: 60, useNativeDriver: true }),
//             Animated.timing(shakeAnim, { toValue: 0,   duration: 60, useNativeDriver: true }),
//         ]).start();
//     };
//
//     // ─── OTP Input ────────────────────────────────────────────────────────────
//     const handleDigitChange = (text, index) => {
//         const digit = text.replace(/[^0-9]/g, '').slice(-1);
//         const updated = [...otpDigits];
//         updated[index] = digit;
//         setOtpDigits(updated);
//         if (digit && index < OTP_LENGTH - 1)
//             inputRefs.current[index + 1]?.focus();
//     };
//
//     const handleKeyPress = (e, index) => {
//         if (e.nativeEvent.key === 'Backspace' && !otpDigits[index] && index > 0)
//             inputRefs.current[index - 1]?.focus();
//     };
//
//     const getOtpString = () => otpDigits.join('');
//
//     // ─── Verify OTP → Register Account ───────────────────────────────────────
//     const handleVerify = async () => {
//         const otp = getOtpString();
//         if (otp.length < OTP_LENGTH) {
//             Alert.alert('Incomplete OTP', 'Please enter all 6 digits.');
//             return;
//         }
//
//         setLoading(true);
//         try {
//             const response = await fetch(`${BASE_URL}/api/users/register`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ name, email, number, password, otp })
//             });
//
//             const json = await response.json();
//
//             if (json.status_code === 200) {
//                 playSuccessAnimation(() => navigation.navigate('LoginScreen'));
//             } else {
//                 playShakeAnimation();
//                 Alert.alert('Verification Failed', json.status_msg || 'Invalid OTP. Please try again.');
//             }
//         } catch (err) {
//             console.error(err);
//             Alert.alert('Error', 'Network error. Please try again.');
//         } finally {
//             setLoading(false);
//         }
//     };
//
//     // ─── Resend OTP ───────────────────────────────────────────────────────────
//     const handleResend = async () => {
//         if (!canResend) return;
//
//         setResendLoading(true);
//         try {
//             const response = await fetch(`${BASE_URL}/api/users/send-otp`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ email })
//             });
//
//             const json = await response.json();
//
//             if (json.status_code === 200) {
//                 setOtpDigits(Array(OTP_LENGTH).fill(''));
//                 inputRefs.current[0]?.focus();
//                 setCountdown(RESEND_COUNTDOWN);
//                 setCanResend(false);
//                 Alert.alert('OTP Resent', `A new OTP has been sent to ${maskedEmail}`);
//             } else {
//                 Alert.alert('Error', json.status_msg || 'Failed to resend OTP.');
//             }
//         } catch (err) {
//             Alert.alert('Error', 'Network error. Please try again.');
//         } finally {
//             setResendLoading(false);
//         }
//     };
//
//     // ─── Render ───────────────────────────────────────────────────────────────
//     return (
//         <ImageBackground
//             source={require('../assets/images/farming.jpg')}
//             style={styles.bg}
//             resizeMode="cover"
//         >
//             <KeyboardAvoidingView
//                 style={{ flex: 1 }}
//                 behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//             >
//                 <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
//                     <View style={styles.overlay}>
//
//                         {/* Logo */}
//                         <View style={styles.logoOuter}>
//                             <View style={styles.logoCircle}>
//                                 <Image source={require('../assets/images/Logo.png')} style={styles.logo} />
//                             </View>
//                         </View>
//
//                         <Text style={styles.appTitle}>Kisan Seva</Text>
//                         <Text style={styles.subTitle}>Email Verification</Text>
//
//                         <View style={styles.card}>
//
//                             {/* Email icon + instruction */}
//                             <View style={styles.emailIconRow}>
//                                 <Text style={styles.emailIcon}>📧</Text>
//                             </View>
//
//                             <Text style={styles.infoText}>
//                                 We've sent a 6-digit OTP to
//                             </Text>
//                             <Text style={styles.emailText}>{maskedEmail}</Text>
//                             <Text style={styles.infoSubText}>
//                                 Check your inbox (and spam folder)
//                             </Text>
//
//                             {/* 6-box OTP input */}
//                             <Animated.View
//                                 style={[
//                                     styles.otpRow,
//                                     { transform: [{ translateX: shakeAnim }] }
//                                 ]}
//                             >
//                                 {otpDigits.map((digit, i) => (
//                                     <TextInput
//                                         key={i}
//                                         ref={ref => (inputRefs.current[i] = ref)}
//                                         style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
//                                         value={digit}
//                                         onChangeText={text => handleDigitChange(text, i)}
//                                         onKeyPress={e => handleKeyPress(e, i)}
//                                         keyboardType="numeric"
//                                         maxLength={1}
//                                         selectTextOnFocus
//                                         textAlign="center"
//                                     />
//                                 ))}
//                             </Animated.View>
//
//                             {/* Verify button */}
//                             <TouchableOpacity
//                                 style={[styles.verifyBtn, loading && styles.verifyBtnDisabled]}
//                                 onPress={handleVerify}
//                                 disabled={loading}
//                             >
//                                 {loading
//                                     ? <ActivityIndicator color="#fff" />
//                                     : <Text style={styles.verifyText}>Verify & Create Account</Text>
//                                 }
//                             </TouchableOpacity>
//
//                             {/* Resend */}
//                             <View style={styles.resendRow}>
//                                 <Text style={styles.resendLabel}>Didn't receive it? </Text>
//                                 {canResend ? (
//                                     <TouchableOpacity onPress={handleResend} disabled={resendLoading}>
//                                         {resendLoading
//                                             ? <ActivityIndicator size="small" color="#2f6df6" />
//                                             : <Text style={styles.resendLink}>Resend OTP</Text>
//                                         }
//                                     </TouchableOpacity>
//                                 ) : (
//                                     <Text style={styles.countdownText}>
//                                         Resend in <Text style={styles.countdownNum}>{countdown}s</Text>
//                                     </Text>
//                                 )}
//                             </View>
//
//                             {/* Back */}
//                             <TouchableOpacity
//                                 style={styles.backBtn}
//                                 onPress={() => navigation.goBack()}
//                             >
//                                 <Text style={styles.backText}>← Change Email</Text>
//                             </TouchableOpacity>
//
//                         </View>
//                     </View>
//                 </ScrollView>
//             </KeyboardAvoidingView>
//
//             {/* Success Overlay */}
//             {showSuccess && (
//                 <View style={styles.successOverlay}>
//                     <Animated.View style={[
//                         styles.successCircle,
//                         { opacity: successOpacity, transform: [{ scale: successScale }] }
//                     ]}>
//                         <Text style={styles.successCheck}>✓</Text>
//                     </Animated.View>
//                     <Text style={styles.successLabel}>Account Created!</Text>
//                 </View>
//             )}
//
//         </ImageBackground>
//     );
// }
//
// const styles = StyleSheet.create({
//
//     bg: { flex: 1 },
//
//     overlay: {
//         flex: 1,
//         backgroundColor: 'rgba(0,0,0,0.42)',
//         justifyContent: 'center',
//         paddingHorizontal: 22,
//         paddingVertical: 40
//     },
//
//     logoOuter: { alignItems: 'center', marginBottom: 10 },
//     logoCircle: {
//         width: 80, height: 80, borderRadius: 40,
//         overflow: 'hidden', alignItems: 'center', justifyContent: 'center'
//     },
//     logo: { width: 110, height: 110, resizeMode: 'cover' },
//
//     appTitle: {
//         textAlign: 'center', fontSize: 36, color: '#fff',
//         fontWeight: '800', letterSpacing: 1.5, marginBottom: 4,
//         textShadowColor: 'rgba(0,0,0,0.4)',
//         textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 6
//     },
//
//     subTitle: {
//         textAlign: 'center', fontSize: 15,
//         color: 'rgba(255,255,255,0.9)', letterSpacing: 2, marginBottom: 26
//     },
//
//     card: {
//         backgroundColor: 'rgba(255,255,255,0.18)',
//         borderRadius: 24, padding: 24,
//         borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)',
//         alignItems: 'center'
//     },
//
//     emailIconRow: { marginBottom: 10 },
//     emailIcon: { fontSize: 42 },
//
//     infoText: {
//         color: 'rgba(255,255,255,0.85)', fontSize: 14,
//         textAlign: 'center', marginBottom: 4
//     },
//
//     emailText: {
//         color: '#fff', fontSize: 17, fontWeight: '700',
//         textAlign: 'center', marginBottom: 4
//     },
//
//     infoSubText: {
//         color: 'rgba(255,255,255,0.6)', fontSize: 12,
//         textAlign: 'center', marginBottom: 24
//     },
//
//     otpRow: {
//         flexDirection: 'row', gap: 10,
//         justifyContent: 'center', marginBottom: 28
//     },
//
//     otpBox: {
//         width: 44, height: 52, borderRadius: 12,
//         backgroundColor: 'rgba(255,255,255,0.75)',
//         fontSize: 22, fontWeight: '700', color: '#1a1a2e',
//         textAlign: 'center',
//         borderWidth: 2, borderColor: 'transparent'
//     },
//
//     otpBoxFilled: {
//         borderColor: '#2f6df6', backgroundColor: '#fff'
//     },
//
//     verifyBtn: {
//         backgroundColor: '#2f6df6', height: 48,
//         borderRadius: 14, alignItems: 'center',
//         justifyContent: 'center', width: '100%', marginBottom: 20
//     },
//
//     verifyBtnDisabled: { backgroundColor: '#7aa3f8' },
//
//     verifyText: { color: '#fff', fontSize: 16, fontWeight: '600' },
//
//     resendRow: {
//         flexDirection: 'row', alignItems: 'center', marginBottom: 14
//     },
//
//     resendLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
//
//     resendLink: {
//         color: '#9ec1ff', fontWeight: '700', fontSize: 13,
//         textDecorationLine: 'underline'
//     },
//
//     countdownText: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
//
//     countdownNum: { color: '#fff', fontWeight: '700' },
//
//     backBtn: { marginTop: 4 },
//
//     backText: { color: 'rgba(255,255,255,0.65)', fontSize: 13 },
//
//     // ─── Success ────────────────────────────────────────────────────
//     successOverlay: {
//         position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
//         justifyContent: 'center', alignItems: 'center',
//         backgroundColor: 'rgba(0,0,0,0.5)',
//         zIndex: 9999, elevation: 9999
//     },
//
//     successCircle: {
//         width: 120, height: 120, borderRadius: 60,
//         backgroundColor: '#2ecc71',
//         justifyContent: 'center', alignItems: 'center', marginBottom: 16
//     },
//
//     successCheck: { color: '#fff', fontSize: 72, fontWeight: '900' },
//
//     successLabel: {
//         color: '#fff', fontSize: 22, fontWeight: '700', letterSpacing: 1
//     }
// });

import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, TextInput, TouchableOpacity, StyleSheet,
    Image, Animated, Alert, ActivityIndicator, KeyboardAvoidingView,
    Platform, ScrollView, Dimensions, StatusBar
} from 'react-native';
import { useNavigation, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const BASE_URL = `https://kisan-seva-user.onrender.com`;
const OTP_LENGTH = 6;
const RESEND_COUNTDOWN = 60;

export default function OtpVerification() {
    const navigation = useNavigation();
    const params = useLocalSearchParams();
    const { name, email, number, password } = params;

    const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(''));
    const inputRefs = useRef([]);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [countdown, setCountdown] = useState(RESEND_COUNTDOWN);
    const [canResend, setCanResend] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const successScale = useRef(new Animated.Value(0)).current;
    const successOpacity = useRef(new Animated.Value(0)).current;
    const shakeAnim = useRef(new Animated.Value(0)).current;
    const cardAnim = useRef(new Animated.Value(0)).current;
    const orb1Y = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(cardAnim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }).start();
        Animated.loop(
            Animated.sequence([
                Animated.timing(orb1Y, { toValue: 14, duration: 3000, useNativeDriver: true }),
                Animated.timing(orb1Y, { toValue: -14, duration: 3000, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    useEffect(() => {
        if (countdown <= 0) { setCanResend(true); return; }
        const t = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [countdown]);

    const maskedEmail = (() => {
        if (!email) return '';
        const [local, domain] = email.split('@');
        return `${local.slice(0, 3)}${'*'.repeat(Math.max(local.length - 3, 2))}@${domain}`;
    })();

    const playSuccessAnimation = (onDone) => {
        setShowSuccess(true);
        successScale.setValue(0);
        successOpacity.setValue(0);
        Animated.parallel([
            Animated.timing(successOpacity, { toValue: 1, duration: 150, useNativeDriver: true }),
            Animated.spring(successScale, { toValue: 1, friction: 5, useNativeDriver: true })
        ]).start(() => setTimeout(() => { setShowSuccess(false); onDone?.(); }, 700));
    };

    const playShakeAnimation = () => {
        shakeAnim.setValue(0);
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 12, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -12, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
        ]).start();
    };

    const handleDigitChange = (text, index) => {
        const digit = text.replace(/[^0-9]/g, '').slice(-1);
        const updated = [...otpDigits];
        updated[index] = digit;
        setOtpDigits(updated);
        if (digit && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace' && !otpDigits[index] && index > 0)
            inputRefs.current[index - 1]?.focus();
    };

    const handleVerify = async () => {
        const otp = otpDigits.join('');
        if (otp.length < OTP_LENGTH) { Alert.alert('Incomplete OTP', 'Please enter all 6 digits.'); return; }
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/api/users/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, number, password, otp })
            });
            const json = await response.json();
            if (json.status_code === 200) {
                playSuccessAnimation(() => navigation.navigate('LoginScreen'));
            } else {
                playShakeAnimation();
                Alert.alert('Verification Failed', json.status_msg || 'Invalid OTP.');
            }
        } catch (err) {
            Alert.alert('Error', 'Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!canResend) return;
        setResendLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/api/users/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const json = await response.json();
            if (json.status_code === 200) {
                setOtpDigits(Array(OTP_LENGTH).fill(''));
                inputRefs.current[0]?.focus();
                setCountdown(RESEND_COUNTDOWN);
                setCanResend(false);
                Alert.alert('OTP Resent', `A new OTP has been sent to ${maskedEmail}`);
            } else {
                Alert.alert('Error', json.status_msg || 'Failed to resend OTP.');
            }
        } catch (err) {
            Alert.alert('Error', 'Network error.');
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <View style={styles.root}>
            <StatusBar barStyle="light-content" />
            <View style={styles.bgLayer1} />
            <View style={styles.bgLayer2} />
            <Animated.View style={[styles.orb1, { transform: [{ translateY: orb1Y }] }]} />

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

                    <View style={styles.logoSection}>
                        <View style={styles.logoGlow}>
                            <View style={styles.logoRing}>
                                <Image source={require('../assets/images/Logo.png')} style={styles.logo} />
                            </View>
                        </View>
                        <Text style={styles.appTitle}>KISAN SEVA</Text>
                        <Text style={styles.subTitle}>Email Verification</Text>
                    </View>

                    <Animated.View style={[styles.glassCard, {
                        opacity: cardAnim,
                        transform: [{ translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }]
                    }]}>
                        <View style={styles.emailIconWrap}>
                            <Text style={styles.emailEmoji}>📧</Text>
                        </View>
                        <Text style={styles.cardTitle}>Check your inbox</Text>
                        <Text style={styles.infoText}>We've sent a 6-digit code to</Text>
                        <Text style={styles.emailText}>{maskedEmail}</Text>
                        <Text style={styles.infoSubText}>Check inbox & spam folder</Text>

                        <Animated.View style={[styles.otpRow, { transform: [{ translateX: shakeAnim }] }]}>
                            {otpDigits.map((digit, i) => (
                                <TextInput
                                    key={i}
                                    ref={ref => (inputRefs.current[i] = ref)}
                                    style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
                                    value={digit}
                                    onChangeText={text => handleDigitChange(text, i)}
                                    onKeyPress={e => handleKeyPress(e, i)}
                                    keyboardType="numeric"
                                    maxLength={1}
                                    selectTextOnFocus
                                    textAlign="center"
                                />
                            ))}
                        </Animated.View>

                        <TouchableOpacity
                            style={[styles.verifyBtn, loading && styles.verifyBtnDisabled]}
                            onPress={handleVerify}
                            disabled={loading}
                        >
                            {loading
                                ? <ActivityIndicator color="#0a1628" />
                                : <View style={styles.verifyBtnInner}>
                                    <Text style={styles.verifyText}>Verify & Create Account</Text>
                                    <Ionicons name="checkmark-circle" size={18} color="#0a1628" />
                                  </View>
                            }
                        </TouchableOpacity>

                        <View style={styles.resendRow}>
                            <Text style={styles.resendLabel}>Didn't receive it? </Text>
                            {canResend ? (
                                <TouchableOpacity onPress={handleResend} disabled={resendLoading}>
                                    {resendLoading
                                        ? <ActivityIndicator size="small" color="#7eeab4" />
                                        : <Text style={styles.resendLink}>Resend OTP</Text>
                                    }
                                </TouchableOpacity>
                            ) : (
                                <Text style={styles.countdownText}>
                                    Resend in <Text style={styles.countdownNum}>{countdown}s</Text>
                                </Text>
                            )}
                        </View>

                        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                            <Ionicons name="arrow-back" size={14} color="rgba(255,255,255,0.4)" />
                            <Text style={styles.backText}>Change Email</Text>
                        </TouchableOpacity>
                    </Animated.View>

                </ScrollView>
            </KeyboardAvoidingView>

            {showSuccess && (
                <View style={styles.successOverlay}>
                    <Animated.View style={[styles.successCircle, { opacity: successOpacity, transform: [{ scale: successScale }] }]}>
                        <Text style={styles.successCheck}>✓</Text>
                    </Animated.View>
                    <Text style={styles.successLabel}>Account Created!</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#050e1a' },
    bgLayer1: { ...StyleSheet.absoluteFillObject, backgroundColor: '#050e1a' },
    bgLayer2: { position: 'absolute', top: 0, left: 0, right: 0, height: height * 0.4, backgroundColor: '#0d1f3a', borderBottomLeftRadius: 80, borderBottomRightRadius: 80 },
    orb1: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(46,196,130,0.07)', top: -30, right: -30 },

    scrollContent: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 40 },

    logoSection: { alignItems: 'center', paddingTop: 55, paddingBottom: 24 },
    logoGlow: {
        width: 86, height: 86, borderRadius: 43,
        backgroundColor: 'rgba(46,196,130,0.12)',
        justifyContent: 'center', alignItems: 'center',
        shadowColor: '#2ec482', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 16,
    },
    logoRing: {
        width: 70, height: 70, borderRadius: 35,
        borderWidth: 2, borderColor: 'rgba(46,196,130,0.4)',
        overflow: 'hidden', justifyContent: 'center', alignItems: 'center',
    },
    logo: { width: 80, height: 80, resizeMode: 'cover' },
    appTitle: { marginTop: 12, fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: 5 },
    subTitle: { marginTop: 4, fontSize: 12, color: 'rgba(255,255,255,0.4)', letterSpacing: 2 },

    glassCard: {
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderRadius: 28, borderWidth: 1, borderColor: 'rgba(255,255,255,0.11)',
        padding: 26, alignItems: 'center',
    },
    emailIconWrap: { marginBottom: 12 },
    emailEmoji: { fontSize: 44 },
    cardTitle: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 10 },
    infoText: { color: 'rgba(255,255,255,0.55)', fontSize: 13, marginBottom: 4 },
    emailText: { color: '#7eeab4', fontSize: 16, fontWeight: '700', marginBottom: 4 },
    infoSubText: { color: 'rgba(255,255,255,0.35)', fontSize: 11, marginBottom: 28 },

    otpRow: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 28 },
    otpBox: {
        width: 44, height: 52, borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.08)',
        fontSize: 22, fontWeight: '700', color: '#fff',
        borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)',
    },
    otpBoxFilled: { borderColor: '#2ec482', backgroundColor: 'rgba(46,196,130,0.1)' },

    verifyBtn: {
        width: '100%', borderRadius: 16, backgroundColor: '#2ec482',
        height: 50, justifyContent: 'center', alignItems: 'center',
        marginBottom: 20,
        shadowColor: '#2ec482', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
    },
    verifyBtnDisabled: { backgroundColor: 'rgba(46,196,130,0.4)' },
    verifyBtnInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    verifyText: { color: '#0a1628', fontSize: 15, fontWeight: '800' },

    resendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    resendLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 13 },
    resendLink: { color: '#7eeab4', fontWeight: '700', fontSize: 13 },
    countdownText: { color: 'rgba(255,255,255,0.45)', fontSize: 13 },
    countdownNum: { color: '#7eeab4', fontWeight: '700' },

    backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    backText: { color: 'rgba(255,255,255,0.35)', fontSize: 13 },

    successOverlay: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'center', alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999,
    },
    successCircle: {
        width: 110, height: 110, borderRadius: 55,
        backgroundColor: '#2ec482', justifyContent: 'center', alignItems: 'center', marginBottom: 14,
        shadowColor: '#2ec482', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 28,
    },
    successCheck: { color: '#fff', fontSize: 66, fontWeight: '900' },
    successLabel: { color: '#fff', fontSize: 20, fontWeight: '700', letterSpacing: 1 },
});