'use client'
import React from 'react'
import { useTranslation } from 'react-i18next'
import Chat from '@/app/components/chat'
import ConfigSence from '@/app/components/config-scence'
import type { IMainProps } from '@/app/components'

type ChatPageProps = {
  // 保留原有聊天组件的所有props
  conversationName: string
  hasSetInputs: boolean
  isPublicVersion: boolean
  siteInfo: any
  promptConfig: any
  onStartChat: (inputs: Record<string, any>) => void
  canEditInputs: boolean
  savedInputs: Record<string, any>
  onInputsChange: (inputs: Record<string, any>) => void
  chatList: any[]
  onSend: (message: string, files?: any[]) => void
  onFeedback: (messageId: string, feedback: any) => void
  isResponding: boolean
  checkCanSend: () => boolean
  visionConfig: any
} & IMainProps

const ChatPage: React.FC<ChatPageProps> = ({
  conversationName,
  hasSetInputs,
  isPublicVersion,
  siteInfo,
  promptConfig,
  onStartChat,
  canEditInputs,
  savedInputs,
  onInputsChange,
  chatList,
  onSend,
  onFeedback,
  isResponding,
  checkCanSend,
  visionConfig,
}) => {
  const { t } = useTranslation()

  return (
    <div className="h-full flex flex-col">
      {/* 聊天配置区域 */}
      <div className="flex-shrink-0">
        <ConfigSence
          conversationName={conversationName}
          hasSetInputs={hasSetInputs}
          isPublicVersion={isPublicVersion}
          siteInfo={siteInfo}
          promptConfig={promptConfig}
          onStartChat={onStartChat}
          canEditInputs={canEditInputs}
          savedInputs={savedInputs}
          onInputsChange={onInputsChange}
        />
      </div>

      {/* 聊天内容区域 */}
      {hasSetInputs && (
        <div className="flex-1 relative min-h-0 p-4">
          <div className="h-full glass-card p-4">
            <div className="h-full overflow-y-auto">
              <Chat
                chatList={chatList}
                onSend={onSend}
                onFeedback={onFeedback}
                isResponding={isResponding}
                checkCanSend={checkCanSend}
                visionConfig={visionConfig}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatPage
