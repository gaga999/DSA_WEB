export type HeapStep = {
  heap: number[];
  highlight: number[] | null; // 高亮的節點索引
  description: string; // 步驟描述
};

export class MinMaxHeap {
  private heap: number[] = []; // 0-based 索引
  private steps: HeapStep[] = [];

  // 獲取節點所在層級
  private getLevel(index: number): number {
    return Math.floor(Math.log2(index + 1));
  }

  // 判斷是否為 min 層（偶數層）
  private isMinLevel(index: number): boolean {
    return this.getLevel(index) % 2 === 0;
  }

  // 父節點索引
  private parent(index: number): number {
    return Math.floor((index - 1) / 2);
  }

  // 子節點索引
  private leftChild(index: number): number {
    return 2 * index + 1;
  }

  private rightChild(index: number): number {
    return 2 * index + 2;
  }

  // 祖父節點索引
  private grandparent(index: number): number {
    return this.parent(this.parent(index));
  }

  // 插入新值
  insert(value: number) {
    this.steps = [];
    this.heap.push(value);
    const newIndex = this.heap.length - 1;
    this.steps.push({
      heap: [...this.heap],
      highlight: [newIndex],
      description: `Inserted ${value} at index ${newIndex + 1}`,
    });
    this.pushUp(newIndex);
    return this.steps;
  }

  // 刪除最小值
  deleteMin(): HeapStep[] {
    this.steps = [];
    if (this.heap.length === 0) {
      this.steps.push({
        heap: [],
        highlight: null,
        description: `Heap is empty, nothing to delete`,
      });
      return this.steps;
    }
    if (this.heap.length === 1) {
      const min = this.heap.pop()!;
      this.steps.push({
        heap: [...this.heap],
        highlight: null,
        description: `Removed only element ${min}`,
      });
      return this.steps;
    }

    const min = this.heap[0];
    const lastIndex = this.heap.length - 1;
    this.heap[0] = this.heap[lastIndex];
    this.heap.pop();
    this.steps.push({
      heap: [...this.heap],
      highlight: [0, lastIndex],
      description: `Moved last element ${this.heap[0]} from index ${lastIndex + 1} to root (index 1)`,
    });
    this.pushDown(0);
    return this.steps;
  }

  // 刪除最大值
  deleteMax(): HeapStep[] {
    this.steps = [];
    if (this.heap.length === 0) {
      this.steps.push({
        heap: [],
        highlight: null,
        description: `Heap is empty, nothing to delete`,
      });
      return this.steps;
    }
    if (this.heap.length === 1) {
      const max = this.heap.pop()!;
      this.steps.push({
        heap: [...this.heap],
        highlight: null,
        description: `Removed only element ${max}`,
      });
      return this.steps;
    }
    if (this.heap.length === 2) {
      const max = this.heap.pop()!;
      this.steps.push({
        heap: [...this.heap],
        highlight: null,
        description: `Removed element ${max} at index 2`,
      });
      return this.steps;
    }

    // 找到 max 層（第一層，索引 1 或 2）的最大值
    const maxIndex = this.heap[1] > (this.heap[2] || -Infinity) ? 1 : 2;
    const max = this.heap[maxIndex];
    const lastIndex = this.heap.length - 1;
    this.steps.push({
      heap: [...this.heap],
      highlight: [maxIndex],
      description: `Selected max element ${max} at index ${maxIndex + 1}`,
    });
    this.heap[maxIndex] = this.heap[lastIndex];
    this.heap.pop();
    this.steps.push({
      heap: [...this.heap],
      highlight: [maxIndex, lastIndex],
      description: `Moved last element ${this.heap[maxIndex]} from index ${lastIndex + 1} to index ${maxIndex + 1}`,
    });
    this.pushDown(maxIndex);
    return this.steps;
  }

  // 獲取堆的陣列表示
  getHeap(): number[] {
    return [...this.heap];
  }

  // 獲取最小後代（子節點或孫節點）
  private getSmallestDescendant(index: number): number {
    let smallest = index;
    let smallestValue = this.heap[index];

    const left = this.leftChild(index);
    const right = this.rightChild(index);
    if (left < this.heap.length && this.heap[left] < smallestValue) {
      smallest = left;
      smallestValue = this.heap[left];
    }
    if (right < this.heap.length && this.heap[right] < smallestValue) {
      smallest = right;
      smallestValue = this.heap[right];
    }

    const grandchildren = [
      this.leftChild(left),
      this.rightChild(left),
      this.leftChild(right),
      this.rightChild(right),
    ].filter((i) => i < this.heap.length);
    for (const gc of grandchildren) {
      if (this.heap[gc] < smallestValue) {
        smallest = gc;
        smallestValue = this.heap[gc];
      }
    }

    return smallest;
  }

  // 獲取最大後代（子節點或孫節點）
  private getLargestDescendant(index: number): number {
    let largest = index;
    let largestValue = this.heap[index];

    const left = this.leftChild(index);
    const right = this.rightChild(index);
    if (left < this.heap.length && this.heap[left] > largestValue) {
      largest = left;
      largestValue = this.heap[left];
    }
    if (right < this.heap.length && this.heap[right] > largestValue) {
      largest = right;
      largestValue = this.heap[right];
    }

    const grandchildren = [
      this.leftChild(left),
      this.rightChild(left),
      this.leftChild(right),
      this.rightChild(right),
    ].filter((i) => i < this.heap.length);
    for (const gc of grandchildren) {
      if (this.heap[gc] > largestValue) {
        largest = gc;
        largestValue = this.heap[gc];
      }
    }

    return largest;
  }

  // Push-down 操作（維基百科 trickle-down）
  private pushDown(index: number) {
    if (this.isMinLevel(index)) {
      // Min 層
      const m = this.getSmallestDescendant(index);
      if (m === index) return;

      this.steps.push({
        heap: [...this.heap],
        highlight: [index, m],
        description: `Comparing ${this.heap[index]} (min level, index ${index + 1}) with smallest descendant ${this.heap[m]} (index ${m + 1})`,
      });

      if (this.heap[m] < this.heap[index]) {
        if (this.getLevel(m) - this.getLevel(index) === 2) {
          // 孫節點
          this.swap(index, m);
          this.steps.push({
            heap: [...this.heap],
            highlight: null,
            description: `Swapped ${this.heap[m]} with ${this.heap[index]}`,
          });
          const parentM = this.parent(m);
          if (this.heap[m] > this.heap[parentM]) {
            this.steps.push({
              heap: [...this.heap],
              highlight: [m, parentM],
              description: `Comparing ${this.heap[m]} (min level, index ${m + 1}) with parent ${this.heap[parentM]} (max level, index ${parentM + 1})`,
            });
            this.swap(m, parentM);
            this.steps.push({
              heap: [...this.heap],
              highlight: null,
              description: `Swapped ${this.heap[parentM]} with ${this.heap[m]}`,
            });
          } else if (this.heap[m] <= this.heap[parentM]) {
            this.steps.push({
              heap: [...this.heap],
              highlight: [m, parentM],
              description: `Comparing ${this.heap[m]} (min level, index ${m + 1}) with parent ${this.heap[parentM]} (max level, index ${parentM + 1})`,
            });
            this.steps.push({
              heap: [...this.heap],
              highlight: null,
              description: `No swap needed`,
            });
          }
          this.pushDown(m);
        } else {
          // 子節點
          this.swap(index, m);
          this.steps.push({
            heap: [...this.heap],
            highlight: null,
            description: `Swapped ${this.heap[m]} with ${this.heap[index]}`,
          });
        }
      } else {
        this.steps.push({
          heap: [...this.heap],
          highlight: null,
          description: `No swap needed`,
        });
      }
    } else {
      // Max 層
      const m = this.getLargestDescendant(index);
      if (m === index) return;

      this.steps.push({
        heap: [...this.heap],
        highlight: [index, m],
        description: `Comparing ${this.heap[index]} (max level, index ${index + 1}) with largest descendant ${this.heap[m]} (index ${m + 1})`,
      });

      if (this.heap[m] > this.heap[index]) {
        if (this.getLevel(m) - this.getLevel(index) === 2) {
          // 孫節點
          this.swap(index, m);
          this.steps.push({
            heap: [...this.heap],
            highlight: null,
            description: `Swapped ${this.heap[m]} with ${this.heap[index]}`,
          });
          const parentM = this.parent(m);
          if (this.heap[m] < this.heap[parentM]) {
            this.steps.push({
              heap: [...this.heap],
              highlight: [m, parentM],
              description: `Comparing ${this.heap[m]} (max level, index ${m + 1}) with parent ${this.heap[parentM]} (min level, index ${parentM + 1})`,
            });
            this.swap(m, parentM);
            this.steps.push({
              heap: [...this.heap],
              highlight: null,
              description: `Swapped ${this.heap[parentM]} with ${this.heap[m]}`,
            });
          } else if (this.heap[m] >= this.heap[parentM]) {
            this.steps.push({
              heap: [...this.heap],
              highlight: [m, parentM],
              description: `Comparing ${this.heap[m]} (max level, index ${m + 1}) with parent ${this.heap[parentM]} (min level, index ${parentM + 1})`,
            });
            this.steps.push({
              heap: [...this.heap],
              highlight: null,
              description: `No swap needed`,
            });
          }
          this.pushDown(m);
        } else {
          // 子節點
          this.swap(index, m);
          this.steps.push({
            heap: [...this.heap],
            highlight: null,
            description: `Swapped ${this.heap[m]} with ${this.heap[index]}`,
          });
        }
      } else {
        this.steps.push({
          heap: [...this.heap],
          highlight: null,
          description: `No swap needed`,
        });
      }
    }
  }

  // Push-up 操作（維基百科 bubble-up）
  private pushUp(index: number) {
    if (index === 0) return;

    const parentIndex = this.parent(index);
    this.steps.push({
      heap: [...this.heap],
      highlight: [index, parentIndex],
      description: `Comparing ${this.heap[index]} (index ${index + 1}) with parent ${this.heap[parentIndex]} (${this.isMinLevel(parentIndex) ? 'min' : 'max'} level, index ${parentIndex + 1})`,
    });

    if (this.isMinLevel(index)) {
      // Min 層
      if (this.heap[index] > this.heap[parentIndex]) {
        this.swap(index, parentIndex);
        this.steps.push({
          heap: [...this.heap],
          highlight: null,
          description: `Swapped ${this.heap[parentIndex]} with ${this.heap[index]}`,
        });
        this.pushUpMax(parentIndex);
      } else {
        this.steps.push({
          heap: [...this.heap],
          highlight: null,
          description: `No swap needed`,
        });
        this.pushUpMin(index);
      }
    } else {
      // Max 層
      if (this.heap[index] < this.heap[parentIndex]) {
        this.swap(index, parentIndex);
        this.steps.push({
          heap: [...this.heap],
          highlight: null,
          description: `Swapped ${this.heap[parentIndex]} with ${this.heap[index]}`,
        });
        this.pushUpMin(parentIndex);
      } else {
        this.steps.push({
          heap: [...this.heap],
          highlight: null,
          description: `No swap needed`,
        });
        this.pushUpMax(index);
      }
    }
  }

  // Push-up for min level
  private pushUpMin(index: number) {
    const grandparentIndex = this.grandparent(index);
    if (grandparentIndex >= 0 && this.heap[index] < this.heap[grandparentIndex]) {
      this.steps.push({
        heap: [...this.heap],
        highlight: [index, grandparentIndex],
        description: `Comparing ${this.heap[index]} (min level, index ${index + 1}) with grandparent ${this.heap[grandparentIndex]} (min level, index ${grandparentIndex + 1})`,
      });
      this.swap(index, grandparentIndex);
      this.steps.push({
        heap: [...this.heap],
        highlight: null,
        description: `Swapped ${this.heap[grandparentIndex]} with ${this.heap[index]}`,
      });
      this.pushUpMin(grandparentIndex);
    } else if (grandparentIndex >= 0) {
      this.steps.push({
        heap: [...this.heap],
        highlight: [index, grandparentIndex],
        description: `Comparing ${this.heap[index]} (min level, index ${index + 1}) with grandparent ${this.heap[grandparentIndex]} (min level, index ${grandparentIndex + 1})`,
      });
      this.steps.push({
        heap: [...this.heap],
        highlight: null,
        description: `No swap needed`,
      });
    }
  }

  // Push-up for max level
  private pushUpMax(index: number) {
    const grandparentIndex = this.grandparent(index);
    if (grandparentIndex >= 0 && this.heap[index] > this.heap[grandparentIndex]) {
      this.steps.push({
        heap: [...this.heap],
        highlight: [index, grandparentIndex],
        description: `Comparing ${this.heap[index]} (max level, index ${index + 1}) with grandparent ${this.heap[grandparentIndex]} (max level, index ${grandparentIndex + 1})`,
      });
      this.swap(index, grandparentIndex);
      this.steps.push({
        heap: [...this.heap],
        highlight: null,
        description: `Swapped ${this.heap[grandparentIndex]} with ${this.heap[index]}`,
      });
      this.pushUpMax(grandparentIndex);
    } else if (grandparentIndex >= 0) {
      this.steps.push({
        heap: [...this.heap],
        highlight: [index, grandparentIndex],
        description: `Comparing ${this.heap[index]} (max level, index ${index + 1}) with grandparent ${this.heap[grandparentIndex]} (max level, index ${grandparentIndex + 1})`,
      });
      this.steps.push({
        heap: [...this.heap],
        highlight: null,
        description: `No swap needed`,
      });
    }
  }

  // 交換節點
  private swap(i: number, j: number) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }
}