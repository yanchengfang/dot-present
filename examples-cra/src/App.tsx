import { VirtualList } from "@dot-present/virtual-list";
// 原包未导出 VirtualListRef，使用 any 作为 ref 类型
// type VirtualListRef = any;
import { useRef } from "react";

export default function App() {
  return (
    <div>
      <VirtualList />
    </div>
  );
}
