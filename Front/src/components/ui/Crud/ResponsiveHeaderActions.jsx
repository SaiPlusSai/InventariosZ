import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Menu } from 'lucide-react';
import Button from '../Button';
import PrimaryActions from './PrimaryActions';
import ActionDropdown from './ActionDropdown';

export default function ResponsiveHeaderActions({ primaryActions = [], secondaryActions = [] }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasPrimary = primaryActions && primaryActions.length > 0;
  const hasSecondary = secondaryActions && secondaryActions.length > 0;
  const hasActions = hasPrimary || hasSecondary;

  if (!hasActions) return null;

  return (
    <div className="flex items-center gap-2">
      {/* ========================================= */}
      {/* 1. DESKTOP / TABLET VIEW (Hidden on Mobile) */}
      {/* ========================================= */}
      <div className="hidden md:flex flex-row items-center gap-2 justify-end">
        <PrimaryActions actions={primaryActions.filter(a => a.variant !== 'primary')} />
        <ActionDropdown actions={secondaryActions} />
        <PrimaryActions actions={primaryActions.filter(a => a.variant === 'primary')} />
      </div>

      {/* ========================================= */}
      {/* 2. MOBILE VIEW (Hidden on Desktop/Tablet) */}
      {/* ========================================= */}
      <div className="md:hidden relative flex-shrink-0" ref={mobileMenuRef}>
        <Button 
          variant="secondary" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="inline-flex items-center justify-center whitespace-nowrap bg-white shadow-sm border border-gray-200 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-primary-500/20"
        >
          <Menu size={16} className="mr-2 text-gray-500" />
          Menú
          <ChevronDown size={14} className={`ml-1.5 text-gray-400 transition-transform duration-200 ${isMobileMenuOpen ? 'rotate-180' : ''}`} />
        </Button>

        {/* UNIFIED DROPDOWN FOR MOBILE */}
        <div 
          className={`absolute right-0 mt-2 w-56 origin-top-right rounded-lg bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none transition-all duration-200 ease-out z-[100] overflow-hidden ${
            isMobileMenuOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
          }`}
        >
          <div className="py-2 flex flex-col max-h-[75vh] overflow-y-auto">
            
            {/* Primary Actions (e.g. Nuevo Producto, Ver Papelera) */}
            {hasPrimary && (
              <div className="px-2 pb-2 mb-2 border-b border-gray-100 space-y-1">
                {primaryActions.map((action, idx) => {
                  const Icon = action.icon;
                  // If it's the main primary action (Nuevo Producto), make it stand out slightly
                  const isMainPrimary = action.variant === 'primary';
                  return (
                    <button
                      key={`prim-${idx}`}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        if (action.onClick) action.onClick();
                      }}
                      className={`w-full flex items-center px-3 py-2.5 text-sm rounded-md transition-colors text-left ${
                        isMainPrimary 
                          ? 'bg-primary-50 text-primary-700 hover:bg-primary-100 font-medium'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      {Icon && <Icon className={`mr-3 h-4 w-4 flex-shrink-0 ${isMainPrimary ? 'text-primary-600' : 'text-gray-400'}`} aria-hidden="true" />}
                      <span className="truncate">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
            
            {/* Secondary Actions (e.g. Exportar Excel, PDF, etc.) */}
            {hasSecondary && (
              <div className="px-2 space-y-1">
                <div className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Otras Acciones
                </div>
                {secondaryActions.map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={`sec-${idx}`}
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        if (action.onClick) action.onClick();
                      }}
                      className="w-full flex items-center px-3 py-2.5 text-sm text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors text-left"
                    >
                      {Icon && <Icon className="mr-3 h-4 w-4 text-gray-400 flex-shrink-0" aria-hidden="true" />}
                      <span className="truncate">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
