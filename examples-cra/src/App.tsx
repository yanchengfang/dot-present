import { VirtualList } from "@dot-present/virtual-list";
import type { VirtualListRef } from "@dot-present/virtual-list";
import { useMemo, useRef, useState, useEffect } from "react";

const BigDataList = () => {
  const data = useMemo(
    () =>
      Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        text: `Item ${i}`,
      })),
    [],
  );
  const ref = useRef<VirtualListRef>(null);
  const [expandedSet, setExpandedSet] = useState<Set<number>>(new Set());
  useEffect(() => {
    setExpandedSet(() => {
      const next = new Set<number>();
      while (next.size < 600) {
        next.add(Math.floor(Math.random() * data.length));
      }
      return next;
    });
  }, []);

  // const randomExpand = () => {
  //   setExpandedSet(() => {
  //     const next = new Set<number>();
  //     while (next.size < 600) {
  //       next.add(Math.floor(Math.random() * data.length));
  //     }
  //     return next;
  //   });
  // };

  return (
    <div>
      <div style={{ marginBottom: "8px", display: "flex", gap: "8px" }}>
        {/* <button onClick={randomExpand}>随机扩展 600 行</button> */}
        <button onClick={() => setExpandedSet(new Set())}>收起全部</button>
      </div>
      <VirtualList
        ref={ref}
        data={data}
        itemKey={(item) => (item as { id: number }).id.toString()}
        estimatedItemHeight={90}
        containerHeight="500px"
        bufferSize={5}
        onReachEnd={() => console.log("load more")}
        renderItem={(item, index) => {
          const isExpanded = expandedSet.has(index);
          return (
            <div
              style={{
                padding: "12px",
                borderBottom: "1px solid #ccc",
                background: isExpanded ? "#f7fbff" : "#fff",
              }}
            >
              {index}: {(item as { text: string }).text}
              <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#666" }}>
                Base line
              </p>
              {isExpanded ? (
                <div style={{ marginTop: "8px", color: "#333" }}>
                  {Array.from({ length: 8 }, (_, i) => (
                    <p key={i} style={{ margin: "4px 0", fontSize: "12px" }}>
                      Dynamic content line {i + 1}
                    </p>
                  ))}
                </div>
              ) : null}
            </div>
          );
        }}
      />
      <div style={{ marginTop: "8px", fontSize: "12px", color: "#666" }}>
        当前扩展行数: {expandedSet.size}
      </div>
    </div>
  );
};
export default function App() {
  return (
    <div>
      <BigDataList />
    </div>
  );
}
