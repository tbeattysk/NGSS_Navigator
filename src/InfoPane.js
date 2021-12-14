class InfoPane{
    
    constructor(){
        this.elem = createElement("div")
        this.elem.position(window.innerWidth-150,0,"relative")
        this.elem.class("pe-stack")
        this.selectedPE = null;
        this.inspectedPE = null;
    }
    position(x,y,type){
        this.elem.position(x,y,type)
    }
    deselectPE(){
        if(this.selectedPE) this.selectedPE.elem.remove();
    }
    selectPE(pe){
        this.deselectPE();
        this.selectedPE = new InfoBlockPE(pe,this.elem)
        // this.selectedPE.elem.addClass("pe-selected-frame")
    }
    setInspect(){
        if(this.inspectedPE) this.inspectedPE.elem.remove();
        this.inspectedPE = new InfoBlockPE(this.selectedPE.pe,this.elem)
        this.deselectPE();
        this.selectedPE = new InfoBlockBlank(this.elem)
        this.inspectedPE.elem.class("pe-selected-frame")
    }
    deinspectPE(){
        if(this.inspectedPE) this.inspectedPE.elem.remove();
    }
    width(){
        return this.elem.width;
    }
}
class InfoBlockBlank{
    constructor(parentDiv){
        this.elem = createElement("div")
        parentDiv.elt.prepend(this.elem.elt)
        this.elem.addClass("pe-frame")
    }
}
class InfoBlockPE{
    constructor(pe,parentDiv){
        this.elem = createElement("div")
        parentDiv.elt.prepend(this.elem.elt)
        this.elem.addClass("pe-frame")
        this.elem.id(pe.refNotation)
        this.pe = pe;
        let id = this.pe.statementNotation[0].value
        let desc = this.pe.description[0].value
        let comments = []
        if(this.pe.comment){
            this.pe.comment.forEach(comment=>{
                comments.push(comment.value)
            });
        }   
        let cccTitle = this.pe.parent.parent.description[0].value
        let cccDesc = this.pe.searchComprisedOf(this.pe.cccRef.possibleRefs)[0];
        cccDesc = cccDesc.description[0].value;
        let sepTitle = this.pe.parent.possibleRefs[0].description[0].value
        let sepDesc = this.pe.searchComprisedOf(this.pe.sepRef.possibleRefs)[0];
        sepDesc = sepDesc.description[0].value
        let dciDescriptions = this.pe.searchComprisedOf(this.pe.getAllPossibleDciRefs())
        let result = `
            <div class="pe-desc">
                <h2 class="pe-notation">${id}</h2>
                <div class="pe-full">
                    <div class="pe-statement">${desc}</div>`
        comments.forEach(comment=>{
            result += `
                    <div class="pe-comment">${comment}</div>`
        })
        result += `
                </div>
            </div>
            <div class="pe-components" >
                <div class="left-comps">
                    <div class="ccc">
                        <h4>${cccTitle}</h4><ul>
                        <li><span>${cccDesc}</span></li></ul>
                    </div>
                    <div class="practices">
                        <h4>${sepTitle}</h4><ul>
                        <li><span>${sepDesc}</span></li></ul>
                    </div>
                </div>
                <div class="right-comps">
                    <div class="dci">`
            let title;
            let count = 0;
            dciDescriptions.forEach(dciDesc => {
                if(title != dciDesc.dciParentTitle){
                    title = dciDesc.dciParentTitle;
                    if(count != 0)result+='</ul>'
                    result+=`
                        <h4>${title}</h4>
                        <ul>`
                }
                result+=`
                                <li><span>${dciDesc.description[0].value}</span> </li>`
                count++
            })
            result+=`
                        </ul>
                    </div>
                </div>
            </div>`
        this.elem.html(result);
        
        // this.elem.html(`<div style="margin:10px"><b>${id}</b></div> <div style="margin:20px">${desc}</div>
        //             <div style="margin:10px"> <i>${cccTitle}</i></div> <div style="margin:20px">${cccDesc}</div>
        //             <div style="margin:10px"><i>${sepTitle}</i></div> <div style="margin:20px">${sepDesc}</div>`);
        // let title;
        // dciDescriptions.forEach(dciDesc => {
        //     if(title != dciDesc.dciParentTitle){
        //         title = dciDesc.dciParentTitle;
        //         this.elem.html(this.elem.html()+`</div><div style="margin:10px"> <i>${title}</i>`)
        //     }
        //     this.elem.html(this.elem.html()+`<div style="margin:20px">${dciDesc.description[0].value}</div>`)
        // });
    }
}