// Dependency Injection Container
// Простой DI контейнер для управления зависимостями

export type Constructor<T = {}> = new (...args: unknown[]) => T
export type Factory<T> = (...args: unknown[]) => T
export type ServiceDefinition<T> = {
  factory: Factory<T>
  singleton: boolean
  dependencies: string[]
}

export class DIContainer {
  private services = new Map<string, ServiceDefinition<unknown>>()
  private instances = new Map<string, unknown>()

  /**
   * Регистрирует сервис в контейнере
   */
  register<T>(
    name: string,
    factory: Factory<T>,
    options: {
      singleton?: boolean
      dependencies?: string[]
    } = {}
  ): this {
    this.services.set(name, {
      factory,
      singleton: options.singleton ?? true,
      dependencies: options.dependencies ?? []
    })
    return this
  }

  /**
   * Регистрирует класс как сервис
   */
  registerClass<T>(
    name: string,
    constructor: Constructor<T>,
    options: {
      singleton?: boolean
      dependencies?: string[]
    } = {}
  ): this {
    return this.register(
      name,
      (...args) => new constructor(...args),
      options
    )
  }

  /**
   * Регистрирует значение как сервис
   */
  registerValue<T>(name: string, value: T): this {
    this.instances.set(name, value)
    return this
  }

  /**
   * Получает экземпляр сервиса
   */
  get<T>(name: string): T {
    // Если уже есть экземпляр (для singleton)
    if (this.instances.has(name)) {
      return this.instances.get(name) as T
    }

    // Получаем определение сервиса
    const service = this.services.get(name)
    if (!service) {
      throw new Error(`Service '${name}' not found`)
    }

    // Разрешаем зависимости
    const dependencies = service.dependencies.map(dep => this.get(dep))

    // Создаем экземпляр
    const instance = service.factory(...dependencies) as T

    // Сохраняем для singleton
    if (service.singleton) {
      this.instances.set(name, instance)
    }

    return instance
  }

  /**
   * Проверяет, зарегистрирован ли сервис
   */
  has(name: string): boolean {
    return this.services.has(name) || this.instances.has(name)
  }

  /**
   * Очищает все сервисы
   */
  clear(): void {
    this.services.clear()
    this.instances.clear()
  }

  /**
   * Удаляет конкретный сервис
   */
  remove(name: string): boolean {
    const removed = this.services.delete(name) || this.instances.delete(name)
    return removed
  }

  /**
   * Получает список всех зарегистрированных сервисов
   */
  getRegisteredServices(): string[] {
    return [
      ...Array.from(this.services.keys()),
      ...Array.from(this.instances.keys())
    ]
  }
}

// Глобальный экземпляр контейнера
export const container = new DIContainer()

// Декораторы для автоматической регистрации
export function Injectable(singleton = true) {
  return function <T extends Constructor>(target: T) {
    const name = target.name
    container.registerClass(name, target, { singleton })
    return target
  }
}

export function Inject(serviceName: string) {
  return function (target: unknown, propertyKey: string | symbol, parameterIndex: number) {
    // В реальной реализации здесь была бы логика для внедрения зависимостей
    // через метаданные или другие механизмы
    console.log(`Injecting ${serviceName} into ${target?.constructor?.name} at parameter ${parameterIndex}`)
  }
}

// Утилиты для работы с контейнером
export const di = {
  container,
  register: <T>(name: string, factory: Factory<T>, options?: { singleton?: boolean; dependencies?: string[] }) =>
    container.register(name, factory, options),
  registerClass: <T>(name: string, constructor: Constructor<T>, options?: { singleton?: boolean; dependencies?: string[] }) =>
    container.registerClass(name, constructor, options),
  registerValue: <T>(name: string, value: T) => container.registerValue(name, value),
  get: <T>(name: string) => container.get<T>(name),
  has: (name: string) => container.has(name),
  clear: () => container.clear(),
  remove: (name: string) => container.remove(name)
}
