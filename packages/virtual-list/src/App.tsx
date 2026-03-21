import React, {
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  useMemo,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useReducer,
} from "react";

// 位置缓存项
interface Position {
  index: number;
  height: number;
  offset: number;
}

export interface VirtualListRef {
  scrollTo: (scrollTop: number) => void;
  scrollToIndex: (index: number, align?: "start" | "center" | "end") => void;
  getCurrentRange: () => { start: number; end: number };
}

interface VirtualListProps<T> {
  data: T[];
  itemKey: keyof T | ((item: T, index: number) => string);
  estimatedItemHeight?: number; // 预估高度，动态高度模式必须
  itemHeight?: number; // 若提供，则启用固定高度模式
  containerHeight?: number | string;
  bufferSize?: number;
  overscanCount?: number; // 与 bufferSize 同义，可选
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  onReachEnd?: () => void;
  renderItem: (item: T, index: number) => React.ReactNode;
}

export const VirtualList = forwardRef(
  <T,>(props: VirtualListProps<T>, ref: React.Ref<VirtualListRef>) => {
    const {
      data,
      itemKey,
      estimatedItemHeight = 50,
      itemHeight: fixedItemHeight,
      containerHeight = "100%",
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
    const itemObserversRef = useRef<Map<string, ResizeObserver>>(new Map());
    const isNearEndRef = useRef(false);

    // 状态
    const [scrollTop, setScrollTop] = useState(0);
    const [containerHeightVal, setContainerHeightVal] = useState(0);
    const [, forceUpdate] = useReducer((v: number) => v + 1, 0);

    const parsedContainerHeight = useMemo(() => {
      if (typeof containerHeight === "number") return containerHeight;
      if (typeof containerHeight === "string") {
        const matched = containerHeight.trim().match(/^(\d+(?:\.\d+)?)px$/i);
        if (matched) return Number(matched[1]);
      }
      return 0;
    }, [containerHeight]);

    // ---------- 动态高度模式的位置缓存 ----------
    const positions = useRef<Position[]>([]);

    // 初始化 / 数据变化时重建位置缓存
    useEffect(() => {
      if (isFixedHeight) return;
      const total = data.length;
      let offset = 0;
      positions.current = data.map((_, idx) => {
        const height = estimatedItemHeight;
        const pos = { index: idx, height, offset };
        offset += height;
        return pos;
      });
    }, [data, estimatedItemHeight, isFixedHeight]);

    useEffect(() => {
      return () => {
        itemObserversRef.current.forEach((observer) => observer.disconnect());
        itemObserversRef.current.clear();
      };
    }, []);

    // 更新某个索引的高度，并修正后续偏移
    const updateItemHeight = useCallback(
      (index: number, newHeight: number) => {
        if (isFixedHeight) return;
        const pos = positions.current[index];
        if (!pos || pos.height === newHeight) return;
        const oldHeight = pos.height;
        pos.height = newHeight;
        // 修正从 index+1 开始的所有偏移量
        let diff = newHeight - oldHeight;
        for (let i = index + 1; i < positions.current.length; i++) {
          const pos = positions.current[i];
          if (pos) {
            pos.offset += diff;
          }
        }
        // 触发重新渲染，确保动态高度变化后可视区及时更新
        forceUpdate();
      },
      [isFixedHeight],
    );

    // 监听容器高度变化
    useLayoutEffect(() => {
      if (!containerRef.current) return;
      const initialHeight = containerRef.current.clientHeight;
      if (initialHeight > 0) {
        setContainerHeightVal(initialHeight);
      }
    }, []);

    useEffect(() => {
      if (!containerRef.current) return;
      const observer = new ResizeObserver((entries) => {
        if (entries.length > 0) {
          const height = entries[0].contentRect.height;
          setContainerHeightVal(height);
        }
      });
      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }, []);

    // 计算当前可视区的起始/结束索引
    const { startIndex, endIndex, totalHeight } = useMemo(() => {
      if (data.length === 0) {
        return { startIndex: 0, endIndex: -1, totalHeight: 0 };
      }
      const effectiveContainerHeight =
        containerHeightVal > 0
          ? containerHeightVal
          : parsedContainerHeight > 0
            ? parsedContainerHeight
            : estimatedItemHeight * 8;

      if (isFixedHeight) {
        const itemHeight = fixedItemHeight!;
        const start = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
        const visibleCount = Math.max(
          1,
          Math.ceil(effectiveContainerHeight / itemHeight),
        );
        const end = Math.min(data.length - 1, start + visibleCount + buffer);
        const total = data.length * itemHeight;
        return { startIndex: start, endIndex: end, totalHeight: total };
      } else {
        // 二分查找起始索引
        const binarySearch = (scrollTop: number) => {
          let low = 0,
            high = data.length - 1;
          while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            const offset = positions.current[mid]?.offset ?? 0;
            if (offset === scrollTop) return mid;
            if (offset < scrollTop) low = mid + 1;
            else high = mid - 1;
          }
          // 返回包含当前 scrollTop 的最后一个起始 offset <= scrollTop 的元素
          return Math.max(0, low - 1);
        };
        const start = binarySearch(scrollTop);
        let end = start;
        let offsetEnd = positions.current[start]?.offset ?? 0;
        while (
          end < data.length - 1 &&
          offsetEnd - scrollTop < effectiveContainerHeight
        ) {
          end++;
          const endPos = positions.current[end];
          offsetEnd = (endPos?.offset ?? 0) + (endPos?.height ?? 0);
        }
        // 增加缓冲区
        const startWithBuffer = Math.max(0, start - buffer);
        const endWithBuffer = Math.min(data.length - 1, end + buffer);
        const total =
          positions.current.length > 0
            ? (() => {
                const lastPos = positions.current[positions.current.length - 1];
                return (lastPos?.offset ?? 0) + (lastPos?.height ?? 0);
              })()
            : 0;
        return {
          startIndex: startWithBuffer,
          endIndex: endWithBuffer,
          totalHeight: total,
        };
      }
    }, [
      scrollTop,
      containerHeightVal,
      data.length,
      buffer,
      fixedItemHeight,
      isFixedHeight,
      parsedContainerHeight,
      estimatedItemHeight,
    ]);

    // 滚动事件处理（含节流）
    const handleScroll = useCallback(
      (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const newScrollTop = target.scrollTop;
        setScrollTop(newScrollTop);
        onScroll?.(e);
        // 触底检测
        const nearEnd =
          target.scrollHeight - target.scrollTop - target.clientHeight < 5;
        if (onReachEnd && nearEnd && !isNearEndRef.current) {
          isNearEndRef.current = true;
          onReachEnd();
        } else if (!nearEnd) {
          isNearEndRef.current = false;
        }
      },
      [onScroll, onReachEnd],
    );

    // 暴露方法
    useImperativeHandle(
      ref,
      () => ({
        scrollTo: (top: number) => {
          if (!containerRef.current) return;
          const safeTop = Math.max(0, top);
          containerRef.current.scrollTop = safeTop;
          setScrollTop(safeTop);
        },
        scrollToIndex: (
          index: number,
          align: "start" | "center" | "end" = "start",
        ) => {
          if (!containerRef.current || data.length === 0) return;
          const safeIndex = Math.min(Math.max(0, index), data.length - 1);
          let targetTop = 0;
          if (isFixedHeight) {
            targetTop = safeIndex * fixedItemHeight!;
          } else {
            targetTop = positions.current[safeIndex]?.offset ?? 0;
          }
          const targetHeight = isFixedHeight
            ? fixedItemHeight!
            : positions.current[safeIndex]?.height ?? estimatedItemHeight;
          if (align === "center") {
            targetTop -= (containerHeightVal - targetHeight) / 2;
          } else if (align === "end") {
            targetTop -= containerHeightVal - targetHeight;
          }
          const safeTop = Math.max(0, targetTop);
          containerRef.current.scrollTop = safeTop;
          setScrollTop(safeTop);
        },
        getCurrentRange: () => ({ start: startIndex, end: endIndex }),
      }),
      [
        startIndex,
        endIndex,
        containerHeightVal,
        fixedItemHeight,
        isFixedHeight,
        data.length,
        estimatedItemHeight,
      ],
    );

    // 获取唯一 key
    const getKey = useCallback(
      (item: T, idx: number): string => {
        if (typeof itemKey === "function") return itemKey(item, idx);
        return (item[itemKey] as any)?.toString() ?? `item_${idx}`;
      },
      [itemKey],
    );

    // 渲染可视区内的项
    const visibleItems = useMemo(() => {
      const items = [];
      for (let i = startIndex; i <= endIndex && i < data.length; i++) {
        const item = data[i];
        if (item === undefined) continue;

        const key = getKey(item, i);
        let top = 0;
        if (isFixedHeight) {
          top = i * fixedItemHeight!;
        } else {
          top = positions.current[i]?.offset ?? 0;
        }
        items.push(
          <div
            key={key}
            ref={(el) => {
              if (isFixedHeight) return;
              if (!el) {
                itemsRef.current.delete(key);
                const prevObserver = itemObserversRef.current.get(key);
                if (prevObserver) {
                  prevObserver.disconnect();
                  itemObserversRef.current.delete(key);
                }
                return;
              }

              const htmlEl = el as unknown as HTMLElement;
              itemsRef.current.set(key, htmlEl);
              const prevObserver = itemObserversRef.current.get(key);
              if (prevObserver) {
                prevObserver.disconnect();
              }
              const resizeObserver = new ResizeObserver((entries) => {
                if (entries.length === 0) return;
                const newHeight = entries[0].contentRect.height;
                if (newHeight > 0) {
                  updateItemHeight(i, newHeight);
                }
              });
              resizeObserver.observe(htmlEl);
              itemObserversRef.current.set(key, resizeObserver);

              // 测量真实高度（初次渲染或内容变化）
              const actualHeight = htmlEl.getBoundingClientRect().height;
              if (
                actualHeight &&
                positions.current[i]?.height !== actualHeight
              ) {
                updateItemHeight(i, actualHeight);
              }
            }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${top}px)`,
            }}
          >
            {renderItem(item, i)}
          </div>,
        );
      }
      return items;
    }, [
      startIndex,
      endIndex,
      data,
      getKey,
      isFixedHeight,
      fixedItemHeight,
      renderItem,
      updateItemHeight,
    ]);

    // 容器样式
    const containerStyle: React.CSSProperties = {
      height: containerHeight,
      overflowY: "auto",
      position: "relative",
    };

    const innerStyle: React.CSSProperties = {
      position: "relative",
      height: totalHeight,
      width: "100%",
    };

    return (
      // 可视区域容器
      <div ref={containerRef} style={containerStyle} onScroll={handleScroll}>
        {/* 容器占位，高度是总列表的高度，用于撑起容器的高度，出现滚动条*/}
        <div style={innerStyle}>{visibleItems}</div>
      </div>
    );
  },
);
