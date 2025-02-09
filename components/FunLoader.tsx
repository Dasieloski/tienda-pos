import { motion } from "framer-motion"

export const FunLoader = ({ size = "default" }: { size?: "small" | "default" | "large" }) => {
  const circles = [0, 1, 2]

  const circleVariants = {
    start: (i: number) => ({
      y: 0,
      transition: {
        delay: i * 0.2,
      },
    }),
    end: (i: number) => ({
      y: -10,
      transition: {
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse" as const,
        duration: 0.5,
        ease: "easeInOut",
        delay: i * 0.2,
      },
    }),
  }

  const containerClass = {
    small: "h-4",
    default: "h-8",
    large: "h-16",
  }

  const circleClass = {
    small: "w-1 h-1",
    default: "w-2 h-2",
    large: "w-4 h-4",
  }

  return (
    <div className={`flex justify-center items-center ${containerClass[size]}`}>
      <div className="flex space-x-2">
        {circles.map((index) => (
          <motion.span
            key={index}
            className={`bg-primary rounded-full ${circleClass[size]}`}
            variants={circleVariants}
            initial="start"
            animate="end"
            custom={index}
          />
        ))}
      </div>
    </div>
  )
}

