import { motion } from 'framer-motion'

export default function InfoCard({
  icon,
  title,
  children,
}) {
  return (
    <motion.div
      whileHover={{
        y: -3,
        transition: {
          duration: 0.15,
        },
      }}
      className="
        rounded-xl
        border
        border-slate-200
        bg-white
        p-5
        shadow-sm
        hover:shadow-md
        transition-all
      "
    >
      <div className="flex items-center gap-2 mb-3">

        <div className="text-slate-500">
          {icon}
        </div>

        <span className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
          {title}
        </span>

      </div>

      <div className="text-lg font-medium text-slate-900 break-words">
        {children}
      </div>

    </motion.div>
  )
}