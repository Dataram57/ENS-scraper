const fs = require('fs');

let source = null;
let i = 0;
let f = 0;
const data = {};
let key = '';
let value = '';
let group = null;
fs.readdir('./scans',(err, files) => {
    files.forEach(file => {
        if(file.toLowerCase().indexOf('.json') == -1)
            return;
        source = require('./scans/' + file);
        i = source.length;
        while(i-- > 1){
            key = source[i][0];
            value = source[i][1];
            if(data[key]){
                group = data[key];
                f = group.length;
                while(f-- > 0)
                    if(group[f] == value)
                        break;
                if(f == -1)
                    group.push(value);
            }
            else
                data[key] = [value];
        }
    });
    fs.writeFileSync('result.json', JSON.stringify(data));
    let temp = '';
    for (let prop in data)
        if(data.hasOwnProperty(prop))
            if(data[prop].length)
                temp += prop + ": " + data[prop].length + "\n";
    fs.writeFileSync('result.txt', temp);
    console.log(temp);
});