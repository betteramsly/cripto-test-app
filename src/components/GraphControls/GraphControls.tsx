import { useState } from "react";
import styles from "./GraphControls.module.scss";

type IProps = {
  fetchGraphData: (address: string) => void;
  displayMode: "token" | "usd";
  setDisplayMode: (mode: "token" | "usd") => void;
};

export const GraphControls = ({
  fetchGraphData,
  displayMode,
  setDisplayMode,
}: IProps) => {
  const [address, setAddress] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (address.trim()) {
      fetchGraphData(address.trim());
    }
  };

  return (
    <div className={styles.root}>
      <form onSubmit={handleSubmit} className={styles.form_wrapper}>
        <input
          type="text"
          value={address}
          className={styles.input}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Введите адрес"
        />
        <button type="submit" className={styles.button}>
          Загрузить
        </button>
      </form>
      <div style={{ marginTop: "10px" }}>
        <label>Отображать суммы:</label>
        <select
          value={displayMode}
          onChange={(e) => setDisplayMode(e.target.value as "token" | "usd")}
          className={styles.input}
        >
          <option value="token">В токенах</option>
          <option value="usd">В долларах</option>
        </select>
      </div>
    </div>
  );
};
