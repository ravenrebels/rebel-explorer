import * as React from "react";
import { getParam } from "./getParam";
import { Meta } from "./Assets";
import axios from "axios";
export function Asset() {
  const [data, setData] = React.useState(null);
  const assetName = "" + getParam("name");
  React.useEffect(() => {
    const searchParams = new URLSearchParams();
    searchParams.append("name", assetName);

    const URL = "/api/getassetdata?" + searchParams.toString();

    axios.get(URL).then((response) => {
      setData(response.data);
      console.log("Response", response);
    });
  }, []);

  if (!data) {
    return (
      <div>
        <h3>Cant find data about {assetName}</h3>
      </div>
    );
  }
  return (
    <div>
      <h1>{assetName}</h1>
      <Meta asset={data} />
    </div>
  );
}
