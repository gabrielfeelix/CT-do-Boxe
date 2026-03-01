import { View, Text } from 'react-native';

export default function RegisterScreen() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1F2937' }}>
                📝 Cadastro
            </Text>
            <Text style={{ fontSize: 16, color: '#6B7280', marginTop: 8 }}>
                Crie sua conta
            </Text>
        </View>
    );
}
