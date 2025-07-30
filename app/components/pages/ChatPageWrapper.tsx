'use client'
import type { FC } from 'react'
import React, { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import AppLayout from '@/app/components/layout/AppLayout'
import Main from '@/app/components'
import { fetchConversations } from '@/service'
import type { ConversationItem } from '@/types/app'
import useConversation from '@/hooks/use-conversation'
import { APP_ID } from '@/config'

type ChatPageWrapperProps = {
    params: any
}

const ChatPageWrapper: FC<ChatPageWrapperProps> = ({ params }) => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [conversations, setConversations] = useState<ConversationItem[]>([])
    const [loading, setLoading] = useState(true)

    // 使用 useConversation hook 来管理对话状态
    const {
        conversationList,
        setConversationList,
        currConversationId,
        setCurrConversationId,
        getConversationIdFromStorage,
    } = useConversation()

    // 获取对话列表
    useEffect(() => {
        const loadConversations = async () => {
            try {
                setLoading(true)
                const { data } = await fetchConversations()
                setConversations(data || [])
                setConversationList(data || [])
            } catch (error) {
                console.error('Failed to load conversations:', error)
                setConversations([])
                setConversationList([])
            } finally {
                setLoading(false)
            }
        }

        loadConversations()
    }, [setConversationList])

    // 从 URL 参数获取当前对话 ID 并同步到 useConversation
    useEffect(() => {
        const conversationId = searchParams.get('conversationId') || '-1'
        if (conversationId !== currConversationId) {
            setCurrConversationId(conversationId, APP_ID, false)
        }
    }, [searchParams, setCurrConversationId, currConversationId])

    // 当 currConversationId 变化时，更新 URL
    useEffect(() => {
        const conversationId = searchParams.get('conversationId') || ''
        if (currConversationId === '-1' && conversationId) {
            router.push('/chat')
        } else if (currConversationId !== '-1' && currConversationId !== conversationId) {
            router.push(`/chat?conversationId=${currConversationId}`)
        }
    }, [currConversationId, searchParams, router])

    // 处理新建对话
    const handleNewChat = () => {
        setCurrConversationId('-1', APP_ID, false)
        router.push('/chat')
    }

    // 处理选择对话
    const handleSelectConversation = (conversationId: string) => {
        setCurrConversationId(conversationId, APP_ID, true)
        router.push(`/chat?conversationId=${conversationId}`)
    }

    // 准备对话列表数据
    const conversationListData = {
        conversations,
        currentId: currConversationId === '-1' ? '' : currConversationId,
        onNewChat: handleNewChat,
        onSelectConversation: handleSelectConversation,
        loading
    }

    return (
        <AppLayout
            currentPage="chat"
            showConversationList={true}
            conversationListData={conversationListData}
        >
            <div className="h-full">
                <Main params={params} />
            </div>
        </AppLayout>
    )
}

export default React.memo(ChatPageWrapper)