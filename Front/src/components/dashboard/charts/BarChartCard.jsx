import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const BarChartCard = ({ title, subtitle, data, dataKey = "value", nameKey = "name", color = "#4F46E5" }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm h-72 flex flex-col items-center justify-center">
        <h3 className="font-semibold text-gray-800 mb-1">{title}</h3>
        <p className="text-sm text-gray-500 mb-4">{subtitle}</p>
        <p className="text-gray-400">No hay datos suficientes</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm h-72 flex flex-col">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis dataKey={nameKey} axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12}} />
            <Tooltip 
              cursor={{fill: '#F3F4F6'}} 
              contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
            />
            <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BarChartCard;
