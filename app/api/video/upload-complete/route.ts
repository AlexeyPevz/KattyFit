import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { getUploadedChunks, cleanupUpload } from "@/lib/upload-chunks"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { uploadId, metadata, chunks } = body

    if (!uploadId || !metadata || !chunks) {
      return NextResponse.json(
        { error: "Недостаточно данных" },
        { status: 400 }
      )
    }

    // Получаем все чанки из памяти
    const uploadedChunks = getUploadedChunks(uploadId)
    
    if (!uploadedChunks) {
      return NextResponse.json(
        { error: "Чанки не найдены или загружены не полностью" },
        { status: 400 }
      )
    }

    // Объединяем чанки в один файл
    const completeBuffer = Buffer.concat(uploadedChunks)
    
    // Генерируем уникальное имя файла
    const timestamp = Date.now()
    // Сохраняем расширение и основное имя
    const originalName = metadata.fileName || 'video.mp4'
    const lastDotIndex = originalName.lastIndexOf('.')
    const extension = lastDotIndex > 0 ? originalName.slice(lastDotIndex) : '.mp4'
    const baseName = lastDotIndex > 0 ? originalName.slice(0, lastDotIndex) : originalName
    
    // Санитизация с сохранением Unicode символов
    const sanitizedBaseName = baseName
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_') // Удаляем недопустимые символы файловой системы
      .replace(/\.+/g, '.') // Множественные точки в одну
      .slice(0, 100) // Ограничиваем длину
    
    const fileName = `${timestamp}_${sanitizedBaseName}${extension}`
    const { data: storageData, error: storageError } = await supabaseAdmin.storage
      .from('videos')
      .upload(fileName, completeBuffer, {
        contentType: metadata.fileType || 'video/mp4',
        upsert: false
      })

    if (storageError) {
      throw storageError
    }

    // Получаем публичный URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('videos')
      .getPublicUrl(fileName)

    // Сохраняем информацию о видео в БД
    const { data: videoRecord, error: dbError } = await supabaseAdmin
      .from('videos')
      .insert({
        title: metadata.title,
        description: metadata.description,
        course_id: metadata.courseId,
        lesson_id: metadata.lessonId,
        file_size: completeBuffer.length,
        hls_url: publicUrl,
        status: 'ready',
        duration: 0, // Нужно будет обработать видео для получения длительности
      })
      .select()
      .single()

    if (dbError) {
      // Удаляем файл из storage если не удалось сохранить в БД
      await supabaseAdmin.storage
        .from('videos')
        .remove([fileName])
      
      throw dbError
    }

    // Очищаем временные данные
    cleanupUpload(uploadId)

    // Удаляем записи о чанках из БД
    await supabaseAdmin
      .from('upload_chunks')
      .delete()
      .eq('upload_id', uploadId)

    return NextResponse.json({
      success: true,
      video: videoRecord,
      url: publicUrl
    })

  } catch (error) {
    console.error('Ошибка финализации загрузки:', error)
    return NextResponse.json(
      { error: 'Ошибка финализации загрузки' },
      { status: 500 }
    )
  }
}
