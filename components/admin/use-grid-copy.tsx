import { useCallback, RefObject } from 'react';
import type { GridApi } from 'ag-grid-community';

export function useGridCopy(gridApi: RefObject<GridApi | null>) {
  return useCallback((e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'c') {
      const selection = window.getSelection();
      if (selection && !selection.isCollapsed) return;

      const api = gridApi.current;
      if (!api) return;
      const focused = api.getFocusedCell();
      if (!focused) return;
      const rowNode = api.getDisplayedRowAtIndex(focused.rowIndex);
      const value = rowNode?.data?.[focused.column.getColId()];
      if (value == null) return;
      const text = String(value);
      navigator.clipboard?.writeText(text).catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        try { document.execCommand('copy'); } catch { /* noop */ }
        document.body.removeChild(textarea);
      });
    }
  }, [gridApi]);
}
