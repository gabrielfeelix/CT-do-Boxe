'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, Maximize, Minimize, Pause, Play, Settings, Square, Volume2, VolumeX, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'

type FaseTimer = 'preparacao' | 'trabalho' | 'descanso'

interface TimerConfig {
    rounds: number
    trabalhoSegundos: number
    descansoSegundos: number
    preparacaoSegundos: number
    avisoFimSegundos: number
    avisoProximoRoundSegundos: number
}

interface TimerPreset {
    id: string
    nome: string
    descricao: string
    config: TimerConfig
}

type SoundKey = 'countdown' | 'roundWarning' | 'nextRoundWarning' | 'phaseChange' | 'finish'

interface SoundPlaybackOptions {
    delayMs?: number
    playbackRate?: number
    volume?: number
}

const STORAGE_KEY = 'ct-timer-config-v2'

const DEFAULT_CONFIG: TimerConfig = {
    rounds: 3,
    trabalhoSegundos: 180,
    descansoSegundos: 60,
    preparacaoSegundos: 10,
    avisoFimSegundos: 10,
    avisoProximoRoundSegundos: 10,
}

const PRESETS: TimerPreset[] = [
    {
        id: 'boxe-classico',
        nome: 'Boxe classico',
        descricao: '3 x 3:00 / 1:00',
        config: {
            rounds: 3,
            trabalhoSegundos: 180,
            descansoSegundos: 60,
            preparacaoSegundos: 10,
            avisoFimSegundos: 10,
            avisoProximoRoundSegundos: 10,
        },
    },
    {
        id: 'sparring-curto',
        nome: 'Sparring curto',
        descricao: '5 x 2:00 / 1:00',
        config: {
            rounds: 5,
            trabalhoSegundos: 120,
            descansoSegundos: 60,
            preparacaoSegundos: 10,
            avisoFimSegundos: 10,
            avisoProximoRoundSegundos: 10,
        },
    },
    {
        id: 'condicionamento',
        nome: 'Condicionamento',
        descricao: '8 x 1:00 / 0:30',
        config: {
            rounds: 8,
            trabalhoSegundos: 60,
            descansoSegundos: 30,
            preparacaoSegundos: 8,
            avisoFimSegundos: 8,
            avisoProximoRoundSegundos: 10,
        },
    },
]

const DURACOES_PREPARACAO = [5, 8, 10, 15, 20]
const DURACOES_TRABALHO = [60, 90, 120, 180, 240, 300]
const DURACOES_DESCANSO = [20, 30, 45, 60, 90]

const SOUND_SOURCES: Record<SoundKey, string> = {
    countdown: '/sounds/timer-countdown.wav',
    roundWarning: '/sounds/timer-round-warning.wav',
    nextRoundWarning: '/sounds/timer-next-round-warning.wav',
    phaseChange: '/sounds/timer-phase-change.wav',
    finish: '/sounds/timer-finish.wav',
}

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max)
}

function normalizarConfig(raw: Partial<TimerConfig> | null | undefined): TimerConfig {
    const rounds = clamp(Number(raw?.rounds ?? DEFAULT_CONFIG.rounds), 1, 20)
    const trabalhoSegundos = clamp(Number(raw?.trabalhoSegundos ?? DEFAULT_CONFIG.trabalhoSegundos), 10, 900)
    const descansoSegundos = clamp(Number(raw?.descansoSegundos ?? DEFAULT_CONFIG.descansoSegundos), 10, 600)
    const preparacaoSegundos = clamp(Number(raw?.preparacaoSegundos ?? DEFAULT_CONFIG.preparacaoSegundos), 3, 180)

    const avisoFimSegundos = clamp(
        Number(raw?.avisoFimSegundos ?? DEFAULT_CONFIG.avisoFimSegundos),
        0,
        Math.max(0, trabalhoSegundos - 1)
    )

    const avisoProximoRoundSegundos = clamp(
        Number(raw?.avisoProximoRoundSegundos ?? DEFAULT_CONFIG.avisoProximoRoundSegundos),
        0,
        Math.max(0, descansoSegundos - 1)
    )

    return {
        rounds,
        trabalhoSegundos,
        descansoSegundos,
        preparacaoSegundos,
        avisoFimSegundos,
        avisoProximoRoundSegundos,
    }
}

function formatarTempo(segundos: number) {
    const seguro = Math.max(0, segundos)
    const minutos = Math.floor(seguro / 60)
    const segs = seguro % 60
    return `${minutos < 10 ? '0' : ''}${minutos}:${segs < 10 ? '0' : ''}${segs}`
}

function formatarMinSeg(segundos: number) {
    const minutos = Math.floor(segundos / 60)
    const segs = segundos % 60
    return `${minutos}:${segs.toString().padStart(2, '0')}`
}

export default function TimerPage() {
    const router = useRouter()

    const [config, setConfig] = useState<TimerConfig>(DEFAULT_CONFIG)
    const [configEdicao, setConfigEdicao] = useState<TimerConfig>(DEFAULT_CONFIG)
    const [configAberto, setConfigAberto] = useState(false)

    const [ativo, setAtivo] = useState(false)
    const [fase, setFase] = useState<FaseTimer>('preparacao')
    const [roundAtual, setRoundAtual] = useState(1)
    const [duracaoFaseAtual, setDuracaoFaseAtual] = useState(DEFAULT_CONFIG.preparacaoSegundos)
    const [tempoRestante, setTempoRestante] = useState(DEFAULT_CONFIG.preparacaoSegundos)

    const [isFullscreen, setIsFullscreen] = useState(false)
    const [somStatus, setSomStatus] = useState(true)
    const [animacaoSeed, setAnimacaoSeed] = useState(0)

    const containerRef = useRef<HTMLDivElement>(null)
    const intervaloRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const deadlineRef = useRef<number | null>(null)
    const ultimoSegundoProcessadoRef = useRef<number | null>(null)
    const audioBasesRef = useRef<Record<SoundKey, HTMLAudioElement | null>>({
        countdown: null,
        roundWarning: null,
        nextRoundWarning: null,
        phaseChange: null,
        finish: null,
    })
    const audioDesbloqueadoRef = useRef(false)

    const configRef = useRef(config)
    const faseRef = useRef(fase)
    const roundRef = useRef(roundAtual)
    const tempoRestanteRef = useRef(tempoRestante)
    const ativoRef = useRef(ativo)
    const somStatusRef = useRef(somStatus)

    useEffect(() => {
        configRef.current = config
    }, [config])

    useEffect(() => {
        faseRef.current = fase
    }, [fase])

    useEffect(() => {
        roundRef.current = roundAtual
    }, [roundAtual])

    useEffect(() => {
        tempoRestanteRef.current = tempoRestante
    }, [tempoRestante])

    useEffect(() => {
        ativoRef.current = ativo
    }, [ativo])

    useEffect(() => {
        somStatusRef.current = somStatus
    }, [somStatus])

    useEffect(() => {
        if (typeof window === 'undefined') return

        const keys = Object.keys(SOUND_SOURCES) as SoundKey[]
        const instancias: Partial<Record<SoundKey, HTMLAudioElement>> = {}

        keys.forEach(key => {
            const audio = new Audio(SOUND_SOURCES[key])
            audio.preload = 'auto'
            instancias[key] = audio
            audioBasesRef.current[key] = audio
        })

        return () => {
            keys.forEach(key => {
                const audio = instancias[key]
                if (!audio) return
                audio.pause()
            })
        }
    }, [])

    const tocarSom = useCallback((key: SoundKey, options: SoundPlaybackOptions = {}) => {
        if (!somStatusRef.current) return

        const executar = () => {
            const baseAudio = audioBasesRef.current[key]
            if (!baseAudio) return

            const instancia = baseAudio.cloneNode(true) as HTMLAudioElement
            instancia.currentTime = 0
            instancia.volume = options.volume ?? 0.85
            instancia.playbackRate = options.playbackRate ?? 1
            void instancia.play().catch(() => {
                // browser pode bloquear áudio sem gesto do usuário
            })
        }

        if (options.delayMs && options.delayMs > 0) {
            window.setTimeout(executar, options.delayMs)
            return
        }

        executar()
    }, [])

    const desbloquearAudio = useCallback(async () => {
        if (audioDesbloqueadoRef.current) return
        const preview = audioBasesRef.current.countdown
        if (!preview) return

        try {
            preview.currentTime = 0
            preview.volume = 0
            await preview.play()
            preview.pause()
            preview.currentTime = 0
            audioDesbloqueadoRef.current = true
        } catch {
            // alguns browsers só liberam após mais de um gesto
        }
    }, [])

    const tocarAvisoFinalRound = useCallback(() => {
        tocarSom('roundWarning')
        tocarSom('roundWarning', { delayMs: 170 })
    }, [tocarSom])

    const tocarAvisoProximoRound = useCallback(() => {
        tocarSom('nextRoundWarning', { playbackRate: 0.95 })
        tocarSom('nextRoundWarning', { delayMs: 180, playbackRate: 1.1 })
        tocarSom('nextRoundWarning', { delayMs: 360, playbackRate: 1.25 })
    }, [tocarSom])

    const tocarContagemFinal = useCallback(() => {
        tocarSom('countdown', { volume: 0.75 })
    }, [tocarSom])

    const tocarTrocaFase = useCallback(() => {
        tocarSom('phaseChange')
    }, [tocarSom])

    const tocarFimTreino = useCallback(() => {
        tocarSom('finish', { volume: 0.9 })
        tocarSom('finish', { delayMs: 320, playbackRate: 1.15, volume: 0.9 })
    }, [tocarSom])

    const prepararEstadoInicial = useCallback((cfg: TimerConfig) => {
        setFase('preparacao')
        faseRef.current = 'preparacao'
        setRoundAtual(1)
        roundRef.current = 1
        setDuracaoFaseAtual(cfg.preparacaoSegundos)
        setTempoRestante(cfg.preparacaoSegundos)
        tempoRestanteRef.current = cfg.preparacaoSegundos
        ultimoSegundoProcessadoRef.current = cfg.preparacaoSegundos
        deadlineRef.current = null
        setAnimacaoSeed(prev => prev + 1)
    }, [])

    const aplicarConfig = useCallback((next: TimerConfig) => {
        const cfg = normalizarConfig(next)
        setConfig(cfg)
        setConfigEdicao(cfg)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg))
        setAtivo(false)
        prepararEstadoInicial(cfg)
    }, [prepararEstadoInicial])

    useEffect(() => {
        const salvo = localStorage.getItem(STORAGE_KEY)
        const cfg = normalizarConfig(salvo ? JSON.parse(salvo) : DEFAULT_CONFIG)

        setConfig(cfg)
        setConfigEdicao(cfg)
        prepararEstadoInicial(cfg)
    }, [prepararEstadoInicial])

    const iniciarFase = useCallback((nextFase: FaseTimer, duracao: number, nextRound?: number) => {
        setFase(nextFase)
        faseRef.current = nextFase

        if (typeof nextRound === 'number') {
            setRoundAtual(nextRound)
            roundRef.current = nextRound
        }

        setDuracaoFaseAtual(duracao)
        setTempoRestante(duracao)
        tempoRestanteRef.current = duracao
        ultimoSegundoProcessadoRef.current = duracao
        deadlineRef.current = Date.now() + duracao * 1000
        setAnimacaoSeed(prev => prev + 1)
    }, [])

    const finalizarTreino = useCallback(() => {
        setAtivo(false)
        ativoRef.current = false

        if (intervaloRef.current) {
            clearInterval(intervaloRef.current)
            intervaloRef.current = null
        }

        deadlineRef.current = null
        setTempoRestante(0)
        tempoRestanteRef.current = 0
        tocarFimTreino()
    }, [tocarFimTreino])

    const avancarFase = useCallback(() => {
        const cfg = configRef.current
        const faseAtual = faseRef.current
        const round = roundRef.current

        if (faseAtual === 'preparacao') {
            tocarTrocaFase()
            iniciarFase('trabalho', cfg.trabalhoSegundos, 1)
            return
        }

        if (faseAtual === 'trabalho') {
            if (round >= cfg.rounds) {
                finalizarTreino()
                return
            }

            tocarTrocaFase()
            iniciarFase('descanso', cfg.descansoSegundos)
            return
        }

        const proximoRound = round + 1
        tocarTrocaFase()
        iniciarFase('trabalho', cfg.trabalhoSegundos, proximoRound)
    }, [finalizarTreino, iniciarFase, tocarTrocaFase])

    const processarAvisos = useCallback((segundos: number, faseAtual: FaseTimer) => {
        if (!somStatusRef.current || segundos <= 0) return

        const cfg = configRef.current

        if (segundos <= 3) {
            tocarContagemFinal()
            return
        }

        if (faseAtual === 'trabalho' && cfg.avisoFimSegundos > 0 && segundos === cfg.avisoFimSegundos) {
            tocarAvisoFinalRound()
            return
        }

        if (faseAtual === 'descanso' && cfg.avisoProximoRoundSegundos > 0 && segundos === cfg.avisoProximoRoundSegundos) {
            tocarAvisoProximoRound()
        }
    }, [tocarAvisoFinalRound, tocarAvisoProximoRound, tocarContagemFinal])

    const atualizarRelogio = useCallback(() => {
        if (!ativoRef.current || deadlineRef.current === null) return

        const diferencaMs = deadlineRef.current - Date.now()
        const segundos = Math.max(0, Math.ceil(diferencaMs / 1000))

        if (segundos !== tempoRestanteRef.current) {
            setTempoRestante(segundos)
            tempoRestanteRef.current = segundos

            if (segundos !== ultimoSegundoProcessadoRef.current) {
                processarAvisos(segundos, faseRef.current)
                ultimoSegundoProcessadoRef.current = segundos
            }
        }

        if (diferencaMs <= 0) {
            avancarFase()
        }
    }, [avancarFase, processarAvisos])

    useEffect(() => {
        if (!ativo) {
            if (intervaloRef.current) {
                clearInterval(intervaloRef.current)
                intervaloRef.current = null
            }
            return
        }

        intervaloRef.current = setInterval(atualizarRelogio, 200)

        return () => {
            if (intervaloRef.current) {
                clearInterval(intervaloRef.current)
                intervaloRef.current = null
            }
        }
    }, [ativo, atualizarRelogio])

    const toggleAtivo = useCallback(() => {
        if (ativoRef.current) {
            setAtivo(false)
            return
        }

        if (somStatusRef.current) {
            void desbloquearAudio()
        }

        if (tempoRestanteRef.current <= 0) {
            prepararEstadoInicial(configRef.current)
        }

        deadlineRef.current = Date.now() + tempoRestanteRef.current * 1000
        ultimoSegundoProcessadoRef.current = tempoRestanteRef.current
        setAnimacaoSeed(prev => prev + 1)
        setAtivo(true)
    }, [desbloquearAudio, prepararEstadoInicial])

    const resetarTimer = useCallback((cfg: TimerConfig = configRef.current) => {
        setAtivo(false)
        if (intervaloRef.current) {
            clearInterval(intervaloRef.current)
            intervaloRef.current = null
        }
        prepararEstadoInicial(cfg)
    }, [prepararEstadoInicial])

    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            void containerRef.current?.requestFullscreen()
        } else {
            void document.exitFullscreen()
        }
    }, [])

    useEffect(() => {
        const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
        document.addEventListener('fullscreenchange', onFullscreenChange)
        return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
    }, [])

    const faseUI = useMemo(() => {
        if (fase === 'preparacao') {
            return {
                label: 'PREPARAR',
                gradiente: 'from-amber-400 via-amber-500 to-orange-500',
                destaque: 'bg-amber-200 text-amber-900',
            }
        }

        if (fase === 'trabalho') {
            const emAviso = tempoRestante <= config.avisoFimSegundos && tempoRestante > 0
            return {
                label: 'ROUND',
                gradiente: emAviso ? 'from-red-500 via-red-600 to-rose-700' : 'from-emerald-500 via-green-500 to-teal-600',
                destaque: emAviso ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-900',
            }
        }

        const emAvisoProximo = tempoRestante <= config.avisoProximoRoundSegundos && tempoRestante > 0
        return {
            label: 'DESCANSO',
            gradiente: emAvisoProximo ? 'from-fuchsia-600 via-purple-600 to-violet-700' : 'from-sky-500 via-blue-500 to-indigo-600',
            destaque: emAvisoProximo ? 'bg-fuchsia-100 text-fuchsia-900' : 'bg-blue-100 text-blue-900',
        }
    }, [config.avisoFimSegundos, config.avisoProximoRoundSegundos, fase, tempoRestante])

    const progresso = useMemo(() => {
        const total = Math.max(1, duracaoFaseAtual)
        return clamp(((total - tempoRestante) / total) * 100, 0, 100)
    }, [duracaoFaseAtual, tempoRestante])

    const abrirModalConfig = useCallback(() => {
        setConfigEdicao(configRef.current)
        setConfigAberto(true)
    }, [])

    const cancelarEdicaoConfig = useCallback(() => {
        setConfigEdicao(configRef.current)
        setConfigAberto(false)
    }, [])

    const salvarEdicaoConfig = useCallback(() => {
        aplicarConfig(configEdicao)
        setConfigAberto(false)
    }, [aplicarConfig, configEdicao])

    const aplicarPreset = useCallback((preset: TimerPreset) => {
        aplicarConfig(preset.config)
    }, [aplicarConfig])

    return (
        <div
            ref={containerRef}
            className={`relative min-h-[calc(100vh-80px)] overflow-hidden text-white transition-all duration-500 ${
                isFullscreen ? 'fixed inset-0 z-50 h-screen rounded-none' : 'rounded-3xl'
            } bg-gradient-to-br ${faseUI.gradiente}`}
        >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.2),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(0,0,0,0.35),transparent_45%)]" />
            <div className="pointer-events-none absolute inset-0 bg-black/25" />

            <div className="relative z-10 mx-auto flex h-full w-full max-w-6xl flex-col px-4 pb-8 pt-4 sm:px-6 sm:pb-10">
                <div className="flex items-center justify-between">
                    {!isFullscreen ? (
                        <button
                            onClick={() => router.back()}
                            className="inline-flex items-center gap-2 rounded-xl bg-black/25 px-3 py-2 text-sm font-semibold text-white/90 backdrop-blur-md transition hover:bg-black/40 hover:text-white"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Voltar
                        </button>
                    ) : (
                        <div />
                    )}

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setSomStatus(prev => !prev)}
                            className="rounded-xl bg-black/25 p-2.5 text-white backdrop-blur-md transition hover:bg-black/40"
                            aria-label={somStatus ? 'Desativar som' : 'Ativar som'}
                        >
                            {somStatus ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                        </button>
                        <button
                            onClick={abrirModalConfig}
                            className="rounded-xl bg-black/25 p-2.5 text-white backdrop-blur-md transition hover:bg-black/40"
                            aria-label="Configurar timer"
                        >
                            <Settings className="h-5 w-5" />
                        </button>
                        <button
                            onClick={toggleFullscreen}
                            className="hidden rounded-xl bg-black/25 p-2.5 text-white backdrop-blur-md transition hover:bg-black/40 sm:block"
                            aria-label={isFullscreen ? 'Sair da tela cheia' : 'Entrar em tela cheia'}
                        >
                            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    {PRESETS.map(preset => (
                        <button
                            key={preset.id}
                            onClick={() => aplicarPreset(preset)}
                            className="group rounded-xl border border-white/25 bg-white/10 px-3 py-2 text-left text-xs font-semibold backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/20"
                        >
                            <div className="leading-tight">{preset.nome}</div>
                            <div className="text-[11px] font-medium text-white/70">{preset.descricao}</div>
                        </button>
                    ))}
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/20 bg-black/20 p-3 backdrop-blur-md">
                        <p className="text-[11px] uppercase tracking-wider text-white/70">Fase</p>
                        <p className="mt-1 text-lg font-black tracking-wide">{faseUI.label}</p>
                    </div>
                    <div className="rounded-2xl border border-white/20 bg-black/20 p-3 backdrop-blur-md">
                        <p className="text-[11px] uppercase tracking-wider text-white/70">Round</p>
                        <p className="mt-1 text-lg font-black tracking-wide">
                            {roundAtual} <span className="text-white/60">/ {config.rounds}</span>
                        </p>
                    </div>
                    <div className="rounded-2xl border border-white/20 bg-black/20 p-3 backdrop-blur-md">
                        <p className="text-[11px] uppercase tracking-wider text-white/70">Progresso</p>
                        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/20">
                            <div className="h-full rounded-full bg-white transition-all duration-300" style={{ width: `${progresso}%` }} />
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex flex-1 flex-col items-center justify-center">
                    <div
                        key={`${animacaoSeed}-${fase}`}
                        className="animate-in zoom-in-90 fade-in duration-500 rounded-3xl border border-white/25 bg-black/25 px-4 py-6 text-center shadow-2xl backdrop-blur-lg sm:px-8 sm:py-8"
                    >
                        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${faseUI.destaque}`}>
                            <Zap className="h-3.5 w-3.5" />
                            {faseUI.label}
                        </span>

                        <div className="mt-2 text-[clamp(4rem,16vw,10.5rem)] font-black leading-none tracking-tight tabular-nums">
                            {formatarTempo(tempoRestante)}
                        </div>

                        <p className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
                            ROUND {roundAtual} DE {config.rounds}
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-center gap-4">
                    <button
                        onClick={toggleAtivo}
                        className={`flex h-20 w-20 items-center justify-center rounded-full bg-white text-black shadow-xl transition ${
                            ativo ? 'scale-100' : 'hover:scale-105 active:scale-95'
                        }`}
                        aria-label={ativo ? 'Pausar timer' : 'Iniciar timer'}
                    >
                        {ativo ? <Pause className="h-8 w-8 fill-current" /> : <Play className="ml-1 h-8 w-8 fill-current" />}
                    </button>
                    <button
                        onClick={() => resetarTimer(configRef.current)}
                        className="flex h-14 w-14 items-center justify-center rounded-full border border-white/40 bg-black/25 text-white backdrop-blur-md transition hover:bg-black/40"
                        aria-label="Resetar timer"
                    >
                        <Square className="h-5 w-5 fill-current" />
                    </button>
                </div>

                <p className="mt-4 text-center text-xs font-semibold text-white/75">
                    Trabalho {formatarMinSeg(config.trabalhoSegundos)} | Descanso {formatarMinSeg(config.descansoSegundos)} | Aviso proximo round {config.avisoProximoRoundSegundos}s
                </p>
            </div>

            {configAberto && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-xl animate-in fade-in zoom-in-95 rounded-3xl bg-white p-5 text-gray-900 shadow-2xl duration-200 sm:p-6">
                        <h3 className="mb-1 flex items-center gap-2 text-xl font-black">
                            <Settings className="h-5 w-5 text-red-600" />
                            Configuracao do timer
                        </h3>
                        <p className="mb-4 text-sm text-gray-500">As alteracoes sao aplicadas somente ao salvar.</p>

                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">Rounds</label>
                                <div className="flex items-center overflow-hidden rounded-xl bg-gray-100">
                                    <button
                                        onClick={() => setConfigEdicao(prev => ({ ...prev, rounds: clamp(prev.rounds - 1, 1, 20) }))}
                                        className="px-4 py-2 text-xl font-bold transition hover:bg-gray-200"
                                    >
                                        -
                                    </button>
                                    <div className="flex-1 text-center text-lg font-black">{configEdicao.rounds}</div>
                                    <button
                                        onClick={() => setConfigEdicao(prev => ({ ...prev, rounds: clamp(prev.rounds + 1, 1, 20) }))}
                                        className="px-4 py-2 text-xl font-bold transition hover:bg-gray-200"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">Preparacao</label>
                                <select
                                    className="w-full rounded-xl bg-gray-100 px-3 py-2.5 font-semibold outline-none ring-red-500 focus:ring-2"
                                    value={configEdicao.preparacaoSegundos}
                                    onChange={event =>
                                        setConfigEdicao(prev => ({ ...prev, preparacaoSegundos: Number(event.target.value) }))
                                    }
                                >
                                    {DURACOES_PREPARACAO.map(valor => (
                                        <option key={valor} value={valor}>
                                            {formatarMinSeg(valor)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">Trabalho</label>
                                <select
                                    className="w-full rounded-xl bg-gray-100 px-3 py-2.5 font-semibold outline-none ring-red-500 focus:ring-2"
                                    value={configEdicao.trabalhoSegundos}
                                    onChange={event =>
                                        setConfigEdicao(prev => ({ ...prev, trabalhoSegundos: Number(event.target.value) }))
                                    }
                                >
                                    {DURACOES_TRABALHO.map(valor => (
                                        <option key={valor} value={valor}>
                                            {formatarMinSeg(valor)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">Descanso</label>
                                <select
                                    className="w-full rounded-xl bg-gray-100 px-3 py-2.5 font-semibold outline-none ring-red-500 focus:ring-2"
                                    value={configEdicao.descansoSegundos}
                                    onChange={event =>
                                        setConfigEdicao(prev => ({ ...prev, descansoSegundos: Number(event.target.value) }))
                                    }
                                >
                                    {DURACOES_DESCANSO.map(valor => (
                                        <option key={valor} value={valor}>
                                            {formatarMinSeg(valor)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                                    Aviso final do round (s)
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    max={configEdicao.trabalhoSegundos - 1}
                                    value={configEdicao.avisoFimSegundos}
                                    onChange={event =>
                                        setConfigEdicao(prev => ({
                                            ...prev,
                                            avisoFimSegundos: Number(event.target.value),
                                        }))
                                    }
                                    className="w-full rounded-xl bg-gray-100 px-3 py-2.5 font-semibold outline-none ring-red-500 focus:ring-2"
                                />
                            </div>

                            <div>
                                <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-gray-500">
                                    Aviso para proximo round (s)
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    max={configEdicao.descansoSegundos - 1}
                                    value={configEdicao.avisoProximoRoundSegundos}
                                    onChange={event =>
                                        setConfigEdicao(prev => ({
                                            ...prev,
                                            avisoProximoRoundSegundos: Number(event.target.value),
                                        }))
                                    }
                                    className="w-full rounded-xl bg-gray-100 px-3 py-2.5 font-semibold outline-none ring-red-500 focus:ring-2"
                                />
                            </div>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3">
                            <button
                                onClick={cancelarEdicaoConfig}
                                className="rounded-xl border border-gray-300 px-4 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-100"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={salvarEdicaoConfig}
                                className="rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700"
                            >
                                Salvar e aplicar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
