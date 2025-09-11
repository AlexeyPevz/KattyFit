"use client"

import { CourseBuilderComponent } from "@/components/admin/courses/course-builder"
import { Course } from "@/components/admin/courses/types"

// Mock data for development
const mockCourse: Course = {
  id: "course-1",
  title: "Полный курс React",
  description: "Изучите React с нуля до продвинутого уровня. Создавайте современные веб-приложения с использованием лучших практик.",
  shortDescription: "Изучите React с нуля до продвинутого уровня",
  thumbnail: "https://example.com/react-course.jpg",
  level: "intermediate",
  duration: 1200, // 20 hours
  price: 15000,
  isPublished: false,
  modules: [
    {
      id: "module-1",
      title: "Основы React",
      description: "Изучаем базовые концепции React",
      lessons: [
        {
          id: "lesson-1",
          title: "Введение в React",
          description: "Что такое React и зачем он нужен",
          type: "video",
          duration: 30,
          content: {
            videoUrl: "https://example.com/intro.mp4"
          },
          isPreview: true,
          order: 0
        },
        {
          id: "lesson-2",
          title: "Компоненты и JSX",
          description: "Создаем первые компоненты",
          type: "video",
          duration: 45,
          content: {
            videoUrl: "https://example.com/components.mp4"
          },
          isPreview: false,
          order: 1
        }
      ],
      order: 0,
      isExpanded: true
    },
    {
      id: "module-2",
      title: "Состояние и события",
      description: "Управление состоянием в React",
      lessons: [
        {
          id: "lesson-3",
          title: "useState хук",
          description: "Работа с локальным состоянием",
          type: "video",
          duration: 40,
          content: {
            videoUrl: "https://example.com/usestate.mp4"
          },
          isPreview: false,
          order: 0
        },
        {
          id: "lesson-4",
          title: "Обработка событий",
          description: "Квиз по обработке событий",
          type: "quiz",
          duration: 20,
          content: {
            quizQuestions: [
              {
                id: "q1",
                question: "Как правильно обработать клик в React?",
                type: "single",
                options: [
                  "onClick={handleClick}",
                  "onclick={handleClick}",
                  "onClick={handleClick()}"
                ],
                correctAnswers: [0],
                explanation: "В React используется camelCase для обработчиков событий",
                points: 1
              }
            ]
          },
          isPreview: false,
          order: 1
        }
      ],
      order: 1,
      isExpanded: false
    }
  ],
  tags: ["React", "JavaScript", "Frontend", "Web Development"],
  prerequisites: ["Базовые знания JavaScript", "HTML и CSS"],
  learningOutcomes: [
    "Создавать React компоненты",
    "Управлять состоянием приложения",
    "Работать с хуками",
    "Строить современные веб-приложения"
  ],
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-01-15T10:00:00Z"
}

export default function CourseBuilderPage() {
  return (
    <CourseBuilderComponent 
      initialCourse={mockCourse}
      courseId="course-1"
    />
  )
}