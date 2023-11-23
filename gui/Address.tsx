import * as React from "react";
import axios from "axios";
import { getHistory } from "@ravenrebels/ravencoin-history-list";
//Parcel will handle the require call, no worries
//@ts-ignore
const numberConverter = require("number-to-words");

import { getParam } from "./getParam";
import { Spacer, Loading } from "@nextui-org/react";
import { MyCard } from "./MyCard";
import { Table } from "@nextui-org/react";
import { useRavencoinUSD } from "./useRavencoinUSD";
import { useConfig } from "./useConfig";

export function Address() {
  const [address, setAddress] = React.useState<string | null>("");
  const [data, setData] = React.useState<IBalance | null>(null);
  const config = useConfig();
  const [unspent, setUnspent] = React.useState<any[] | null>(null);
  const rvnUsdRate = useRavencoinUSD();
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
      <Balance
        balance={data.balance}
        baseCurrency={config ? config.baseCurrency : ""}
        rvnUsdRate={rvnUsdRate}
      />
      <Spacer></Spacer>
      <Received
        baseCurrency={config ? config.baseCurrency : ""}
        received={data.received}
        rvnUsdRate={rvnUsdRate}
      ></Received>
      <Spacer></Spacer>

      <MyCard header="History" body={<History address={address} />} />

      <Spacer></Spacer>
      <MyCard header="Assets" body={<AssetTable assets={data.assets} />} />

      <Spacer></Spacer>
      <MyCard
        header={header}
        body={<Unspent address={address} unspent={unspent} />}
      />
    </div>
  );
}
interface IReceivedProps {
  baseCurrency: string;
  received: number;
  rvnUsdRate: number | null;
}
interface IBalanceProps {
  baseCurrency: string;
  balance: number;
  rvnUsdRate: number | null;
}

function formatNumber(num: number) {
  if (num === 0) {
    return 0;
  }
  if (!num) {
    return null;
  }

  if (typeof num !== "number") {
    return null;
  }

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

interface IBalance {
  balance: number;
  received: number;
  assets: any[];
}
function Balance({ balance, baseCurrency, rvnUsdRate }: IBalanceProps) {
  const balanceAmount = balance / 1e8;
  if (baseCurrency === "RVN" && rvnUsdRate) {
    const rvn = (
      <MyCard header="RVN" body={formatNumber(balanceAmount)}></MyCard>
    );
    const usd = (
      <MyCard
        header="USD"
        body={formatNumber(balanceAmount * rvnUsdRate)}
      ></MyCard>
    );
    const tutti = (
      <div>
        {rvn}
        <Spacer />
        {usd}
      </div>
    );

    return <MyCard header="Balance" body={tutti} />;
  }

  return <MyCard header="Balance" body={formatNumber(balanceAmount)}></MyCard>;
}

function Received({ baseCurrency, received, rvnUsdRate }: IReceivedProps) {
  const receivedAmount = Math.abs(received / 1e8);
  if (baseCurrency !== "RVN" || rvnUsdRate === null) {
    <MyCard
      header="Total received"
      body={
        <div>
          {baseCurrency} {formatNumber(receivedAmount)}
        </div>
      }
    />;
  }

  let usdDisplay = <div></div>;
  if (rvnUsdRate && baseCurrency === "RVN") {
    usdDisplay = (
      <MyCard header={"USD"} body={formatNumber(receivedAmount * rvnUsdRate)} />
    );
  }

  return (
    <MyCard
      header="Total received"
      body={
        <div>
          <MyCard header={baseCurrency} body={formatNumber(receivedAmount)} />
          <Spacer />
          {usdDisplay}
        </div>
      }
    />
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

function History({ address }: { address: string | null }) {
  const URL = "/api/addressdeltas/" + address;

  const [deltas, setDeltas] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (address) {
      async function work() {
        const response = await axios.get(URL);

        setDeltas(response.data);
      }
      work();
    }
  }, [address]);

  if (!deltas) {
    return <div>History</div>;
  }

  if (deltas.length > 500) {
    return (
      <div>
        This address have more has {deltas.length.toLocaleString()} history
        items. <a href={URL}>Full history</a>
      </div>
    );
  }
  deltas.sort((d1, d2) => (d1.height > d2.height ? -1 : 1));
  const rows = deltas.map((delta) => {
    const URL = "?route=TRANSACTION&id=" + delta.txid;
    return (
      <Table.Row key={delta.txid + "_" + delta.index}>
        <Table.Cell>
          <a href={URL}>{delta.assetName}</a>
        </Table.Cell>
        <Table.Cell>{delta.amount.toLocaleString()}</Table.Cell>
        <Table.Cell>{delta.height.toLocaleString()}</Table.Cell>
      </Table.Row>
    );
  });
  return (
    <Table>
      <Table.Header>
        <Table.Column>Asset</Table.Column>
        <Table.Column>Amount</Table.Column>
        <Table.Column>Block heights</Table.Column>
      </Table.Header>
      <Table.Body>{rows}</Table.Body>
      <Table.Pagination
        shadow
        noMargin
        align="center"
        rowsPerPage={10}
        onPageChange={(page) => console.log({ page })}
      />
    </Table>
  );
}
