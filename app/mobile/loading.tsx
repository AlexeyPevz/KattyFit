export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full yoga-gradient flex items-center justify-center mx-auto mb-4 animate-pulse">
          <span className="text-white font-bold text-xl">K</span>
        </div>
        <p className="text-muted-foreground">Загрузка мобильной версии...</p>
      </div>
    </div>
  )
}
