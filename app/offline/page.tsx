export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md text-center space-y-4">
        <div className="h-16 w-16 mx-auto rounded-full bg-muted flex items-center justify-center">
          <span className="text-2xl">📴</span>
        </div>
        <h1 className="text-2xl font-bold">Нет подключения к интернету</h1>
        <p className="text-muted-foreground">
          Проверьте соединение и попробуйте снова. Некоторые страницы доступны офлайн, а
          остальной контент загрузится при восстановлении сети.
        </p>
        <a href="/" className="underline">На главную</a>
      </div>
    </div>
  )
}

