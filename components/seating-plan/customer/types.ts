import { BaseSeatingPlanManager, UISeatMetadata, UISeatSelectionWarning, UISeatState } from "../types";

export class CustomerSeatingPlanManager extends BaseSeatingPlanManager {
  maxSeatsPerCategory: Map<string, number>

  isolatedSeatIds: string[]

  constructor(
    seatMap: ReadonlyMap<string, UISeatMetadata>,
    initialSeatStateMap: ReadonlyMap<string, UISeatState>,
    defaultLevel: string,
    maxSeatsPerCategory: Map<string, number>,
    updateContextCallback?: () => void,
  ) {
    // Assumes initialSeatStateMap is valid
    super(seatMap, initialSeatStateMap, defaultLevel, updateContextCallback);
    this.maxSeatsPerCategory = maxSeatsPerCategory;
    this.isolatedSeatIds = [];
  }

  auditSeatSelection(newSeatIds?: string[]): UISeatSelectionWarning[] {
    // Assumes the previous value of `manager.selection` is valid (which is true,
    // under normal circumstances)

    const warnings: UISeatSelectionWarning[] = [];

    // Check whether adding new seats will exceed the limit set for each category
    if (newSeatIds !== undefined) {
      const categories = this.selection.map(id => this.seatMap.get(id)!.category);
      const categoryCounts = new Map(Array.from(this.maxSeatsPerCategory.keys()).map(category => {
        return [category, categories.filter(cat => cat === category).length];
      }));
      const max = Array.from(this.maxSeatsPerCategory.entries());
      if (!(max.every(([cat, count]) => (count >= categoryCounts.get(cat)!)))) {
        this.selection = this.selection.filter(id => !newSeatIds.includes(id));
        newSeatIds.forEach(id => {
          this.seatStateMap.get(id)!.selected = false;
          warnings.push({ id, type: "MAX_CAT_LIMIT_EXCEEDED" });
        });
      }
    }

    // Check if a selected seat was taken and update to UI is needed
    this.selection = this.selection.filter(id => {
      const state = this.seatStateMap.get(id)!;
      if (state.taken) {
        state.selected = false;
        warnings.push({ id, type: "SEAT_TAKEN" });
        return false;
      }
      return true;
    });

    // Updates the isolated seats
    const selectedOrTaken = (state: UISeatState) => state.selected || state.taken;
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
