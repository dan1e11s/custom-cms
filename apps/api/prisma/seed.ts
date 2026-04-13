import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@cms.local'
  const username = 'admin'
  const password = 'admin123'

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  })

  if (existing) {
    console.log(`✓ Пользователь "${username}" уже существует (role: ${existing.role})`)
    return
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const user = await prisma.user.create({
    data: {
      email,
      username,
      passwordHash,
      role: 'ADMIN',
    },
  })

  console.log(`✓ Создан ADMIN пользователь:`)
  console.log(`  email:    ${email}`)
  console.log(`  password: ${password}`)
  console.log(`  id:       ${user.id}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
