'use client'

import { useSession } from "../../../utils/hooks/useSession";
import SignInPage from "./SignInPage";

const Page = () =>{
    const {session, loading} = useSession()
    return <SignInPage sessionData={{data: session, loading}} />
}



export default Page