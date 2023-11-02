import React from "react";
import axios from "axios";
export function useConfig() {
  const [config, setConfig] = React.useState(null);

  React.useEffect(() => {
    axios.get("/gui-settings").then((response) => {
      setConfig(response.data);
    });
  }, []);

  return config;
}
