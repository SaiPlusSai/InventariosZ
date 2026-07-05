import { motion } from 'framer-motion'

export default function MetricCard({
  icon,
  title,
  value,
  color = 'blue',
}) {

  const colors = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    red: 'text-red-600 bg-red-50',
    orange: 'text-orange-600 bg-orange-50',
    purple: 'text-purple-600 bg-purple-50',
  }

  return (

    <motion.div

      whileHover={{
        y: -4,
      }}

      className="
        bg-white
        border
        rounded-2xl
        shadow-sm
        hover:shadow-lg
        transition-all
        p-6
      "

    >

      <div className="flex justify-between items-start">

        <div>

          <p className="text-sm uppercase text-slate-500 font-semibold">

            {title}

          </p>

          <h2 className="mt-5 text-5xl font-bold text-slate-900">

            {value}

          </h2>

        </div>

        <div
          className={`
            p-3
            rounded-xl
            ${colors[color]}
          `}
        >
          {icon}
        </div>

      </div>

    </motion.div>

  )

}