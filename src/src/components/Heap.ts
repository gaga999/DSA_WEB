export class Heap {
  private heap: number[] = [];

  // 插入新值
  insert(value: number) {
    this.heap.push(value);
    this.bubbleUp(this.heap.length - 1);
  }

  // 刪除最大值（根節點）
  deleteMax(): number | null {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop()!;

    const max = this.heap[0];
    this.heap[0] = this.heap.pop()!;
    this.bubbleDown(0);
    return max;
  }

  // 獲取堆的陣列表示
  getHeap(): number[] {
    return [...this.heap];
  }

  // 上浮操作，維護堆性質
  private bubbleUp(index: number) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[parentIndex] >= this.heap[index]) break;
      [this.heap[parentIndex], this.heap[index]] = [
        this.heap[index],
        this.heap[parentIndex],
      ];
      index = parentIndex;
    }
  }

  // 下沉操作，維護堆性質
  private bubbleDown(index: number) {
    const lastIndex = this.heap.length - 1;
    while (true) {
      let largest = index;
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;

      if (leftChild <= lastIndex && this.heap[leftChild] > this.heap[largest]) {
        largest = leftChild;
      }
      if (rightChild <= lastIndex && this.heap[rightChild] > this.heap[largest]) {
        largest = rightChild;
      }
      if (largest === index) break;

      [this.heap[index], this.heap[largest]] = [
        this.heap[largest],
        this.heap[index],
      ];
      index = largest;
    }
  }
}
