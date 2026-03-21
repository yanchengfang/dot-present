import { jsx as _jsx } from "react/jsx-runtime";
import { useRef, useState, useEffect, useMemo, useCallback, forwardRef, useImperativeHandle, } from "react";
export const VirtualList = forwardRef((props, ref) => {
    const { data, itemKey, estimatedItemHeight = 50, itemHeight: fixedItemHeight, containerHeight = "100%", bufferSize = 3, overscanCount, onScroll, onReachEnd, renderItem, } = props;
    const buffer = overscanCount ?? bufferSize;
    const isFixedHeight = fixedItemHeight !== undefined;
    // DOM refs
    const containerRef = useRef(null);
    const itemsRef = useRef(new Map());
    // 状态
    const [scrollTop, setScrollTop] = useState(0);
    const [containerHeightVal, setContainerHeightVal] = useState(0);
    // ---------- 动态高度模式的位置缓存 ----------
    const positions = useRef([]);
    // 初始化 / 数据变化时重建位置缓存
    useEffect(() => {
        if (isFixedHeight)
            return;
        const total = data.length;
        let offset = 0;
        positions.current = data.map((_, idx) => {
            const height = estimatedItemHeight;
            const pos = { index: idx, height, offset };
            offset += height;
            return pos;
        });
    }, [data, estimatedItemHeight, isFixedHeight]);
    // 更新某个索引的高度，并修正后续偏移
    const updateItemHeight = useCallback((index, newHeight) => {
        if (isFixedHeight)
            return;
        const pos = positions.current[index];
        if (!pos || pos.height === newHeight)
            return;
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
        // 触发重新渲染，确保滚动位置正确
        setScrollTop((prev) => prev); // 微小 hack：强制刷新（实际可用更优雅的方式）
    }, [isFixedHeight]);
    // 监听容器高度变化
    useEffect(() => {
        if (!containerRef.current)
            return;
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
        if (isFixedHeight) {
            const itemHeight = fixedItemHeight;
            const start = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
            const visibleCount = Math.ceil(containerHeightVal / itemHeight);
            const end = Math.min(data.length - 1, start + visibleCount + buffer);
            const total = data.length * itemHeight;
            return { startIndex: start, endIndex: end, totalHeight: total };
        }
        else {
            // 二分查找起始索引
            const binarySearch = (scrollTop) => {
                let low = 0, high = data.length - 1;
                while (low <= high) {
                    const mid = Math.floor((low + high) / 2);
                    const offset = positions.current[mid]?.offset ?? 0;
                    if (offset === scrollTop)
                        return mid;
                    if (offset < scrollTop)
                        low = mid + 1;
                    else
                        high = mid - 1;
                }
                return low;
            };
            const start = binarySearch(scrollTop);
            let end = start;
            let offsetEnd = positions.current[start]?.offset ?? 0;
            while (end < data.length - 1 &&
                offsetEnd - scrollTop < containerHeightVal) {
                end++;
                const endPos = positions.current[end];
                offsetEnd = (endPos?.offset ?? 0) + (endPos?.height ?? 0);
            }
            // 增加缓冲区
            const startWithBuffer = Math.max(0, start - buffer);
            const endWithBuffer = Math.min(data.length - 1, end + buffer);
            const total = positions.current.length > 0
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
    ]);
    // 滚动事件处理（含节流）
    const handleScroll = useCallback((e) => {
        const target = e.currentTarget;
        const newScrollTop = target.scrollTop;
        setScrollTop(newScrollTop);
        onScroll?.(e);
        // 触底检测
        if (onReachEnd &&
            target.scrollHeight - target.scrollTop - target.clientHeight < 5) {
            onReachEnd();
        }
    }, [onScroll, onReachEnd]);
    // 暴露方法
    useImperativeHandle(ref, () => ({
        scrollTo: (top) => {
            if (containerRef.current)
                containerRef.current.scrollTop = top;
        },
        scrollToIndex: (index, align = "start") => {
            if (!containerRef.current)
                return;
            let targetTop = 0;
            if (isFixedHeight) {
                targetTop = index * fixedItemHeight;
            }
            else {
                targetTop = positions.current[index]?.offset ?? 0;
            }
            if (align === "center") {
                targetTop -= containerHeightVal / 2;
            }
            else if (align === "end") {
                targetTop -= containerHeightVal;
            }
            containerRef.current.scrollTop = Math.max(0, targetTop);
        },
        getCurrentRange: () => ({ start: startIndex, end: endIndex }),
    }), [
        startIndex,
        endIndex,
        containerHeightVal,
        fixedItemHeight,
        isFixedHeight,
    ]);
    // 获取唯一 key
    const getKey = useCallback((item, idx) => {
        if (typeof itemKey === "function")
            return itemKey(item, idx);
        return item[itemKey]?.toString() ?? `item_${idx}`;
    }, [itemKey]);
    // 渲染可视区内的项
    const visibleItems = useMemo(() => {
        const items = [];
        for (let i = startIndex; i <= endIndex && i < data.length; i++) {
            const item = data[i];
            if (item === undefined)
                continue;
            const key = getKey(item, i);
            let top = 0;
            if (isFixedHeight) {
                top = i * fixedItemHeight;
            }
            else {
                top = positions.current[i]?.offset ?? 0;
            }
            items.push(_jsx("div", { ref: (el) => {
                    if (!el || isFixedHeight)
                        return;
                    const htmlEl = el;
                    itemsRef.current.set(key, htmlEl);
                    // 测量真实高度（初次渲染或内容变化）
                    const actualHeight = htmlEl.getBoundingClientRect().height;
                    if (actualHeight &&
                        positions.current[i]?.height !== actualHeight) {
                        updateItemHeight(i, actualHeight);
                    }
                }, style: {
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${top}px)`,
                }, children: renderItem(item, i) }, key));
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
    const containerStyle = {
        height: containerHeight,
        overflowY: "auto",
        position: "relative",
    };
    const innerStyle = {
        position: "relative",
        height: totalHeight,
        width: "100%",
    };
    return (
    // 可视区域容器
    _jsx("div", { ref: containerRef, style: containerStyle, onScroll: handleScroll, children: _jsx("div", { style: innerStyle, children: visibleItems }) }));
});
//# sourceMappingURL=App.js.map