import useTheme from "../../hooks/useTheme"
import { useUser } from "../../hooks/useUser"
import { Ionicons } from "@expo/vector-icons"
import { Tabs } from 'expo-router'
import React from 'react'

const TabsLayout = () => {
    const { colors } = useTheme();
    const { role } = useUser();

    const isAdmin = role === 'Librarian';

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
                        <Ionicons name={focused ? "home" : "home-outline"} size={24} color={color} />
                    )
                }}
            />

            <Tabs.Screen
                name='search'
                options={{
                    title: isAdmin ? "Books" : "Search",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "search" : "search-outline"} size={24} color={color} />
                    )
                }}
            />

            <Tabs.Screen
                name='borrowed'
                options={{
                    title: isAdmin ? "Loans" : "My Books",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "book" : "book-outline"} size={24} color={color} />
                    )
                }}
            />

            <Tabs.Screen
                name='rooms'
                options={{
                    title: isAdmin ? "Reservations" : "Rooms",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "calendar" : "calendar-outline"} size={24} color={color} />
                    )
                }}
            />

            <Tabs.Screen
                name='profile'
                options={{
                    title: isAdmin ? "Admin" : "Profile",
                    tabBarIcon: ({ color, focused }) => (
                        <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />
                    )
                }}
            />
        </Tabs>
    )
}

export default TabsLayout
