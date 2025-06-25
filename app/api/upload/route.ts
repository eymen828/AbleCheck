import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as HandleUploadBody

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // Validate file type and size
        const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]

        return {
          allowedContentTypes: allowedTypes,
          maximumSizeInBytes: 5 * 1024 * 1024, // 5MB limit
          tokenPayload: JSON.stringify({
            userId: clientPayload || "anonymous",
            timestamp: Date.now(),
          }),
        }
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        console.log("Upload completed successfully:", {
          url: blob.url,
          size: blob.size,
          pathname: blob.pathname,
        })
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error: any) {
    console.error("Upload API error:", error)

    // Return more specific error messages
    if (error.message?.includes("token")) {
      return NextResponse.json(
        { error: "Token generation failed. Please check your Vercel Blob configuration." },
        { status: 500 },
      )
    }

    if (error.message?.includes("size")) {
      return NextResponse.json({ error: "File size exceeds the maximum limit of 5MB." }, { status: 413 })
    }

    if (error.message?.includes("type")) {
      return NextResponse.json(
        { error: "File type not supported. Please use JPEG, PNG, GIF, or WebP." },
        { status: 415 },
      )
    }

    return NextResponse.json({ error: error.message || "Upload failed. Please try again." }, { status: 400 })
  }
}
