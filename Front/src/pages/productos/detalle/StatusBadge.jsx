export default function StatusBadge({
  activo,
}) {

  return (

    <span
      className={`
        inline-flex
        items-center
        gap-2
        rounded-full
        px-3
        py-1
        text-xs
        font-bold
        uppercase

        ${
          activo
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
        }
      `}
    >

      <span
        className={`
          w-2
          h-2
          rounded-full

          ${
            activo
              ? 'bg-green-600'
              : 'bg-red-600'
          }
        `}
      />

      {activo ? 'Activo' : 'Inactivo'}

    </span>

  )

}