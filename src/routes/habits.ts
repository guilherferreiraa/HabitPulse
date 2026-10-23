import { Router } from 'express'
import prisma from '../lib/prisma.js'

const router = Router()

// Rota POST para criar um novo hábito
router.post('/habits', async (req, res) => {
  try {
    const { title, targetType } = req.body

    // Validação básica
    if (!title || !targetType) {
      return res.status(400).json({ error: 'Título e targetType são obrigatórios.' })
    }

   
    const habit = await prisma.habit.create({
      data: {
        title,
        targetType, 
      },
    })

    return res.status(201).json(habit)
  } catch (error) {
    console.error('Erro ao criar hábito:', error)
    return res.status(500).json({ error: 'Erro interno ao criar hábito.' })
  }
})

export default router