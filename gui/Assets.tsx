import * as React from "react";
import axios from "axios";
import { MyCard } from "./MyCard";
import { Link, Table } from "@nextui-org/react";
import { Avatar } from "@nextui-org/react";
import { Loading } from "@nextui-org/react";
import { debounce } from "lodash";

import {
  Button,
  Input,
  Modal,
  Pagination,
  Spacer,
  Text,
} from "@nextui-org/react";
export function Assets() {
  const [assets, setAssets] = React.useState(null);
  const [gatewayURL, setGatewayURL] = React.useState(
    "https://cloudflare-ipfs.com/ipfs/"
  );
  const [filterText, setFilterText] = React.useState("");
  const [modalVisible, setModalVisible] = React.useState(false);

  const [assetName, setAssetName] = React.useState("");

  const [page, setPage] = React.useState(1);
  const PAGE_SIZE = 25;

  const showModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);

  const debouncedSearch = React.useRef(
    debounce(async (value) => {
      setFilterText(value);
      setPage(1); //always reset the paginator when search changes
    }, 300)
  ).current;

  React.useEffect(() => {
    axios.get("/gui-settings").then((response) => {
      const settings = response.data;
      const gateway = settings.ipfs_gateway;
      setGatewayURL(gateway);
    });
    axios
      .get("/api/assets")
      .then((axiosResponse) => {
        setAssets(axiosResponse.data);
      })
      .catch((e) => {
        alert("Something went wrong when fetching assets");
      });
  }, []);

  if (!assets) {
    return <Loading />;
  }
  const names = Object.keys(assets).sort();

  const assetsToShow = names.filter((asset) => {
    if (!filterText) {
      return true;
    }
    const filter = filterText.toUpperCase();

    return asset.toUpperCase().startsWith(filter);
  });

  let header = "Assets (" + names.length + ")";

  const asset = assets[assetName];

  const displayedAssets = assetsToShow.filter(function (asset, index) {
    const lowerLimit = page * PAGE_SIZE - PAGE_SIZE;
    const upperLimit = page * PAGE_SIZE;

    if (index < lowerLimit) {
      return false;
    }

    if (index > upperLimit) {
      return false;
    }
    return true;
  });
  const body = (
    <>
      <Input
        clearable
        bordered
        value={filterText}
        onChange={(event) => {
          const value = event.target.value;

          debouncedSearch(value);
        }}
      />
      <Spacer />
      <MyPaginator
        page={page}
        pageSize={PAGE_SIZE}
        total={assetsToShow.length}
        setPage={setPage}
      ></MyPaginator>
      <Spacer />
      <AssetModal
        modalVisible={modalVisible}
        closeModal={closeModal}
        asset={asset}
      />

      <Table
        aria-label="Example table with static content"
        css={{
          height: "auto",
          minWidth: "100%",
        }}
      >
        <Table.Header>
          <Table.Column>NR</Table.Column>
          <Table.Column>Name</Table.Column>
          <Table.Column>IPFS</Table.Column>
          <Table.Column>Amount</Table.Column>
        </Table.Header>
        <Table.Body>
          {displayedAssets.map((name) => {
            const asset = assets[name];
            return (
              <Table.Row key={name}>
                <Table.Cell>{names.indexOf(name) + 1}</Table.Cell>
                <Table.Cell>
                  <a
                    title={name}
                    href={"#"}
                    onClick={() => {
                      setAssetName(name);
                      showModal();
                    }}
                  >
                    {name}
                  </a>
                </Table.Cell>
                <Table.Cell>
                  {!!asset.ipfs_hash && (
                    <Link href={gatewayURL + asset.ipfs_hash} target="_blank">
                      <Avatar
                        size="md"
                        squared
                        src={"/thumbnail?assetName=" + encodeURIComponent(name)}
                      />
                    </Link>
                  )}
                </Table.Cell>
                <Table.Cell>{asset.amount.toLocaleString()}</Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    </>
  );
  return <MyCard header={header} body={body} />;
}

function MyPaginator({ setPage, total, page, pageSize }) {
  const numberOfPages = Math.ceil(total / pageSize);
  return (
    <div>
      <Pagination total={numberOfPages} page={page} onChange={setPage} />
    </div>
  );
}

function AssetModal({ modalVisible, closeModal, asset }) {
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
export function Meta({ asset }) {
  const [meta, setMeta] = React.useState(asset);
  console.log("meta", meta);
  if (!meta) {
    return null;
  }
  const ipfs = meta.ipfs_hash;

  return (
    <>
      <pre>{JSON.stringify(meta, null, 4)}</pre>
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
