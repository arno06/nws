class Template extends BaseTemplate
{
    constructor(pName, pContent)
    {
        super(pName, pContent);
    }


    render(pParent)
    {
        let p = pParent;
        if((typeof p).toLowerCase()=="string")
            p = document.querySelector(pParent);
        if(!p)
            return;

        //this.dispatchEvent(new Event(TemplateEvent.RENDER_INIT));

        p.innerHTML += this.evaluate();

        //this.dispatchEvent(new Event(TemplateEvent.RENDER_COMPLETE));

        let images = p.querySelectorAll("img");

        let max = images.length;

        if(!max)
        {
            //this.dispatchEvent(new Event(TemplateEvent.RENDER_COMPLETE_LOADED));
            return;
        }

        let i = 0;

        let tick = _ => {
            //
            //if(++i==max)
            //    this.dispatchEvent(new Event(TemplateEvent.RENDER_COMPLETE_LOADED));
        };

        images.forEach(img =>
        {
            if(img.complete && (++i==max))
            {
                //this.dispatchEvent(new Event(TemplateEvent.RENDER_COMPLETE_LOADED));
            }
            img.onload = tick;
            img.onerror = tick;
        });
    }

    static setup()
    {
        let templates = document.querySelectorAll('script[type="'+Template.SCRIPT_TYPE+'"]');
        templates.forEach(function(pEl)
        {
            Template.$[pEl.getAttribute("id")] = pEl.text;
            pEl.parentNode.removeChild(pEl);
        });
    }
}
NodeList.prototype.forEach||(NodeList.prototype.forEach = Array.prototype.forEach);

window.addEventListener("DOMContentLoaded", Template.setup, false);