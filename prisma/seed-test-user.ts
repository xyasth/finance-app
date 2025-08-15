// scripts/seed-test-user.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createTestUser() {
  try {
    // Check if test user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    })

    if (existingUser) {
      console.log('Test user already exists!')
      console.log('Email: test@example.com')
      console.log('Password: password123')
      return
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 12)

    // Create test user
    const testUser = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        hashedPassword,
        currency: 'USD',
      }
    })

    // Create some sample transactions
    await prisma.transaction.createMany({
      data: [
        {
          userId: testUser.id,
          type: 'INCOME',
          amount: 5000,
          description: 'Monthly Salary',
          category: 'Salary',
          date: new Date('2024-12-01'),
        },
        {
          userId: testUser.id,
          type: 'EXPENSE',
          amount: 1200,
          description: 'Rent Payment',
          category: 'Bills & Utilities',
          date: new Date('2024-12-01'),
        },
        {
          userId: testUser.id,
          type: 'EXPENSE',
          amount: 300,
          description: 'Grocery Shopping',
          category: 'Food & Dining',
          date: new Date('2024-12-02'),
        },
        {
          userId: testUser.id,
          type: 'INCOME',
          amount: 800,
          description: 'Freelance Project',
          category: 'Freelance',
          date: new Date('2024-12-03'),
        },
        {
          userId: testUser.id,
          type: 'EXPENSE',
          amount: 150,
          description: 'Gas Station',
          category: 'Transportation',
          date: new Date('2024-12-03'),
        },
        {
          userId: testUser.id,
          type: 'EXPENSE',
          amount: 80,
          description: 'Movie Night',
          category: 'Entertainment',
          date: new Date('2024-12-04'),
        },
        {
          userId: testUser.id,
          type: 'INCOME',
          amount: 200,
          description: 'Cash Gift',
          category: 'Other Income',
          date: new Date('2024-12-05'),
        }
      ]
    })

    console.log('✅ Test user created successfully!')
    console.log('📧 Email: test@example.com')
    console.log('🔐 Password: password123')
    console.log('💰 Sample transactions added')

  } catch (error) {
    console.error('❌ Error creating test user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()

// package.json script to add:
// "seed:test": "npx tsx scripts/seed-test-user.ts"