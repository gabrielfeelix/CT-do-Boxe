import { Feather, FontAwesome5 } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native'

import { useAuth } from '@/contexts/AuthContext'
import { fetchPerfilData, updateAlunoDados } from '@/lib/appData'

export default function DadosCadastraisScreen() {
    const router = useRouter()
    const { aluno, refreshAluno } = useAuth()

    const [nome, setNome] = useState('')
    const [email, setEmail] = useState('')
    const [telefone, setTelefone] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    const loadData = useCallback(async () => {
        if (!aluno?.id) {
            setLoading(false)
            return
        }

        const data = await fetchPerfilData(aluno.id)
        setNome(data.aluno?.nome ?? '')
        setEmail(data.aluno?.email ?? '')
        setTelefone(data.aluno?.telefone ?? '')
        setLoading(false)
    }, [aluno?.id])

    useEffect(() => {
        loadData()
    }, [loadData])

    const handleSalvar = async () => {
        if (!aluno?.id) return

        if (!nome.trim()) {
            Alert.alert('Validacao', 'Informe o seu nome.')
            return
        }

        if (!email.trim()) {
            Alert.alert('Validacao', 'Informe o seu e-mail.')
            return
        }

        setSaving(true)
        await updateAlunoDados(aluno.id, {
            nome: nome.trim(),
            email: email.trim(),
            telefone: telefone.trim() || null,
        })
        await refreshAluno()
        setSaving(false)

        Alert.alert('Sucesso', 'Dados salvos com sucesso.', [{ text: 'Voltar', onPress: () => router.back() }])
    }

    const avatar = useMemo(
        () =>
            (nome || 'AL')
                .trim()
                .split(/\s+/)
                .slice(0, 2)
                .map((p) => p[0]?.toUpperCase() ?? '')
                .join('')
                .slice(0, 2),
        [nome]
    )

    return (
        <View className="flex-1 bg-[#FDFDFD]">
            <View className="z-10 flex-row items-center border-b border-slate-100 bg-white px-6 pb-6 pt-16 shadow-sm shadow-slate-200/50">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="mr-4 h-10 w-10 items-center justify-center rounded-full border border-slate-100 bg-slate-50"
                >
                    <Feather name="arrow-left" size={18} color="#64748B" />
                </TouchableOpacity>
                <View>
                    <Text className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400">Meu Perfil</Text>
                    <Text className="text-2xl font-black tracking-tight text-slate-900">Dados Cadastrais</Text>
                </View>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                    <View className="px-6 pt-8">
                        {loading ? (
                            <View className="items-center justify-center rounded-3xl border border-slate-100 bg-white py-16">
                                <Text className="text-sm font-medium text-slate-500">Carregando cadastro...</Text>
                            </View>
                        ) : (
                            <>
                                <View className="mb-10 items-center">
                                    <View className="relative mb-4 h-24 w-24 items-center justify-center rounded-[1.5rem] bg-slate-900 shadow-xl shadow-slate-900/20">
                                        <Text className="text-3xl font-black tracking-tighter text-white">{avatar || 'AL'}</Text>
                                        <View className="absolute -bottom-2 -right-2 h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-emerald-500">
                                            <Feather name="camera" size={12} color="white" />
                                        </View>
                                    </View>
                                    <Text className="text-sm font-bold uppercase tracking-widest text-slate-400">Alterar Foto</Text>
                                </View>

                                <View className="space-y-6">
                                    <View>
                                        <Text className="mb-2 ml-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                            Nome Completo
                                        </Text>
                                        <View className="h-16 flex-row items-center rounded-2xl border-[1.5px] border-slate-100 bg-white px-5 shadow-sm shadow-slate-200/50">
                                            <Feather name="user" size={18} color="#94A3B8" />
                                            <TextInput
                                                className="h-full flex-1 pl-3 text-base font-medium text-slate-900"
                                                value={nome}
                                                onChangeText={setNome}
                                            />
                                        </View>
                                    </View>

                                    <View>
                                        <Text className="mb-2 ml-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">E-mail</Text>
                                        <View className="h-16 flex-row items-center rounded-2xl border-[1.5px] border-slate-100 bg-white px-5 shadow-sm shadow-slate-200/50">
                                            <Feather name="mail" size={18} color="#94A3B8" />
                                            <TextInput
                                                className="h-full flex-1 pl-3 text-base font-medium text-slate-900"
                                                value={email}
                                                onChangeText={setEmail}
                                                keyboardType="email-address"
                                                autoCapitalize="none"
                                            />
                                        </View>
                                    </View>

                                    <View>
                                        <Text className="mb-2 ml-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                            Telefone WhatsApp
                                        </Text>
                                        <View className="h-16 flex-row items-center rounded-2xl border-[1.5px] border-slate-100 bg-white px-5 shadow-sm shadow-slate-200/50">
                                            <FontAwesome5 name="whatsapp" size={18} color="#94A3B8" />
                                            <TextInput
                                                className="h-full flex-1 pl-3 text-base font-medium text-slate-900"
                                                value={telefone}
                                                onChangeText={setTelefone}
                                                keyboardType="phone-pad"
                                            />
                                        </View>
                                    </View>
                                </View>

                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={handleSalvar}
                                    disabled={saving}
                                    className="mt-10 h-16 flex-row items-center justify-center rounded-2xl bg-slate-900 shadow-lg shadow-slate-900/30"
                                >
                                    <Text className="font-black uppercase tracking-widest text-white">
                                        {saving ? 'Salvando...' : 'Salvar Alteracoes'}
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    )
}
