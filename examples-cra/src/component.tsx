import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from 'react';

// 位置缓存项
interface Position {
  index: number;
  height: number;
  offset: number;
}

export interface VirtualListRef {
  scrollTo: (scrollTop: number) => void;
  scrollToIndex: (index: number, align?: 'start' | 'center' | 'end') => void;
  getCurrentRange: () => { start: number; end: number };
}

interface VirtualListProps<T> {
  data: T[];
  itemKey: keyof T | ((item: T, index: number) => string);
  estimatedItemHeight?: number;   // 预估高度，动态高度模式必须
  itemHeight?: number;            // 若提供，则启用固定高度模式
  containerHeight?: number | string;
  bufferSize?: number;
  overscanCount?: number;         // 与 bufferSize 同义，可选
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  onReachEnd?: () => void;
  renderItem: (item: T, index: number) => React.ReactNode;
}

export const VirtualList = forwardRef(<T,>(
  props: VirtualListProps<T>,
  ref: React.Ref<VirtualListRef>
) => {
  const {
    data,
    itemKey,
    estimatedItemHeight = 50,
    itemHeight: fixedItemHeight,
    containerHeight = '100%',
    bufferSize = 3,
    overscanCount,
    onScroll,
    onReachEnd,
    renderItem,
  } = props;

  const buffer = overscanCount ?? bufferSize;
  const isFixedHeight = fixedItemHeight !== undefined;

  // DOM refs
  const containerRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<Map<string, HTMLElement>>(new Map());

  // 状态
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeightVal, setContainerHeightVal] = useState(0);

  // ---------- 动态高度模式的位置缓存 ----------
  const positions = useRef<Position[]>([]);

  // 初始化 / 数据变化时重建位置缓存
  useEffect(() => {
    if (isFixedHeight) return;
    let offset = 0;
    positions.current = data.map((_, idx) => {
      const height = estimatedItemHeight;
      const pos = { index: idx, height, offset };
      offset += height;
      return pos;
    });
  }, [data, estimatedItemHeight, isFixedHeight]);

  // 更新某个索引的高度，并修正后续偏移
  const updateItemHeight = useCallback((index: number, newHeight: number) => {
    if (isFixedHeight) return;
    const pos = positions.current[index];
    if (!pos || pos.height === newHeight) return;
    const oldHeight = pos.height;
    pos.height = newHeight;
    // 修正从 index+1 开始的所有偏移量
    const diff = newHeight - oldHeight;
    for (let i = index + 1; i < positions.current.length; i++) {
      positions.current[i].offset += diff;
    }
    setScrollTop((prev) => prev);
  }, [isFixedHeight]);

  // 监听容器高度变化
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const height = entries[0].contentRect.height;
      setContainerHeightVal(height);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // 计算当前可视区的起始/结束索引
  const { startIndex, endIndex, totalHeight } = useMemo(() => {
    if (isFixedHeight) {
      const start = Math.max(0, Math.floor(scrollTop / fixedItemHeight));
      const visibleCount = Math.ceil(containerHeightVal / fixedItemHeight);
      const end = Math.min(data.length - 1, start + visibleCount + buffer);
      const total = data.length * fixedItemHeight;
      return { startIndex: start, endIndex: end, totalHeight: total };
    } else {
      // 二分查找起始索引
      const binarySearch = (scrollTop: number) => {
        let low = 0, high = data.length - 1;
        while (low <= high) {
          const mid = Math.floor((low + high) / 2);
          const offset = positions.current[mid]?.offset ?? 0;
          if (offset === scrollTop) return mid;
          if (offset < scrollTop) low = mid + 1;
          else high = mid - 1;
        }
        return low;
      };
      const start = binarySearch(scrollTop);
      let end = start;
      let offsetEnd = positions.current[start]?.offset ?? 0;
      while (end < data.length - 1 && offsetEnd - scrollTop < containerHeightVal) {
        end++;
        offsetEnd = (positions.current[end]?.offset ?? 0) + (positions.current[end]?.height ?? 0);
      }
      // 增加缓冲区
      const startWithBuffer = Math.max(0, start - buffer);
      const endWithBuffer = Math.min(data.length - 1, end + buffer);
      const last = positions.current[positions.current.length - 1];
      const total = positions.current.length ? (last?.offset ?? 0) + (last?.height ?? 0) : 0;
      return {
        startIndex: startWithBuffer,
        endIndex: endWithBuffer,
        totalHeight: total,
      };
    }
  }, [scrollTop, containerHeightVal, data.length, buffer, fixedItemHeight, isFixedHeight]);

  // 滚动事件处理（含节流）
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const newScrollTop = target.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(e);
    // 触底检测
    if (onReachEnd && target.scrollHeight - target.scrollTop - target.clientHeight < 5) {
      onReachEnd();
    }
  }, [onScroll, onReachEnd]);

  // 暴露方法
  useImperativeHandle(ref, () => ({
    scrollTo: (top: number) => {
      if (containerRef.current) containerRef.current.scrollTop = top;
    },
    scrollToIndex: (index: number, align: 'start' | 'center' | 'end' = 'start') => {
      if (!containerRef.current) return;
      let targetTop = 0;
      if (isFixedHeight) {
        targetTop = index * fixedItemHeight;
      } else {
        targetTop = positions.current[index]?.offset ?? 0;
      }
      if (align === 'center') {
        targetTop -= containerHeightVal / 2;
      } else if (align === 'end') {
        targetTop -= containerHeightVal;
      }
      containerRef.current.scrollTop = Math.max(0, targetTop);
    },
    getCurrentRange: () => ({ start: startIndex, end: endIndex }),
  }), [startIndex, endIndex, containerHeightVal, fixedItemHeight, isFixedHeight]);

  // 获取唯一 key
  const getKey = useCallback((item: T, idx: number): string => {
    if (typeof itemKey === 'function') return itemKey(item, idx);
    return (item[itemKey] as any)?.toString() ?? `item_${idx}`;
  }, [itemKey]);

  // 渲染可视区内的项
  const visibleItems = useMemo(() => {
    const items = [];
    for (let i = startIndex; i <= endIndex && i < data.length; i++) {
      const item = data[i];
      const key = getKey(item, i);
      const top = isFixedHeight ? i * fixedItemHeight : (positions.current[i]?.offset ?? 0);
      items.push(
        <div
          key={key}
          ref={(el) => {
            if (!el) return;
            if (isFixedHeight) return;
            itemsRef.current.set(key, el);
            const actualHeight = el.getBoundingClientRect().height;
            if (actualHeight && positions.current[i]?.height !== actualHeight) {
              updateItemHeight(i, actualHeight);
            }
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            transform: `translateY(${top}px)`,
          }}
        >
          {renderItem(item, i)}
        </div>
      );
    }
    return items;
  }, [startIndex, endIndex, data, getKey, isFixedHeight, fixedItemHeight, renderItem, updateItemHeight]);

  // 容器样式
  const containerStyle: React.CSSProperties = {
    height: containerHeight,
    overflowY: 'auto',
    position: 'relative',
  };

  const innerStyle: React.CSSProperties = {
    position: 'relative',
    height: totalHeight,
    width: '100%',
  };

  return (
    <div ref={containerRef} style={containerStyle} onScroll={handleScroll}>
      <div style={innerStyle}>
        {visibleItems}
      </div>
    </div>
  );
});
