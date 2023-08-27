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
});