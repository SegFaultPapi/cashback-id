"use client"

import * as React from "react"
import { motion, useMotionValue, useTransform } from "framer-motion"
import { Eye, EyeOff, Wifi } from "lucide-react"
import { cn } from "@/lib/utils"

const PERSPECTIVE = 1000
const CARD_ANIMATION_DURATION = 0.6
const INITIAL_DELAY = 0.2

interface CashbackCardProps extends React.HTMLAttributes<HTMLDivElement> {
  cardNumber?: string
  cardHolder?: string
  expiryDate?: string
  cvv?: string
}

export function CashbackCard({
  cardNumber = "4532 1234 5678 9010",
  cardHolder = "vitalik.eth",
  expiryDate = "12/28",
  cvv = "123",
  className,
}: CashbackCardProps) {
  const [isVisible, setIsVisible] = React.useState(false)
  const [isFlipped, setIsFlipped] = React.useState(false)
  const [isClicked, setIsClicked] = React.useState(false)
  
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useTransform(y, [-100, 100], [20, -20])
  const rotateY = useTransform(x, [-100, 100], [-20, 20])

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set(event.clientX - centerX)
    y.set(event.clientY - centerY)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  const getMaskedNumber = (number: string) => {
    const cleaned = number.replace(/\s/g, '')
    const lastFour = cleaned.slice(-4)
    return `•••• •••• •••• ${lastFour}`
  }

  return (
    <div className={cn("relative", className)}>
      <motion.div
        className="relative w-full max-w-[400px] mx-auto"
        style={{ perspective: PERSPECTIVE }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: CARD_ANIMATION_DURATION }}
      >
        <motion.div
          className="relative w-full aspect-[1.586/1] cursor-pointer"
          style={{ 
            transformStyle: "preserve-3d",
            rotateX,
            rotateY: isFlipped ? 180 : rotateY,
          }}
          animate={{ 
            scale: isClicked ? 0.95 : 1,
            y: isClicked ? 0 : [0, -8, 0],
          }}
          transition={{ 
            scale: { duration: 0.6, type: "spring", stiffness: 100, damping: 20 },
            y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={() => {
            setIsClicked(true)
            setTimeout(() => setIsClicked(false), 200)
            setTimeout(() => setIsFlipped(!isFlipped), 100)
          }}
        >
          {/* Front of card */}
          <motion.div
            className="absolute inset-0 rounded-2xl p-6 md:p-8 shadow-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 backface-hidden"
            style={{ 
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              boxShadow: "0 25px 50px -12px rgba(16, 185, 129, 0.25), 0 0 40px rgba(16, 185, 129, 0.15)"
            }}
            whileHover={{
              boxShadow: "0 30px 60px -15px rgba(16, 185, 129, 0.35), 0 0 60px rgba(16, 185, 129, 0.25)"
            }}
          >
            {/* Card shimmer effect */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 3,
                  ease: "linear",
                }}
              />
            </div>

            {/* Card content */}
            <div className="relative h-full flex flex-col justify-between text-white">
              {/* Top section */}
              <div className="flex justify-between items-start">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: INITIAL_DELAY }}
                  className="flex items-center gap-3 md:gap-4"
                >
                  <div className="w-10 h-8 md:w-12 md:h-9 rounded bg-gradient-to-br from-amber-500 to-yellow-600 shadow-inner" />
                  <Wifi className="w-5 h-5 md:w-6 md:h-6 rotate-90" />
                </motion.div>

                <motion.button
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    delay: 0.4,
                    type: "spring",
                    stiffness: 200,
                    damping: 15
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsVisible(!isVisible)
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                >
                  {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </motion.button>
              </div>

              {/* Card number */}
              <motion.div
                className="text-xl md:text-2xl font-mono tracking-wider"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {isVisible ? cardNumber : getMaskedNumber(cardNumber)}
              </motion.div>

              {/* Bottom section */}
              <div className="flex justify-between items-end">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="text-[10px] md:text-xs opacity-70 mb-1">CARD HOLDER</div>
                  <div className="font-medium text-xs md:text-sm tracking-wide">{cardHolder}</div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="text-[10px] md:text-xs opacity-70 mb-1">EXPIRES</div>
                  <div className="font-medium text-xs md:text-sm">{isVisible ? expiryDate : "••/••"}</div>
                </motion.div>

                <motion.div
                  className="flex items-center gap-1"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    delay: 0.6,
                    type: "spring",
                    stiffness: 200
                  }}
                >
                  {/* Sui Network Logo */}
                  <svg 
                    width="48" 
                    height="48" 
                    viewBox="0 0 200 200" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-8 h-8 md:w-10 md:h-10"
                  >
                    <path
                      d="M81.3 43.4c8.6-11.5 25-11.5 33.6 0l56.4 75.2c10.4 13.8 1.2 33.4-15.7 33.4H40.6c-16.9 0-26.1-19.6-15.7-33.4l56.4-75.2Z"
                      fill="currentColor"
                    />
                  </svg>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Back of card */}
          <motion.div
            className="absolute inset-0 rounded-2xl shadow-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 backface-hidden"
            style={{ 
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              boxShadow: "0 25px 50px -12px rgba(16, 185, 129, 0.25), 0 0 40px rgba(16, 185, 129, 0.15)"
            }}
            whileHover={{
              boxShadow: "0 30px 60px -15px rgba(16, 185, 129, 0.35), 0 0 60px rgba(16, 185, 129, 0.25)"
            }}
          >
            {/* Magnetic strip */}
            <div className="absolute top-6 md:top-8 left-0 right-0 h-10 md:h-12 bg-black/80" />
            
            {/* Signature panel */}
            <div className="absolute top-20 md:top-24 left-4 right-4 md:left-6 md:right-6 bg-white/90 h-8 md:h-10 rounded flex items-center justify-end px-2 md:px-3">
              <motion.div 
                className="text-black font-mono font-bold text-sm md:text-base"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {isVisible ? cvv : "•••"}
              </motion.div>
            </div>

            {/* Card info */}
            <div className="absolute bottom-6 md:bottom-8 left-6 md:left-8 right-6 md:right-8 text-white text-[10px] md:text-xs space-y-2 opacity-70">
              <p>ENS Identity + LI.FI Cross-Chain + Sui Settlement</p>
              <p>cashbackid.* — Your name, your rules, your cashback</p>
              <p className="text-[9px] md:text-[10px]">
                Spend on any chain, receive on your name. Cashback routed via 
                LI.FI and settled on Sui with sub-second finality.
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Floating elements */}
        <motion.div
          className="absolute -top-4 -right-4 w-16 h-16 md:w-20 md:h-20 bg-emerald-400/30 rounded-full blur-2xl"
          animate={{
            scale: isClicked ? [1, 1.5, 1] : [1, 1.2, 1],
            opacity: isClicked ? [0.2, 0.6, 0.2] : [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: isClicked ? 0.3 : 3,
            repeat: isClicked ? 0 : Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute -bottom-4 -left-4 w-20 h-20 md:w-24 md:h-24 bg-emerald-500/30 rounded-full blur-2xl"
          animate={{
            scale: isClicked ? [1, 1.6, 1] : [1, 1.3, 1],
            opacity: isClicked ? [0.2, 0.6, 0.2] : [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: isClicked ? 0.3 : 4,
            repeat: isClicked ? 0 : Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Click ripple effect */}
        {isClicked && (
          <motion.div
            className="absolute inset-0 rounded-2xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.1, opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="h-full w-full rounded-2xl border-2 border-white/50" />
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
