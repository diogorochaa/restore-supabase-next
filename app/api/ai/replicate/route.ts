import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse, NextRequest } from 'next/server'
import { cookies } from 'next/headers'

interface NextRequestWithImage extends NextRequest {
  imageUrl: string
}

export async function POST(req: NextRequestWithImage, res: NextResponse) {
  const { imageUrl } = await req.json()
  const supabase = createRouteHandlerClient({ cookies })
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 })
  }

  const startRestoreProcess = await fetch(
    'htpps://api.replicate.com/v1/predictions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
      },
      body: JSON.stringify({
        version:
          '9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3',
        input: {
          img: imageUrl,
          version: 'v1.4',
          scale: 2,
        },
      }),
    },
  )

  const jsonStartProcessResponse = await startRestoreProcess.json()
  const endpointUrl = jsonStartProcessResponse.urls.get
  let restoredImage: string | null = null

  while (!restoredImage) {
    console.log('Waiting for restore to complete...')
    const finalResponse = await fetch(endpointUrl, {
      method: 'GET',
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
      },
    })
    const jsonFinalResponse = await finalResponse.json()

    if (jsonFinalResponse.status === 'succeeded') {
      restoredImage = jsonFinalResponse.output
    } else if (jsonFinalResponse.status === 'failed') {
      return NextResponse.json(
        { message: 'Failed to restore image' },
        { status: 500 },
      )
    } else {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  return NextResponse.json({ restoredImage }, { status: 200 })
}
