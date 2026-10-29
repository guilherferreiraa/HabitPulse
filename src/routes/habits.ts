import { Router } from "express";
import prisma from "../lib/prisma.js";

const router = Router();

// Rota GET para listar todos os hábitos
router.get("/habits", async (req, res) => {
  try {
    const habits = await prisma.habit.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json(habits);
  } catch (error) {
    console.error("Erro ao buscar hábitos:", error);
    return res.status(500).json({ error: "Erro interno ao buscar hábitos." });
  }
});

// Rota POST para criar um novo hábito
router.post("/habits", async (req, res) => {
  try {
    const { title, targetType } = req.body;

    // Validação básica
    if (!title || !targetType) {
      return res
        .status(400)
        .json({ error: "Título e targetType são obrigatórios." });
    }

    const habit = await prisma.habit.create({
      data: {
        title,
        targetType,
      },
    });

    return res.status(201).json(habit);
  } catch (error) {
    console.error("Erro ao criar hábito:", error);
    return res.status(500).json({ error: "Erro interno ao criar hábito." });
  }
});

// Rota POST para registrar a conclusão/progresso de um hábito num dia
router.post("/habits/:id/logs", async (req, res) => {
  try {
    const { id } = req.params;
    const { completed, value } = req.body;

    // 1. Verifica se o hábito existe no banco
    const habit = await prisma.habit.findUnique({
      where: { id },
    });

    if (!habit) {
      return res.status(404).json({ error: "Hábito não encontrado." });
    }

    // 2. Cria o registro usando o habitId diretamente
    const log = await prisma.habitLog.create({
      data: {
        habitId: id,
        completed: completed ?? true,
        ...(value !== undefined && value !== null ? { value: Number(value) } : {}),
      },
    });

    return res.status(201).json(log);
  } catch (error) {
    console.error("Erro ao registrar progresso:", error);
    return res.status(500).json({ error: "Erro interno ao registrar progresso." });
  }
});

// Rota DELETE para remover um hábito e seus logs associados
router.delete("/habits/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Verifica se o hábito existe no banco
    const habit = await prisma.habit.findUnique({
      where: { id },
    });

    if (!habit) {
      return res.status(404).json({ error: "Hábito não encontrado." });
    }

    // 2. Deleta primeiro os logs associados para respeitar a integridade do banco
    await prisma.habitLog.deleteMany({
      where: { habitId: id },
    });

    // 3. Deleta o hábito
    await prisma.habit.delete({
      where: { id },
    });

    // Retorna status 204 (No Content) indicando sucesso sem corpo de resposta
    return res.status(204).send();
  } catch (error) {
    console.error("Erro ao deletar hábito:", error);
    return res.status(500).json({ error: "Erro interno ao deletar hábito." });
  }
});

// Rota GET para o resumo dos hábitos com os respetivos logs
router.get("/summary", async (req, res) => {
  try {
    // Busca todos os hábitos incluindo o histórico de logs associados
    const habits = await prisma.habit.findMany({
      include: {
        logs: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json(habits);
  } catch (error) {
    console.error("Erro ao buscar resumo:", error);
    return res.status(500).json({ error: "Erro interno ao buscar o resumo." });
  }
});
export default router;
