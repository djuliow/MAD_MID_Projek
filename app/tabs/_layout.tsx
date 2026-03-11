// File ini mengatur tata letak navigasi tab di bagian bawah aplikasi.
// Mendefinisikan ikon tab dengan animasi dan menyesuaikan label tab berdasarkan peran pengguna (Admin atau Siswa).

import useTheme from "../../hooks/useTheme"
import { useUser } from "../../hooks/useUser"
import { Ionicons } from "@expo/vector-icons"
import { Tabs } from 'expo-router'
import React, { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import Animated, { useAnimatedStyle, withSpring, useSharedValue } from 'react-native-reanimated'

// Komponen ikon tab dengan animasi saat dipilih (scale dan translateY)
const TabIcon = ({ name, color, focused }: { name: any, color: string, focused: boolean }) => {
    const translateY = useSharedValue(0);
    const scale = useSharedValue(1);

    useEffect(() => {
        if (focused) {
            translateY.value = withSpring(-8, { damping: 10, stiffness: 100 });
            scale.value = withSpring(1.1);
        } else {
            translateY.value = withSpring(0);
            scale.value = withSpring(1);
        }
    }, [focused]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: translateY.value },
            { scale: scale.value }
        ],
    }));

    return (
        <Animated.View style={[styles.iconContainer, animatedStyle]}>
            <Ionicons name={name} size={24} color={color} />
        </Animated.View>
    );
}

const TabsLayout = () => {
    const { colors } = useTheme();
    const { role } = useUser();

    const isAdmin = role === 'librarian';

    return (
        <Tabs screenOptions={{
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.textMuted,
            tabBarStyle: {
                backgroundColor: colors.surface,
                borderTopWidth: 1,
                borderTopColor: colors.border,
                height: 70,
                paddingBottom: 12,
                paddingTop: 8,
                elevation: 10,
                shadowColor: colors.shadow,
                shadowOffset: { width: 0, height: -2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            tabBarLabelStyle: {
                fontSize: 10,
                fontWeight: "600",
            },
            headerShown: false,
        }}>
            <Tabs.Screen
                name='index'
                options={{
                    title: isAdmin ? "Dashboard" : "Home",
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon name={focused ? "home" : "home-outline"} color={color} focused={focused} />
                    )
                }}
            />

            <Tabs.Screen
                name='search'
                options={{
                    title: isAdmin ? "Assets" : "Search",
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon name={focused ? (isAdmin ? "library" : "search") : (isAdmin ? "library-outline" : "search-outline")} color={color} focused={focused} />
                    )
                }}
            />

            <Tabs.Screen
                name='borrowed'
                options={{
                    title: isAdmin ? "Loans" : "My Books",
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon name={focused ? "book" : "book-outline"} color={color} focused={focused} />
                    )
                }}
            />

            <Tabs.Screen
                name='rooms'
                options={{
                    title: isAdmin ? "Reservations" : "Rooms",
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon name={focused ? "calendar" : "calendar-outline"} color={color} focused={focused} />
                    )
                }}
            />

            <Tabs.Screen
                name='profile'
                options={{
                    title: isAdmin ? "Admin" : "Profile",
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon name={focused ? "person" : "person-outline"} color={color} focused={focused} />
                    )
                }}
            />
        </Tabs>
    )
}

const styles = StyleSheet.create({
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
        borderRadius: 20,
    }
})

export default TabsLayout
