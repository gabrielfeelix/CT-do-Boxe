import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { FontAwesome5, Feather } from '@expo/vector-icons';
import { colors } from '../../constants/theme';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.gray,
                tabBarStyle: {
                    backgroundColor: colors.white,
                    borderTopWidth: 1,
                    borderTopColor: colors.grayLight,
                    height: 64,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '600',
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => <Feather name="home" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="feed"
                options={{
                    title: 'Feed',
                    tabBarIcon: ({ color }) => <Feather name="message-circle" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="checkin"
                options={{
                    title: 'Check-in',
                    tabBarIcon: ({ color, focused }) => (
                        <View
                            style={{
                                width: 56,
                                height: 56,
                                borderRadius: 28,
                                backgroundColor: focused ? colors.primaryDark : colors.primary,
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginBottom: 20,
                                shadowColor: colors.primary,
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 4,
                                elevation: 5,
                            }}
                        >
                            <FontAwesome5 name="check" size={24} color={colors.white} />
                        </View>
                    ),
                    tabBarLabel: () => null, // Oculta o texto para a tab central ficar mais limpa
                }}
            />
            <Tabs.Screen
                name="historico"
                options={{
                    title: 'Histórico',
                    tabBarIcon: ({ color }) => <Feather name="calendar" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="perfil"
                options={{
                    title: 'Perfil',
                    tabBarIcon: ({ color }) => <Feather name="user" size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}
