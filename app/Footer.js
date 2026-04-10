import React from "react";
import { View, TouchableOpacity, StyleSheet, Image, Text } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "./Themecontext";

const NAV_ITEMS = [
    { name: "Home",        icon: require("../assets/images/home-agreement.png"), label: "Home"    },
    { name: "PopularAds",  icon: require("../assets/images/fire.png"),           label: "Popular" },
    { name: "FreshAd",     icon: require("../assets/images/fresh.png"),          label: "Fresh"   },
    { name: "UserProfile", icon: require("../assets/images/user.png"),           label: "Profile" },
];

export default function Footer() {
    const navigation = useNavigation();
    const route      = useRoute();
    const { theme }  = useTheme();

    const isActive = (name) => route.name === name;

    return (
        <View style={styles.wrapper}>
            <View style={[styles.footer, {
                backgroundColor: theme.navBg,
                borderColor: theme.navBorder,
            }]}>
                {NAV_ITEMS.map((item) => {
                    const active = isActive(item.name);
                    return (
                        <TouchableOpacity
                            key={item.name}
                            onPress={() => navigation.navigate(item.name)}
                            style={styles.navItem}
                            activeOpacity={0.7}
                        >
                            {active && (
                                <View style={[styles.activePill, { backgroundColor: theme.accent }]} />
                            )}
                            <View style={[
                                styles.iconWrap,
                                active && { backgroundColor: `${theme.accent}22` }
                            ]}>
                                <Image
                                    source={item.icon}
                                    style={[
                                        styles.icon,
                                        { tintColor: active ? theme.accent : theme.iconInactive }
                                    ]}
                                />
                            </View>
                            <Text style={[
                                styles.navLabel,
                                { color: active ? theme.accent : theme.iconInactive },
                                active && styles.navLabelActive
                            ]}>
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        position: "absolute", bottom: 0, left: 0, right: 0,
        paddingHorizontal: 12, paddingBottom: 8,
    },
    footer: {
        borderRadius: 26,
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        height: 66,
        paddingHorizontal: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 20,
        borderWidth: 1,
    },
    navItem: {
        flex: 1, alignItems: "center", justifyContent: "center",
        position: "relative", paddingTop: 4
    },
    activePill: {
        position: "absolute", top: -2,
        width: 28, height: 3, borderRadius: 2,
    },
    iconWrap: {
        width: 36, height: 36, borderRadius: 12,
        justifyContent: "center", alignItems: "center",
    },
    icon: { width: 22, height: 22 },
    navLabel: { fontSize: 10, fontWeight: "500", marginTop: 2 },
    navLabelActive: { fontWeight: "700" },
});