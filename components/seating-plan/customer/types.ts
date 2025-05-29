import { BaseSeatingPlanManager, SeatMetadata, SeatSelectionResult, SeatState } from "../types";

export class CustomerSeatingPlanManager extends BaseSeatingPlanManager {
  lastOperation: any
  isolatedSeatIds: Set<string>
  
  constructor(
    seatMap: ReadonlyMap<string, SeatMetadata>,
    initialSeatStateMap: ReadonlyMap<string, SeatState>,
    defaultLevel: string,
    updateContextCallback?: () => void,
  ) {
    super(seatMap, initialSeatStateMap, defaultLevel);
    this.lastOperation = undefined;  // TODO: at this point should be "init" operation
    this.isolatedSeatIds = new Set();
    this.updateIsolatedSeatIdsFromLastOperation();

    if (updateContextCallback) {
      this._updateContext = () => {
        this.updateIsolatedSeatIdsFromLastOperation();
        updateContextCallback();
      }
    }
  }

  updateIsolatedSeatIdsFromLastOperation() {
    return;  // TODO: update from operation "init"/"select"/"unselect"/"taken"/"released"
  }

  checkSeatSelectionValidity(newSeatIds: string[]): SeatSelectionResult[] {
    // TODO: Add logic for ticket category and certain seat types (e.g. wheelchair)
    const results: SeatSelectionResult[] = [];
    newSeatIds.forEach(id => {
      const res = {
        seatId: id,
        success: false,
        failureReason: "",
      }
      if (this.selection.includes(id)) {
        res.failureReason = "Seat is already taken";
      } else {
        res.success = true;
      }
      results.push(res);
    });
    return results;
  }

  async updateTakenStatus(takenStatusMap: Map<string, boolean>): Promise<void> {
    if (Array.from(takenStatusMap.entries()).filter(([id, _]) => !this._seatIds.has(id)).length > 0) {
      throw new Error("Seat not found");
    }
    await this._seatStateMapMutex.withLock(() => {
      takenStatusMap.forEach((taken, id) => {
        const state = this.seatStateMap.get(id)!;
        if (taken && state.selected) {
          // Send signal to notifications
          state.selected = false;
        }
        state.taken = taken;
      })
      this._updateContext();
    })
  }
}
