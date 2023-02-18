import * as React from "react";
import axios from "axios";
const assetDataCache = {};

async function getAssetDataCached(assetName: string) {
  const name = encodeURIComponent(assetName);
  const URL = "/api/assetdata/" + name;
  let promise = assetDataCache[URL];
  if (promise) {
  }
  if (!promise) {
    promise = axios.get(URL);
    assetDataCache[name] = promise;
  }
  const axiosResponse = await promise;
  return axiosResponse.data;
}

export default function useAssetData(assetName: string) {
  const [meta, setMeta] = React.useState(null);

  React.useEffect(() => {
    getAssetDataCached(assetName).then(setMeta);
  }, []);
  return meta;
}
