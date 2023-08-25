console.clear();
//node app.js 15139124 15139125
//================================================================
//#region Consts

//temps
let i = 0;

const fs = require('fs');
const axios = require('axios');

const terminalArgFix = 2;
const GetTerminalAgument = (n, d) => {
    let v = process.argv[n + terminalArgFix];
    if(v){
        v = v.trim();
        if(v.length > 0)
            return v;
    }
    return d;
};

const nodes = require('./nodes.json');
const GetNode = () => nodes[Math.floor(nodes.length * Math.random())];

const contracts = require('./contracts.json');
const GetContractAddressIndex = (address) => {
    address = address.toLowerCase();
    let i = contracts.length;
    while(i-- > 0)
        if(contracts[i] === address)
            return i;
    return -1;
};

const GetBlockTxs = (blockNumber) => { 
    blockNumber = '0x' + blockNumber.toString(16);
    return new Promise((resolve) => {
        axios.post(GetNode()
            ,{
                'jsonrpc': '2.0',
                'method': 'eth_getBlockByNumber',
                'params': [blockNumber, true],
                'id': 1
            }
            ,{
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )
        .then(res => {
            try{
                resolve(res.data.result.transactions);
            }catch(e){
                resolve(null);
            }
        })
        .catch(err => {
            resolve(null);
        });
    });
};

const GetBlockTxsForced = async(blockNumber) => {
    let transactions = null;
    while(!transactions)
        transactions = await GetBlockTxs(blockNumber);
    return transactions;
};

//#endregion

//================================================================
//#region I HATE TO TRUST FASTLY CHANGING LIBRARIES, I HATE THE ANTICHRIST RAAAAA

//npm i ethers@5.7.2
const ethers = require('ethers');

//generate interfaces
const contractsInterface = [];
for(i = 0; i < contracts.length; i++)
    contractsInterface.push(new ethers.utils.Interface(require('./abi/' + contracts[i] + '.json')));

//returns null if the transaction has nothing to say
const GetTxInfo = (tx) => {
    console.log(3);
    i = GetContractAddressIndex(tx.to);
    if(i == -1)
        return null;
    //continue check
    const decodedData = contractsInterface[i].parseTransaction({ data: tx.input, value: tx.value});
    console.log(decodedData);
};

//#endregion

//================================================================
//#region Read params and create write stream

const startBlockNumber = parseInt(GetTerminalAgument(0, -1));
const endBlockNumber = parseInt(GetTerminalAgument(1, -1));
const targetFile = GetTerminalAgument(2, "result.json");

console.log("Start:", startBlockNumber);
console.log("End:", endBlockNumber);
console.log("Into:", targetFile);

const writeStream = fs.createWriteStream(targetFile);
const write = (obj) => {
    console.log(obj);
    writeStream.write(obj + ',\n');
};
const print = console.log;

//#endregion

//================================================================
//#region final conversion

i = contracts.length;
while(i-- > 0)
    contracts[i] = contracts[i].toLowerCase();

//#endregion

//================================================================
(async () => {
    
//================================================================
//#region Scan the blockchain

let currentBlock = startBlockNumber;
let transactions = null;
let info = null;
i = 0;

for(let currentBlock = startBlockNumber; currentBlock < endBlockNumber; currentBlock++){
    print('Block', currentBlock, ':');
    transactions = await GetBlockTxsForced(currentBlock);
    i = transactions.length;
    console.log(i)
    while(i-- > 0){
        info = GetTxInfo(transactions[i]);
        if(info)
            write(info);
    }
}





//#endregion

//================================================================
//#region End


writeStream.close();

//#endregion

})();