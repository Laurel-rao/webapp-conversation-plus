import type { FC } from 'react'
import React from 'react'
import AppLayout from '@/app/components/layout/AppLayout'
import ChatPageWrapper from '@/app/components/pages/ChatPageWrapper'

type ChatProps = {
  params: any
}

const Chat: FC<ChatProps> = ({ params }) => {
  return (
    <ChatPageWrapper params={params} />
  )
}

export default React.memo(Chat)
