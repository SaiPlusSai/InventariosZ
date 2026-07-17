import React from 'react';

/**
 * PageHeader is a reusable wrapper component for page headers (like CrudToolbar or CrudHeader).
 * It encapsulates the sticky positioning, responsive padding, and z-index logic
 * to ensure consistent behavior across all pages and proper stacking context with the Sidebar.
 *
 * @param {boolean} isSticky - If true, the header will stick to the top.
 * @param {string} stickyOffset - The top offset class (e.g. 'top-0', 'top-16').
 * @param {string} className - Additional custom classes.
 */
export default function PageHeader({ 
  children, 
  isSticky = true, 
  stickyOffset = 'top-0',
  className = '' 
}) {
  const baseClasses = "w-full flex flex-col transition-all duration-200";
  
  // These paddings and negative margins break out of the DashboardLayout container 
  // to provide a full-width background for the sticky header while aligning content.
  const stickyClasses = isSticky 
    ? `sticky ${stickyOffset} z-30 bg-gray-50 pt-4 pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 md:pt-6 md:-mx-8 md:px-8 mb-6` 
    : "mb-6";

  return (
    <div className={`${baseClasses} ${stickyClasses} ${className}`.trim()}>
      {children}
    </div>
  );
}
