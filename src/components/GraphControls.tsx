import { useState } from "react";

import { loadGraph } from "../feature/graph/graphActions";
import { useAppDispatch } from "../app/store";

export const GraphControls = () => {
  const dispatch = useAppDispatch();
  const [address, setAddress] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (address.trim()) {
      dispatch(loadGraph(address.trim()));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Введите адрес"
      />
      <button type="submit">Загрузить</button>
    </form>
  );
};
