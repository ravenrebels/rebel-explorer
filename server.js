import express from "express";
import cors from "cors";

import getConfig from "./getConfig.js";
import thumbnail from "./thumbnail.js";
import blockchain from "./blockchain.js";
import compression from "compression";

const CONFIG = getConfig();
const app = express();
import { getDebugMessage } from "./update.js";

process.on("uncaughtException", (error, origin) => {
  console.log("----- Uncaught exception -----");
  console.log(error);
  console.log("----- Exception origin -----");
  console.log(origin);
});

process.on("unhandledRejection", (reason, promise) => {
  console.log("----- Unhandled Rejection at -----");
  console.log(promise);
  console.log("----- Reason -----");
  console.log(reason);
});

app.use(compression());

//Send human readable JSON
app.set("json spaces", 4);
const port = process.env.PORT || CONFIG.httpPort || 80;

/*
//Start index every X seconds
setInterval(() => {
  console.log("Asking for update", new Date().toLocaleString());
  try {
    const totalUpdate = false;
    update(totalUpdate).catch((e) => {
      console.log("Could not update");
      console.dir(e);
    });
  } catch (e) {}
}, 10000);
*/
//Send human readable JSON
app.set("json spaces", 4);

//USE CORS
app.use(cors());

//Do this to be able to get IP of request by request.ip
app.set("trust proxy", true);

//ACCEPT BODY POST DATA, is this really needed?
app.use(express.json());

//STATIC CONTENT
app.use(express.static("dist"));

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
app.get("/debug", (req, res) => {
  res.send(getDebugMessage());
});

app.get("/gui-settings", (_, response) => {
  response.send({
    headline: CONFIG.headline,
    theme: CONFIG.theme,
    ipfs_gateway: CONFIG.ipfs_gateway,
  });
});
app.get("/api/addresses", function (_, response) {
  const find = {
    selector: {
      type: "ADDRESS",
    },
    fields: ["_id"],
  };
  db.find(find)
    .then((data) => {
      const a = data.docs.map(function (obj) {
        return obj._id;
      });
      a.sort();
      response.send(a);
    })
    .catch((e) => {
      response.status(500).send({
        error: "" + e,
      });
    });
});
app.get("/thumbnail", thumbnail);

app.get("/gettype/:value", async function (req, res) {
  const type = await blockchain.getType(req.params.value);
  res.send({ type });
});

app.get("/api/addressdeltas/:address", (request, response) => {
  const address = request.params.address;

  const promise = Reader.getAddressDeltas(addres);
  promise.then(response.send).catch((e) => {
    promise.catch((e) => {
      res.status(400).send({ error: "" + e });
    });
  });
});

app.get("/api/balancebyaddress/:address", (req, res) => {
  const address = req.params.address;
  const balance = blockchain.getAddressBalance(address);

  res.send(balance);
});

app.get("/memory", function (_, response) {
  const m = process.memoryUsage();
  response.send(m);
});
app.get("/api/getaddressutxos/:address", (request, response) => {
  const address = request.params.address;
  const promise = blockchain.getAddressUTXOs(address);
  promise
    .then((data) => {
      response.send(data);
    })
    .catch((e) => {
      response.status(500).send({ error: "Technical error" });
    });
});
app.get("/api/blocks/:blockHash", (req, res) => {
  const hash = req.params.blockHash;

  //Is it hash or height?
  let promise = null;
  if (hash.length > 15) {
    promise = blockchain.getBlock(hash);
  } else {
    promise = blockchain.getBlockByHeight(parseInt(hash));
  }

  promise
    .then((data) => {
      return res.send(data);
    })
    .catch((e) => {
      console.log("server in promise catch");
      console.dir(e);
      res.status(500).send({
        error: "Technical error",
      });
      /* res.sendStatus(500).send({
        error: e + "",
      });*/
    });
});
app.get("/api/blocks", async (req, res) => {
  try {
    let hash = await blockchain.getBestBlockHash();

    const blocks = [];

    for (let i = 0; i < 10; i++) {
      let block = await blockchain.getBlock(hash);

      blocks.push(block);
      hash = block.previousblockhash;
    }
    res.send(blocks);
  } catch (e) {
    console.dir(e);
    res.status(500).send({ error: "" + e });
  }
});

setInterval(() => {
  //Fetch assets and assign the resolved promise to assetsCache WHEN DONE
  const promise = blockchain.listAssets();
  promise
    .then((data) => (assetsCache.listAssets = promise))
    .catch((e) => {
      console.log("Error fetching assets");
    });
}, 4 * 60 * 1000);

app.get("/api/assetdata/:name", (request, response) => {
  const name = "" + request.params.name;

  blockchain
    .getAssetData(name)
    .then((data) => response.send(data))
    .catch((e) => response.status(500).send({ error: "" + e }));
});
app.get("/api/assets", (request, response) => {
  const promise = blockchain.getAssets();
  promise
    .then((assets) => response.send(assets))
    .catch((e) => {
      res.status(500).send({ error: "" + e });
    });
});

app.get("/api/transactions/:id", async (request, response) => {
  const id = "" + request.params.id;
  blockchain
    .getTransaction(id)
    .then((data) => {
      delete data.hex;
      response.send(data);
      return;
    })
    .catch((e) => {
      response.status(500).send({
        error: "" + e,
      });
      return;
    });
});
app.get("/api/bestblock", async (request, response) => {
  const hash = await blockchain.getBestBlockHash();
  const block = await blockchain.getBlock(hash);
  response.send(block);
});

app.get("/api/addresses/:address", (request, response) => {
  blockchain
    .getAddressBalance(request.params.address)
    .then((data) => response.send(data))
    .catch((error) => {
      response.status(500).send({
        error: "" + error,
      });
    });
});

app.get("/gettxoutsetinfo", function (request, response) {
  blockchain
    .getCoinsInCirculation()
    .then((data) => response.send(data))
    .catch((e) => {
      response.status(500).send({
        error: "Server side error",
      });
    });
});

app.get("/api/getassetdata", (request, response) => {
  const assetName = request.query.name;

  if (!assetName) {
    response.status(400).send({
      error:
        "Query parameter name is mandatory, cant lookup an asset without a name",
    });
    return;
  }
  blockchain
    .getAssetData(assetName)
    .then((data) => {
      response.send(data);
    })
    .catch((e) => {
      console.dir(e);
      response.status(500).send({
        error: "Something went wrong",
      });
    });
});
