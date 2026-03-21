import { VirtualList } from "@dot-present/virtual-list";
import type { VirtualListRef } from "@dot-present/virtual-list";
import { useRef } from "react";

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
      itemKey={(item) => (item as { id: number }).id.toString()}
      estimatedItemHeight={60}
      containerHeight="500px"
      bufferSize={5}
      onReachEnd={() => console.log("load more")}
      renderItem={(item, index) => (
        <div style={{ padding: "12px", borderBottom: "1px solid #ccc" }}>
          {index}: {(item as { text: string }).text}
          <p style={{ margin: 0, fontSize: "12px", color: "#666" }}>
            This is a dynamic height example. Content may vary.
          </p>
        </div>
      )}
    />
  );
};
export default function App() {
  return (
    <div>
      <BigDataList />
    </div>
  );
}
