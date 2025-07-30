import type { FC } from 'react'
import React from 'react'
import AppLayout from '@/app/components/layout/AppLayout'
import ProfilePage from '@/app/components/pages/ProfilePage'

const Profile: FC = () => {
    return (
        <AppLayout currentPage="profile">
            <ProfilePage />
        </AppLayout>
    )
}

export default React.memo(Profile)