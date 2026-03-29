import React from "react";
import {
    View,
    TouchableOpacity,
    StyleSheet,
    Image
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function Footer() {

    const navigation = useNavigation();
    const route = useRoute();

    const isActive = (name) => route.name === name;

    return (
        <View style={styles.footer}>

            {/* Home / Category */}
            <TouchableOpacity onPress={() => navigation.navigate("Home")}>
                <Image
                    source={require("../assets/images/home-agreement.png")}
                    style={[
                        styles.icon,
                        isActive("Home") && styles.activeIcon
                    ]}
                />
            </TouchableOpacity>

            {/* Popular */}
            <TouchableOpacity onPress={() => navigation.navigate("PopularAds")}>
                <Image
                    source={require("../assets/images/fire.png")}
                    style={[
                        styles.icon,
                        isActive("PopularAds") && styles.activeIcon
                    ]}
                />
            </TouchableOpacity>

            {/* Fresh */}
            <TouchableOpacity onPress={() => navigation.navigate("FreshAd")}>
                <Image
                    source={require("../assets/images/fresh.png")}
                    style={[
                        styles.icon,
                        isActive("FreshAd") && styles.activeIcon
                    ]}
                />
            </TouchableOpacity>

            {/* Profile */}
            <TouchableOpacity onPress={() => navigation.navigate("UserProfile")}>
                <Image
                    source={require("../assets/images/user.png")}
                    style={[
                        styles.icon,
                        isActive("UserProfile") && styles.activeIcon
                    ]}
                />
            </TouchableOpacity>

        </View>
    );
}

const styles = StyleSheet.create({

    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 64,
        backgroundColor: "#000",
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        paddingHorizontal: 20,
        zIndex: 10
    },

    icon: {
        width: 26,
        height: 26,
        tintColor: "#ffffff",
        opacity: 0.5
    },

    activeIcon: {
        tintColor: "#22c55e",
        opacity: 1
    }

});
