# Ethereum Name Service Scraper
This is a tool I made for myself to scrap the data about the changes of ENS domain records, from the Ethereum blockchain.

# Setup
## Install dependencies
`npm i axios ethers@5.7.2`
## Setup RPC node addresses
Put them into the `nodes.json` config file.

# Running
scheme: `node app.js START_BLOCK_NUMBER END_BLOCK_NUMBER ?OUTPUT_JSON_FILE`

# Example data
See `scans` folder