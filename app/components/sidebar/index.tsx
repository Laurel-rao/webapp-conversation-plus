import React from 'react'
import type { FC } from 'react'
import { useTranslation } from 'react-i18next'
import {
  ChatBubbleOvalLeftEllipsisIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline'
import { ChatBubbleOvalLeftEllipsisIcon as ChatBubbleOvalLeftEllipsisSolidIcon } from '@heroicons/react/24/solid'
import Button from '@/app/components/base/button'
// import Card from './card'
import type { ConversationItem } from '@/types/app'

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}

const MAX_CONVERSATION_LENTH = 20

export type ISidebarProps = {
  copyRight: string
  currentId: string
  onCurrentIdChange: (id: string) => void
  list: ConversationItem[]
}

const Sidebar: FC<ISidebarProps> = ({
  copyRight,
  currentId,
  onCurrentIdChange,
  list,
}) => {
  const { t } = useTranslation()
  return (
    <div
      className="shrink-0 flex flex-col overflow-y-auto bg-white/5 backdrop-blur-sm w-full h-full border-r border-blue-400/20"
    >
      {list.length < MAX_CONVERSATION_LENTH && (
        <div className="flex flex-shrink-0 p-4 !pb-0">
          <button
            onClick={() => { onCurrentIdChange('-1') }}
            className="group block w-full flex-shrink-0 justify-start h-9 px-3 py-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg items-center text-sm transition-colors">
            <PencilSquareIcon className="mr-2 h-4 w-4" /> {t('app.chat.newChat')}
          </button>
        </div>
      )}

      <nav className="mt-4 flex-1 space-y-1 bg-transparent p-4 !pt-0">
        {list.map((item) => {
          const isCurrent = item.id === currentId
          const ItemIcon
            = isCurrent ? ChatBubbleOvalLeftEllipsisSolidIcon : ChatBubbleOvalLeftEllipsisIcon
          return (
            <div
              onClick={() => onCurrentIdChange(item.id)}
              key={item.id}
              className={classNames(
                isCurrent
                  ? 'bg-blue-500/20 text-white border border-blue-400/30'
                  : 'text-blue-200 hover:bg-white/10 hover:text-white',
                'group flex items-center rounded-md px-3 py-2 text-sm font-medium cursor-pointer transition-colors',
              )}
            >
              <ItemIcon
                className={classNames(
                  isCurrent
                    ? 'text-blue-300'
                    : 'text-blue-400 group-hover:text-blue-200',
                  'mr-3 h-4 w-4 flex-shrink-0',
                )}
                aria-hidden="true"
              />
              <span className="truncate" title={item.name}>
                {item.name}
              </span>
            </div>
          )
        })}
      </nav>
      {/* <a className="flex flex-shrink-0 p-4" href="https://langgenius.ai/" target="_blank">
        <Card><div className="flex flex-row items-center"><ChatBubbleOvalLeftEllipsisSolidIcon className="text-primary-600 h-6 w-6 mr-2" /><span>LangGenius</span></div></Card>
      </a> */}
      <div className="flex flex-shrink-0 pr-4 pb-4 pl-4">
        <div className="text-blue-300/60 font-normal text-xs">© {copyRight} {(new Date()).getFullYear()}</div>
      </div>
    </div>
  )
}

export default React.memo(Sidebar)
