import { api } from '@/utils/api'
import { NextPage, NextPageContext } from 'next'
import { useEffect } from 'react'

Room.getInitialProps = async (ctx: NextPageContext) => {
    const { id } = ctx.query
    return { id }
}

interface Props {
    id: string | string[] | undefined
}

export default function Room({ id }: Props) {
    const joinRoomApi = api.roomRouter.join.useMutation()
    useEffect(() => {
        joinRoomApi.mutate({ record_id: id as string, user_record_id: '1' })
    }, [])

    return <>asdfsadf</>
}