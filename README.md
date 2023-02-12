# Rebel Explorer
An blockchain explorer for Ravencoin and Ravencoin forks

## Before you install
- You need to have Node.js and Git installed.
- You need to have a Raven core node.
The node needs to be fully indexed and your raven.conf must include
    * txindex=1
    * addressindex=1
    * assetindex=1
    * timestampindex=1
    * spentindex=1

## How to install
Clone the git repo

Run `npm install`

Run `npm run build`

## How to start

Run `npm start`
### Configuration

The first time you try to start the Explorer, a config.json file will be created.
Update the config.json file with your information and restart restart the node.js app
```
{
    "raven_password": "YOUR PASSWORD",
    "raven_username": "YOUR USERNAME",
    "raven_url": "https://LOCALHOST:8766",
    "httpPort": 80,
    "headline": "Ravencoin Mainnet",
    "theme": "dark",
    "ipfs_gateway": "https://cloudflare-ipfs.com/ipfs/"
}
```

The attributes "headline" and "theme" are used for the graphical user interface. Config is only read once at startup, so you need to restart the app if you change config. 



 






