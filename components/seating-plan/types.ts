import { Mutex } from "@/lib/utils";
import React, { ReactNode } from "react";

export interface UISeatMetadata {
  label: string
  location: {
    x: number,
    y: number,
    rot: number,  // in degrees, clockwise
  },
  notSelectable: boolean,
  level: string,
  category: string,
  leftId: string | null,
  rightId: string | null,
}

export interface UICategoryMetadata {
  label: string,
  description: string,
  style: {
    width: number,
    height: number,
  },
  themes: {
    notSelectable: React.FC<{ children?: ReactNode }>,
    taken: React.FC<{ children?: ReactNode }>,
    selected: React.FC<{ children?: ReactNode }>,
    default: React.FC<{ children?: ReactNode }>,
  },
}

export interface UILevelMetadata {
  label: string,
  levelSvgUrl: string,
  levelMinimapImgUrl: string,
}

export interface UISeatState {
  selected: boolean
  taken: boolean
}

export interface UISeatSelectionWarning {
  id: string,
  type: string,
}

export class BaseSeatingPlanManager {
  seatMap: Map<string, UISeatMetadata>
  seatStateMap: Map<string, UISeatState>

  currentLevel: string

  selection: string[]

  _seatIds: Set<string>
  _seatStateMapMutex: Mutex
  _updateContext: () => void

  constructor(
    seatMap: ReadonlyMap<string, UISeatMetadata>,
    initialSeatStateMap: ReadonlyMap<string, UISeatState>,
    defaultLevel: string,
    updateContextCallback?: () => void,
  ) {
    this.seatMap = new Map(seatMap);
    this.seatStateMap = new Map(initialSeatStateMap);
    
    this.currentLevel = defaultLevel;

    this.selection = Array.from(this.seatStateMap.entries())
      .filter(([_, state]) => state.selected).map(([id, _]) => id);

    this._seatIds = new Set(this.seatStateMap.keys());
    Array.from(this.seatMap.keys()).forEach(key => {
      if (!this._seatIds.has(key)) {
        throw new Error("Missing seat state detected");
      }
    });
    
    this._seatStateMapMutex = new Mutex();

    this._updateContext = updateContextCallback ?? (() => {});
  }

  auditSeatSelection(newSeatIds?: string[]): UISeatSelectionWarning[] {
    // This method is triggered after every operation that can potentially invalidate
    // the selection. It should unselect seats which require immediate fixing, and
    // return warnings for problematic seats (a seat that either was unselected or
    // is related to a violation of some business logic).

    // `newSeatIds` contain the seats that are newly selected since the last audit.
    // When it is provided, if unselecting seats is necessary, the method should
    // prioritize unselecting these seats where possible.

    // The method should return an empty array if and only if the selection is valid
    // for reservation at that point in time.
    throw new Error("This method should be implemented in the subclass")
  }

  async updateTakenStatus(takenStatusMap: Map<string, boolean>): Promise<UISeatSelectionWarning[]> {
    // Assumes `takenStatusMap` keys are valid
    return await this._seatStateMapMutex.withLock(() => {
      takenStatusMap.forEach((taken, id) => {
        this.seatStateMap.get(id)!.taken = taken;
      })
      const warnings = this.auditSeatSelection();

      this._updateContext();
      return warnings;
    });
  }

  async getSelection(): Promise<string[]> {
    // Ensures selection is not retrieved in between potentially invalidating operations.
    return await this._seatStateMapMutex.withLock(() => {
      return Array.from(this.selection);
    });
  }

  async selectSeat(seatId: string): Promise<UISeatSelectionWarning[]> {
    return await this.selectSeats([seatId]);
  }

  async selectSeats(seatIds: string[]): Promise<UISeatSelectionWarning[]> {
    // Assumes `seatIds` is valid
    return await this._seatStateMapMutex.withLock(() => {
      const warnings: UISeatSelectionWarning[] = [];
      seatIds.forEach(seatId => {
        this.seatStateMap.get(seatId)!.selected = true;
        this.selection.push(seatId);
      });
      warnings.push(...this.auditSeatSelection(seatIds));

      this._updateContext();
      return warnings;
    });
  }

  async unselectSeat(seatId: string): Promise<UISeatSelectionWarning[]> {
    return await this.unselectSeats([seatId]);
  }

  async unselectSeats(seatIds: string[]): Promise<UISeatSelectionWarning[]> {
    // Assumes `seatIds` is valid
    return await this._seatStateMapMutex.withLock(() => {
      seatIds.forEach(id => {
        this.seatStateMap.get(id)!.selected = false;
      });
      this.selection = this.selection.filter(id => !seatIds.includes(id));
      const warnings = this.auditSeatSelection()

      this._updateContext();
      return warnings;
    });
  }

  async unselectAllSeats(): Promise<UISeatSelectionWarning[]> {
    return await this.unselectSeats(Array.from(this.seatMap.keys()));
  }

  setCurrentLevel(level: string) {
    this.currentLevel = level;
    this._updateContext();
  }
}

export interface SeatingPlanContextType<T extends BaseSeatingPlanManager> {
  width: number,
  height: number,
  levels: Map<string, UILevelMetadata>
  categories: Map<string, UICategoryMetadata>

  manager: T,
  seatSelectionWarningsHandler: (warnings: UISeatSelectionWarning[]) => Promise<void> | void,
  SeatComponent: React.FC<{ id: string }>,
}
