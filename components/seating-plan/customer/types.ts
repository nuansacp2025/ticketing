import { BaseSeatingPlanManager, BaseSeatState, SeatSelectionResult } from "../types";

export class CustomerSeatingPlanManager extends BaseSeatingPlanManager<BaseSeatState> {
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
    })
  }
}
