"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard,
  ArrowRight,
  Tag
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"

// Демо-данные корзины
const initialCartItems = [
  {
    id: 1,
    title: "Основы растяжки для начинающих",
    price: 2990,
    originalPrice: 3990,
    image: "/images/trainer-studio.jpg",
    type: "course",
    quantity: 1
  },
  {
    id: 2,
    title: "Персональная тренировка онлайн",
    price: 2500,
    image: "/images/trainer-outdoor.jpg",
    type: "training",
    quantity: 2
  }
]

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState(initialCartItems)
  const [promoCode, setPromoCode] = useState("")
  const [discount, setDiscount] = useState(0)
  const router = useRouter()

  const updateQuantity = (id: number, delta: number) => {
    setCartItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    )
  }

  const removeItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id))
  }

  const applyPromoCode = () => {
    // Демо промокоды
    if (promoCode.toUpperCase() === "KATTY10") {
      setDiscount(10)
    } else if (promoCode.toUpperCase() === "FIRST20") {
      setDiscount(20)
    } else {
      setDiscount(0)
      alert("Промокод не найден")
    }
  }

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discountAmount = Math.round(subtotal * discount / 100)
  const total = subtotal - discountAmount

  const handleCheckout = () => {
    // В реальном приложении здесь будет переход к оплате
    alert("Переход к оплате... (функционал в разработке)")
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container px-4 py-16 mt-16 text-center">
          <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Корзина пуста</h1>
          <p className="text-muted-foreground mb-8">
            Добавьте курсы или тренировки, чтобы начать заниматься
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild>
              <Link href="/courses">Посмотреть курсы</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/booking">Записаться на тренировку</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container px-4 py-8 mt-16">
        <h1 className="text-3xl font-bold mb-8">Корзина</h1>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.title}
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{item.title}</h3>
                          <Badge variant="secondary" className="mt-1">
                            {item.type === "course" ? "Курс" : "Тренировка"}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, -1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-12 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="text-right">
                          <div className="font-semibold">
                            {(item.price * item.quantity).toLocaleString()} ₽
                          </div>
                          {item.originalPrice && (
                            <div className="text-sm text-muted-foreground line-through">
                              {(item.originalPrice * item.quantity).toLocaleString()} ₽
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Итого</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Подытог</span>
                    <span>{subtotal.toLocaleString()} ₽</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Скидка ({discount}%)</span>
                      <span>-{discountAmount.toLocaleString()} ₽</span>
                    </div>
                  )}
                </div>
                
                <Separator />
                
                <div className="flex justify-between text-xl font-semibold">
                  <span>К оплате</span>
                  <span>{total.toLocaleString()} ₽</span>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="promo">Промокод</Label>
                  <div className="flex gap-2">
                    <Input
                      id="promo"
                      placeholder="Введите код"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                    />
                    <Button variant="outline" onClick={applyPromoCode}>
                      <Tag className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <Button className="w-full yoga-gradient text-white" onClick={handleCheckout}>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Перейти к оплате
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                
                <p className="text-xs text-center text-muted-foreground">
                  Нажимая "Перейти к оплате", вы соглашаетесь с{" "}
                  <Link href="/terms" className="underline">
                    условиями использования
                  </Link>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
