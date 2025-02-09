import { motion } from "framer-motion"

export const FunLoader = () => {
  const emojis = ["📦"]

  return (
    <div className="flex justify-center items-center h-40">
      <div className="flex space-x-4">
        {emojis.map((emoji, index) => (
          <motion.div
            key={index}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 360, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              delay: index * 0.2,
            }}
            className="text-4xl"
          >
            {emoji}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

