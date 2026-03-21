import React from "react";
export interface VirtualListRef {
    scrollTo: (scrollTop: number) => void;
    scrollToIndex: (index: number, align?: "start" | "center" | "end") => void;
    getCurrentRange: () => {
        start: number;
        end: number;
    };
}
interface VirtualListProps<T> {
    data: T[];
    itemKey: keyof T | ((item: T, index: number) => string);
    estimatedItemHeight?: number;
    itemHeight?: number;
    containerHeight?: number | string;
    bufferSize?: number;
    overscanCount?: number;
    onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
    onReachEnd?: () => void;
    renderItem: (item: T, index: number) => React.ReactNode;
}
export declare const VirtualList: React.ForwardRefExoticComponent<VirtualListProps<unknown> & React.RefAttributes<VirtualListRef>>;
export {};
