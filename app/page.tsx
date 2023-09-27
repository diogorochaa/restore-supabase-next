import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { RedirectType, redirect } from "next/navigation"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs"

export default async function Home() {
  let loggedIn = false
  try {
    const supabase = createServerComponentClient({ cookies })
    const { data: {session},} = await supabase.auth.getSession()

    if (session) {
      loggedIn = true
    }

  } catch (e) {
    console.log('home', e)

  } finally {
    if (loggedIn) redirect('/user-app', RedirectType.replace)
  }

  return (
    <div className="flex flex-col h-screen w-full justify-center items-center">
      <Tabs defaultValue="create-account" className="w-[400px] border rounded-md pb-4 shadow-2xl">
        <TabsList className="flex justify-around items-center rounded-b-none h-14">
          <TabsTrigger className="transition-all delay-150" value="create-account">Account</TabsTrigger>
          <TabsTrigger className="transition-all delay-150" value="login">Login</TabsTrigger>
        </TabsList>
        <TabsContent value="create-account">
         
        </TabsContent>
        <TabsContent value="login">
         
        </TabsContent>
      </Tabs>
    </div>
  )
}