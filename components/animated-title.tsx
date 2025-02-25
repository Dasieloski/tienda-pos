'use client'

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { BikeIcon as Motorcycle } from 'lucide-react'

export function AnimatedTitle() {
  const [isHovered, setIsHovered] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const letters = "Variedades-Friñón".split("")

  if (!isClient) return null

  return (
    <div
      className="flex items-center gap-3 p-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        animate={isHovered ? {
          rotate: [0, 10, -10, 0],
          scale: [1, 1.1, 1],
        } : {}}
        transition={{
          duration: 0.6,
          ease: "easeInOut"
        }}
        className="inline-block text-2xl"
      >
        <Motorcycle className="w-8 h-8 md:w-10 md:h-10 text-primary" />
      </motion.div>
      <div className="flex flex-col">
        <div className="flex flex-wrap">
          {letters.map((letter, index) => (
            <motion.span
              key={index}
              className="font-bold text-xl md:text-3xl lg:text-4xl font-display tracking-tight"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.08,
                duration: 0.5,
                ease: "easeOut"
              }}
              whileHover={{
                scale: 1.05,
                color: letter === "-" ? "#666" :
                  ["#2B4C7E", "#567EBB", "#606D80", "#1E3A5F"][index % 4],
                transition: { duration: 0.2 }
              }}
            >
              {letter}
            </motion.span>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="flex flex-col text-sm md:text-base space-y-0.5"
        >
          <span className="font-medium text-primary">
            Piezas y Accesorios para Motos
          </span>
          <span className="text-xs md:text-sm text-muted-foreground">
            Tienda Física y Virtual • La Habana, Cuba
          </span>
        </motion.div>
      </div>
    </div>
  )
}
