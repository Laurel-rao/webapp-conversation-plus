import type { FC } from 'react'
import React from 'react'
import AppLayout from '@/app/components/layout/AppLayout'
import BillingPage from '@/app/components/pages/BillingPage'

const Billing: FC = () => {
  return (
    <AppLayout currentPage="billing">
      <BillingPage />
    </AppLayout>
  )
}

export default React.memo(Billing)
