import type { FC } from 'react'
import React from 'react'
import AppLayout from '@/app/components/layout/AppLayout'
import HomePage from '@/app/components/pages/HomePage'

const App: FC = () => {
  return (
    <AppLayout currentPage="home">
      <HomePage />
    </AppLayout>
  )
}

export default React.memo(App)
