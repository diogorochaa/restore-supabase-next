'use client'

import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '../ui/button'
import { Input } from '../ui/input'

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

// definindo schema de validação
const formSchema = z.object({
  email: z
    .string({ required_error: 'E-mail is required' })
    .email({ message: 'Must be a valid e-mail' }),
  password: z
    .string({ required_error: 'Password is required' })
    .min(7, { message: 'Password must be at least 7 characters long' })
    .max(12, { message: 'Password must be at most 12 characters long' }),
})

export default function CreateAccountForm() {
  const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const supabase = createClientComponentClient()
      const { email, password } = values
      const {
        error,
        data: { user },
      } = await supabase.auth.signUp({
        email,
        password,
      })

      if (user) {
        form.reset()

        router.refresh()
      }
    } catch (e) {
      console.log('CreateAccount', e)
    }
  }

  return (
    <div className="flex flex-col justify-center items-center space-y-2">
      <span>Create Account Form</span>
      <Form {...form}>
        <form
          className="flex flex-col space-y-2"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="email">E-mail</FormLabel>
                <FormControl>
                  <Input
                    id="email"
                    type="email"
                    placeholder="E-mail"
                    {...field}
                  />
                </FormControl>
                <FormDescription>This is your e-mail address</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="password">Password</FormLabel>
                <FormControl>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Password"
                    {...field}
                  />
                </FormControl>
                <FormDescription>This is your password</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Create Account</Button>
        </form>
      </Form>
    </div>
  )
}
