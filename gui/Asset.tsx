import * as React from "react";
import { getParam } from "./getParam"; 
import { Meta } from "./AssetModal";
import useAssetData from "./useAssetData";

export function Asset() {
  const assetName = "" + getParam("name");
  const data = useAssetData(assetName);

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
