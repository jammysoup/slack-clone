import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: { workspaceId: string } }
) {
  const session = await getServerSession()
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const channels = await prisma.channel.findMany({
    where: {
      workspaceId: params.workspaceId,
      OR: [
        { isPrivate: false },
        {
          members: {
            some: {
              user: {
                email: session.user.email
              }
            }
          }
        }
      ]
    },
    include: {
      members: {
        include: {
          user: true
        }
      }
    }
  })

  return NextResponse.json(channels)
}

export async function POST(
  request: Request,
  { params }: { params: { workspaceId: string } }
) {
  const session = await getServerSession()
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const json = await request.json()
  const { name, description, isPrivate } = json

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! }
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const channel = await prisma.channel.create({
    data: {
      name,
      description,
      isPrivate,
      workspaceId: params.workspaceId,
      members: {
        create: {
          userId: user.id,
          role: "OWNER"
        }
      }
    }
  })

  return NextResponse.json(channel)
} 