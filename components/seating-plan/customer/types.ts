import { BaseSeatingPlanManager, SeatMetadata, SeatSelectionWarning, SeatState } from "../types";

export class CustomerSeatingPlanManager extends BaseSeatingPlanManager {
  isolatedSeatIds: string[]

  constructor(
    seatMap: ReadonlyMap<string, SeatMetadata>,
    initialSeatStateMap: ReadonlyMap<string, SeatState>,
    defaultLevel: string,
    updateContextCallback?: () => void,
  ) {
    super(seatMap, initialSeatStateMap, defaultLevel, updateContextCallback);
    this.isolatedSeatIds = [];
    this.auditSeatSelection();
  }

  auditSeatSelection(newSeatIds?: string[]): SeatSelectionWarning[] {
    const warnings: SeatSelectionWarning[] = [];

    this.selection = this.selection.filter(id => {
      const state = this.seatStateMap.get(id)!;
      if (state.taken) {
        state.selected = false;
        warnings.push({ id, type: "SEAT_TAKEN" });
        return false;
      }
      return true;
    });

    // TODO: implement logic for MAX_CAT_LIMIT_EXCEEDED

    const selectedOrTaken = (state: SeatState) => state.selected || state.taken;
    this.isolatedSeatIds = Array.from(this.seatMap.entries()).filter(([id, data]) => {
      if (selectedOrTaken(this.seatStateMap.get(id)!)) return false;
      const left = (data.leftId === null) || selectedOrTaken(this.seatStateMap.get(data.leftId)!)
      const right = (data.rightId === null) || selectedOrTaken(this.seatStateMap.get(data.rightId)!)
      return (data.leftId !== null || data.rightId !== null) && left && right;
    }).map(([id, _]) => {
      // warnings.push({ id, type: "SEAT_ISOLATED" });
      return id;
    });

    return warnings;
  }
}
