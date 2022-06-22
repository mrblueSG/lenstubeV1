/**
 * Middleware based open graph generation for client side NextJs apps
 * Inspired from https://github.com/lensterxyz by @bigint
 */

import { LENSTUBE_TWITTER_HANDLE, LENSTUBE_URL } from '@utils/constants'
import getThumbnailUrl from '@utils/functions/getThumbnailUrl'
import imageCdn from '@utils/functions/imageCdn'
import { NextRequest } from 'next/server'
import { LenstubePublication } from 'src/types/local'
import parser from 'ua-parser-js'

export async function middleware(req: NextRequest) {
  const { headers } = req
  const url = req.nextUrl.clone()
  const id = url.pathname.replace('/watch/', '')
  const ua = parser(headers.get('user-agent')!)

  if (!ua.os.name) {
    const result = await fetch(`${url.origin}/api/video?id=${id}`)
    const data = await result.json()

    if (data?.success) {
      const video: LenstubePublication = data?.video
      const title = video?.metadata.name || ''
      const description =
        video.metadata?.description ||
        `Published by @${video.profile.handle} via Lenstube.`
      const cover = imageCdn(getThumbnailUrl(video))
      return new Response(
        `<!DOCTYPE html>
        <html lang="en">
            <head>
            <title>${title}</title>
            <meta charset="UTF-8">
            <meta name="description" content="${description}" />
            <meta property="og:url" content=${LENSTUBE_URL} />
            <meta property="og:site_name" content="Lenstube" />
            <meta property="og:title" content="${title}" />
            <meta property="og:description" content="${description}" />
            <meta property="og:image" content="${cover}" />
            <meta property="og:image:width" content="600" />
            <meta property="og:image:height" content="300" />
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:site" content="Lenstube" />
            <meta property="twitter:title" content="${title}" />
            <meta property="twitter:description" content="${description}" />
            <meta property="twitter:image" content="${cover}" />
            <meta property="twitter:image:width" content="600" />
            <meta property="twitter:image:height" content="500" />
            <meta property="twitter:creator" content="${LENSTUBE_TWITTER_HANDLE}" />
            </head>
        </html>`,
        {
          headers: {
            'Content-Type': 'text/html',
            'Cache-Control': 's-maxage=86400'
          }
        }
      )
    }
  }
}
