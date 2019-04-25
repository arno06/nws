const path = require('path');
const fs = require('fs');

class Template
{
    constructor(pFile, pContent)
    {
        this._content = pContent||{};
        this._c = {};
        this._functions = Template.FUNCTIONS||{};

        let filename = path.join(process.cwd(), 'views', pFile);
        if(!fs.existsSync(filename)){
            throw new Error('Template file not found');
        }
        let stats = fs.statSync(filename);
        if(!stats.isFile()){
            throw new Error('Template file not found');
        }
        this.raw = fs.readFileSync(filename, 'utf8');
    }

    assign(pName, pValue)
    {
        this._content[pName] = pValue;
    }

    setFunction(pName, pFunction)
    {
        this._functions[pName] = pFunction;
    }

    render(pResponse){
        if(!this.raw || this.raw === ""){
            pResponse.writeHead(404);
            pResponse.write("Resource not found");
            pResponse.end();
            return;
        }
        pResponse.writeHead(200);
        pResponse.write(this.evaluate());
        pResponse.end();
    }

    evaluate()
    {
        this._c = JSON.parse(JSON.stringify(this._content));
        let start = new Date().getTime();
        let t = this.raw;
        if(!t)
            return "";

        let t0 = Template.TAG[0];
        let t1 = Template.TAG[1];

        let re_blocs = new RegExp("(\\"+t0+"[a-z]+|\\"+t0+"\/[a-z]+)(\\s|\\"+t1+"){1}", "gi");

        let opener = [t0+"foreach", t0+"if"];
        let closer = [t0+"\/foreach", t0+"\/if"];
        let neutral= [t0+"else"];

        let step = 0;

        let result, currentId;

        let opened = [];

        while (result = re_blocs.exec(t))
        {
            let tag = result[1];
            if(opener.indexOf(tag)>-1)
            {
                currentId = ++step;
                opened.unshift(currentId);
            }
            else if (closer.indexOf(tag)>-1)
            {
                currentId = opened.shift();
            }
            else if (neutral.indexOf(tag)>-1)
            {
                currentId = opened[0];
            }
            else
                continue;

            t = t.replace(result[0], tag+"_"+currentId+result[2]);
        }
        let evaluation = this._parseBlock(t, this._c);
        let end = new Date().getTime();
        this.time = end - start;
        return evaluation;
    }

    _parseBlock(pString, pData)
    {
        let t_0 = Template.TAG[0];
        let t_1 = Template.TAG[1];

        //{opener_X}
        let opener = new RegExp('\\'+t_0+'([a-z]+)(_[0-9]+)([^\}]*)\\'+t_1, 'i');

        //$path.to.var
        let rea = /\$([a-z0-9\._\-]+)*/i;

        let o;

        while(o = opener.exec(pString))
        {
            let params;
            let start = o.index;
            let closer = new RegExp('\\'+t_0+'\/'+o[1]+o[2]+'\\'+t_1, 'gi');
            let c = closer.exec(pString);

            if(!c)
            {
                console.log("no end tag");
                break;
            }

            let blc = pString.substr((start + o[0].length), c.index - (start + o[0].length));
            let alt = "";

            let neutral = new RegExp('\\'+t_0+'else'+o[2]+'\\'+t_1, 'gi');

            let n = neutral.exec(pString);
            if(n)
            {
                blc = pString.substr(start+o[0].length, n.index - (start + o[0].length));
                alt = pString.substr(n.index+n[0].length, c.index - (n.index+n[0].length));
            }

            let length = (c.index + c[0].length) - start;

            let totalBlock = pString.substr(start, length);

            let r = "";
            switch(o[1])
            {
                case "foreach":
                    params = o[3].split(" ");//Setup [*, tablename, itemname, keyname]
                    params[1] = params[1].replace("$","");
                    let d = this._getVariable(params[1], pData);
                    if(d)
                    {
                        let empty = true;
                        let val = t_0+(params[2]||"$v")+t_1;
                        let key = t_0+(params[3]||"$k")+t_1;
                        let c_key = (params[3]||"$k").replace("$", "");
                        let re = new RegExp("\\"+t_0+"\\"+(params[2]||"$v")+"([a-z0-9\.\_\-]+)*\\"+t_1, "gi");
                        for(let j in d)
                        {
                            let vr;
                            if(!d.hasOwnProperty(j))
                                continue;
                            empty = false;
                            let v = blc;
                            let dataCloned = Object.assign({}, pData);//Data cloning
                            dataCloned[(params[2]||"$v").replace("$", "")] = d[j];
                            dataCloned[c_key] = j;
                            v = this._parseBlock(v, dataCloned);
                            r += v;
                        }
                        if(empty === true)
                        {
                            r = this._parseBlock(alt, pData);
                        }
                    }
                    else
                        r = this._parseBlock(alt, pData);
                    break;
                case "if":
                    let f = this._parseVariables(o[3], pData, rea, true);
                    while(f[0]==" ")
                        f = f.replace(/^\s/, '');
                    if(/^\s*$/.exec(f)||/^(!|=|>|<)/.exec(f)||/(\||&)(!|=|>|<)/.exec(f))
                        f = false;
                    let cond = eval("(_ => {let r = false; try { r = "+f+"; } catch(e){ r= false;} return r;})()");
                    r = cond?blc:(alt||"");
                    r = this._parseBlock(r, pData);
                    break;
                default:
                    continue;
                    break;
            }

            pString = pString.replace(totalBlock, r);
        }

        pString = this._parseVariables(pString, pData, Template.REGEXP_VAR);

        let func;
        while(func = Template.REGEXP_FUNC.exec(pString))
        {
            let funcName = func[1];
            let p = [];
            if(!this._functions[funcName])
            {
                throw new Error("Call to undefined function "+funcName);
            }
            let params = func[2];
            params = params.replace(/,\s/g, ",");
            params = params.split(",");
            for(let i = 0, max = params.length;i<max;i++)
            {
                if(params[i][0]=="$")
                    p.push(this._getVariable(params[i], pData));
                else
                {
                    if(/^[0-9][0-9\.]*[0-9]*$/.exec(params[i]))
                        params[i] = Number(params[i]);
                    if(/^("|')/.exec(params[i]))
                        params[i] = params[i].substr(1, params[i].length-2);
                    p.push(params[i]);
                }
            }
            p.push(pData);
            pString = pString.replace(func[0], this._functions[funcName].apply(null, p));
        }

        return pString;
    }

    _parseVariables(pString, pData, pREGEXP, pEscapeString)
    {
        pEscapeString = pEscapeString||false;
        pREGEXP = pREGEXP||Template.REGEXP_ID;
        let res;
        while(res = pREGEXP.exec(pString))
        {
            let value = this._getVariable(res[1], pData);
            if(pEscapeString&& (typeof value )== "string")
                value = "'"+value.replace(/\'/g, "\\'")+"'";
            pString = pString.replace(res[0], value);
        }
        return pString;
    }

    _getVariable(pName, pContext)
    {
        let default_value = "";
        let data = pContext||this._c;
        let result = Template.REGEXP_ID.exec(pName);

        if(!result)
            return default_value;

        let levels = result[1].split(".");

        for(let i = 0, max = levels.length;i<max;i++)
        {
            if (typeof data[levels[i]] == "undefined")
            {
                return default_value;
            }
            data = data[levels[i]];
        }

        return data;
    }
}

Template.TAG = ["{", "}"];
Template.REGEXP_FUNC = new RegExp("\\"+Template.TAG[0]+"\\=([^(]+)\\(([^"+Template.TAG[1]+"]+)\\)\\"+Template.TAG[1], "i");
Template.REGEXP_VAR = new RegExp("\\"+Template.TAG[0]+"\\$([a-z0-9\.\_\-]+)*\\"+Template.TAG[1], "i");
Template.REGEXP_ID = new RegExp("([a-z0-9\.\_\-]+)", "i");

Template.$ = {};

Template.FUNCTIONS =
{
    truncate:function(pString, pLength, pEnd)
    {
        pLength = pLength||80;
        pEnd = pEnd||"...";
        if(pString.length<=pLength)
            return pString;
        pString = pString.substr(0, pLength-pEnd.length);
        return pString+pEnd;
    },
    uppercase:function(pString)
    {
        return pString.toUpperCase();
    },
    lowercase:function(pString)
    {
        return pString.toLowerCase();
    },
    replace:function(pString, pSearch, pReplace, pFlags)
    {
        pFlags = pFlags||"gi";
        let re = new RegExp(pSearch, pFlags);
        return pString.replace(re, pReplace);
    },
    add:function()
    {
        let result = 0;
        for(let i = 0, max = arguments.length-1;i<max;i++)
        {
            result+=Number(arguments[i]);
        }
        return result;
    },
    include:function(pTpl)
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
    }
};

module.exports = Template;