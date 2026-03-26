import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useChatAutoCompact } from "./useChatAutoCompact.js";

describe("useChatAutoCompact", () => {
  describe("initial state", () => {
    it("defaults to false when no initialValue provided", () => {
      const { result } = renderHook(() => useChatAutoCompact());
      expect(result.current.autoCompact).toBe(false);
    });

    it("initializes to true when initialValue is true", () => {
      const { result } = renderHook(() =>
        useChatAutoCompact({ initialValue: true }),
      );
      expect(result.current.autoCompact).toBe(true);
    });
  });

  describe("toggleAutoCompact", () => {
    it("toggles from false to true", () => {
      const { result } = renderHook(() => useChatAutoCompact());

      act(() => {
        result.current.toggleAutoCompact();
      });

      expect(result.current.autoCompact).toBe(true);
    });

    it("toggles back to false on second call", () => {
      const { result } = renderHook(() =>
        useChatAutoCompact({ initialValue: true }),
      );

      act(() => {
        result.current.toggleAutoCompact();
      });

      expect(result.current.autoCompact).toBe(false);
    });

    it("calls onChange with the new value on each toggle", () => {
      const onChange = vi.fn();
      const { result } = renderHook(() =>
        useChatAutoCompact({ initialValue: false, onChange }),
      );

      act(() => {
        result.current.toggleAutoCompact();
      });
      expect(onChange).toHaveBeenCalledWith(true);

      act(() => {
        result.current.toggleAutoCompact();
      });
      expect(onChange).toHaveBeenCalledWith(false);
    });
  });

  describe("autoCompactRef", () => {
    it("ref reflects current autoCompact value after toggle", () => {
      const { result } = renderHook(() => useChatAutoCompact());

      expect(result.current.autoCompactRef.current).toBe(false);

      act(() => {
        result.current.toggleAutoCompact();
      });

      expect(result.current.autoCompactRef.current).toBe(true);
    });
  });
});
