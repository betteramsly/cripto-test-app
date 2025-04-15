import { useEffect } from "react";
import "./App.css";

import { loadGraph } from "./feature/graph/graphActions";
import { GraphControls } from "./components/GraphControls";
import { GraphCanvas } from "./components/GraphCanvas";
import { useAppDispatch } from "./app/store";

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(loadGraph("0x0000"));
  }, [dispatch]);

  return (
    <div className="p-4">
      <br />
      <GraphControls />
      <br />
      <GraphCanvas />
    </div>
  );
}

export default App;
