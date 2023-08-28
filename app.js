console.clear();
console.log('================================================================');
/*PLAN 26/8/2023
start = 15834260
end = 17997944
delta = 108184

node app.js 15834260 15942444{
    //break at 15924404 due to the heavy rain
    node app.js 15834260 15942444
    //start again
    node app.js 15924404 15942444
}
node app.js 15942444 16050628{
    delta = 54092
    node app.js 15942444 15996536 1.json
    node app.js 15996536 16050628 2.json
    error at 15971153       //node app.js 15971153 15996536 1.json
    //0x5c0a62b860c3a8f9eccbe8826817d33c1ce073381146e022e2eaf2c9d1582596
    error at 16029810       //node app.js 16029810 16050628 2.json
    //0x8b59ab066ec4d0695793a0f9397142de073840598b83c93a04b6ea6f5e1b054b
}
node app.js 16050628 16158812{
    delta = 54092
    node app.js 16050628 16104720 1.json
    node app.js 16104720 16158812 2.json
}
node app.js 16158812 16266996{
    delta = 54092
    node app.js 16158812 16212904 3.json
    node app.js 16212904 16266996 4.json

    //node app.js 16158812 16212904 0.json

    node app.js 16175898 16212904 1.json
    node app.js 16176908 16212904 0.json

    3+1+0+4
}
node app.js 16266996 16375180{
    delta = 54092
    node app.js 16266996 16321088 st1.json
    node app.js 16321088 16375180 st2.json
}
node app.js 16375180 16483364
node app.js 16483364 16591548
node app.js 16591548 16699732
node app.js 16699732 16807916
node app.js 16807916 16916100
node app.js 16916100 17024284
node app.js 17024284 17132468
node app.js 17132468 17240652
node app.js 17240652 17348836
node app.js 17348836 17457020
node app.js 17457020 17565204
node app.js 17565204 17673388
node app.js 17673388 17781572
node app.js 17781572 17889756
node app.js 17889756 17997944
*/

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
    //console.log(tx);
    if(!tx.to)
        return;
    let i = GetContractAddressIndex(tx.to);
    if(i == -1)
        return null;
    //continue check
    try {
        const decodedData = contractsInterface[i].parseTransaction({ data: tx.input, value: tx.value});
        const args = decodedData.args;
        //recognize the function and get the args
        switch(decodedData.name){
            case 'setText':
                return [args.key, args.value];
                break;

        }
    }
    catch(e){
        print("Error at", tx.hash);
        return null;    
    }
    return null;
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
    if(typeof(obj) == 'string')
        writeStream.write(obj);
    else
        writeStream.write(",\n" + JSON.stringify(obj));
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

write("[null");
for(let currentBlock = startBlockNumber; currentBlock < endBlockNumber; currentBlock++){
    print('Block', currentBlock, ':');
    transactions = await GetBlockTxsForced(currentBlock);
    i = transactions.length;
    while(i-- > 0){
        info = GetTxInfo(transactions[i]);
        if(info)
            write(info);
    }
}
write("\n]");
JSON.stringify



//#endregion

//================================================================
//#region End


writeStream.close();

//#endregion

})();