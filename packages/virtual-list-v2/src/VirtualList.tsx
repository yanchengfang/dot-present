/**
 * Vue 3 + JSX 虚拟列表：支持固定行高与动态行高（ResizeObserver 测量修正偏移）。
 */
import {
  defineComponent,
  ref,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  type PropType,
  type VNodeChild,
} from "vue";

/** 动态高度模式下的位置缓存 */
interface Position {
  index: number;
  height: number;
  offset: number;
}

/** 通过 ref 调用的实例方法 */
export interface VirtualListExpose {
  scrollTo: (scrollTop: number) => void;
  scrollToIndex: (index: number, align?: "start" | "center" | "end") => void;
  getCurrentRange: () => { start: number; end: number };
}

export default defineComponent({
  name: "DotVirtualList",
  props: {
    data: { type: Array as PropType<unknown[]>, required: true },
    itemKey: {
      type: [String, Function] as PropType<
        string | ((item: unknown, index: number) => string)
      >,
      required: true,
    },
    estimatedItemHeight: { type: Number, default: 50 },
    itemHeight: { type: Number, default: undefined },
    containerHeight: {
      type: [Number, String] as PropType<number | string>,
      default: "100%",
    },
    bufferSize: { type: Number, default: 3 },
    overscanCount: { type: Number, default: undefined },
    onScroll: {
      type: Function as PropType<(e: Event) => void>,
      default: undefined,
    },
    onReachEnd: { type: Function as PropType<() => void>, default: undefined },
    renderItem: {
      type: Function as PropType<
        (item: unknown, index: number) => VNodeChild
      >,
      required: true,
    },
  },
  setup(props, { expose }) {
    const fixedItemHeight = computed(() => props.itemHeight);
    const isFixedHeight = computed(() => fixedItemHeight.value !== undefined);
    const buffer = computed(
      () => props.overscanCount ?? props.bufferSize,
    );

    const containerRef = ref<HTMLDivElement | null>(null);
    const itemObserversRef = new Map<string, ResizeObserver>();
    const isNearEndRef = ref(false);

    const scrollTop = ref(0);
    const containerHeightVal = ref(0);
    /** 动态高度测量后递增，驱动可视区与 translateY 同步 */
    const measureVersion = ref(0);

    const positions = ref<Position[]>([]);

    const parsedContainerHeight = computed(() => {
      const ch = props.containerHeight;
      if (typeof ch === "number") return ch;
      if (typeof ch === "string") {
        const matched = ch.trim().match(/^(\d+(?:\.\d+)?)px$/i);
        if (matched) return Number(matched[1]);
      }
      return 0;
    });

    const rebuildPositions = () => {
      if (isFixedHeight.value) return;
      let offset = 0;
      positions.value = props.data.map((_, idx) => {
        const height = props.estimatedItemHeight;
        const pos: Position = { index: idx, height, offset };
        offset += height;
        return pos;
      });
    };

    watch(
      () => [props.data, props.estimatedItemHeight, isFixedHeight.value] as const,
      () => {
        rebuildPositions();
      },
      { immediate: true, deep: true },
    );

    const updateItemHeight = (index: number, newHeight: number) => {
      if (isFixedHeight.value) return;
      const list = positions.value;
      const pos = list[index];
      if (!pos || pos.height === newHeight) return;
      const oldHeight = pos.height;
      pos.height = newHeight;
      const diff = newHeight - oldHeight;
      for (let i = index + 1; i < list.length; i++) {
        const p = list[i];
        if (p) p.offset += diff;
      }
      measureVersion.value++;
    };

    const disconnectObservers = () => {
      itemObserversRef.forEach((ro) => ro.disconnect());
      itemObserversRef.clear();
    };

    let resizeObserverCleanup: (() => void) | undefined;

    onMounted(() => {
      const el = containerRef.value;
      if (el && el.clientHeight > 0) {
        containerHeightVal.value = el.clientHeight;
      }
      if (!el) return;
      const ro = new ResizeObserver((entries) => {
        const first = entries[0];
        if (first) {
          containerHeightVal.value = first.contentRect.height;
        }
      });
      ro.observe(el);
      resizeObserverCleanup = () => ro.disconnect();
    });

    onBeforeUnmount(() => {
      resizeObserverCleanup?.();
      disconnectObservers();
    });

    const rangeState = computed(() => {
      measureVersion.value;
      const data = props.data;
      if (data.length === 0) {
        return { startIndex: 0, endIndex: -1, totalHeight: 0 };
      }
      const est = props.estimatedItemHeight;
      const effectiveContainerHeight =
        containerHeightVal.value > 0
          ? containerHeightVal.value
          : parsedContainerHeight.value > 0
            ? parsedContainerHeight.value
            : est * 8;

      const buf = buffer.value;
      const st = scrollTop.value;

      if (isFixedHeight.value) {
        const ih = fixedItemHeight.value!;
        const start = Math.max(0, Math.floor(st / ih) - buf);
        const visibleCount = Math.max(
          1,
          Math.ceil(effectiveContainerHeight / ih),
        );
        const end = Math.min(data.length - 1, start + visibleCount + buf);
        const total = data.length * ih;
        return { startIndex: start, endIndex: end, totalHeight: total };
      }

      const list = positions.value;
      const findStartIndex = (top: number) => {
        let low = 0;
        let high = data.length - 1;
        let ans = 0;
        while (low <= high) {
          const mid = Math.floor((low + high) / 2);
          const off = list[mid]?.offset ?? 0;
          if (off <= top) {
            ans = mid;
            low = mid + 1;
          } else {
            high = mid - 1;
          }
        }
        return ans;
      };
      const start = findStartIndex(st);
      let end = start;
      const startPos = list[start];
      let offsetEnd =
        (startPos?.offset ?? 0) + (startPos?.height ?? 0);
      while (
        end < data.length - 1 &&
        offsetEnd - st < effectiveContainerHeight
      ) {
        end++;
        const p = list[end];
        offsetEnd = (p?.offset ?? 0) + (p?.height ?? 0);
      }
      const startWithBuffer = Math.max(0, start - buf);
      const endWithBuffer = Math.min(data.length - 1, end + buf);
      const total =
        list.length > 0
          ? (() => {
              const last = list[list.length - 1];
              return (last?.offset ?? 0) + (last?.height ?? 0);
            })()
          : 0;
      return {
        startIndex: startWithBuffer,
        endIndex: endWithBuffer,
        totalHeight: total,
      };
    });

    const startIndex = computed(() => rangeState.value.startIndex);
    const endIndex = computed(() => rangeState.value.endIndex);
    const totalHeight = computed(() => rangeState.value.totalHeight);

    const handleScroll = (e: Event) => {
      const target = e.target as HTMLDivElement;
      const newTop = target.scrollTop;
      scrollTop.value = newTop;
      props.onScroll?.(e);
      const nearEnd =
        target.scrollHeight - target.scrollTop - target.clientHeight < 5;
      if (props.onReachEnd && nearEnd && !isNearEndRef.value) {
        isNearEndRef.value = true;
        props.onReachEnd();
      } else if (!nearEnd) {
        isNearEndRef.value = false;
      }
    };

    const getKey = (item: unknown, idx: number): string => {
      const ik = props.itemKey;
      if (typeof ik === "function") return ik(item, idx);
      const rec = item as Record<string, unknown>;
      return rec[ik as string]?.toString() ?? `item_${idx}`;
    };

    const setItemRef = (
      el: Element | null,
      i: number,
      key: string,
    ) => {
      if (isFixedHeight.value) return;
      if (!el) {
        const prev = itemObserversRef.get(key);
        if (prev) {
          prev.disconnect();
          itemObserversRef.delete(key);
        }
        return;
      }
      const htmlEl = el as HTMLElement;
      const prevObs = itemObserversRef.get(key);
      if (prevObs) prevObs.disconnect();
      const ro = new ResizeObserver((entries) => {
        const h = entries[0]?.contentRect.height;
        if (h && h > 0) updateItemHeight(i, h);
      });
      ro.observe(el);
      itemObserversRef.set(key, ro);
      const actualHeight = htmlEl.getBoundingClientRect().height;
      if (
        actualHeight &&
        positions.value[i]?.height !== actualHeight
      ) {
        updateItemHeight(i, actualHeight);
      }
    };

    expose({
      scrollTo: (top: number) => {
        const el = containerRef.value;
        if (!el) return;
        const safe = Math.max(0, top);
        el.scrollTop = safe;
        scrollTop.value = safe;
      },
      scrollToIndex: (
        index: number,
        align: "start" | "center" | "end" = "start",
      ) => {
        const el = containerRef.value;
        const data = props.data;
        if (!el || data.length === 0) return;
        const safeIndex = Math.min(Math.max(0, index), data.length - 1);
        let targetTop = 0;
        if (isFixedHeight.value) {
          targetTop = safeIndex * fixedItemHeight.value!;
        } else {
          targetTop = positions.value[safeIndex]?.offset ?? 0;
        }
        const targetHeight = isFixedHeight.value
          ? fixedItemHeight.value!
          : (positions.value[safeIndex]?.height ?? props.estimatedItemHeight);
        const ch = containerHeightVal.value;
        if (align === "center") {
          targetTop -= (ch - targetHeight) / 2;
        } else if (align === "end") {
          targetTop -= ch - targetHeight;
        }
        const safeTop = Math.max(0, targetTop);
        el.scrollTop = safeTop;
        scrollTop.value = safeTop;
      },
      getCurrentRange: () => ({
        start: startIndex.value,
        end: endIndex.value,
      }),
    });

    return () => {
      const data = props.data;
      const ih = fixedItemHeight.value;
      const fixed = isFixedHeight.value;
      const list = positions.value;
      const items: unknown[] = [];
      const si = startIndex.value;
      const ei = endIndex.value;

      for (let i = si; i <= ei && i < data.length; i++) {
        const item = data[i];
        if (item === undefined) continue;
        const key = getKey(item, i);
        let top = 0;
        if (fixed) {
          top = i * ih!;
        } else {
          top = list[i]?.offset ?? 0;
        }
        items.push(
          <div
            key={key}
            ref={(el) => {
              const node =
                el instanceof HTMLElement
                  ? el
                  : el && typeof el === "object" && "$el" in el
                    ? ((el as { $el?: HTMLElement }).$el ?? null)
                    : null;
              setItemRef(node, i, key);
            }}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              transform: `translateY(${top}px)`,
            }}
          >
            {props.renderItem(item, i)}
          </div>,
        );
      }

      const ch = props.containerHeight;
      const containerStyle = {
        height: typeof ch === "number" ? `${ch}px` : ch,
        overflowY: "auto" as const,
        position: "relative" as const,
      };
      const innerStyle = {
        position: "relative" as const,
        height: `${totalHeight.value}px`,
        width: "100%",
      };

      return (
        <div ref={containerRef} style={containerStyle} onScroll={handleScroll}>
          <div style={innerStyle}>{items}</div>
        </div>
      );
    };
  },
});
