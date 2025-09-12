import { NextRequest, NextResponse } from "next/server"
import { RAGContext, ChatMessage } from "@/types/api"
import { AppError, ValidationError } from "@/types/errors"
import { withErrorHandler } from "@/lib/error-handler"
import { generateRAGResponse } from "@/lib/rag-engine"
import { z } from "zod"

// ===== ZOD СХЕМЫ ВАЛИДАЦИИ =====

const ChatMessageSchema = z.object({
  id: z.string().optional(),
  text: z.string().optional(),
  message: z.string().optional(),
  timestamp: z.union([z.string(), z.number(), z.date()]).optional(),
  sender: z.enum(['user', 'assistant', 'system']).optional(),
  platform: z.enum(['web', 'telegram', 'vk', 'whatsapp']).optional(),
}).transform((data) => ({
  id: data.id || `msg_${Date.now()}`,
  text: data.text || data.message || '',
  timestamp: new Date(data.timestamp || Date.now()),
  sender: data.sender || 'user',
  platform: data.platform || 'web',
}))

const YandexGPTRequestSchema = z.object({
  message: z.string()
    .min(1, 'Message is required')
    .max(4000, 'Message must be 4000 characters or less')
    .transform(msg => msg.trim()),
  conversationId: z.string().optional(),
  chatHistory: z.array(ChatMessageSchema).default([]),
})

async function handleYandexGPTRequest(request: NextRequest): Promise<NextResponse> {
  const body = await request.json()
  
  // Валидация с помощью Zod
  const validationResult = YandexGPTRequestSchema.safeParse(body)
  
  if (!validationResult.success) {
    const fieldErrors = validationResult.error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code || 'VALIDATION_ERROR'
    }))
    
    throw new ValidationError('Validation failed', fieldErrors)
  }

  const { message, conversationId, chatHistory } = validationResult.data

  // Создаем контекст для RAG
  const ragContext: RAGContext = {
    userMessage: message,
    chatHistory,
    platform: 'web',
    userName: 'Guest',
    userContext: {
      userId: conversationId,
    },
  }

  // Генерируем ответ через RAG движок
  const response = await generateRAGResponse(ragContext)

  return NextResponse.json({
    success: true,
    response,
    conversationId: conversationId || `chat_${Date.now()}`,
  })
}

export const POST = withErrorHandler(handleYandexGPTRequest)
