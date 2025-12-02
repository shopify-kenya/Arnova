import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface InputErrorProps {
  message?: string
  className?: string
}

export default function InputError({ message, className }: InputErrorProps) {
  if (!message) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn("text-sm text-destructive mt-1", className)}
    >
      {message}
    </motion.div>
  )
}