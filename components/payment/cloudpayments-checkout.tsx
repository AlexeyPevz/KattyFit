"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Lock, CreditCard, Shield, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { trackEvent, ANALYTICS_EVENTS } from "@/lib/analytics"
import logger from "@/lib/logger"

interface CloudPaymentsWidget {
  charge: (options: {
    publicId: string
    description: string
    amount: number
    currency: string
    invoiceId?: string
    accountId?: string
    email?: string
    skin?: string
    data?: Record<string, unknown>
    onSuccess?: (options: CloudPaymentsSuccessOptions) => void
    onFail?: (reason: string, options: CloudPaymentsFailOptions) => void
    onComplete?: (paymentResult: CloudPaymentsResult, options: CloudPaymentsCompleteOptions) => void
  }) => void
}

interface CloudPaymentsSuccessOptions {
  transactionId: string
  amount: number
  currency: string
  [key: string]: unknown
}

interface CloudPaymentsFailOptions {
  reason: string
  [key: string]: unknown
}

interface CloudPaymentsResult {
  success: boolean
  transactionId?: string
  [key: string]: unknown
}

interface CloudPaymentsCompleteOptions {
  [key: string]: unknown
}

declare global {
  interface Window {
    cp: CloudPaymentsWidget
  }
}

interface CloudPaymentsCheckoutProps {
  amount: number
  currency?: string
  description: string
  accountId?: string
  email?: string
  data?: Record<string, unknown>
  onSuccess?: (transaction: CloudPaymentsSuccessOptions) => void
  onFail?: (reason: string) => void
  onComplete?: () => void
}

export function CloudPaymentsCheckout({
  amount,
  currency = "RUB",
  description,
  accountId,
  email,
  data = {},
  onSuccess,
  onFail,
  onComplete
}: CloudPaymentsCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [userEmail, setUserEmail] = useState(email || "")
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [promoCode, setPromoCode] = useState("")
  const [discount, setDiscount] = useState<number>(0)
  const [finalAmount, setFinalAmount] = useState<number>(amount)
  const router = useRouter()

  useEffect(() => {
    // Загружаем скрипт CloudPayments
    if (!window.cp) {
      const script = document.createElement("script")
      script.src = "https://widget.cloudpayments.ru/bundles/cloudpayments.js"
      script.async = true
      document.body.appendChild(script)
    }
  }, [])

  useEffect(() => {
    const applied = Math.max(0, Math.min(100, discount))
    const discounted = Math.max(0, Math.round((amount * (100 - applied)) / 100))
    setFinalAmount(discounted)
  }, [amount, discount])

  const applyPromo = async () => {
    if (!promoCode) return
    try {
      const res = await fetch(`/api/promocodes/validate?code=${encodeURIComponent(promoCode)}&amount=${amount}`)
      const data = await res.json()
      if (res.ok && data.valid) {
        setDiscount(data.discountPercent || 0)
        trackEvent(ANALYTICS_EVENTS.PROMO_APPLIED, {
          code: promoCode,
          discount: data.discountPercent,
          amount: amount
        })
      } else {
        setDiscount(0)
        alert(data.error || "Промокод недействителен")
      }
    } catch {
      setDiscount(0)
      alert("Не удалось применить промокод")
    }
  }

  const handlePayment = async () => {
    if (!window.cp) {
      logger.error("CloudPayments widget not loaded")
      return
    }

    if (!userEmail) {
      alert("Пожалуйста, укажите email")
      return
    }

    if (!acceptTerms) {
      alert("Необходимо принять условия оферты")
      return
    }

    setIsLoading(true)

    const widget = new window.cp.CloudPayments()
    
    const paymentData = {
      publicId: process.env.NEXT_PUBLIC_CLOUDPAYMENTS_PUBLIC_ID || "test_api_00000000000000000000001", // v0 will use env var
      description: description,
      amount: finalAmount,
      currency: currency,
      accountId: accountId || userEmail,
      email: userEmail,
      data: {
        ...data,
        email: userEmail,
        promoCode: promoCode || undefined,
        discountPercent: discount || undefined,
      }
    }

    widget.pay("auth", paymentData,
      {
        onSuccess: (options: CloudPaymentsSuccessOptions) => {
          // Платеж прошел успешно
          logger.info("Payment success", { options })
          setIsLoading(false)
          setShowSuccessDialog(true)
          
          trackEvent(ANALYTICS_EVENTS.PURCHASE, {
            amount: finalAmount,
            description: description,
            promoCode: promoCode || undefined,
            transactionId: options.id
          })
          
          // Сохраняем информацию о покупке
          fetch("/api/payments/success", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              transactionId: options.id,
              amount: finalAmount,
              description: description,
              email: userEmail,
              data: { ...data, promoCode, discountPercent: discount }
            })
          })

          if (onSuccess) {
            onSuccess(options)
          }

          // Перенаправляем на страницу успеха через 3 секунды
          setTimeout(() => {
            if (data.courseId) {
              router.push(`/player/${data.courseId}`)
            } else if (data.bookingId) {
              router.push("/booking/success")
            }
          }, 3000)
        },
        onFail: (reason: string, options: CloudPaymentsFailOptions) => {
          // Платеж не прошел
          logger.error("Payment failed", { reason, options })
          setIsLoading(false)
          alert(`Ошибка оплаты: ${reason}`)
          
          if (onFail) {
            onFail(reason)
          }
        },
        onComplete: (paymentResult: CloudPaymentsResult, options: CloudPaymentsCompleteOptions) => {
          // Вызывается как при успехе, так и при неудаче
          setIsLoading(false)
          
          if (onComplete) {
            onComplete()
          }
        }
      }
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Оформление заказа</CardTitle>
          <CardDescription>
            Безопасная оплата через CloudPayments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payment Info */}
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Товар:</span>
              <span className="font-medium">{description}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Скидка:</span>
                <span className="text-green-600">- {discount}%</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">К оплате:</span>
              <span className="text-2xl font-bold">{finalAmount} ₽</span>
            </div>
          </div>
          {/* Promo Code */}
          <div className="space-y-2">
            <Label htmlFor="promo">Промокод</Label>
            <div className="flex gap-2">
              <Input
                id="promo"
                placeholder="Введите промокод"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.trim())}
              />
              <Button type="button" variant="outline" onClick={applyPromo}>Применить</Button>
            </div>
          </div>


          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email">Email для доступа</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              На этот email будут отправлены данные для доступа
            </p>
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={acceptTerms}
              onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
            />
            <label
              htmlFor="terms"
              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Я принимаю{" "}
              <a href="/offer" target="_blank" className="text-primary underline">
                условия оферты
              </a>{" "}
              и{" "}
              <a href="/privacy" target="_blank" className="text-primary underline">
                политику конфиденциальности
              </a>
            </label>
          </div>

          {/* Security Badges */}
          <div className="flex items-center justify-center gap-4 py-4 border-y">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4" />
              <span>SSL</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>PCI DSS</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CreditCard className="h-4 w-4" />
              <span>3D-Secure</span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Принимаем к оплате:</p>
            <div className="flex flex-wrap gap-2">
              <img src="/api/placeholder/60/40" alt="Visa" className="h-8" />
              <img src="/api/placeholder/60/40" alt="Mastercard" className="h-8" />
              <img src="/api/placeholder/60/40" alt="Mir" className="h-8" />
              <img src="/api/placeholder/60/40" alt="ApplePay" className="h-8" />
              <img src="/api/placeholder/60/40" alt="GooglePay" className="h-8" />
            </div>
          </div>

          {/* Pay Button */}
          <Button 
            onClick={handlePayment}
            disabled={isLoading || !userEmail || !acceptTerms}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Обработка...
              </>
            ) : (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Оплатить {amount} ₽
              </>
            )}
          </Button>

          {/* Additional Info */}
          <p className="text-xs text-center text-muted-foreground">
            Нажимая кнопку "Оплатить", вы соглашаетесь с условиями оферты.
            Оплата происходит через защищенное соединение.
          </p>
        </CardContent>
      </Card>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <DialogTitle className="text-center">Оплата прошла успешно!</DialogTitle>
            <DialogDescription className="text-center">
              Спасибо за покупку! Сейчас вы будете перенаправлены к вашему контенту.
              Также мы отправили данные для доступа на email {userEmail}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center mt-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
