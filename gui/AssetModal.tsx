import * as React from "react";
import { Modal, Text } from "@nextui-org/react";
import useAssetData from "./useAssetData";

export function Meta({ asset }) {
  const ipfs = asset.ipfs_hash;

  return (
    <>
      <pre>{JSON.stringify(asset, null, 4)}</pre>
      {ipfs && (
        <div
          style={{
            textAlign: "center",
          }}
        >
          <a href={"https://ipfs.io/ipfs/" + ipfs} target="_blank">
            IPFS link
            <br />
            <img
              width="200"
              src={"/thumbnail?assetName=" + encodeURIComponent(asset.name)}
            />
          </a>
        </div>
      )}
    </>
  );
}
export function AssetModal({ modalVisible, closeModal, assetName }) {
  if (modalVisible === false) {
    return null;
  }
  const asset = useAssetData(assetName);
  if (!asset) {
    return null;
  }
  return (
    <Modal
      closeButton
      aria-labelledby="modal-title"
      open={modalVisible}
      onClose={closeModal}
    >
      <Modal.Header>
        <Text id="modal-title" size={18}>
          Asset data for{" "}
          <Text b size={18}>
            {asset.name}
          </Text>
        </Text>
      </Modal.Header>
      <Modal.Body>
        <Meta asset={asset} />
      </Modal.Body>
    </Modal>
  );
}
