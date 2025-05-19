import { Mutex } from "@/lib/utils";

export interface SeatMetadata {
  location: {
    x: number,
    y: number,
  },
  selectable: boolean,
  type: SeatType,
  group: SeatGroup,
}

export interface SeatType {
  label: string,
  style: {
    className: string,
  },
}

export interface SeatGroup {
  label: string,
}

export class BaseSeatState {
  selected: boolean
  taken: boolean

  constructor(selected: boolean, taken: boolean) {
    this.selected = selected;
    this.taken = taken;
  }
}

interface RectangleBoundary {
  x: {
    start: number,
    end: number,
  },
  y: {
    start: number,
    end: number,
  },
}

interface SeatGroupMetadata {
  location: RectangleBoundary,
}

interface SeatSelectionResult {
  seatId: string,
  success: boolean,
  failureReason: string,
}

export class BaseSeatingPlanManager<T extends BaseSeatState> {
  seatMap: Map<string, SeatMetadata>
  seatStateMap: Map<string, T>

  view: RectangleBoundary
  maxView: RectangleBoundary

  _seatIds: Set<string>
  _groups: Set<SeatGroup>
  _groupMetadataMap: Map<SeatGroup, SeatGroupMetadata>

  _seatStateMapMutex: Mutex

  constructor(
    seatMap: ReadonlyMap<string, SeatMetadata>,
    initialSeatStateMap: ReadonlyMap<string, T>,
    maxView?: RectangleBoundary,
    seatGroupMetadataMap?: ReadonlyMap<SeatGroup, SeatGroupMetadata>,
  ) {
    this.seatMap = new Map(seatMap);
    this.seatStateMap = new Map(initialSeatStateMap);

    if (maxView) {
      // TODO: check maxView is valid
      this.maxView = maxView;
    } else {
      this.maxView = this.inferMaxView();
    }
    this.view = this.maxView;

    this._seatIds = new Set(this.seatStateMap.keys());
    Array.from(this.seatMap.keys()).forEach(key => {
      if (!this._seatIds.has(key)) {
        throw new Error("Missing seat state detected");
      }
    })

    this._groups = new Set<SeatGroup>(Array.from(this.seatMap.values()).map(seatData => seatData.group));
    if (seatGroupMetadataMap) {
      // TODO: check location for each metadata is valid
      this._groupMetadataMap = new Map(seatGroupMetadataMap);
    } else {
      this._groupMetadataMap = new Map();
      this._groups.forEach(group => {
        this._groupMetadataMap.set(group, this.inferGroupMetadata(group));
      })
    }
    
    this._seatStateMapMutex = new Mutex();
  }

  private inferMaxView(): RectangleBoundary {
    return {
      x: { start: 0, end: 0 },
      y: { start: 0, end: 0 },
    };
  }

  private inferGroupMetadata(seatGroup: SeatGroup): SeatGroupMetadata {
    // Calculates the best x and y boundaries for a certain seat group.
    // TODO: Implement this.
    return {
      location: {
        x: { start: 0, end: 0 },
        y: { start: 0, end: 0 },
      },
    }
  }

  checkSeatSelectionValidity(newSeatIds: string[]): SeatSelectionResult[] {
    throw new Error("This method should be implemented in the subclass")
  }

  async updateTakenStatus(takenStatusMap: Map<string, boolean>): Promise<void> {
    throw new Error("This method should be implemented in the subclass")
  }

  async getSelection(): Promise<string[]> {
    return await this._seatStateMapMutex.withLock(() => {
      return Array.from(this.seatStateMap.entries())
        .filter(([_, state]) => state.selected)
        .map(([id, _]) => id);
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
        }
      });
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
        this.seatStateMap.get(id)!.selected = true;
      });
    });
  }

  async unselectAllSeats(): Promise<void> {
    await this.unselectSeats(Array.from(this.seatMap.keys()));
  }

  setViewToGroup(group: SeatGroup) {
    if (!this._groups.has(group)) {
      throw new Error("Group not found");
    }
    this.view = this._groupMetadataMap.get(group)!.location;
  }

  resetView() {
    this.view = this.maxView;
  }
}
