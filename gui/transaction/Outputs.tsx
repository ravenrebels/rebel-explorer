import * as React from "react";
import { ITransaction } from "./ITransaction";
import { Table } from "@nextui-org/react";
import { useTransaction } from "./useTransaction";
export function Outputs({ transaction }: { transaction: ITransaction }) {
  return (
    <Table style={{ tableLayout: "fixed" }}>
      <Table.Header>
        <Table.Column>Address</Table.Column>
        <Table.Column>Value</Table.Column>
      </Table.Header>
      <Table.Body>
        {transaction.vout.map((item: any) => {
          const url = "/index.html?route=ADDRESS&address=";

          const addy = item.scriptPubKey.addresses[0];

          let amount = item.value.toLocaleString();
          const asset = item.scriptPubKey.asset;

          if (asset) {
            amount = asset.amount.toLocaleString() + " " + asset.name;
          }
          return (
            <Table.Row>
              <Table.Cell>
                <a href={url + addy}>{addy}</a>
              </Table.Cell>
              <Table.Cell>{amount}</Table.Cell>
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table>
  );
}

