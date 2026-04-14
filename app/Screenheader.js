/**
 * ScreenHeader.js
 *
 * Next-gen animated header component for Kisan Seva.
 * Features:
 *   • Scroll-driven collapse (tall → compact) with spring interpolation
 *   • Screen-specific gradient identities (4 unique palettes)
 *   • Floating geometric particle blobs with staggered pulse animations
 *   • Glassmorphism badge row (live stat pill + label)
 *   • Animated mesh grid overlay for depth
 *   • Entrance animation: fade + slide on mount
 *   • Light / dark mode aware
 */

import React, { useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, Animated, TouchableOpacity,
    Dimensions, StatusBar, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from './Themecontext';

const { width } = Dimensions.get('window');

// ─── Per-screen design tokens ─────────────────────────────────────────────────
export const HEADER_CONFIGS = {
    Home: {
        gradient:   ['#1e1b4b', '#312e81', '#4338ca'],
        accent:     '#818cf8',
        accentGlow: 'rgba(129,140,248,0.35)',
        orbs: [
            { color: 'rgba(129,140,248,0.22)', size: 180, top: -40, right: -30 },
            { color: 'rgba(16,185,129,0.15)',  size: 130, top: 60,  left: -40 },
            { color: 'rgba(245,158,11,0.12)',  size: 90,  bottom: -20, right: 60 },
        ],
        icon: 'leaf',
        label: 'Kisan Seva',
        sublabel: 'Farm · Connect · Grow',
    },
    FreshAd: {
        gradient:   ['#064e3b', '#065f46', '#059669'],
        accent:     '#34d399',
        accentGlow: 'rgba(52,211,153,0.35)',
        orbs: [
            { color: 'rgba(52,211,153,0.20)',  size: 200, top: -60, right: -50 },
            { color: 'rgba(16,185,129,0.12)',  size: 120, top: 80,  left: -30 },
            { color: 'rgba(6,182,212,0.10)',   size: 80,  bottom: -10, right: 40 },
        ],
        icon: 'sparkles',
        label: 'Fresh Ads',
        sublabel: 'Hot off the farm today',
    },
    PopularAds: {
        gradient:   ['#7c2d12', '#9a3412', '#c2410c'],
        accent:     '#fb923c',
        accentGlow: 'rgba(251,146,60,0.35)',
        orbs: [
            { color: 'rgba(251,146,60,0.22)',  size: 190, top: -50, right: -40 },
            { color: 'rgba(239,68,68,0.15)',   size: 130, top: 70,  left: -35 },
            { color: 'rgba(250,204,21,0.12)',  size: 85,  bottom: -15, right: 50 },
        ],
        icon: 'flame',
        label: 'Popular Ads',
        sublabel: 'Most viewed by farmers',
    },
    UserProfile: {
        gradient:   ['#1e1b4b', '#4c1d95', '#6d28d9'],
        accent:     '#a78bfa',
        accentGlow: 'rgba(167,139,250,0.35)',
        orbs: [
            { color: 'rgba(167,139,250,0.22)', size: 190, top: -50, right: -40 },
            { color: 'rgba(236,72,153,0.14)',  size: 120, top: 80,  left: -30 },
            { color: 'rgba(6,182,212,0.10)',   size: 75,  bottom: -10, right: 55 },
        ],
        icon: 'person-circle',
        label: 'My Profile',
        sublabel: 'Verified Farmer Account',
    },
};

// ─── Animated blob ────────────────────────────────────────────────────────────
function PulseBlob({ color, size, style, delay = 0 }) {
    const pulse = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.delay(delay),
                Animated.timing(pulse, { toValue: 1.12, duration: 2800, useNativeDriver: true }),
                Animated.timing(pulse, { toValue: 0.92, duration: 2800, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    return (
        <Animated.View style={[
            { position: 'absolute', width: size, height: size, borderRadius: size / 2, backgroundColor: color },
            style,
            { transform: [{ scale: pulse }] },
        ]} />
    );
}

// ─── Mesh grid overlay ────────────────────────────────────────────────────────
function MeshGrid({ color = 'rgba(255,255,255,0.04)' }) {
    const COLS = 6, ROWS = 3;
    return (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
            {Array.from({ length: ROWS }).map((_, r) => (
                <View key={r} style={{ position: 'absolute', top: r * 50, left: 0, right: 0, height: 1, backgroundColor: color }} />
            ))}
            {Array.from({ length: COLS }).map((_, c) => (
                <View key={c} style={{ position: 'absolute', left: c * (width / COLS), top: 0, bottom: 0, width: 1, backgroundColor: color }} />
            ))}
        </View>
    );
}

// ─── Main ScreenHeader ────────────────────────────────────────────────────────
export default function ScreenHeader({
                                         screen = 'Home',
                                         scrollY,                    // Animated.Value from parent FlatList
                                         title,                      // override label
                                         subtitle,                   // override sublabel
                                         badge,                      // { value, label } — live stat pill
                                         showBack = false,
                                         onBack,
                                         rightAction,                // { icon, onPress }
                                         logo,                       // show app logo if true
                                         COLLAPSED_H = 88,
                                         EXPANDED_H  = 190,
                                     }) {
    const { isDark } = useTheme();
    const cfg = HEADER_CONFIGS[screen] || HEADER_CONFIGS.Home;

    // ── Entrance animation ────────────────────────────────────────────────────
    const entranceY   = useRef(new Animated.Value(-30)).current;
    const entranceOp  = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.spring(entranceY,  { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
            Animated.timing(entranceOp, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]).start();
    }, []);

    // ── Scroll-driven collapse ────────────────────────────────────────────────
    const safeScrollY = scrollY || new Animated.Value(0);
    const COLLAPSE_RANGE = [0, EXPANDED_H - COLLAPSED_H];

    const headerHeight = safeScrollY.interpolate({
        inputRange: COLLAPSE_RANGE,
        outputRange: [EXPANDED_H, COLLAPSED_H],
        extrapolate: 'clamp',
    });

    const titleScale = safeScrollY.interpolate({
        inputRange: COLLAPSE_RANGE,
        outputRange: [1, 0.78],
        extrapolate: 'clamp',
    });

    const titleTranslateY = safeScrollY.interpolate({
        inputRange: COLLAPSE_RANGE,
        outputRange: [0, -18],
        extrapolate: 'clamp',
    });

    const subtitleOpacity = safeScrollY.interpolate({
        inputRange: [0, 60],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    const badgeOpacity = safeScrollY.interpolate({
        inputRange: [0, 40],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    const orbScale = safeScrollY.interpolate({
        inputRange: COLLAPSE_RANGE,
        outputRange: [1, 0.6],
        extrapolate: 'clamp',
    });

    const labelStr   = title    || cfg.label;
    const subStr     = subtitle || cfg.sublabel;

    return (
        <Animated.View style={[
            styles.wrapper,
            {
                height: headerHeight, // stays JS-driven
            }
        ]}>
            <Animated.View
                style={{
                    flex: 1,
                    transform: [{ translateY: entranceY }],
                    opacity: entranceOp,
                }}
            >
            <StatusBar barStyle="light-content" />

            {/* ── Gradient layers (3 stacked views simulate gradient) ── */}
            <View style={[styles.gradBase, { backgroundColor: cfg.gradient[0] }]} />
            <View style={[styles.gradMid,  { backgroundColor: cfg.gradient[1] }]} />
            <View style={[styles.gradTop,  { backgroundColor: cfg.gradient[2] }]} />

            {/* ── Animated blobs ── */}
            {cfg.orbs.map((o, i) => (
                <Animated.View key={i} style={{ transform: [{ scale: orbScale }] }}>
                    <PulseBlob
                        color={o.color}
                        size={o.size}
                        delay={i * 600}
                        style={{ top: o.top, left: o.left, right: o.right, bottom: o.bottom }}
                    />
                </Animated.View>
            ))}

            {/* ── Mesh grid ── */}
            <MeshGrid />

            {/* ── Bottom curved mask ── */}
            <View style={styles.curveMask} />

            {/* ── Content ── */}
            <View style={styles.contentWrapper}>

                {/* Top bar: back / logo / right action */}
                <View style={styles.topBar}>
                    {showBack ? (
                        <TouchableOpacity style={styles.iconBtn} onPress={onBack} activeOpacity={0.75}>
                            <Ionicons name="arrow-back" size={20} color="#fff" />
                        </TouchableOpacity>
                    ) : logo ? (
                        <View style={styles.logoWrap}>
                            <Image source={require('../assets/images/Logo.png')} style={styles.logo} />
                        </View>
                    ) : (
                        <View style={styles.iconBtn}>
                            <Ionicons name={cfg.icon} size={20} color={cfg.accent} />
                        </View>
                    )}

                    {rightAction && (
                        <TouchableOpacity style={styles.iconBtn} onPress={rightAction.onPress} activeOpacity={0.75}>
                            <Ionicons name={rightAction.icon} size={20} color="#fff" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Title block */}
                <Animated.View style={[
                    styles.titleBlock,
                    {
                        transform: [
                            { scale: titleScale },
                            { translateY: titleTranslateY },
                        ],
                    },
                ]}>
                    <Text style={styles.title} numberOfLines={1}>{labelStr}</Text>

                    <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
                        {subStr}
                    </Animated.Text>
                </Animated.View>

                {/* Badge / stat pill row */}
                {badge && (
                    <Animated.View style={[styles.badgeRow, { opacity: badgeOpacity }]}>
                        <View style={[styles.statPill, { backgroundColor: cfg.accentGlow, borderColor: cfg.accent + '55' }]}>
                            <View style={[styles.statDot, { backgroundColor: cfg.accent }]} />
                            <Text style={[styles.statVal, { color: cfg.accent }]}>{badge.value}</Text>
                            <Text style={[styles.statLbl, { color: cfg.accent + 'bb' }]}>{badge.label}</Text>
                        </View>
                    </Animated.View>
                )}
            </View>
        </Animated.View>
        </Animated.View>

    );
}

const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
        overflow: 'hidden',
        zIndex: 100,
        // Curved bottom
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 20,
        elevation: 16,
    },

    // Gradient layers
    gradBase: { ...StyleSheet.absoluteFillObject },
    gradMid:  { ...StyleSheet.absoluteFillObject, opacity: 0.65, marginTop: 40 },
    gradTop:  { ...StyleSheet.absoluteFillObject, opacity: 0.30, marginTop: 100 },

    // Curve mask at bottom for 3D depth illusion
    curveMask: {
        position: 'absolute', bottom: -1, left: 0, right: 0, height: 28,
        backgroundColor: 'transparent',
    },

    contentWrapper: {
        flex: 1,
        paddingTop: 48,
        paddingHorizontal: 18,
        paddingBottom: 16,
        justifyContent: 'space-between',
    },

    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    iconBtn: {
        width: 38, height: 38, borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.12)',
        justifyContent: 'center', alignItems: 'center',
    },

    logoWrap: {
        width: 38, height: 38, borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.15)',
        overflow: 'hidden',
        justifyContent: 'center', alignItems: 'center',
    },
    logo: { width: 44, height: 44, resizeMode: 'cover' },

    titleBlock: {
        marginTop: 8,
        transformOrigin: 'left center',
    },
    title: {
        fontSize: 30,
        fontWeight: '900',
        color: '#ffffff',
        letterSpacing: -0.5,
        textShadowColor: 'rgba(0,0,0,0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 8,
    },
    subtitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '500',
        marginTop: 3,
        letterSpacing: 0.3,
    },

    badgeRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 6,
    },
    statPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
    },
    statDot: {
        width: 6, height: 6, borderRadius: 3,
    },
    statVal: {
        fontSize: 13,
        fontWeight: '800',
    },
    statLbl: {
        fontSize: 11,
        fontWeight: '500',
    },
});