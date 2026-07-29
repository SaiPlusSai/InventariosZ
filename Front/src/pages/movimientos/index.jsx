import { useState } from 'react'
import PageHeader from '../../components/ui/PageHeader'
import CrudHeader from '../../components/ui/CrudHeader'
import SearchInput from '../../components/ui/Crud/SearchInput'
import FilterButton from '../../components/ui/Crud/FilterButton'
import ResponsiveHeaderActions from '../../components/ui/Crud/ResponsiveHeaderActions'
import { EmptyState } from '../../components/ui/EmptyState'
import { ArrowRightLeft, Download, Upload, RefreshCw } from 'lucide-react'
import MovimientoTable from './components/MovimientoTable'
import MovimientoCard from './components/MovimientoCard'
import useMovimientoStore from '../../store/movimientoStore'

export default function MovimientosPage() {
  const { movimientos, loading } = useMovimientoStore()
  const [showFilters, setShowFilters] = useState(false)

  // Handlers base sin implementación profunda para el Sprint 1
  const handleSearch = (term) => {
    // console.log('Buscar:', term)
  }

  const handleRefresh = () => {
    // console.log('Actualizar')
  }

  const handleExport = () => {
    // console.log('Exportar')
  }

  const handleImport = () => {
    // console.log('Importar')
  }

  const getPrimaryActions = () => [
    {
      label: 'Actualizar',
      icon: <RefreshCw size={20} />,
      onClick: handleRefresh,
      variant: 'secondary'
    },
    {
      label: 'Importar',
      icon: <Upload size={20} />,
      onClick: handleImport,
      variant: 'secondary'
    },
    {
      label: 'Exportar',
      icon: <Download size={20} />,
      onClick: handleExport,
      variant: 'primary'
    }
  ]

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50 relative">
      <PageHeader 
        title="Movimientos de Inventario" 
        subtitle="Historial completo de entradas, salidas y ajustes."
      />
      
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative z-10">
        <CrudHeader>
          <div className="flex items-center gap-3">
            <SearchInput 
              placeholder="Buscar por código, documento..." 
              onSearch={handleSearch}
            />
            <FilterButton 
              onToggle={() => setShowFilters(!showFilters)} 
              showFilters={showFilters}
            />
          </div>
          
          <ResponsiveHeaderActions actions={getPrimaryActions()} />
        </CrudHeader>

        {/* Filters Panel will go here in future Sprints */}

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {movimientos.length === 0 && !loading ? (
              <EmptyState
                icon={ArrowRightLeft}
                title="No existen movimientos registrados."
                description="Cuando se realice el primer movimiento aparecerá aquí."
              />
            ) : (
              <>
                {/* Desktop View */}
                <div className="hidden lg:block">
                  <MovimientoTable />
                </div>

                {/* Mobile/Tablet View */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
                  <MovimientoCard />
                  <MovimientoCard />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
