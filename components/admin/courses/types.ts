// Типы для компонентов курсов
// Централизованные типы для всех course-связанных компонентов

export interface CourseLesson {
  id: string
  title: string
  description: string
  type: "video" | "text" | "quiz" | "assignment"
  duration: number
  content: {
    videoUrl?: string
    textContent?: string
    quizQuestions?: Array<Record<string, unknown>>
    assignmentText?: string
  }
  isPreview: boolean
  order: number
}

export interface CourseModule {
  id: string
  title: string
  description: string
  lessons: CourseLesson[]
  order: number
  isExpanded: boolean
}

export interface Course {
  id: string
  title: string
  description: string
  shortDescription: string
  thumbnail: string
  level: "beginner" | "intermediate" | "advanced"
  duration: number
  price: number
  isPublished: boolean
  modules: CourseModule[]
  tags: string[]
  prerequisites: string[]
  learningOutcomes: string[]
  createdAt: string
  updatedAt: string
}

export interface QuizQuestion {
  id: string
  question: string
  type: "single" | "multiple" | "text"
  options: string[]
  correctAnswers: number[]
  explanation?: string
  points: number
}

export interface CourseFormData {
  title: string
  description: string
  shortDescription: string
  thumbnail: string
  level: string
  price: number
  tags: string[]
  prerequisites: string[]
  learningOutcomes: string[]
}

export interface LessonFormData {
  title: string
  description: string
  type: string
  duration: number
  content: {
    videoUrl?: string
    textContent?: string
    quizQuestions?: QuizQuestion[]
    assignmentText?: string
  }
}

export interface CourseBuilderState {
  course: Course
  selectedModule: CourseModule | null
  selectedLesson: CourseLesson | null
  isPreviewMode: boolean
  isSaving: boolean
  hasUnsavedChanges: boolean
}
