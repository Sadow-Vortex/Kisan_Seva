import React, { useEffect, useLayoutEffect, useState } from "react";
import {
    View,
    Image,
    FlatList,
    StyleSheet,
    Dimensions,
    ActivityIndicator,
    Text,
    TouchableOpacity,
    TextInput,
    ImageBackground
} from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import Footer from "./Footer";

const { width,height } = Dimensions.get("window");
const IMAGE_WIDTH = width / 3 - 20;

export default function SubCategory() {

    const navigation = useNavigation();
    const { categoryId } = useLocalSearchParams();
    const [subCategory, setSubCategory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoryImage, setCategoryImage] = useState(null);
    const [categoryName, setCategoryName] = useState("Sub Categories");


    const url = `http://10.194.243.199:2001`;

    useLayoutEffect(() => {
        navigation.setOptions({ headerShown: false });
    }, [navigation]);

    const fetchSubCategory = async () => {
        try {
            const response = await fetch(`${url}/subcategory/by-category/${categoryId}`);
            const data = await response.json();
            const subcategoryArray = Array.isArray(data?.data) ? data.data : [];
            setSubCategory(subcategoryArray);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (categoryId) {
            fetchSubCategory();
        }
    }, [categoryId]);

    useEffect(() => {
        if (!categoryId) return;

        fetch(`${url}/category`)
            .then(res => res.json())
            .then(json => {

                const list = Array.isArray(json?.data) ? json.data : [];

                const current = list.find(
                    c => String(c.categoryId) === String(categoryId)
                );

                if (current) {
                    setCategoryImage(current.imageLink || null);
                    setCategoryName(current.categoryName || "Sub Categories");
                }

            })
            .catch(err => console.log("category image load error", err));

    }, [categoryId]);


    const renderItem = ({ item }) => {
        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() =>
                    navigation.navigate("AdsBySubCategory", {
                        subCategoryId: item.subCategoryId
                    })
                }
            >
                <Image
                    source={{ uri: item.subCategoryImageLink }}
                    style={styles.image}
                />
                <Text style={styles.cardTitle}>
                    {item.subCategoryName}
                </Text>
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <ActivityIndicator
                size="large"
                style={{ flex: 1, justifyContent: "center" }}
            />
        );
    }

    if (!Array.isArray(subCategory) || subCategory.length === 0) {
        return (
            <>
                <View style={{ flex: 1, backgroundColor: "#FCEFE4" }}>

                    <ImageBackground
                        source={{
                            uri: "https://i.pinimg.com/1200x/c5/c9/4e/c5c94e59aa8fd075e78c640c6e5e1533.jpg"
                        }}
                        style={styles.banner}
                        imageStyle={styles.bannerImage}
                    >
                        <View style={styles.bannerOverlay}>
                            <Text style={styles.bannerTitle}>Sub Categories</Text>
                            <Text style={styles.bannerSub}>
                                Select your favourites
                            </Text>
                        </View>
                    </ImageBackground>

                    <View style={styles.searchWrapper}>
                        <TextInput
                            placeholder="Search sub categories"
                            placeholderTextColor="#9ca3af"
                            style={styles.searchInput}
                        />
                    </View>

                    <Text style={{ textAlign: "center", marginTop: 40 }}>
                        No Sub Categories
                    </Text>

                    <Footer />
                </View>
            </>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#FCEFE4" }}>

            <ImageBackground
                source={
                    categoryImage
                        ? { uri: categoryImage }
                        : require('../assets/images/farm.jpg')
                }
                style={styles.banner}
                imageStyle={styles.bannerImage}
            >

                <View style={styles.bannerOverlay}>
                    <Text style={styles.bannerTitle}>{categoryName} </Text>
                    <Text style={styles.bannerSub}>
                        Select your favourites
                    </Text>
                </View>
            </ImageBackground>

            <View style={styles.searchWrapper}>
                <TextInput
                    placeholder="Search sub categories"
                    placeholderTextColor="#9ca3af"
                    style={styles.searchInput}
                />
            </View>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Browse Subcategories</Text>

                <View style={styles.sectionLineRow}>
                    <View style={styles.sectionLine} />
                    <View style={styles.sectionLine} />
                </View>

                <Text style={styles.sectionSub}>
                    Choose the type you want.
                </Text>
            </View>

            <FlatList
                data={subCategory}
                keyExtractor={(item, index) =>
                    item?.subCategoryId
                        ? item.subCategoryId.toString()
                        : index.toString()
                }
                renderItem={renderItem}
                numColumns={3}
                contentContainerStyle={styles.container}
            />

            <Footer />

        </View>
    );
}

const styles = StyleSheet.create({

    banner: {
        height: height/4,
        width: "100%",
        justifyContent: "flex-end"
    },

    bannerImage: {
        borderBottomLeftRadius: 26,
        borderBottomRightRadius: 26
    },

    bannerOverlay: {
        padding: 18,
        backgroundColor: "rgba(0,0,0,0.25)",
        borderBottomLeftRadius: 26,
        borderBottomRightRadius: 26
    },

    bannerTitle: {
        fontSize: 26,
        fontWeight: "800",
        color: "#ffffff"
    },

    bannerSub: {
        marginTop: 4,
        fontSize: 14,
        color: "#f1f5f9",
        fontWeight: "600"
    },

    searchWrapper: {
        marginTop: 12,
        marginHorizontal: 16,
        backgroundColor: "#ffffff",
        borderRadius: 20,
        paddingHorizontal: 16,
        height: 46,
        justifyContent: "center",

        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 10
    },

    searchInput: {
        fontSize: 14,
        color: "#111827"
    },

    sectionHeader: {
        marginTop: 18,
        marginBottom: 18,
        alignItems: "center"
    },

    sectionTitle: {
        fontSize: 20,
        fontWeight: "800",
        color: "#5a4a42"
    },

    sectionLineRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "70%",
        marginVertical: 6
    },

    sectionLine: {
        width: "35%",
        height: 1,
        backgroundColor: "#e7d6c9"
    },

    sectionSub: {
        fontSize: 13,
        color: "#8b7a70"
    },

    container: {
        paddingHorizontal: 10,
        paddingBottom: 90
    },

    card: {
        width: IMAGE_WIDTH,
        margin: 6,
        backgroundColor: "#ffffff",
        borderRadius: 18,
        overflow: "hidden",

        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 6
    },

    image: {
        width: "100%",
        height: 110
    },

    cardTitle: {
        paddingVertical: 10,
        textAlign: "center",
        fontSize: 14,
        fontWeight: "700",
        color: "#1f2937"
    }

});
