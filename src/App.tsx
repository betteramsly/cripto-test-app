import { useEffect, useState } from "react";
import styles from "./App.module.scss";

import { GraphControls } from "./components/GraphControls/GraphControls";
import { GraphCanvas } from "./components/GraphCanvas/GraphCanvas";

import { useGraphActions } from "./feature/graph/graphSlice";

function App() {
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [displayMode, setDisplayMode] = useState<"token" | "usd">("token");
  const { fetchGraphData } = useGraphActions();

  useEffect(() => {
    fetchGraphData("0x0000");
  }, []);

  const handleFetchGraphData = (address: string) => {
    setSelectedAddress(address);
    fetchGraphData(address);
  };

  return (
    <div className={styles.wrapper}>
      <div className="p-4">
        <br />
        <GraphControls
          fetchGraphData={handleFetchGraphData}
          setDisplayMode={setDisplayMode}
          displayMode={displayMode}
        />
        <br />
        <GraphCanvas
          handleFetchGraphData={handleFetchGraphData}
          selectedAddress={selectedAddress}
          displayMode={displayMode}
        />
      </div>
    </div>
  );
}

export default App;
