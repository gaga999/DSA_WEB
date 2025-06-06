export type HeapStep = {
  heap: number[];
  highlight: number[] | null; // 高亮的節點索引
  description: string; // 步驟描述
};

export class MinMaxHeap {
  private heap: number[] = [0]; // 1-based 索引，0 留空
  private steps: HeapStep[] = [];

  toJSON() {
    return {
      heap: this.heap,
      steps: this.steps,
    };
  }
  static fromJSON(data: { heap: number[]; steps: HeapStep[] }): MinMaxHeap {
    const instance = new MinMaxHeap();
    instance.heap = data.heap || [0];
    instance.steps = data.steps || [];
    return instance;
  }

  // 獲取節點所在層級
  private getLevel(index: number): number {
    return Math.floor(Math.log2(index));
  }

  // 判斷是否為 min 層（偶數層）
  private isMinLevel(index: number): boolean {
    return this.getLevel(index) % 2 === 0;
  }

  // 父節點索引
  private parent(index: number): number {
    return Math.floor(index / 2);
  }

  // 子節點索引
  private leftChild(index: number): number {
    return 2 * index;
  }

  private rightChild(index: number): number {
    return 2 * index + 1;
  }

  // 祖父節點索引
  private grandparent(index: number): number {
    return this.parent(this.parent(index));
  }

  clear(): void {
    this.heap = [0]; // 重置為初始狀態（1-based）
    this.steps = [];
  }

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
    this.pushUp(newIndex);
    this.steps.push({
      heap: [...this.heap],
      highlight: null,
      description: `finish`,
    });
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
      this.steps.push({
        heap: [...this.heap],
        highlight: null,
        description: `finish`,
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
      this.steps.push({
        heap: [...this.heap],
        highlight: null,
        description: `finish`,
      });
      return this.steps;
    }

    // const min = this.heap[1];
    const lastIndex = this.heap.length - 1;
    this.heap[1] = this.heap[lastIndex];
    this.heap.pop();
    this.steps.push({
      heap: [...this.heap],
      highlight: [1, lastIndex],
      description: `Moved last element ${this.heap[1]} from index ${lastIndex} to root (index 1)`,
    });
    this.pushDown(1);
    this.steps.push({
      heap: [...this.heap],
      highlight: null,
      description: `finish`,
    });
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
      this.steps.push({
        heap: [...this.heap],
        highlight: null,
        description: `finish`,
      });
      return this.steps;
    }
    if (this.heap.length === 2) {
      const max = this.heap.pop()!;
      this.steps.push({
        heap: [...this.heap],
        highlight: null,
        description: `Removed only element ${max}`,
      });
      this.steps.push({
        heap: [...this.heap],
        highlight: null,
        description: `finish`,
      });
      return this.steps;
    }
    const maxIndex = this.heap[2] > (this.heap[3] || -Infinity) ? 2 : 3;
    const max = this.heap[maxIndex];
    const lastIndex = this.heap.length - 1;
    this.steps.push({
      heap: [...this.heap],
      highlight: [maxIndex],
      description: `Selected max element ${max} at index ${maxIndex}`,
    });
    if (this.heap.length <= 4) {
      if (maxIndex === lastIndex) {
        this.heap.pop();
        this.steps.push({
          heap: [...this.heap],
          highlight: null,
          description: `Removed element ${max} at index ${maxIndex}`,
        });
      }
      else {
        this.heap[maxIndex] = this.heap[lastIndex];
        this.heap.pop();
        this.steps.push({
          heap: [...this.heap],
          highlight: [maxIndex, lastIndex],
          description: `Moved last element ${this.heap[maxIndex]} from index ${lastIndex} to index ${maxIndex}`,
        });
      }
      this.steps.push({
        heap: [...this.heap],
        highlight: null,
        description: `finish`,
      });
      return this.steps;
    }

    // 找到 max 層（第一層，索引 2 或 3）的最大值
    this.heap[maxIndex] = this.heap[lastIndex];
    this.heap.pop();
    this.steps.push({
      heap: [...this.heap],
      highlight: [maxIndex, lastIndex],
      description: `Moved last element ${this.heap[maxIndex]} from index ${lastIndex} to index ${maxIndex}`,
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
    let smallestValue = Infinity;

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
    let largestValue = -Infinity;

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
        description: `Comparing ${this.heap[index]} (min level, index ${index}) with smallest descendant ${this.heap[m]} (index ${m})`,
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
          this.steps.push({
            heap: [...this.heap],
            highlight: [m, parentM],
            description: `Comparing ${this.heap[m]} (min level, index ${m}) with parent ${this.heap[parentM]} (max level, index ${parentM})`,
          });
          if (this.heap[m] > this.heap[parentM]) {
            this.swap(m, parentM);
            this.steps.push({
              heap: [...this.heap],
              highlight: null,
              description: `Swapped ${this.heap[parentM]} with ${this.heap[m]}`,
            });
          } else {
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
        description: `Comparing ${this.heap[index]} (max level, index ${index}) with largest descendant ${this.heap[m]} (index ${m})`,
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
          this.steps.push({
            heap: [...this.heap],
            highlight: [m, parentM],
            description: `Comparing ${this.heap[m]} (max level, index ${m}) with parent ${this.heap[parentM]} (min level, index ${parentM})`,
          });
          if (this.heap[m] < this.heap[parentM]) {
            this.swap(m, parentM);
            this.steps.push({
              heap: [...this.heap],
              highlight: null,
              description: `Swapped ${this.heap[parentM]} with ${this.heap[m]}`,
            });
          } else {
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
    if (index <= 1) return;

    const parentIndex = this.parent(index);
    this.steps.push({
      heap: [...this.heap],
      highlight: [index, parentIndex],
      description: `Comparing ${this.heap[index]} (index ${index}) with parent ${this.heap[parentIndex]} (${this.isMinLevel(parentIndex) ? 'min' : 'max'} level, index ${parentIndex})`,
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
    if (grandparentIndex >= 1) {
      this.steps.push({
        heap: [...this.heap],
        highlight: [index, grandparentIndex],
        description: `Comparing ${this.heap[index]} (min level, index ${index}) with grandparent ${this.heap[grandparentIndex]} (min level, index ${grandparentIndex})`,
      });
      if (this.heap[index] < this.heap[grandparentIndex]) {
        this.swap(index, grandparentIndex);
        this.steps.push({
          heap: [...this.heap],
          highlight: null,
          description: `Swapped ${this.heap[grandparentIndex]} with ${this.heap[index]}`,
        });
        this.pushUpMin(grandparentIndex);
      }
      else {
        this.steps.push({
          heap: [...this.heap],
          highlight: null,
          description: `No swap needed`,
        });
      }
    }
  }

  // Push-up for max level
  private pushUpMax(index: number) {
    const grandparentIndex = this.grandparent(index);
    if (grandparentIndex >= 1) {
      this.steps.push({
        heap: [...this.heap],
        highlight: [index, grandparentIndex],
        description: `Comparing ${this.heap[index]} (max level, index ${index}) with grandparent ${this.heap[grandparentIndex]} (max level, index ${grandparentIndex})`,
      });
      if (this.heap[index] > this.heap[grandparentIndex]) {
        this.swap(index, grandparentIndex);
        this.steps.push({
          heap: [...this.heap],
          highlight: null,
          description: `Swapped ${this.heap[grandparentIndex]} with ${this.heap[index]}`,
        });
        this.pushUpMax(grandparentIndex);
      }
      else {
        this.steps.push({
          heap: [...this.heap],
          highlight: null,
          description: `No swap needed`,
        });
      }
    }
  }

  // 交換節點
  private swap(i: number, j: number) {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }
}