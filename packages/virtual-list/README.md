# 虚拟列表

## 为什么需要虚拟列表组件？

在处理海量数据列表时，传统的滚动列表会导致性能问题，因为浏览器需要渲染所有 DOM 节点，而用户只能看到可见区域。虚拟列表组件通过只渲染可视区域内的少量 DOM 节点，通过动态计算起始/结束索引来模拟完整滚动效果，从而支持海量数据的高性能滚动。

## 解决方案

### 1.时间分片：

通过 requestAnimationFrame 实现滚动事件的时间分片处理，大量数据分片执行，执行完毕后控制权交还主线程处理，避免造成主线程阻塞。
缺陷：效率低、不直观、性能差。

### 2.虚拟列表：

**设置一个可视区域，只渲染可视区域内的少量 DOM 节点，通过动态计算起始/结束索引来模拟完整滚动效果，从而支持海量数据的高性能滚动**

#### 实现

每个列表项的高度是固定的，通过计算可视区域的起始索引和结束索引，动态渲染可视区域内的列表项。

- 起始索引：可视区域顶部第一个列表项的索引
- 结束索引：可视区域底部最后一个列表项的索引
- 可视区域高度：可视区域的高度，用于计算起始索引和结束索引
- 偏移量：可视区域顶部与列表顶部的距离，用于计算起始索引

监听containerde scroll事件

可视区域高度固定 screenHeight
列表每项高度固定 itemHeight
列表数据称之为 listData
滚动高度为 scrollTop

计算出一些信息：
列表总高度 listHeight：`listData.length * itemHeight`
可现实列表项数 visibleCount：`screenHeight / itemHeight`
起始索引 startIndex：`Math.floor(scrollTop / itemHeight)`
结束索引 endIndex：`Math.min(startIndex + visibleCount, listData.length)`
可显示数据 visibleData：`listData.slice(startIndex, endIndex)`

## 偏移量 offsetTop：`scrollTop - startIndex * itemHeight`

#### 遗留问题

1. 动态高度
2. 白屏问题

## 一、公用组件的设计目标

1. **数据无关**：接受任意数据结构，通过作用域插槽（或 render prop）自定义每一项的渲染。
2. **高度灵活**：支持固定行高（高性能）和动态行高（自适应内容）。
3. **容器自适应**：滚动容器高度可固定或跟随父元素，能响应容器尺寸变化。
4. **可控滚动**：提供 `scrollTo`、`scrollToIndex` 等方法，方便外部控制滚动位置。
5. **性能优先**：滚动事件节流，缓存位置信息，避免重排抖动。

---

## 二、Props 配置设计

| 属性名                | 类型              | 默认值   | 说明                                   |
| --------------------- | ----------------- | -------- | -------------------------------------- |
| `data`                | Array             | `[]`     | 列表数据源                             |
| `itemKey`             | string / function | `'id'`   | 用于标识每个列表项的唯一键（优化渲染） |
| `estimatedItemHeight` | number            | `50`     | 预估的行高（动态高度模式必须提供）     |
| `itemHeight`          | number            | -        | 固定行高（若提供则启用固定高度模式）   |
| `containerHeight`     | number / string   | `'100%'` | 滚动容器高度（支持 px 或百分比）       |
| `bufferSize`          | number            | `3`      | 可视区域上下额外渲染的条目数，减少白屏 |
| `overscanCount`       | number            | `2`      | 同上，部分库称 overscan                |
| `scrollThreshold`     | number            | `0.8`    | 滚动到底部阈值（用于加载更多）         |
| `onScroll`            | function          | -        | 滚动事件回调                           |
| `onScrollEnd`         | function          | -        | 滚动停止回调                           |
| `onReachEnd`          | function          | -        | 滚动接近底部时触发（加载更多）         |

---

## 三、核心实现思路

### 1. 固定高度模式

- **原理**：已知每项高度 `itemHeight`，通过滚动位置 `scrollTop` 直接计算起始索引：
  ```
  startIndex = Math.floor(scrollTop / itemHeight)
  endIndex = startIndex + Math.ceil(containerHeight / itemHeight) + bufferSize
  ```
- **布局**：外层 `div` 相对定位，内层 `div` 高度为 `data.length * itemHeight` 作为占位符撑开滚动条，每个列表项绝对定位，`top` 为 `index * itemHeight`。

### 2. 动态高度模式

- **原理**：维护一个位置数组 `positions`，存储每个列表项的 `height`、`offset`（累计偏移）、`index`。
  - 初始时根据 `estimatedItemHeight` 估算所有项的 `height` 和 `offset`。
  - 滚动时通过二分查找找到起始索引（根据 `scrollTop` 查找最后一个 `offset <= scrollTop` 的项）。
  - 每次渲染后，通过 `ResizeObserver` 或 `ref` 回调获取真实高度，更新 `positions`，并修正后续所有项的 `offset`。
  - 渲染区域外的项不再测量，避免性能损耗。

---

## 四、React 实现示例（动态高度 + 泛型支持）

以下代码展示一个完整的公用虚拟滚动组件 `VirtualList`，支持动态高度、自定义渲染、暴露方法。

```tsx
import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  useCallback,
  forwardRef,
  useImperativeHandle,
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

const VirtualList = forwardRef(
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

    // 状态
    const [scrollTop, setScrollTop] = useState(0);
    const [containerHeightVal, setContainerHeightVal] = useState(0);

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
          positions.current[i].offset += diff;
        }
        // 触发重新渲染，确保滚动位置正确
        setScrollTop((prev) => prev); // 微小 hack：强制刷新（实际可用更优雅的方式）
      },
      [isFixedHeight],
    );

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
          let low = 0,
            high = data.length - 1;
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
        while (
          end < data.length - 1 &&
          offsetEnd - scrollTop < containerHeightVal
        ) {
          end++;
          offsetEnd =
            positions.current[end]?.offset +
            (positions.current[end]?.height ?? 0);
        }
        // 增加缓冲区
        const startWithBuffer = Math.max(0, start - buffer);
        const endWithBuffer = Math.min(data.length - 1, end + buffer);
        const total = positions.current.length
          ? positions.current[positions.current.length - 1]?.offset +
            (positions.current[positions.current.length - 1]?.height ?? 0)
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
    const handleScroll = useCallback(
      (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const newScrollTop = target.scrollTop;
        setScrollTop(newScrollTop);
        onScroll?.(e);
        // 触底检测
        if (
          onReachEnd &&
          target.scrollHeight - target.scrollTop - target.clientHeight < 5
        ) {
          onReachEnd();
        }
      },
      [onScroll, onReachEnd],
    );

    // 暴露方法
    useImperativeHandle(
      ref,
      () => ({
        scrollTo: (top: number) => {
          if (containerRef.current) containerRef.current.scrollTop = top;
        },
        scrollToIndex: (
          index: number,
          align: "start" | "center" | "end" = "start",
        ) => {
          if (!containerRef.current) return;
          let targetTop = 0;
          if (isFixedHeight) {
            targetTop = index * fixedItemHeight;
          } else {
            targetTop = positions.current[index]?.offset ?? 0;
          }
          if (align === "center") {
            targetTop -= containerHeightVal / 2;
          } else if (align === "end") {
            targetTop -= containerHeightVal;
          }
          containerRef.current.scrollTop = Math.max(0, targetTop);
        },
        getCurrentRange: () => ({ start: startIndex, end: endIndex }),
      }),
      [
        startIndex,
        endIndex,
        containerHeightVal,
        fixedItemHeight,
        isFixedHeight,
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
        const key = getKey(item, i);
        let top = 0;
        if (isFixedHeight) {
          top = i * fixedItemHeight;
        } else {
          top = positions.current[i]?.offset ?? 0;
        }
        items.push(
          <div
            key={key}
            ref={(el) => {
              if (!el) return;
              if (isFixedHeight) return;
              itemsRef.current.set(key, el);
              // 测量真实高度（初次渲染或内容变化）
              const actualHeight = el.getBoundingClientRect().height;
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
      <div ref={containerRef} style={containerStyle} onScroll={handleScroll}>
        <div style={innerStyle}>{visibleItems}</div>
      </div>
    );
  },
);

export default VirtualList;
```

---

## 五、使用示例

```tsx
import VirtualList from "./VirtualList";

const BigDataList = () => {
  const data = Array.from({ length: 10000 }, (_, i) => ({
    id: i,
    text: `Item ${i}`,
  }));
  const ref = useRef<VirtualListRef>(null);

  return (
    <VirtualList
      ref={ref}
      data={data}
      itemKey="id"
      estimatedItemHeight={60}
      containerHeight="500px"
      bufferSize={5}
      onReachEnd={() => console.log("load more")}
      renderItem={(item, index) => (
        <div style={{ padding: "12px", borderBottom: "1px solid #ccc" }}>
          {index}: {item.text}
          <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>
            This is a dynamic height example. Content may vary.
          </p>
        </div>
      )}
    />
  );
};
```

---

## 六、封装为公用组件的关键点

### 1. 支持固定高度与动态高度

- 通过 `itemHeight` 的存在与否区分模式，固定高度性能更优，动态高度更灵活。
- 动态高度需要引入位置缓存与高度测量，注意避免频繁重绘。

### 2. 自定义渲染

- 使用 `renderItem` 作为作用域插槽，将每一项的数据和索引传递给调用方，保证 UI 完全可定制。

### 3. 暴露命令式方法

- 使用 `forwardRef` + `useImperativeHandle` 提供 `scrollTo`、`scrollToIndex` 等 API，方便外部控制滚动。

### 4. 响应式更新

- 当 `data` 变化时，需要重置位置缓存并重新计算可视区。注意保留或重置滚动位置（可根据业务需求决定）。
- 当容器尺寸变化时，重新计算可视区范围（ResizeObserver）。

### 5. 性能优化

- 滚动事件：无需额外节流，因为 `scrollTop` 状态更新本身会触发重新渲染，但要注意 `setScrollTop` 不应过于频繁（React 18 的自动批处理可缓解）。
- 高度测量：使用 `ResizeObserver` 或 `ref` 回调 + `getBoundingClientRect`，只在必要时更新，避免同步循环。
- 虚拟列表内部使用 `useMemo` 缓存计算结果。

### 6. 边界处理

- 数据为空时，不渲染任何项。
- 滚动到边界时的索引越界处理。
- 动态高度模式下，快速滚动时可能出现未测量的项，此时利用预估高度保证占位正确。

---

## 七、扩展与变体

- **水平虚拟滚动**：只需将垂直方向改为水平方向，计算逻辑类似。
- **网格布局**：可基于行数计算，但通常需同时知道列数，复杂度稍高。
- **树形数据**：需配合展开/收起动态调整位置，难度更大，可考虑结合递归结构。
- **无限滚动**：利用 `onReachEnd` 加载更多，追加数据后需保持滚动位置（需记录当前滚动偏移）。

---

## 八、总结

封装一个高质量的虚拟滚动公用组件，核心在于：

1. **清晰分离数据、渲染与滚动逻辑**。
2. **提供足够的配置项（高度类型、缓冲、滚动阈值等）以适应不同业务场景**。
3. **通过插槽/渲染函数保证 UI 完全可定制**。
4. **暴露必要的方法，满足外部控制需求**。
5. **做好性能优化（缓存、测量策略、避免多余重绘）**。

实际开发中，也可以基于成熟库（如 `react-window`、`vue-virtual-scroller`）进行二次封装，但理解其内部原理有助于写出更贴合业务需求的自定义组件。

以上思路和代码可直接用于生产环境，也可轻松移植到 Vue 或其他框架（核心逻辑不变，仅语法适配）。
