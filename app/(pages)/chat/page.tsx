import type { FC } from 'react'
import React from 'react'
import AppLayout from '@/app/components/layout/AppLayout'
import Main from '@/app/components'

interface ChatProps {
    params: any
}

const Chat: FC<ChatProps> = ({ params }) => {
    return (
        <AppLayout currentPage="chat">
            <div className="h-full">
                <Main params={params} />
            </div>
        </AppLayout>
    )
}

export default React.memo(Chat)