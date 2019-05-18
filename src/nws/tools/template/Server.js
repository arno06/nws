const BaseTemplate = require('./BaseTemplate');
const path = require('path');
const fs = require('fs');

class Template extends BaseTemplate
{
    constructor(pName, pContent)
    {
        super(pName, pContent);
        this.setupFolder(process.cwd(), 'views');
        this.setFunction('include',function(pTpl)
        {
            let last = arguments.length-1;
            let vars = arguments[last];
            for(let i = 1;i<last;i++)
            {
                let v = arguments[i].split('=');
                if(v.length!=2)
                    continue;
                vars[v[0]] = v[1].replace(/"/g, '').replace(/'/g, '');
            }
            let t = new Template(pTpl, vars);
            return t.evaluate();
        });
    }

    setupFolder(){
        let args = Array.from(arguments);
        if(args.length==0){
            args= [process.cwd(), 'views'];
        }
        args.push(this.name);

        this.filename = path.join(...args);
    }

    loadTemplate(){
        if(!fs.existsSync(this.filename)){
            throw new Error('Template file not found');
        }
        let stats = fs.statSync(this.filename);
        if(!stats.isFile()){
            throw new Error('Template file not found');
        }
        this.raw = fs.readFileSync(this.filename, 'utf8');
        return true;
    }

    render(pResponse){
        let result = this.evaluate();
        if(result === false){
            return;
        }
        pResponse.setHeader("Content-Type", "text/html;charset=UTF-8");
        pResponse.writeHead(200);
        pResponse.write(result, 'utf8');
        pResponse.end();
    }
}

module.exports = Template;