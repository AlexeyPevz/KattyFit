import { NextRequest, NextResponse } from "next/server"
import { RAGContext, ChatMessage } from "@/types/api"
import { AppError, ValidationError } from "@/types/errors"
import { withErrorHandler } from "@/lib/error-handler"
import { generateRAGResponse } from "@/lib/rag-engine"

async function handleYandexGPTRequest(request: NextRequest): Promise<NextResponse> {
  const body = await request.json()
  const { message, conversationId, chatHistory = [] } = body

  // Валидация входных данных
  if (!message || typeof message !== 'string') {
    throw new ValidationError('Message is required and must be a string', [
      { field: 'message', message: 'Message is required and must be a string', code: 'REQUIRED' }
    ])
  }

  if (message.length > 4000) {
    throw new ValidationError('Message too long', [
      { field: 'message', message: 'Message must be 4000 characters or less', code: 'MAX_LENGTH' }
    ])
  }

  // Санитизация сообщения
  const sanitizedMessage = message.trim().slice(0, 4000)

  // Создаем контекст для RAG
  const ragContext: RAGContext = {
    userMessage: sanitizedMessage,
    chatHistory: chatHistory.map((msg: any) => ({
      id: msg.id || `msg_${Date.now()}`,
      text: msg.text || msg.message,
      timestamp: new Date(msg.timestamp || Date.now()),
      sender: msg.sender || 'user',
      platform: 'web',
    } as ChatMessage)),
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