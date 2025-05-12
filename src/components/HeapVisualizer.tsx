'use client';

import React, { useState, useEffect } from 'react';
import { MinMaxHeap, HeapStep } from './MinMaxHeap';

interface HeapVisualizerProps {
  inputValue: string;
  clearInput: () => void;
}

const HeapVisualizer: React.FC<HeapVisualizerProps> = ({ inputValue, clearInput }) => {
  const [heap, setHeap] = useState(new MinMaxHeap());
  const [steps, setSteps] = useState<HeapStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [heapArray, setHeapArray] = useState<number[]>([0]); // 1-based
  const [highlight, setHighlight] = useState<number[] | null>(null);
  const [description, setDescription] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('heapState');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.heap) {
          setHeap(MinMaxHeap.fromJSON(parsed.heap));
        }
        if (parsed.steps) {
          setSteps(parsed.steps);
        }
        if (parsed.currentStep !== undefined) {
          setCurrentStep(parsed.currentStep);
        }
        if (parsed.heapArray) {
          setHeapArray(parsed.heapArray);
        }
        if (parsed.highlight !== undefined) {
          setHighlight(parsed.highlight);
        }
        if (parsed.description !== undefined) {
          setDescription(parsed.description);
        }
        if (parsed.isPlaying !== undefined) {
          setIsPlaying(parsed.isPlaying);
        }
      }
    } catch (e) {
      console.warn('Failed to parse heapState from localStorage:', e);
    }
  }, []);
  useEffect(() => {
    localStorage.setItem(
      'heapState',
      JSON.stringify({ heap: heap.toJSON(), steps, currentStep, heapArray, highlight, description, isPlaying })
    );
  }, [heap, steps, currentStep, heapArray, highlight, description, isPlaying]);

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
      setIsPlaying(true); // 停止自動播放
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
    setIsPlaying(true); // 停止自動播放
  };

  // 處理刪除最大值
  const handleDeleteMax = () => {
    const newSteps = heap.deleteMax();
    setSteps(newSteps);
    setCurrentStep(0);
    setHeapArray(newSteps[0]?.heap || [0]);
    setHighlight(newSteps[0]?.highlight || null);
    setDescription(newSteps[0]?.description || '');
    setIsPlaying(true); // 停止自動播放
  };

  // 下一步
  const handleNextStep = () => {
    if (steps.length > 0 && currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setHeapArray(steps[nextStep].heap);
      setHighlight(steps[nextStep].highlight);
      setDescription(steps[nextStep].description);
    }
  };

  // 前一步
  const handlePrevStep = () => {
    if (steps.length > 0 && currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      setHeapArray(steps[prevStep].heap);
      setHighlight(steps[prevStep].highlight);
      setDescription(steps[prevStep].description);
    }
  };

  // 跳到結果
  const handleSkipToEnd = () => {
    if (steps.length > 0) {
      const lastStep = steps.length - 1;
      setCurrentStep(lastStep);
      setHeapArray(steps[lastStep].heap);
      setHighlight(steps[lastStep].highlight);
      setDescription(steps[lastStep].description);
      setIsPlaying(false); // 停止自動播放
    }
  };

  // 返回倒數第二步
  const handleGoBack = () => {
    if (steps.length > 1) {
      const secondLastStep = 0;
      setCurrentStep(secondLastStep);
      setHeapArray(steps[secondLastStep].heap);
      setHighlight(steps[secondLastStep].highlight);
      setDescription(steps[secondLastStep].description);
      setIsPlaying(true); // 停止自動播放
    }
  };

  const handleReset = () => {
    heap.clear();
    setSteps([]);
    setCurrentStep(0);
    setHeapArray([0]);
    setHighlight(null);
    setDescription('');
    setIsPlaying(false);
  };

  // 自動播放 useEffect
  useEffect(() => {
    if (!isPlaying) return;
    if (steps.length === 0 || currentStep >= steps.length - 1) {
      setIsPlaying(false);
      return;
    }
    const timer = setTimeout(() => {
      handleNextStep();
    }, 1000); // 每秒一步
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, steps]);

  // 繪製堆的 SVG
  const renderHeap = () => {
    if (heapArray.length <= 1) {
      return (
        <div style={{ overflowX: 'auto', width: '85vw', maxWidth: '100vw', height: '55vh', maxHeight: '100vh' }}>
          <p className="text-gray-500 text-center text-lg">Heap is empty</p>;
        </div>
      );
    }
    const nodes: React.ReactNode[] = [];
    const lines: React.ReactNode[] = [];
    const nodeRadius = 30;
    const levelHeight = nodeRadius * 3.5;

    // 計算目前堆的最大層級
    const maxLevel = Math.floor(Math.log2(heapArray.length - 1));
    // 最後一層的節點數
    const lastLevelNodes = heapArray.length - Math.pow(2, maxLevel);
    // 最寬層的節點數
    const maxNodesInLevel = Math.max(Math.pow(2, maxLevel), lastLevelNodes);

    // 動態設定 canvasWidth
    const nodeSpacing = nodeRadius * 3; // 節點間距
    const canvasWidth = maxNodesInLevel * nodeSpacing + 60;
    const height = (Math.floor(Math.log2(heapArray.length)) + 1) * levelHeight;
    // const minWidth = 600;

    // 計算節點位置（1-based）
    const getNodePosition = (index: number) => {
      const level = Math.floor(Math.log2(index));
      const nodesInLevel = Math.pow(2, level);
      const nodeIndexInLevel = index - Math.pow(2, level);
      const x = (canvasWidth / (nodesInLevel + 1)) * (nodeIndexInLevel + 1);
      const y = level * levelHeight + 50;
      return { x, y };
    };

    // 判斷節點是否在 Min 層（偶數層）
    const isMinLevel = (index: number) => Math.floor(Math.log2(index)) % 2 === 0;

    // 繪製節點和連線
    for (let index = 1; index < heapArray.length; index++) {
      const { x, y } = getNodePosition(index);
      const isHighlighted = highlight && highlight.includes(index);
      const fillColor = isHighlighted
        ? '#84CC16' // 橙色（高亮）
        : isMinLevel(index)
          ? '#3B82F6' // 藍色（Min 層）
          : '#F25555'; // 綠色（Max 層）

      nodes.push(
        <g key={index}>
          <circle cx={x} cy={y} r={nodeRadius} fill={fillColor} stroke="#1F2937" strokeWidth="2" />
          <text x={x} y={y + 5} textAnchor="middle" fill="white" fontSize="20">
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
      // <div style={{ overflowX: 'auto', width: '85vw', maxWidth: '100vw', height: '55vh', maxHeight: '100vh' }}>
      //   <svg
      //     width={canvasWidth}
      //     height={(height}
      //     style={{ display: 'block', margin: '0 auto' }}
      //   >
      //     {lines}
      //     {nodes}
      //   </svg>
      // </div>
      <div style={{ overflowX: 'auto', width: '85vw', maxWidth: '100vw', height: '50vh', maxHeight: '100vh' }}>
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${canvasWidth} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          style={{
            display: 'block', margin: '0 auto',
            minWidth: `${canvasWidth / 1.5}px`, maxWidth: `${canvasWidth * 1.5}px`,
            minHeight: `${height / 1.5}px`, maxHeight: `${height * 1.5}px`
          }}
        >
          {lines}
          {nodes}
        </svg>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex space-x-2">
        {steps.length > 0 && currentStep < steps.length - 1 ? (
          <>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`px-4 py-2 rounded text-white ${isPlaying ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button
              onClick={handlePrevStep}
              disabled={currentStep <= 0}
              className={`px-4 py-2 rounded text-white bg-purple-600 hover:bg-purple-700 ${currentStep <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Previous
            </button>
            <button
              onClick={handleNextStep}
              disabled={currentStep >= steps.length - 1}
              className={`px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700 ${currentStep >= steps.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Next
            </button>
            <button
              onClick={handleSkipToEnd}
              className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700"
            >
              Skip to Result
            </button>
          </>
        ) : (
          <>
            <button
              onClick={handleInsert}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Insert
            </button>
            <button
              onClick={handleDeleteMin}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Delete Min
            </button>
            <button
              onClick={handleDeleteMax}
              className="bg-rose-600 text-white px-4 py-2 rounded hover:bg-rose-700"
            >
              Delete Max
            </button>
            <button
              onClick={handleGoBack}
              disabled={steps.length <= 1}
              className={`px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700 ${steps.length <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Go Back
            </button>
            <button
              onClick={handleReset}
              className="bg-slate-600 text-white px-4 py-2 rounded hover:bg-slate-700"
            >
              Reset
            </button>
          </>
        )}
      </div>
      <div className="border p-4 bg-white rounded shadow">{renderHeap()}</div>
      <p className="mt-4 text-3xl text-gray-700">{description}</p>
    </div>
  );
};

export default HeapVisualizer;