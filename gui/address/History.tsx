import * as React from "react";
import { Loading, Table } from "@nextui-org/react";
import { useFetch } from "../useFetch";

export function History({ address }: { address: string | null }) {
  const URL = "/api/addressdeltas/" + address;

  const deltas = useFetch(URL);
  if (!deltas) {
    return (
      <div>
        <Loading></Loading>
      </div>
    );
  }

  if (deltas.length > 500) {
    return (
      <div>
        This address have more has {deltas.length.toLocaleString()} history
        items. <a href={URL}>Full history</a>
      </div>
    );
  }
  interface IHeight {
    height: number;
  }
  deltas.sort((d1: IHeight, d2: IHeight) => (d1.height > d2.height ? -1 : 1));
  const rows = deltas.map((delta) => {
    const URL = "?route=TRANSACTION&id=" + delta.txid;
    return (
      <Table.Row key={delta.txid + "_" + delta.index}>
        <Table.Cell>
          <a href={URL}>{delta.assetName}</a>
        </Table.Cell>
        <Table.Cell>{delta.amount.toLocaleString()}</Table.Cell>
        <Table.Cell>{delta.height.toLocaleString()}</Table.Cell>
        <Table.Cell>
          <Time height={delta.height}></Time>
        </Table.Cell>
      </Table.Row>
    );
  });
  return (
    <Table>
      <Table.Header>
        <Table.Column>Asset</Table.Column>
        <Table.Column>Amount</Table.Column>
        <Table.Column>Block height</Table.Column>
        <Table.Column>Date</Table.Column>
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

function Time({ height }) {
  const block = useFetch("/api/blocks/" + height);

  if (!block) {
    return null;
  }
  return <div>{new Date(1000 * block.time).toLocaleString()}</div>;
}
