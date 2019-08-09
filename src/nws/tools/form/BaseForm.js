const fs = require("fs");
const path = require("path");

class BaseForm{
    constructor(pName, pReal = true){
        this.values = null;
        this.name = pName;
        this.inputs = {};
        if(pReal){
            let fileName = path.join(process.cwd(),"forms",pName+".json");

            if(!fs.existsSync(fileName)){
                throw new Error('Form file not found');
            }
            let stats = fs.statSync(fileName);
            if(!stats.isFile()){
                throw new Error('Form file not found');
            }
            this.inputs = JSON.parse(fs.readFileSync(fileName, 'utf8'));
        }
    }

    render(){
        let output = "<form action='' method='post'>";
        for(let i in this.inputs){
            if(!this.inputs.hasOwnProperty(i)){
                continue;
            }
            let name = i;
            name = this.name+"["+name+"]";
            output += FormHelper.get(name, this.inputs[i]);
        }
        output += "</form>";
        return output;
    }

    isValid(pRequest){
        if(pRequest.post&&pRequest.post.hasOwnProperty(this.name)){
            this.values = {};
            for(let i in pRequest.post[this.name]){
                if(!this.inputs.hasOwnProperty(i)){
                    continue;
                }
                if(this.inputs[i].tag === "input" && this.inputs[i].attributes.type === "submit"){
                    continue;
                }
                if(!this.inputs[i].attributes){
                    this.inputs[i].attributes = {};
                }
                this.inputs[i].attributes.value = pRequest.post[this.name][i];
                this.values[i] = pRequest.post[this.name][i];
            }
        }
        return true;
    }

    getValues(){
        return this.values;
    }

    getError(){
        return false;
    }
}

class FormHelper{

    static getLabel(pLabel, pInputName, pColon = true){
        let attr = {"for":pInputName, "value":pLabel};
        if(pLabel == ""){
            attr.value = "&nbsp;";
            delete attr.for;
        }else if(pColon){
            attr.value += " :";
        }
        return FormHelper.htmlElement("label", attr, false);
    }

    static get(pName, pData){
        let label = FormHelper.getLabel(pData.label||"", pName);
        let inp = "<div class='input'>";
        pData.attributes = pData.attributes||{};
        pData.attributes.name = pName;
        switch(pData.tag){
            case "input":
                inp = FormHelper.htmlElement("input", pData.attributes);
                break;
            case "textarea":
                inp = FormHelper.htmlElement("textarea", pData.attributes, false);
                break;
        }
        inp += "</div>";
        return "<div class='component'>"+label+inp+"</div>";
    }

    static htmlElement(pNodeName, pAttributes, pShortTag = true){
        let el = "<"+pNodeName;
        for(let i in pAttributes){
            if(!pAttributes.hasOwnProperty(i) || (!pShortTag&&i==="value")){
                continue;
            }
            el += " "+i+"='"+pAttributes[i]+"'";
        }
        if(pShortTag){
            el += "/>";
        }else{
            el += ">";
            if(pAttributes.hasOwnProperty("value")){
                el += pAttributes.value;
            }
            el += "</"+pNodeName+">";
        }
        return el;
    }
}

module.exports = BaseForm;