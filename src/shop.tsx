import {useState, useEffect, RefObject, use} from "react";
import { Engine } from "./engine";
import { Upgrade } from "./engine";
import { KeyEvent } from "./app";

interface ShopProps {
	className: string;
	trackSelectNum: number;
	rangeNum: number;
	incrNum: number;
	engineRef: React.RefObject<Engine | null>;
} 

const ShopMenu = ({className, engineRef, trackSelectNum, rangeNum, incrNum}:ShopProps) => {

	const [upgradeList, setUpgradeList] = useState<Upgrade[]>([]);
	const [engineReady, setEngineReady] = useState(false);
	let compiledUpgList;
	useEffect(() => {
		const checkEngine = () => {
			if (!engineRef.current) {
				console.log("Engine not loaded in shop!");
				return;
			}
			console.log("Engine successfully loaded in shop");
		};
		
		checkEngine();
		
		const interval = setInterval(() => {
			if (engineRef.current) {
			console.log("Engine successfully loaded in shop");
			clearInterval(interval);
			}
		}, 100);
	  
		return () => clearInterval(interval);
	}, []);

	useEffect(() => {
		const checkEngine = setInterval(() => {
			if(engineRef.current) {
				setEngineReady(true);

				engineRef.current.onUpgradeChange = (upgrades: Upgrade[]) => {
					setUpgradeList(upgrades);
				};

				setUpgradeList([...engineRef.current.getUpgradeList()]);
				clearInterval(checkEngine);
			}
		}, 50);
	
		return () => clearInterval(checkEngine);
	}, [engineRef]);

	function buildUpgradeList() {
		if (!engineRef.current) {
			return <div><p>Loading engine...</p></div>;
		}
		return upgradeList.map((upg) => (
			<div key={upg.id} className="inlinerow">
				<p>{upg.description}</p>
				<p>Cost: {upg.costCalculation(incrNum)}</p>
				<p>Owned: {upg.owned}</p>
			</div>
		));
	}

	const trackCost = 10
	let totalTrackCost = trackCost * incrNum; 

	useEffect(() => {
		totalTrackCost = trackCost * incrNum;
	}, [incrNum])

	return(
		<div className={className}>
			<p>Use upper/lower case to manipulate [T]rack, [R]ange and [I]ncrement</p>
			<p>Increment: {incrNum.toString().padStart(2, "0")}</p>
			<p>Upgrade track {trackSelectNum.toString().padStart(3, "0")} and {rangeNum.toString().padStart(3, "0")} following.</p>
			<div className="inlinerow">
				{buildUpgradeList()}
			</div>
		</div>
	)
}

export default ShopMenu;