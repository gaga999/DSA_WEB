export type HeapStep = {
  heap: number[];
  highlight: number[] | null; // 高亮的節點索引
  description: string; // 步驟描述
};

export class MinMaxHeap {
  private heap: number[] = [];
  private steps: HeapStep[] = [];

  // 插入新值
  insert(value: number) {
    this.steps = [];
    this.heap.push(value);
    this.steps.push({
      heap: [...this.heap],
      highlight: [this.heap.length - 1],
      description: `Inserted ${value} at the end`,
    });
    this.bubbleUp(this.heap.length - 1);
    return this.steps;
  }

  // 刪除最小值
  deleteMin(): number | null {
    this.steps = [];
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) {
      const min = this.heap.pop()!;
      this.steps.push({
        heap: [...this.heap],
        highlight: null,
        description: `Removed only element ${min}`,
      });
      return min;
    }

    const min = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.steps.push({
      heap: [...this.heap],
      highlight: [0],
      description: `Moved last element ${this.heap[0]} to root`,
    });
    this.bubbleDown(0);
    return min;
  }

  // 獲取堆的陣列表示
  getHeap(): number[] {
    return [...this.heap];
  }

  // 判斷節點是否在 Min 層
  private isMinLevel(index: number): boolean {
    return Math.floor(Math.log2(index + 1)) % 2 === 0;
  }

  // 上浮操作
  private bubbleUp(index: number) {
    if (index === 0) return;

    const level = Math.floor(Math.log2(index + 1));
    if (this.isMinLevel(index)) {
      // Min 層：先與父節點比較（若父節點較大，交換）
      const parentIndex = Math.floor((index - 1) / 2);
      if (parentIndex >= 0 && this.heap[parentIndex] > this.heap[index]) {
        this.steps.push({
          heap: [...this.heap],
          highlight: [index, parentIndex],
          description: `Comparing ${this.heap[index]} (min level) with parent ${this.heap[parentIndex]}`,
        });
        [this.heap[index], this.heap[parentIndex]] = [
          this.heap[parentIndex],
          this.heap[index],
        ];
        this.steps.push({
          heap: [...this.heap],
          highlight: null,
          description: `Swapped ${this.heap[parentIndex]} with ${this.heap[index]}`,
        });
        this.bubbleUp(parentIndex);
        return;
      }
      // 再與祖父節點比較（若有）
      const grandParentIndex = Math.floor((parentIndex - 1) / 2);
      if (grandParentIndex >= 0 && this.heap[grandParentIndex] > this.heap[index]) {
        this.steps.push({
          heap: [...this.heap],
          highlight: [index, grandParentIndex],
          description: `Comparing ${this.heap[index]} (min level) with grandparent ${this.heap[grandParentIndex]}`,
        });
        [this.heap[index], this.heap[grandParentIndex]] = [
          this.heap[grandParentIndex],
          this.heap[index],
        ];
        this.steps.push({
          heap: [...this.heap],
          highlight: null,
          description: `Swapped ${this.heap[grandParentIndex]} with ${this.heap[index]}`,
        });
        this.bubbleUp(grandParentIndex);
      }
    } else {
      // Max 層：與父節點比較（若父節點較小，交換）
      const parentIndex = Math.floor((index - 1) / 2);
      if (parentIndex >= 0 && this.heap[parentIndex] < this.heap[index]) {
        this.steps.push({
          heap: [...this.heap],
          highlight: [index, parentIndex],
          description: `Comparing ${this.heap[index]} (max level) with parent ${this.heap[parentIndex]}`,
        });
        [this.heap[index], this.heap[parentIndex]] = [
          this.heap[parentIndex],
          this.heap[index],
        ];
        this.steps.push({
          heap: [...this.heap],
          highlight: null,
          description: `Swapped ${this.heap[parentIndex]} with ${this.heap[index]}`,
        });
        this.bubbleUp(parentIndex);
      }
    }
  }

  // 下沉操作
  private bubbleDown(index: number) {
    const lastIndex = this.heap.length - 1;

    // Min 層：檢查子節點和孫節點
    if (this.isMinLevel(index)) {
      let smallest = index;
      let smallestValue = this.heap[index];
      const children = [2 * index + 1, 2 * index + 2];
      const grandChildren = [
        2 * children[0] + 1,
        2 * children[0] + 2,
        2 * children[1] + 1,
        2 * children[1] + 2,
      ];

      // 檢查子節點
      for (const child of children) {
        if (child <= lastIndex && this.heap[child] < smallestValue) {
          smallest = child;
          smallestValue = this.heap[child];
        }
      }
      // 檢查孫節點
      for (const grandChild of grandChildren) {
        if (grandChild <= lastIndex && this.heap[grandChild] < smallestValue) {
          smallest = grandChild;
          smallestValue = this.heap[grandChild];
        }
      }

      if (smallest !== index) {
        this.steps.push({
          heap: [...this.heap],
          highlight: [index, smallest],
          description: `Comparing ${this.heap[index]} (min level) with smallest descendant ${this.heap[smallest]}`,
        });
        [this.heap[index], this.heap[smallest]] = [
          this.heap[smallest],
          this.heap[index],
        ];
        this.steps.push({
          heap: [...this.heap],
          highlight: null,
          description: `Swapped ${this.heap[smallest]} with ${this.heap[index]}`,
        });
        // 如果交換的是孫節點，需檢查子節點
        if (grandChildren.includes(smallest)) {
          const parentIndex = Math.floor((smallest - 1) / 2);
          if (this.heap[parentIndex] < this.heap[smallest]) {
            this.steps.push({
              heap: [...this.heap],
              highlight: [smallest, parentIndex],
              description: `Comparing ${this.heap[smallest]} with parent ${this.heap[parentIndex]}`,
            });
            [this.heap[smallest], this.heap[parentIndex]] = [
              this.heap[parentIndex],
              this.heap[smallest],
            ];
            this.steps.push({
              heap: [...this.heap],
              highlight: null,
              description: `Swapped ${this.heap[parentIndex]} with ${this.heap[smallest]}`,
            });
          }
        }
        this.bubbleDown(smallest);
      }
    } else {
      // Max 層：檢查子節點
      let largest = index;
      let largestValue = this.heap[index];
      const children = [2 * index + 1, 2 * index + 2];

      for (const child of children) {
        if (child <= lastIndex && this.heap[child] > largestValue) {
          largest = child;
          largestValue = this.heap[child];
        }
      }

      if (largest !== index) {
        this.steps.push({
          heap: [...this.heap],
          highlight: [index, largest],
          description: `Comparing ${this.heap[index]} (max level) with largest child ${this.heap[largest]}`,
        });
        [this.heap[index], this.heap[largest]] = [
          this.heap[largest],
          this.heap[index],
        ];
        this.steps.push({
          heap: [...this.heap],
          highlight: null,
          description: `Swapped ${this.heap[largest]} with ${this.heap[index]}`,
        });
        this.bubbleDown(largest);
      }
    }
  }
}
