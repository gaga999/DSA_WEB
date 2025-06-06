'use client';

import { useState } from 'react';
import HeapVisualizer from '@/components/HeapVisualizer';

export default function Home() {
  const [value, setValue] = useState('');

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-gray-900">Min-Max Heap Visualization</h1>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">(1-based, Even Layers Min, Odd Layers Max)</h2>
      <div className="mb-4">
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Enter a number"
          className="border-2 border-gray-300 bg-white text-gray-900 p-2 rounded mr-2 focus:ring-blue-500"
        />
      </div>
      <HeapVisualizer inputValue={value} clearInput={() => setValue('')} />
    </div>
  );
}