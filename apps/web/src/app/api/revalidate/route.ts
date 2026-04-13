import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-revalidate-secret')

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  const tag = req.nextUrl.searchParams.get('tag')
  if (!tag) {
    return NextResponse.json({ error: 'Missing tag parameter' }, { status: 400 })
  }

  revalidateTag(tag)

  return NextResponse.json({ revalidated: true, tag })
}
