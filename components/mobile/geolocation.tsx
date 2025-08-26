"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, Phone, Clock, Star } from "lucide-react"
import { TouchButton } from "./touch-interface"

interface Studio {
  id: string
  name: string
  address: string
  phone: string
  rating: number
  distance?: number
  coordinates: {
    lat: number
    lng: number
  }
  workingHours: {
    open: string
    close: string
  }
  services: string[]
  photos: string[]
}

const mockStudios: Studio[] = [
  {
    id: "1",
    name: "Студия Гармония",
    address: "ул. Примерная, д. 123",
    phone: "+7 (999) 123-45-67",
    rating: 4.8,
    coordinates: { lat: 55.7558, lng: 37.6176 },
    workingHours: { open: "08:00", close: "22:00" },
    services: ["Растяжка", "Аэройога", "Персональные тренировки"],
    photos: ["/images/trainer-studio.jpg"],
  },
  {
    id: "2",
    name: "Центр Флексибилити",
    address: "пр. Спортивный, д. 45",
    phone: "+7 (999) 234-56-78",
    rating: 4.6,
    coordinates: { lat: 55.7658, lng: 37.6276 },
    workingHours: { open: "09:00", close: "21:00" },
    services: ["Йога", "Растяжка", "Групповые занятия"],
    photos: ["/images/trainer-outdoor.jpg"],
  },
]

export function StudioLocator() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [studios, setStudios] = useState<Studio[]>(mockStudios)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getCurrentLocation()
  }, [])

  const getCurrentLocation = () => {
    setIsLoading(true)
    setError(null)

    if (!navigator.geolocation) {
      setError("Геолокация не поддерживается вашим браузером")
      setIsLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        setUserLocation(location)
        calculateDistances(location)
        setIsLoading(false)
      },
      (error) => {
        setError("Не удалось получить ваше местоположение")
        setIsLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      },
    )
  }

  const calculateDistances = (userLoc: { lat: number; lng: number }) => {
    const studiosWithDistance = mockStudios
      .map((studio) => {
        const distance = calculateDistance(userLoc.lat, userLoc.lng, studio.coordinates.lat, studio.coordinates.lng)
        return { ...studio, distance }
      })
      .sort((a, b) => (a.distance || 0) - (b.distance || 0))

    setStudios(studiosWithDistance)
  }

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371 // Radius of the Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const openInMaps = (studio: Studio) => {
    const url = `https://maps.google.com/?q=${studio.coordinates.lat},${studio.coordinates.lng}`
    window.open(url, "_blank")
  }

  const callStudio = (phone: string) => {
    window.location.href = `tel:${phone}`
  }

  return (
    <div className="space-y-4">
      {/* Location Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-primary" />
              <span className="font-medium">
                {userLocation ? "Ваше местоположение определено" : "Местоположение не определено"}
              </span>
            </div>
            <TouchButton variant="outline" size="sm" onClick={getCurrentLocation} disabled={isLoading}>
              <Navigation className="w-4 h-4 mr-1" />
              {isLoading ? "Поиск..." : "Обновить"}
            </TouchButton>
          </div>
          {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
        </CardContent>
      </Card>

      {/* Studios List */}
      <div className="space-y-4">
        {studios.map((studio) => (
          <Card key={studio.id} className="overflow-hidden">
            <div className="relative h-32">
              <img
                src={studio.photos[0] || "/placeholder.svg"}
                alt={studio.name}
                className="w-full h-full object-cover"
              />
              {studio.distance && (
                <Badge className="absolute top-2 right-2 bg-black/70 text-white">{studio.distance.toFixed(1)} км</Badge>
              )}
            </div>

            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{studio.name}</h3>
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{studio.rating}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mr-2" />
                  {studio.address}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 mr-2" />
                  {studio.workingHours.open} - {studio.workingHours.close}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Phone className="w-4 h-4 mr-2" />
                  {studio.phone}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {studio.services.map((service) => (
                  <Badge key={service} variant="secondary" className="text-xs">
                    {service}
                  </Badge>
                ))}
              </div>

              <div className="flex space-x-2">
                <TouchButton variant="outline" size="sm" onClick={() => openInMaps(studio)} className="flex-1">
                  <Navigation className="w-4 h-4 mr-1" />
                  Маршрут
                </TouchButton>
                <TouchButton variant="outline" size="sm" onClick={() => callStudio(studio.phone)} className="flex-1">
                  <Phone className="w-4 h-4 mr-1" />
                  Позвонить
                </TouchButton>
                <TouchButton variant="primary" size="sm" className="flex-1">
                  Записаться
                </TouchButton>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {studios.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-8 text-center">
            <MapPin className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-medium mb-2">Студии не найдены</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Попробуйте обновить местоположение или расширить радиус поиска
            </p>
            <TouchButton variant="outline" onClick={getCurrentLocation}>
              Повторить поиск
            </TouchButton>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
