'use client';

import { useState } from 'react';
import { MinMaxHeap, HeapStep } from './MinMaxHeap';

interface HeapVisualizerProps {
  inputValue: string;
  clearInput: () => void;
}

const HeapVisualizer: React.FC<HeapVisualizerProps> = ({ inputValue, clearInput }) => {
  const [heap] = useState(new MinMaxHeap());
  const [steps, setSteps] = useState<HeapStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [heapArray, setHeapArray] = useState<number[]>([0]); // 1-based
  const [highlight, setHighlight] = useState<number[] | null>(null);
  const [description, setDescription] = useState('');

  // 處理插入
  const handleInsert = () => {
    const value = parseInt(inputValue);
    if (!isNaN(value)) {
      const newSteps = heap.insert(value);
      setSteps(newSteps);
      setCurrentStep(0);
      setHeapArray(newSteps[0]?.heap || [0]);
      setHighlight(newSteps[0]?.highlight || null);
      setDescription(newSteps[0]?.description || '');
      clearInput();
    }
  };

  // 處理刪除最小值
  const handleDeleteMin = () => {
    const newSteps = heap.deleteMin();
    setSteps(newSteps);
    setCurrentStep(0);
    setHeapArray(newSteps[0]?.heap || [0]);
    setHighlight(newSteps[0]?.highlight || null);
    setDescription(newSteps[0]?.description || '');
  };

  // 處理刪除最大值
  const handleDeleteMax = () => {
    const newSteps = heap.deleteMax();
    setSteps(newSteps);
    setCurrentStep(0);
    setHeapArray(newSteps[0]?.heap || [0]);
    setHighlight(newSteps[0]?.highlight || null);
    setDescription(newSteps[0]?.description || '');
  };

  // 下一步
  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setHeapArray(steps[nextStep].heap);
      setHighlight(steps[nextStep].highlight);
      setDescription(steps[nextStep].description);
    }
  };

  // 繪製堆的 SVG
  const renderHeap = () => {
    if (heapArray.length <= 1) return <p className="text-gray-500">Heap is empty</p>;

    const nodes: JSX.Element[] = [];
    const lines: JSX.Element[] = [];
    const nodeRadius = 20;
    const levelHeight = 100;
    const canvasWidth = 800;

    // 計算節點位置（1-based）
    const getNodePosition = (index: number) => {
      const level = Math.floor(Math.log2(index));
      const nodesInLevel = Math.pow(2, level);
      const nodeIndexInLevel = index - Math.pow(2, level);
      const x = (canvasWidth / (nodesInLevel + 1)) * (nodeIndexInLevel + 1);
      const y = level * levelHeight + 50;
      return { x, y };
    };

    // 判斷節點是否在 Min 層（奇數層）
    const isMinLevel = (index: number) => Math.floor(Math.log2(index)) % 2 === 0;

    // 繪製節點和連線
    for (let index = 1; index < heapArray.length; index++) {
      const { x, y } = getNodePosition(index);
      const isHighlighted = highlight && highlight.includes(index);
      const fillColor = isHighlighted
        ? '#F59E0B' // 橙色（高亮）
        : isMinLevel(index)
          ? '#60A5FA' // 藍色（Min 層）
          : '#34D399'; // 綠色（Max 層）

      nodes.push(
        <g key={index}>
          <circle cx={x} cy={y} r={nodeRadius} fill={fillColor} stroke="#1F2937" strokeWidth="2" />
          <text x={x} y={y + 5} textAnchor="middle" fill="white" fontSize="14">
            {heapArray[index]}
          </text>
        </g>
      );

      // 繪製父子連線
      const leftChildIndex = 2 * index;
      const rightChildIndex = 2 * index + 1;
      if (leftChildIndex < heapArray.length) {
        const childPos = getNodePosition(leftChildIndex);
        lines.push(
          <line
            key={`line-${index}-left`}
            x1={x}
            y1={y + nodeRadius}
            x2={childPos.x}
            y2={childPos.y - nodeRadius}
            stroke="#1F2937"
            strokeWidth="2"
          />
        );
      }
      if (rightChildIndex < heapArray.length) {
        const childPos = getNodePosition(rightChildIndex);
        lines.push(
          <line
            key={`line-${index}-right`}
            x1={x}
            y1={y + nodeRadius}
            x2={childPos.x}
            y2={childPos.y - nodeRadius}
            stroke="#1F2937"
            strokeWidth="2"
          />
        );
      }
    }

    return (
      <svg width={canvasWidth} height={(Math.floor(Math.log2(heapArray.length)) + 1) * levelHeight}>
        {lines}
        {nodes}
      </svg>
    );
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex space-x-2">
        <button
          onClick={handleInsert}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Insert
        </button>
        <button
          onClick={handleDeleteMin}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Delete Min
        </button>
        <button
          onClick={handleDeleteMax}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
          Delete Max
        </button>
        {steps.length > 0 && currentStep < steps.length - 1 && (
          <button
            onClick={handleNextStep}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Next Step
          </button>
        )}
      </div>
      <div className="border p-4 bg-white rounded shadow">{renderHeap()}</div>
      <p className="mt-4 text-gray-700">{description}</p>
    </div>
  );
};

export default HeapVisualizer;