export default function TabsDetalle({

  tab,

  setTab,

}) {

  const tabs = [

    {
      id: 'general',
      label: 'Información General',
    },

    {
      id: 'inventario',
      label: 'Inventario',
    },

    {
      id: 'precios',
      label: 'Precios',
    },

  ]

  return (

    <div className="border-b bg-white">

      <div className="flex px-8">

        {tabs.map((item) => (

          <button

            key={item.id}

            onClick={() => setTab(item.id)}

            className={`
              py-5
              px-4
              mr-6
              border-b-2
              transition-all
              font-medium

              ${
                tab === item.id

                  ? 'border-blue-600 text-blue-600'

                  : 'border-transparent text-gray-500 hover:text-black'
              }

            `}
          >

            {item.label}

          </button>

        ))}

      </div>

    </div>

  )

}