import * as React from "react";
import { getParam } from "./getParam";
import axios from "axios";

import { MyCard } from "./MyCard";
import { Spacer } from "@nextui-org/react";

export function Transaction() {
  const [data, setData] = React.useState(null);
  const id = getParam("id");
  React.useEffect(() => {
    const URL = "/api/transactions/" + id;
    axios
      .get(URL)
      .then((axiosResponse) => {
        setData(axiosResponse.data);
      })
      .catch((e) => alert("Sorry something went wrong"));
  }, []);

  if (!data) {
    return null;
  }

  const text = JSON.stringify(data, null, 4);

  return (
    <>
      <MyCard header="Transaction id" body={id} />
      <Spacer />
      <MyCard header={"Raw transaction data"} body={<pre>{text}</pre>} />
    </>
  );
}
