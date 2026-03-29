import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Alert,
    TextInput,
    StyleSheet,
    ImageBackground,
    Image,
    Animated
} from "react-native";
import { Link, useNavigation } from "expo-router";

export default function SignUp() {

    const navigation = useNavigation();
    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [number, setNumber] = React.useState('');
    const [password, setPassword] = React.useState('');

    const [showSuccess, setShowSuccess] = React.useState(false);
    const successScale = React.useRef(new Animated.Value(0)).current;
    const successOpacity = React.useRef(new Animated.Value(0)).current;

    const url = `https://kisan-seva-user.onrender.com/api/users/`;

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

    const handleSignUp = async () => {
        try {

            const response = await fetch(`${url}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim(),
                    number: number.trim(),
                    password: password.trim(),
                }),
            });

            const data = await response.json();

            if (response.ok && data.status_code === 200) {

                playSuccessAnimation(() => {
                    navigation.navigate("LoginScreen");
                });

            } else {
                Alert.alert(data.status_msg || "Signup failed");
            }

        } catch (err) {
            console.error(err);
            Alert.alert("Sign up Error", err.message);
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
                        placeholder="Enter your name"
                        placeholderTextColor="#777"
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                    />

                    <TextInput
                        placeholder="Enter your email"
                        placeholderTextColor="#777"
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                    />

                    <TextInput
                        placeholder="Enter your number"
                        placeholderTextColor="#777"
                        style={styles.input}
                        value={number}
                        onChangeText={setNumber}
                        keyboardType="numeric"
                        autoCapitalize="none"
                    />

                    <TextInput
                        placeholder="Create password"
                        placeholderTextColor="#777"
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />

                    <TouchableOpacity style={styles.signupBtn} onPress={handleSignUp}>
                        <Text style={styles.signupText}>Create Account</Text>
                    </TouchableOpacity>

                    <View style={styles.loginRow}>
                        <Text style={styles.loginLabel}>Already have an account?</Text>
                        <Link href="./LoginScreen" style={styles.loginLink}> Login</Link>
                    </View>

                </View>

            </View>

            {/* ✅ new success animation overlay */}
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

    signupBtn: {
        backgroundColor: '#2f6df6',
        height: 46,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 6
    },

    signupText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600'
    },

    loginRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 16
    },

    loginLabel: {
        color: '#ffffff'
    },

    loginLink: {
        color: '#9ec1ff',
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
