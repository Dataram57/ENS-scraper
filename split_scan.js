const { spawn } = require('child_process');

//config
const startBlock = 1;
const endBlock = 100;
const stepBlock = 10;
const threadCount = 3;

//current vars
const threads = [];
let currentBlock = startBlock;
let currentBlockEnd = 0;


const LaunchThread = (index) => {
    //check
    if(currentBlock >= endBlock)
        return;

    //launch
    currentBlockEnd = Math.min(currentBlock + stepBlock, endBlock);
    const thread = spawn('node', ['app.js', currentBlock, currentBlockEnd, 'scan_' + currentBlock + '_' + currentBlockEnd + '.json']);
    threads[index] = thread;

    console.log(currentBlock, currentBlockEnd);
    //define events
    thread.on('close', (code) => {
        //console.log(`Child process exited with code ${code}`);
        LaunchThread(index);
    });

    thread.stdout.on('data', (data) => {
        //console.log(`Child process output: ${data}`);
    });

    //next step
    currentBlock += stepBlock;
};


//spawn threads at start
let i = threadCount;
while(i-- > 0)
    LaunchThread(threads.push(null) - 1);