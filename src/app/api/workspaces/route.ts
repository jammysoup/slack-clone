import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await getServerSession()
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const workspaces = await prisma.workspace.findMany({
    where: {
      members: {
        some: {
          user: {
            email: session.user.email
          }
        }
      }
    },
    include: {
      owner: true,
      members: {
        include: {
          user: true
        }
      }
    }
  })

  return NextResponse.json(workspaces)
}

export async function POST(request: Request) {
  const session = await getServerSession()
  
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const json = await request.json()
  const { name, imageUrl } = json

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! }
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const workspace = await prisma.workspace.create({
    data: {
      name,
      imageUrl,
      ownerId: user.id,
      members: {
        create: {
          userId: user.id,
          role: "OWNER"
        }
      }
    }
  })

  return NextResponse.json(workspace)
} 