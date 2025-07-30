'use client'
import type { FC } from 'react'
import React, { useEffect, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import AppLayout from '@/app/components/layout/AppLayout'
import Main from '@/app/components'
import { fetchConversations } from '@/service'
import type { ConversationItem } from '@/types/app'

type ChatPageWrapperProps = {
    params: any
}

const ChatPageWrapper: FC<ChatPageWrapperProps> = ({ params }) => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [conversations, setConversations] = useState<ConversationItem[]>([])
    const [currentConversationId, setCurrentConversationId] = useState<string>('')
    const [loading, setLoading] = useState(true)

    // 获取对话列表
    useEffect(() => {
        const loadConversations = async () => {
            try {
                setLoading(true)
                const { data } = await fetchConversations()
                setConversations(data || [])
            } catch (error) {
                console.error('Failed to load conversations:', error)
                setConversations([])
            } finally {
                setLoading(false)
            }
        }

        loadConversations()
    }, [])

    // 从 URL 参数获取当前对话 ID
    useEffect(() => {
        const conversationId = searchParams.get('conversationId') || ''
        setCurrentConversationId(conversationId)
    }, [searchParams])

    // 处理新建对话
    const handleNewChat = () => {
        router.push('/chat')
        setCurrentConversationId('')
    }

    // 处理选择对话
    const handleSelectConversation = (conversationId: string) => {
        router.push(`/chat?conversationId=${conversationId}`)
        setCurrentConversationId(conversationId)
    }

    // 准备对话列表数据
    const conversationListData = {
        conversations,
        currentId: currentConversationId,
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