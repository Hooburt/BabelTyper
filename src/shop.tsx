import { useState, useEffect, RefObject, use } from "react";
import { useGame } from "./GameContext";
import { Upgrade } from "./engine";

interface ShopProps {
  className: string;
  trackSelectNum: number;
  rangeNum: number;
  incrNum: number;
}

const ShopMenu = ({
  className,
  trackSelectNum,
  rangeNum,
  incrNum,
}: ShopProps) => {
  const { engineRef, upgrades } = useGame();

  function buildUpgradeList() {
    if (!engineRef.current) {
      return (
        <div>
          <p>Loading engine...</p>
        </div>
      );
    }
    return upgrades.map((upg) => (
      <div key={upg.id} className="inlinerow">
        <p>{upg.description}</p>
        <p>Cost: {upg.costCalculation(incrNum)}</p>
        <p>Owned: {upg.owned}</p>
      </div>
    ));
  }

  const trackCost = 10;
  let totalTrackCost = trackCost * incrNum;

  useEffect(() => {
    totalTrackCost = trackCost * incrNum;
  }, [incrNum]);

  return (
    <div className={className}>
      <p>Use upper/lower case to manipulate [T]rack, [R]ange and [I]ncrement</p>
      <p>Increment: {incrNum.toString().padStart(2, "0")}</p>
      <p>
        Upgrade track {trackSelectNum.toString().padStart(3, "0")} and{" "}
        {rangeNum.toString().padStart(3, "0")} following.
      </p>
      <hr />
      <div className="">{buildUpgradeList()}</div>
    </div>
  );
};

export default ShopMenu;
