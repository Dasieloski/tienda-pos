"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Wrench, Bike, Cog, PenToolIcon as Tool, Gauge, Battery, Sparkles, Fuel, Hammer, Settings2 } from "lucide-react"

const icons = [
  { icon: Bike, color: "#A3C1E6" },
  { icon: Wrench, color: "#BCD4F0" },
  { icon: Cog, color: "#8DB4DA" },
  { icon: Tool, color: "#D1DAE6" },
  { icon: Gauge, color: "#A3C1E6" },
  { icon: Battery, color: "#BCD4F0" },
  { icon: Sparkles, color: "#8DB4DA" },
  { icon: Fuel, color: "#D1DAE6" },
  { icon: Hammer, color: "#A3C1E6" },
  { icon: Settings2, color: "#BCD4F0" },
];


const FloatingEmojis = () => {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
      {windowSize.width > 0 &&
        windowSize.height > 0 &&
        icons.map((IconItem, index) => (
          <motion.div
            key={index}
            className="absolute"
            initial={{
              x: Math.random() * windowSize.width,
              y: Math.random() * windowSize.height,
              opacity: 0,
              rotate: 0,
            }}
            animate={{
              y: [null, -300],
              opacity: [0, 0.7, 0],
              rotate: [0, 180],
              scale: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 15,
              ease: "easeInOut",
            }}
          >
            <IconItem.icon
              size={24}
              className="md:w-8 md:h-8 lg:w-10 lg:h-10"
              style={{
                color: IconItem.color,
                filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
              }}
            />
          </motion.div>
        ))}
    </div>
  )
}

export default FloatingEmojis

