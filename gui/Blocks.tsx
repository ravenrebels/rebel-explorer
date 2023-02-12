import * as React from "react";
import axios from "axios";
import { Card, Table, Text } from "@nextui-org/react";
import { MyCard } from "./MyCard";

export function Blocks() {
  const [blocks, setBlocks] = React.useState([]);

  React.useEffect(() => {
    async function work() {
      const URL = "/api/blocks";
      const axiosResponse = await axios.get(URL);

      const b = axiosResponse.data;
      window.document.title = b[0].height.toLocaleString();
      setBlocks(b);
    }
    work();

    const interval = setInterval(work, 20000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  if (!blocks || blocks.length === 0) {
    return null;
  }

  const header = "Blocks";
  const body = (
    <Table>
      <Table.Header>
        <Table.Column>Height</Table.Column>
        <Table.Column>Time</Table.Column>
        <Table.Column>Transactions</Table.Column>
      </Table.Header>
      <Table.Body>
        {blocks.map((block) => {
          const URL = "index.html?route=BLOCK&hash=" + block.hash;

          const time = new Date(block.time * 1000).toLocaleString();
          return (
            <Table.Row key={block.hash}>
              <Table.Cell>
                <a href={URL}>{block.height.toLocaleString()}</a>
              </Table.Cell>
              <Table.Cell>{time}</Table.Cell>
              <Table.Cell>{block.tx.length}</Table.Cell>
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table>
  );

  return <MyCard header={header} body={body} />;
}
