"use client"

import { useState } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, MapPin, Video, CalendarIcon, CreditCard, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"

const services = [
  {
    id: "personal",
    title: "Персональная тренировка",
    description: "Индивидуальное занятие с полным вниманием тренера",
    duration: 60,
    price: 3500,
    type: "personal",
    features: ["Индивидуальная программа", "Персональные корректировки", "Гибкий график"],
  },
  {
    id: "stretching",
    title: "Растяжка",
    description: "Специализированное занятие по развитию гибкости",
    duration: 90,
    price: 2500,
    type: "stretching",
    features: ["Все группы мышц", "Безопасные техники", "Прогрессивная нагрузка"],
  },
  {
    id: "aerial",
    title: "Аэройога",
    description: "Занятие в воздушных полотнах",
    duration: 90,
    price: 4000,
    type: "aerial",
    features: ["Профессиональное оборудование", "Техника безопасности", "Все уровни"],
  },
  {
    id: "consultation",
    title: "Консультация",
    description: "Оценка физического состояния и составление программы",
    duration: 30,
    price: 1500,
    type: "consultation",
    features: ["Анализ состояния", "Персональные рекомендации", "План тренировок"],
  },
]

const timeSlots = ["09:00", "10:30", "12:00", "13:30", "15:00", "16:30", "18:00", "19:30"]

export default function BookingPage() {
  const [selectedService, setSelectedService] = useState(services[0])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState("")
  const [sessionType, setSessionType] = useState<"online" | "offline">("offline")
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    experience: "",
    goals: "",
    notes: "",
  })

  const handleServiceSelect = (service: (typeof services)[0]) => {
    setSelectedService(service)
  }

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleBooking = () => {
    // Handle booking logic here
    console.log("Booking data:", {
      service: selectedService,
      date: selectedDate,
      time: selectedTime,
      type: sessionType,
      ...formData,
    })
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Запись на{" "}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              тренировку
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Выберите удобное время и тип занятия для достижения ваших целей
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${currentStep >= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}
                `}
                >
                  {currentStep > step ? <CheckCircle className="w-4 h-4" /> : step}
                </div>
                {step < 3 && (
                  <div
                    className={`
                    w-12 h-0.5 mx-2
                    ${currentStep > step ? "bg-primary" : "bg-muted"}
                  `}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Step 1: Service Selection */}
          {currentStep === 1 && (
            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Выберите тип тренировки</CardTitle>
                  <CardDescription>Выберите подходящий формат занятия из доступных вариантов</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    {services.map((service) => (
                      <Card
                        key={service.id}
                        className={`cursor-pointer transition-all duration-200 ${
                          selectedService.id === service.id ? "ring-2 ring-primary bg-primary/5" : "hover:shadow-md"
                        }`}
                        onClick={() => handleServiceSelect(service)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">{service.title}</CardTitle>
                            <Badge variant="outline">{service.price.toLocaleString()} ₽</Badge>
                          </div>
                          <CardDescription>{service.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex items-center text-sm text-muted-foreground mb-3">
                            <Clock className="w-4 h-4 mr-1" />
                            {service.duration} минут
                          </div>
                          <div className="space-y-1">
                            {service.features.map((feature, idx) => (
                              <div key={idx} className="flex items-center text-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
                                {feature}
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Tabs value={sessionType} onValueChange={(value) => setSessionType(value as "online" | "offline")}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="offline" className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        Офлайн
                      </TabsTrigger>
                      <TabsTrigger value="online" className="flex items-center">
                        <Video className="w-4 h-4 mr-2" />
                        Онлайн
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="offline" className="mt-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center space-x-2 text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>Москва, ул. Примерная, д. 123, студия "Гармония"</span>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                    <TabsContent value="online" className="mt-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="flex items-center space-x-2 text-muted-foreground">
                            <Video className="w-4 h-4" />
                            <span>Ссылка на видеоконференцию будет отправлена на email</span>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>

                  <div className="flex justify-end mt-6">
                    <Button onClick={handleNext} className="yoga-gradient text-white">
                      Далее
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Date & Time Selection */}
          {currentStep === 2 && (
            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <Card>
                <CardHeader>
                  <CardTitle>Выберите дату и время</CardTitle>
                  <CardDescription>Выберите удобные дату и время для проведения тренировки</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <Label className="text-base font-medium mb-4 block">Дата</Label>
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date() || date.getDay() === 0}
                        className="rounded-md border"
                      />
                    </div>

                    <div>
                      <Label className="text-base font-medium mb-4 block">Время</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {timeSlots.map((time) => (
                          <Button
                            key={time}
                            variant={selectedTime === time ? "default" : "outline"}
                            className={`${selectedTime === time ? "yoga-gradient text-white" : ""}`}
                            onClick={() => setSelectedTime(time)}
                          >
                            {time}
                          </Button>
                        ))}
                      </div>

                      {selectedDate && selectedTime && (
                        <Card className="mt-6 bg-primary/5 border-primary/20">
                          <CardContent className="pt-6">
                            <div className="flex items-center space-x-2 text-primary">
                              <CalendarIcon className="w-4 h-4" />
                              <span className="font-medium">
                                {selectedDate.toLocaleDateString("ru-RU", {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}{" "}
                                в {selectedTime}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={handleBack}>
                      Назад
                    </Button>
                    <Button
                      onClick={handleNext}
                      disabled={!selectedDate || !selectedTime}
                      className="yoga-gradient text-white"
                    >
                      Далее
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Personal Information & Payment */}
          {currentStep === 3 && (
            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Личная информация</CardTitle>
                    <CardDescription>Заполните данные для связи и уточнения деталей</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="name">Имя *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ваше имя"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Телефон *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+7 (999) 123-45-67"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your@email.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="experience">Опыт тренировок</Label>
                      <Select
                        value={formData.experience}
                        onValueChange={(value) => setFormData({ ...formData, experience: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите уровень" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Новичок</SelectItem>
                          <SelectItem value="intermediate">Средний</SelectItem>
                          <SelectItem value="advanced">Продвинутый</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="goals">Цели тренировок</Label>
                      <Textarea
                        id="goals"
                        value={formData.goals}
                        onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                        placeholder="Расскажите о ваших целях..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="notes">Дополнительные пожелания</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Особые пожелания или ограничения..."
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Детали заказа</CardTitle>
                    <CardDescription>Проверьте информацию перед оплатой</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="font-medium">{selectedService.title}</span>
                        <span>{selectedService.price.toLocaleString()} ₽</span>
                      </div>

                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Продолжительность:</span>
                        <span>{selectedService.duration} мин</span>
                      </div>

                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Формат:</span>
                        <span>{sessionType === "online" ? "Онлайн" : "Офлайн"}</span>
                      </div>

                      {selectedDate && selectedTime && (
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Дата и время:</span>
                          <span>
                            {selectedDate.toLocaleDateString("ru-RU")} в {selectedTime}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="border-t pt-3">
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Итого:</span>
                        <span>{selectedService.price.toLocaleString()} ₽</span>
                      </div>
                    </div>

                    <Button className="w-full yoga-gradient text-white" size="lg" onClick={handleBooking}>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Оплатить и забронировать
                    </Button>

                    <div className="text-xs text-muted-foreground text-center">
                      Нажимая кнопку, вы соглашаетесь с условиями оферты и политикой конфиденциальности
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={handleBack}>
                  Назад
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
