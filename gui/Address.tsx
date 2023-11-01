import * as React from "react";
import axios from "axios";
const numberConverter = require("number-to-words");
import { getParam } from "./getParam";
import { Spacer, Loading } from "@nextui-org/react";
import { MyCard } from "./MyCard";
import { Table } from "@nextui-org/react";
function formatNumber(num) {
  if (num === 0) {
    return 0;
  }
  if (!num) {
    return null;
  }

  if (typeof num !== "number") {
    return null;
  }

  num = num / 1e8;
  num = Number(num.toFixed(2));
  const words = numberConverter.toWords(num);
  const numberString = num.toLocaleString();
  const capitalized = words.charAt(0).toUpperCase() + words.slice(1);
  return (
    <>
      <div>{numberString}</div>
      <div>
        <i>{capitalized}</i>
      </div>
    </>
  );
}

export function Address() {
  const [address, setAddress] = React.useState("");
  const [data, setData] = React.useState(null);

  const [unspent, setUnspent] = React.useState(null);

  React.useEffect(() => {
    setAddress(getParam("address"));
  }, []);

  React.useEffect(() => {
    async function work() {
      if (address) {
        const promise = axios.get("/api/addresses/" + address);
        promise.then((d) => setData(d.data));

        try {
          const response = await axios("/api/getaddressutxos/" + address);

          if (response.data) {
            setUnspent(response.data);
          }
        } catch (e) {
          setUnspent([]);
        }
      }
    }

    work();
  }, [address]);

  if (!data) {
    return null;
  }

  let header = "UTXOs";

  if (unspent) {
    header = header + " " + unspent.length.toLocaleString();
  }

  return (
    <div className="form-group">
      <MyCard header="Address" body={address} />
      <Spacer />
      <MyCard header="Balance" body={formatNumber(data.balance)}></MyCard>
      <Spacer></Spacer>
      <MyCard header="Total received" body={formatNumber(data.received)} />
      <Spacer></Spacer>

      <MyCard
        header="Inputs and outputs"
        body={<a href={"/api/addressdeltas/" + address}>Link</a>}
      ></MyCard>

      <Spacer></Spacer>
      <MyCard header="Assets" body={<AssetTable assets={data.assets} />} />

      <Spacer></Spacer>
      <MyCard
        header={header}
        body={<Unspent address={address} unspent={unspent} />}
      />

      {false && (
        <MyCard
          header="Received"
          body={<Received address={address}></Received>}
        />
      )}
    </div>
  );
}

function Unspent({ address, unspent }) {
  if (!unspent) {
    return (
      <>
        <Loading />
      </>
    );
  }
  if (unspent.length > 100) {
    const URL = "/api/getaddressutxos/" + address;
    return (
      <div>
        <a target="_blank" href={URL}>
          {unspent.length.toLocaleString()} unspent
        </a>
      </div>
    );
  }
  unspent = unspent.map((u) => {
    u.value = u.satoshis / 1e8;
    u.text = numberConverter.toWords(u.value);
    return u;
  });
  if (unspent.length > 100) {
    const text = JSON.stringify(unspent, null, 4);
    return <pre>{text}</pre>;
  }

  const body = (
    <ol>
      {unspent.map((u) => {
        const k = u.txid + " " + u.outputIndex;
        return (
          <li key={k}>
            <pre>{JSON.stringify(u, null, 4)}</pre>
          </li>
        );
      })}
    </ol>
  );

  return <MyCard header="Unspent transaction outputs (UTXO" body={body} />;
}

function Received({ address }) {
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    const URL = "/api/receivedbyaddress/" + address;

    const axiosResponse = axios.get(URL);
    axiosResponse.then((d) => {
      setData(d.data);
    });
  }, []);

  if (!data) {
    return <Loading />;
  }

  //Sort by date
  let _data = data.sort(function (a, b) {
    if (a.time < b.time) {
      return 1;
    }
    if (a.time === b.time) {
      return 0;
    }
    if (a.time > b.time) {
      return -1;
    }
  });

  return (
    <div>
      {_data.map(function (d) {
        return (
          <div>
            <Spacer />
            <div>{formatNumber(d.valueSat)}</div>

            <div>
              <a href={"index.html?route=TRANSACTION&id=" + d.txid}>
                {new Date(d.time * 1000).toLocaleString()}
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AssetTable({ assets }) {
  return (
    <Table striped sticked>
      <Table.Header>
        <Table.Column>Asset</Table.Column>
        <Table.Column>Amount</Table.Column>
      </Table.Header>
      <Table.Body>
        {assets.map((asset) => {
          const name = asset.assetName;
          const balance = asset.balance / 1e8;

          if (balance === 0) {
            return null;
          }
          const displayBalance = getTwoDecimalTrunc(balance).toLocaleString();
          return (
            <Table.Row key={name}>
              <Table.Cell>{name}</Table.Cell>
              <Table.Cell>{displayBalance}</Table.Cell>
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table>
  );
}
function getTwoDecimalTrunc(num: number) {
  //Found answer here https://stackoverflow.com/questions/11832914/how-to-round-to-at-most-2-decimal-places-if-necessary
  //In JavaScript the number 77866.98 minus 111 minus 0.2 equals 77755.95999999999
  //We want it to be 77755.96
  return Math.trunc(num * 100) / 100;
}
