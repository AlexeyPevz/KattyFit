// Заглушка для Sentry когда модуль не установлен
export const Sentry = {
  init: () => {},
  captureException: () => {},
  captureMessage: () => {},
  withScope: (callback: (scope: any) => void) => callback({}),
  ErrorBoundary: ({ children, fallback, beforeCapture }: any) => children,
  setUser: () => {},
  setTag: () => {},
  setTags: () => {},
  setContext: () => {},
  setLevel: () => {},
  addBreadcrumb: () => {},
  configureScope: () => {},
  startTransaction: () => ({ finish: () => {} }),
  startSpan: () => ({ finish: () => {} }),
  captureEvent: () => {},
  getCurrentHub: () => ({
    getClient: () => null,
    getScope: () => null,
  }),
  flush: () => Promise.resolve(true),
  close: () => Promise.resolve(true),
  Integrations: {
    Http: class {},
    Express: class {},
    BrowserTracing: class {},
    Replay: class {},
  },
  nextjsRouterInstrumentation: () => {},
}

// Экспортируем все методы отдельно для совместимости
export const {
  init,
  captureException,
  captureMessage,
  withScope,
  ErrorBoundary,
  setUser,
  setTag,
  setTags,
  setContext,
  setLevel,
  addBreadcrumb,
  configureScope,
  startTransaction,
  startSpan,
  captureEvent,
  getCurrentHub,
  flush,
  close,
  Integrations,
  nextjsRouterInstrumentation,
} = Sentry

export const SentryService = {
  initialize: () => {},
  captureException: () => {},
  captureMessage: () => {},
  setUser: () => {},
  addBreadcrumb: () => {},
}

export function initializeSentry() {}
export function enhanceLoggerWithSentry(logger: any) { return logger }
export function SentryErrorBoundary({ children }: { children: React.ReactNode }) {
  return children
}
