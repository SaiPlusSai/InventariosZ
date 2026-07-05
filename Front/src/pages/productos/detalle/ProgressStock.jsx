export default function ProgressStock({

  actual,

  maximo,

}) {

  const porcentaje = Math.min(

    ((actual || 0) * 100) / (maximo || 1),

    100,

  )

  return (

    <div className="space-y-2">

      <div className="flex justify-between text-sm text-slate-500">

        <span>

          0

        </span>

        <span>

          {maximo}

        </span>

      </div>

      <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">

        <div

          className="
            h-full
            bg-blue-600
            rounded-full
            transition-all
            duration-500
          "

          style={{
            width: `${porcentaje}%`,
          }}

        />

      </div>

      <p className="text-xs text-slate-500 text-center">

        {actual} de {maximo}

      </p>

    </div>

  )

}