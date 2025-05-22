import React from "react";
import { SeatingPlanContext } from "../seating-plan";

interface SelectionChipProps {
  id: string,
}

export default function SelectionChip({ id }: SelectionChipProps) {
  const context = React.useContext(SeatingPlanContext);
  if (context === null) {
    return (
      <div>Loading...</div>
    );
  }

  const manager = context.manager;

  function handleZoomIntoSeat() {
    // TODO
  }

  async function handleUnselectSeat() {
    // TODO
  }

  return (
    <div className="flex justify-between items-center">
      <p className="text-white">{id}</p>
      <div className="flex items-center">
        <div onClick={handleZoomIntoSeat}></div>
        <div onClick={handleUnselectSeat}></div>
      </div>
    </div>
  );
}
