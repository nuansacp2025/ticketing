import { Mutex } from "@/lib/utils";
import { ReactNode } from "react";

export interface SeatMetadata {
  location: {
    x: number,
    y: number,
    rot: number,  // in degrees, clockwise
  },
  notSelectable: boolean,
  type: SeatType,
}

export interface SeatType {
  label: string,
  style: {
    width: number,
    height: number,
  },
  themes: {
    notSelectable: React.FunctionComponent<{ children: ReactNode }>,
    taken: React.FunctionComponent<{ children: ReactNode }>,
    selected: React.FunctionComponent<{ children: ReactNode }>,
    default: React.FunctionComponent<{ children: ReactNode }>,
  },
}

export interface BaseSeatState {
  selected: boolean
  taken: boolean
}

export interface SeatSelectionResult {
  seatId: string,
  success: boolean,
  failureReason: string,
}

export class BaseSeatingPlanManager<T extends BaseSeatState> {
  seatMap: Map<string, SeatMetadata>
  seatStateMap: Map<string, T>

  selection: string[]

  _seatIds: Set<string>
  _seatStateMapMutex: Mutex
  _updateContext: () => void

  constructor(
    seatMap: ReadonlyMap<string, SeatMetadata>,
    initialSeatStateMap: ReadonlyMap<string, T>,
    updateContextCallback?: () => void,
  ) {
    this.seatMap = new Map(seatMap);
    this.seatStateMap = new Map(initialSeatStateMap);

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

  checkSeatSelectionValidity(newSeatIds: string[]): SeatSelectionResult[] {
    throw new Error("This method should be implemented in the subclass")
  }

  async updateTakenStatus(takenStatusMap: Map<string, boolean>): Promise<void> {
    throw new Error("This method should be implemented in the subclass")
  }

  async getSelection(): Promise<string[]> {
    return await this._seatStateMapMutex.withLock(() => {
      return Array.from(this.selection);
    });
  }

  async selectSeat(seatId: string): Promise<SeatSelectionResult> {
    return (await this.selectSeats([seatId]))[0];
  }

  async selectSeats(seatIds: string[]): Promise<SeatSelectionResult[]> {
    if (seatIds.filter((id, _) => !this._seatIds.has(id)).length > 0) {
      throw new Error("Seat not found")
    }
    return await this._seatStateMapMutex.withLock(() => {
      const results = this.checkSeatSelectionValidity(seatIds);
      results.forEach(({ seatId, success }) => {
        if (success) {
          this.seatStateMap.get(seatId)!.selected = true;
          this.selection.push(seatId);
        }
      });
      this._updateContext();
      return results;
    });
  }

  async unselectSeat(seatId: string): Promise<void> {
    await this.unselectSeats([seatId]);
  }

  async unselectSeats(seatIds: string[]): Promise<void> {
    if (seatIds.filter(id => !this._seatIds.has(id)).length > 0) {
      throw new Error("Seat not found")
    }
    return await this._seatStateMapMutex.withLock(() => {
      seatIds.forEach(id => {
        this.seatStateMap.get(id)!.selected = false;
      });
      this.selection = this.selection.filter(id => !seatIds.includes(id));
      this._updateContext();
    });
  }

  async unselectAllSeats(): Promise<void> {
    await this.unselectSeats(Array.from(this.seatMap.keys()));
  }
}
