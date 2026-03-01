/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Post, Story } from '@/types'

export function useFeed() {
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    const fetch = useCallback(async () => {
        setLoading(true)
        const { data } = await supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false })
        setPosts((data as Post[]) ?? [])
        setLoading(false)
    }, [])

    useEffect(() => { fetch() }, [fetch])

    return { posts, loading, refetch: fetch }
}

export function useStories() {
    const [stories, setStories] = useState<Story[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    const fetch = useCallback(async () => {
        setLoading(true)
        // Busca stories ativos (view filtra expirados automaticamente)
        const { data } = await supabase
            .from('stories_ativos')
            .select('*')
        setStories((data as Story[]) ?? [])
        setLoading(false)
    }, [])

    useEffect(() => { fetch() }, [fetch])

    return { stories, loading, refetch: fetch }
}
