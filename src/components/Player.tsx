import { UserInterface } from '@/interfaces/UserInterface'
import { pb } from '@/utils/pocketbase'
import { NextPage } from 'next'
import { useEffect, useState } from 'react'

interface Props {
    id: string
    winnerButton: JSX.Element | null
}

pb.autoCancellation(false)

const Player: NextPage<Props> = ({ id, winnerButton }) => {
    const [UserData, setUserData] = useState({} as UserInterface)
    const [IsLoading, setIsLoading] = useState(true)

    useEffect(() => {
        (async () => {
            setIsLoading(true)
            const userData = await pb.collection('user').getOne<UserInterface>(id)
            setUserData(userData)
            setIsLoading(false)
        })()
        pb.collection('user').subscribe<UserInterface>(id, (e) => {
            if (e.action === 'update') {
                setUserData(e.record)
            }
        })
        return () => {
            pb.collection('user').unsubscribe(id)
        }
    }, [])

    return (
        <>
            <div className='border p-3 flex justify-between'>
                {IsLoading ? <div>Loading...</div> : <div className='flex flex-col'>
                    <div>{UserData.name}</div>
                    <div>{UserData.money.toLocaleString("th-TH")}</div>
                </div>}
                {winnerButton}
            </div>
        </>
    )
}

export default Player