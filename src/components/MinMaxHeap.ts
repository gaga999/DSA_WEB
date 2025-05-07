export type HeapStep = {
  heap: number[];
  highlight: number[] | null; // 高亮的節點索引
  description: string; // 步驟描述
};

export class MinMaxHeap {
  private heap: number[] = [0]; // 1-based 索引，0 留空
  private steps: HeapStep[] = [];

  // 插入新值
  insert(value: number) {
    this.steps = [];
    this.heap.push(value);
    const newIndex = this.heap.length - 1;
    this.steps.push({
      heap: [...this.heap],
      highlight: [newIndex],
      description: `Inserted ${value} at index ${newIndex}`,
    });
    this.bubbleUp(newIndex);
    return this.steps;
  }

  // 刪除最小值
  deleteMin(): HeapStep[] {
    this.steps = [];
    if (this.heap.length <= 1) {
      this.steps.push({
        heap: [0],
        highlight: null,
        description: `Heap is empty, nothing to delete`,
      });
      return this.steps;
    }
    if (this.heap.length === 2) {
      const min = this.heap.pop()!;
      this.steps.push({
        heap: [...this.heap],
        highlight: null,
        description: `Removed only element ${min}`,
      });
      return this.steps;
    }

    const min = this.heap[1];
    const lastIndex = this.heap.length - 1;
    this.heap[1] = this.heap[lastIndex];
    this.heap.pop();
    this.steps.push({
      heap: [...this.heap],
      highlight: [1, lastIndex],
      description: `Moved last element ${this.heap[1]} from index ${lastIndex} to root (index 1)`,
    });
    this.bubbleDown(1);
    return this.steps;
  }

  // 刪除最大值
  deleteMax(): HeapStep[] {
    this.steps = [];
    if (this.heap.length <= 1) {
      this.steps.push({
        heap: [0],
        highlight: null,
        description: `Heap is empty, nothing to delete`,
      });
      return this.steps;
    }
    if (this.heap.length <= 3) {
      const max = this.heap.pop()!;
      this.steps.push({
        heap: [...this.heap],
        highlight: null,
        description: `Removed element ${max} at index ${this.heap.length}`,
      });
      return this.steps;
    }

    // 找到 max 層的第一個節點（索引 2 或 3）
    let maxIndex = 2;
    let maxValue = this.heap[2];
    if (this.heap[3] && this.heap[3] > maxValue) {
      maxIndex = 3;
      maxValue = this.heap[3];
    }

    const lastIndex = this.heap.length - 1;
    this.steps.push({
      heap: [...this.heap],
      highlight: [maxIndex],
      description: `Selected max element ${maxValue} at index ${maxIndex}`,
    });
    this.heap[maxIndex] = this.heap[lastIndex];
    this.heap.pop();
    this.steps.push({
      heap: [...this.heap],
      highlight: [maxIndex, lastIndex],
      description: `Moved last element ${this.heap[maxIndex]} from index ${lastIndex} to index ${maxIndex}`,
    });
    this.bubbleDown(maxIndex);
    return this.steps;
  }

  // 獲取堆的陣列表示
  getHeap(): number[] {
    return [...this.heap];
  }

  // 判斷節點是否在 Min 層（奇數層）
  private isMinLevel(index: number): boolean {
    return Math.floor(Math.log2(index)) % 2 === 0;
  }

  // 上浮操作
  private bubbleUp(index: number) {
    if (index <= 1) return;

    const parentIndex = Math.floor(index / 2);
    let swapped = false;

    // 第一步：與父節點比較
    if (this.isMinLevel(parentIndex)) {
      // 父節點在 min 層，插入節點較小則交換
      if (this.heap[index] < this.heap[parentIndex]) {
        this.steps.push({
          heap: [...this.heap],
          highlight: [index, parentIndex],
          description: `Comparing ${this.heap[index]} (index ${index}) with parent ${this.heap[parentIndex]} (min level, index ${parentIndex})`,
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
        swapped = true;
      } else {
        this.steps.push({
          heap: [...this.heap],
          highlight: [index, parentIndex],
          description: `Comparing ${this.heap[index]} (index ${index}) with parent ${this.heap[parentIndex]} (min level, index ${parentIndex})`,
        });
        this.steps.push({
          heap: [...this.heap],
          highlight: null,
          description: `No swap needed`,
        });
      }
    } else {
      // 父節點在 max 層，插入節點較大則交換
      if (this.heap[index] > this.heap[parentIndex]) {
        this.steps.push({
          heap: [...this.heap],
          highlight: [index, parentIndex],
          description: `Comparing ${this.heap[index]} (index ${index}) with parent ${this.heap[parentIndex]} (max level, index ${parentIndex})`,
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
        swapped = true;
      } else {
        this.steps.push({
          heap: [...this.heap],
          highlight: [index, parentIndex],
          description: `Comparing ${this.heap[index]} (index ${index}) with parent ${this.heap[parentIndex]} (max level, index ${parentIndex})`,
        });
        this.steps.push({
          heap: [...this.heap],
          highlight: null,
          description: `No swap needed`,
        });
      }
    }

    // 第二步：與祖父節點比較（兩層往上）
    const grandParentIndex = Math.floor(parentIndex / 2);
    if (grandParentIndex >= 1) {
      if (this.isMinLevel(index)) {
        // 當前節點在 min 層，比祖父節點（min 層）小則交換
        if (this.heap[index] < this.heap[grandParentIndex]) {
          this.steps.push({
            heap: [...this.heap],
            highlight: [index, grandParentIndex],
            description: `Comparing ${this.heap[index]} (min level, index ${index}) with grandparent ${this.heap[grandParentIndex]} (min level, index ${grandParentIndex})`,
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
        } else {
          this.steps.push({
            heap: [...this.heap],
            highlight: [index, grandParentIndex],
            description: `Comparing ${this.heap[index]} (min level, index ${index}) with grandparent ${this.heap[grandParentIndex]} (min level, index ${grandParentIndex})`,
          });
          this.steps.push({
            heap: [...this.heap],
            highlight: null,
            description: `No swap needed`,
          });
        }
      } else {
        // 當前節點在 max 層，比祖父節點（max 層）大則交換
        if (this.heap[index] > this.heap[grandParentIndex]) {
          this.steps.push({
            heap: [...this.heap],
            highlight: [index, grandParentIndex],
            description: `Comparing ${this.heap[index]} (max level, index ${index}) with grandparent ${this.heap[grandParentIndex]} (max level, index ${grandParentIndex})`,
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
        } else {
          this.steps.push({
            heap: [...this.heap],
            highlight: [index, grandParentIndex],
            description: `Comparing ${this.heap[index]} (max level, index ${index}) with grandparent ${this.heap[grandParentIndex]} (max level, index ${grandParentIndex})`,
          });
          this.steps.push({
            heap: [...this.heap],
            highlight: null,
            description: `No swap needed`,
          });
        }
      }
    }

    // 若與父節點交換，繼續檢查新位置
    if (swapped) {
      this.bubbleUp(parentIndex);
    }
  }

  // 下沉操作
  private bubbleDown(index: number) {
    const lastIndex = this.heap.length - 1;

    if (this.isMinLevel(index)) {
      // Min 層：檢查子節點（max 層）和孫節點（min 層）
      let smallest = index;
      let smallestValue = this.heap[index];
      const children = [2 * index, 2 * index + 1];
      const grandChildren = [
        2 * children[0],
        2 * children[0] + 1,
        2 * children[1],
        2 * children[1] + 1,
      ].filter((i) => i <= lastIndex);

      // 檢查子節點
      for (const child of children) {
        if (child <= lastIndex) {
          this.steps.push({
            heap: [...this.heap],
            highlight: [index, child],
            description: `Comparing ${this.heap[index]} (min level, index ${index}) with child ${this.heap[child]} (max level, index ${child})`,
          });
          if (this.heap[child] < smallestValue) {
            smallest = child;
            smallestValue = this.heap[child];
          }
          this.steps.push({
            heap: [...this.heap],
            highlight: null,
            description: `Child ${this.heap[child]} ${this.heap[child] < smallestValue ? 'is smaller' : 'is not smaller'}`,
          });
        }
      }
      // 檢查孫節點
      for (const grandChild of grandChildren) {
        if (grandChild <= lastIndex) {
          this.steps.push({
            heap: [...this.heap],
            highlight: [index, grandChild],
            description: `Comparing ${this.heap[index]} (min level, index ${index}) with grandchild ${this.heap[grandChild]} (min level, index ${grandChild})`,
          });
          if (this.heap[grandChild] < smallestValue) {
            smallest = grandChild;
            smallestValue = this.heap[grandChild];
          }
          this.steps.push({
            heap: [...this.heap],
            highlight: null,
            description: `Grandchild ${this.heap[grandChild]} ${this.heap[grandChild] < smallestValue ? 'is smaller' : 'is not smaller'}`,
          });
        }
      }

      if (smallest !== index) {
        this.steps.push({
          heap: [...this.heap],
          highlight: [index, smallest],
          description: `Swapping ${this.heap[index]} (index ${index}) with smallest descendant ${this.heap[smallest]} (index ${smallest})`,
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
        // 如果交換的是孫節點，檢查其父節點（max 層）
        if (grandChildren.includes(smallest)) {
          const parentIndex = Math.floor(smallest / 2);
          if (this.heap[parentIndex] < this.heap[smallest]) {
            this.steps.push({
              heap: [...this.heap],
              highlight: [smallest, parentIndex],
              description: `Comparing ${this.heap[smallest]} (min level, index ${smallest}) with parent ${this.heap[parentIndex]} (max level, index ${parentIndex})`,
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
          } else {
            this.steps.push({
              heap: [...this.heap],
              highlight: [smallest, parentIndex],
              description: `Comparing ${this.heap[smallest]} (min level, index ${smallest}) with parent ${this.heap[parentIndex]} (max level, index ${parentIndex})`,
            });
            this.steps.push({
              heap: [...this.heap],
              highlight: null,
              description: `No swap needed`,
            });
          }
        }
        this.bubbleDown(smallest);
      }
    } else {
      // Max 層：檢查子節點（min 層）
      let largest = index;
      let largestValue = this.heap[index];
      const children = [2 * index, 2 * index + 1];

      for (const child of children) {
        if (child <= lastIndex) {
          this.steps.push({
            heap: [...this.heap],
            highlight: [index, child],
            description: `Comparing ${this.heap[index]} (max level, index ${index}) with child ${this.heap[child]} (min level, index ${child})`,
          });
          if (this.heap[child] > largestValue) {
            largest = child;
            largestValue = this.heap[child];
          }
          this.steps.push({
            heap: [...this.heap],
            highlight: null,
            description: `Child ${this.heap[child]} ${this.heap[child] > largestValue ? 'is larger' : 'is not larger'}`,
          });
        }
      }

      if (largest !== index) {
        this.steps.push({
          heap: [...this.heap],
          highlight: [index, largest],
          description: `Swapping ${this.heap[index]} (index ${index}) with largest child ${this.heap[largest]} (index ${largest})`,
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