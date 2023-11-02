import * as React from "react";
import { getParam } from "./getParam";
import axios from "axios";

import { MyCard } from "./MyCard";
import { Spacer, Table } from "@nextui-org/react";
import { useConfig } from "./useConfig";

export function Transaction() {
  const [data, setData] = React.useState(null);
  const config = useConfig();
  const id = getParam("id");

  //Fetch transaction data once
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
      <MyCard
        header={"Transaction details"}
        body={
          <div>
            <Table style={{ tableLayout: "fixed" }}>
              <Table.Header>
                <Table.Column>Local time</Table.Column>
                <Table.Column>ISO time</Table.Column>
              </Table.Header>
              <Table.Body>
                <Table.Row>
                  <Table.Cell>
                    {new Date(data.blocktime * 1000).toLocaleString()}
                  </Table.Cell>
                  <Table.Cell>
                    {new Date(data.blocktime * 1000).toISOString()}
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table>

            <Table style={{ tableLayout: "fixed" }}>
              <Table.Header>
                <Table.Column>Transaction Inputs</Table.Column>
                <Table.Column>Transaction Outputs</Table.Column>
              </Table.Header>
              <Table.Body>
                <Table.Row>
                  <Table.Cell>{data.vin.length}</Table.Cell>
                  <Table.Cell> {data.vout.length}</Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table>

            <Fee
              transaction={data}
              baseCurrency={config ? config.baseCurrency : ""}
            />
          </div>
        }
      />

      <Spacer />
      <MyCard header={"Raw transaction data"} body={<pre>{text}</pre>} />
    </>
  );
}
interface ITransaction {
  vin: { value: number; coinbase?: boolean }[];
  vout: { value: number }[];
}

function Fee({
  baseCurrency,
  transaction,
}: {
  baseCurrency: string;
  transaction: ITransaction;
}) {
  const [USD, setUSD] = React.useState(0);
  const fee = getFee(transaction);

  React.useEffect(() => {
    if (baseCurrency !== "RVN") {
      return;
    }
    if (typeof fee === "number") {
      getFeeValueInDollars(fee).then((value) => {
        setUSD(value);
        console.log(value);
      });
    }
  }, [fee, baseCurrency]);

  if (baseCurrency !== "RVN") {
    return <div>{fee}</div>;
  } else if (baseCurrency === "RVN") {
    return (
      <Table style={{ tableLayout: "fixed" }}>
        <Table.Header>
          <Table.Column>Fee {baseCurrency}</Table.Column>
          <Table.Column>Fee USD</Table.Column>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>{fee}</Table.Cell>
            <Table.Cell> {USD}</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    );
  }
}
async function getFeeValueInDollars(fee: number) {
  const URL = "https://api1.binance.com/api/v3/ticker/price?symbol=RVNUSDT";
  const response = await axios.get(URL);

  const value = parseFloat(response.data.price) * fee;
  return value;
}
function getFee(transaction: ITransaction): number | string {
  let inputValue = 0;
  let outputValue = 0;

  type TransactionValue = { value: number };

  const isCoinbaseTransaction = !!transaction.vin[0].coinbase;

  if (isCoinbaseTransaction === true) {
    return "Coinbase transaction, no fee";
  }
  transaction.vin.map(
    (input: TransactionValue) => (inputValue += input.value || 0)
  );
  transaction.vout.map(
    (output: TransactionValue) => (outputValue += output.value)
  );

  const fee = inputValue - outputValue;
  return fee;
}
