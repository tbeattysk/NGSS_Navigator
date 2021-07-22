class InteractiveContainer{
    constructor(x,y,width,height,data,dotSize,margins){
        this.bounds = [x,y,width,height];
        this.children = [];
        this.possibleRefs = [];
        this.parent = null;
        this.dotSize = dotSize ? dotSize : null;
        this.dotSpacing = margins ? margins : null ;
        Object.assign(this,data)
    }

    width(){
        return this.bounds[2];
    }
    height(){
        return this.bounds[3];
    }
    x(){
        return this.bounds[0];
    }
    y(){
        return this.bounds[1];
    }
    setWidth(width){
        this.bounds[2] = width;
    }
    setHeight(height){
        this.bounds[3] = height;
    }
    getPosition(){
        return [this.bounds[0], this.bounds[1]];
    }
    setPosition(pos){
        this.bounds[0] = pos[0];
        this.bounds[1] = pos[1];
    }
    setBounds(bounds){
        this.bounds = bounds;
    }
    move(d){
        this.setPosition([this.x()+d[0],this.y()+d[1]]);
    }
    add(element){
        this.children.push(element);
        element.parent = this;
    }
    redraw(){
        this.children.forEach(child => {
            child.redraw();
        });
    }
    checkHover(){
        if(mouseX>this.x() && mouseX<this.x()+this.width() && mouseY>this.y() && mouseY<this.y()+this.height()){
            this.children.forEach(child => {
                child.checkHover();
            });
        }
    }
    getDotSize(){
        if(this.dotSize && this.dotSpacing){return this.dotSize + this.dotSpacing}
        else{return this.parent.getDotSize()}
    }
    getDotSpacing(){
        if(this.dotSpacing){return this.dotSpacing}
        else{return this.parent.getDotSpacing()}
    }
    updateLayout(){
        this.children.forEach(child => {
            child.updateLayout();
        });
    }
    addRef(element){
        this.possibleRefs.push(element);
    }
    getRefElement(ref){
        let result = false;
        if(this.ref == ref){
            return this
        }else{
            this.children.forEach(child => {
                let  childRef = child.getRefElement(ref)
                if(childRef){
                    result = childRef
                }
            });
            this.possibleRefs.forEach(simpleRef =>{
                let  childRef = simpleRef.getRefElement(ref)
                if(childRef){
                    result = childRef
                }
            })
            return result;
        }
    }
}
class SimpleRef extends InteractiveContainer{
    constructor(ref,data){
        super(0,0,0,0,data)
        this.ref = ref
    }
}
class VerticalGrowGradeBand extends InteractiveContainer{
    constructor(x,y,width,gradeBand,data){
        super(x,y,width,0,data);
        this.gradeBand = gradeBand;
        this.totalPEs = 0;
    }
    add(element){
        this.setPosition([this.x(),this.y()-element.height()]);
        element.setPosition(this.getPosition());
        this.setHeight(this.height()+element.height());
        super.add(element);
    }
    redraw(){
        super.redraw()
    }
    updateLayout(){
        this.setBounds([this.x(),height,this.width(),0]);

        this.children.forEach(element=>{
            this.setPosition([this.x(),this.y()-element.height()]);
            element.setPosition(this.getPosition());
            this.setHeight(this.height()+element.height());
        })
        super.updateLayout()
    }
}
class HorizontalPanel extends InteractiveContainer{
    constructor(x,y,width,height,data,maxChildren,dotSize,dotMargin){
        super(x,y,width,height,data, dotSize, dotMargin)
        this.maxChildren = maxChildren;
    }
    updateLayout(){
        super.updateLayout();
        let totalWidth = 0;
        this.children.forEach(child =>{
            totalWidth += child.width();
        })
        this.spacing = (this.width() - totalWidth)/(this.maxChildren-1);
        
        let x = this.x()
        for(let i = 0; i<this.maxChildren; i++){
            if(this.children[i]){
                this.children[i].setPosition([x,this.y()])
                this.children[i].updateLayout();
                x += this.children[i].width();
            }
            x += this.spacing;
        }
    }
}
class DotSetRow extends HorizontalPanel{
    constructor(x,y,width,data){
        super(x,y,width,0,data,8)
        this.totalPEs = 0;
    }
    setHeight(newHeight){
        this.children.forEach(child=>{
            child.setHeight(newHeight);
        })
        super.setHeight(newHeight);
    }
    getRefElement(requestedRef){
        let result = false;
        this.possibleRefs.forEach(simpleRef=>{
            if(simpleRef.getRefElement(requestedRef)){
                result = simpleRef;
            }
        })
        if(result!== false){
            return this
        }
    }
    getSepRefElement(requestedRef){
        let result = false;
        this.children.forEach(dotSet=>{
            if(dotSet.getRefElement(requestedRef)){
                result =  dotSet;
            }
        })
        return result;
    }
    updateLayout(){
        if(this.parent.width() != this.width){
            this.setWidth(this.parent.width())
        }
        super.updateLayout()
    }
}
class DotSet extends InteractiveContainer{
    constructor(x, y, height,sepsElement){
        super(x,y,0,height);
        this.possibleRefs.push(sepsElement);
        this.count = 0;
    }
    updateLayout(){
        this.count = this.children.length;
        this.colunms = 0
        if(this.height()<this.getDotSize()){
            this.dotsPerCol = 1;
        }
        else if(this.count > 0){
            let dotsPerCol = 99999
            while(dotsPerCol * this.getDotSize() > this.height()){
                this.colunms++
                dotsPerCol = ceil(this.count/this.colunms)
            }
            this.setWidth(this.colunms * this.getDotSize());
            this.dotsPerCol = dotsPerCol;
        }
        this.children.forEach(child => {
            child.updateLayout();
        });
    }
    getDotPosition(index){
        this.count = this.children.length
        let y = this.y() + this.height()/2 - (this.dotsPerCol-1) * this.getDotSize()/2 
        let x = this.x() + this.getDotSize()/2
        let dotSize = this.getDotSize();
        let colunm = 0;
        for(var i = 0; i<index; i++){
            //this.dots.push(new Dot(dotSize/2 + dotSize*colunm,y,dotSize))
            y = y + dotSize;
            if((i+1)%this.dotsPerCol == 0){
                y = this.y() + this.height()/2 - (this.dotsPerCol-1) * dotSize/2
                if(this.count - i <= this.dotsPerCol){
                    y = this.y() +this.height()/2 - (this.count - i-2)*dotSize/2
                }
                colunm++;
                x = x + dotSize
            }
        }
        return [x,y];
    }
    redraw(){
        noFill()
        rect(this.x(),this.y(),this.width(),this.height());
        super.redraw();
    }
}
class InteractiveElement extends InteractiveContainer{
    constructor(x,y,diameter,data){
        super(x,y,diameter, diameter,data)
        this.state = "rest";
        this.restLook = {fill:color(0,0,0), stroke:color(0,0,0)};
        this.hoverLook = {fill:color(255,0,150), stroke:color(0,0,0)};
        this.selectedLook = {fill:color(255,255,255), stroke:color(0,0,0)};
        this.highlightLook = {fill:color(0,180,180), stroke:color(0,0,0)};
        this.featuredLook = {fill:color(0,0,0), stroke:color(0,0,0)};
        this.hovered = false;
        this.selected = false;
        this.highlighted = false;
        this.featured = false;
        this.hidden = false;
        this.rest();
    }
    redraw(){
        switch(this.state){
            case "hidden":
                break;
            case "rest":
                break;
            case "hover":
                this.checkHover()
                break;
            case "selected":
                if(selectedElement != this){
                    this.rest();
                }
                break;
            case "highlight":
                break;
            case "featured":
                break;
        }
        fill(this.color)
        stroke(this.stroke)
    }
    rest(){
        if(!this.hidden){
            this.hovered = false;
            this.selected = false;
            if(this.featured){
                this.feature();
            }else{
                this.state = "rest";
                this.stroke = this.restLook.stroke;
                this.color = this.restLook.fill;
            }
        }
    }
    hide(){
        this.hidden = true;
    }
    show(){
        this.hidden = false;
        this.rest();
    }
    hover(){
        hoveredElement = this;
        this.hovered = true
        this.state = "hover";
        this.stroke = this.hoverLook.stroke;
        this.color = this.hoverLook.fill;
    }
    select(){
        this.rest();
        this.selected = true;
        this.state = "selected";
        this.stroke = this.selectedLook.stroke;
        this.color = this.selectedLook.fill;
    }
    highlight(){
        this.highlighted = true;
        this.state = "highlight";
        this.stroke = this.highlightLook.stroke;
        this.color = this.highlightLook.fill;
    }
    dehighlight(){
        this.highlighted = false;
        this.rest();
    }
    feature(){
        this.state = "featured";
        this.stroke = this.featuredLook.stroke;
        this.color = this.featuredLook.fill;
    }
    checkHover(){
        if( this.state != "selected"){
            if(this.isWithin()){
                    this.hover();
            }else{
                if(this.hovered){
                    hoveredElement = null;
                    if(this.highlighted)
                        this.highlight()
                    else
                        this.rest();
                }
            }
        }
    }

}
class Dot extends InteractiveElement{
    constructor(x, y, diameter, index, data,cccRef, sepRef){
        super(x,y,diameter,data)
        this.index = index
        this.data = data
        this.cccRef = cccRef;
        this.sepRef = sepRef;
        this.linkedElements = [sepRef]

        sepRef.linkedElements.push(this);
    }
    updateLayout(){
        //get the dot position from the DotSet parent
        this.setPosition(this.parent.getDotPosition(this.index));
    }
    redraw(){
        super.redraw();
        circle(this.x(),this.y(),this.getDotSize()-this.getDotSpacing());
    }    
    isWithin(){
        let d = dist(mouseX,mouseY,this.x(),this.y());
        return d<this.getDotSize()/2;
    }
    hover(){
        super.hover();
        this.linkedElements.forEach(element => {
            if(element.state != "selected")
                element.highlight();
        });
        let cccDesc = this.searchComprisedOf(this.cccRef.possibleRefs);
        let sepsDesc = this.searchComprisedOf(this.sepRef.possibleRefs)
        infoPanePrim.updateData(this.statementNotation[0].value,
            this.description[0].value,
            this.parent.parent.description[0].value,
            cccDesc.description[0].value,
            this.parent.possibleRefs[0].description[0].value,
            sepsDesc.description[0].value)
    }
    rest(){
        if(this.hovered){
            this.linkedElements.forEach(element => {
                if(element.state!= "selected")
                    element.dehighlight();
            });
        }
         super.rest();
         
    }
    searchComprisedOf(elements){
        let result = false;
        for(let i = 0; i<this.comprisedOf.length && !result; i++){
            elements.forEach(element=>{
                if(element.ref = this.comprisedOf[i].value){
                    result = element
                }
            });
        }
        return result;
    }
}
class SepRefIcon extends InteractiveElement{
    constructor(x,y,width,data,colorVal,id,image){
        super(x,y,width,data);
        this.id = id
        this.image = image
        this.linkedElements = [];
        this.hoverLook = {fill:color(50,50,50), stroke:color(90,90,90)};
    }
    redraw(){
        super.redraw();
        if(this.hovered){
            circle(this.x()+this.width()/2,this.y()+this.height()/2, 50)
        }else{
            stroke(150, 150, 150);
            rect(this.x(),this.y(),this.width(),this.height());
        }
        image(this.image, this.x(),this.y(),this.width(),this.height())
    }
    isWithin(){
        return mouseX>this.x() && mouseX<this.x()+this.width() &&mouseY>this.y() && mouseY<this.y()+this.height()
    }
    select(){
        super.select()
        this.linkedElements.forEach(element => {
            element.highlight();
        });
    }
    rest(){
        if(this.selected)
        this.linkedElements.forEach(element => {
            element.dehighlight();
        });
        super.rest();
    }
}
class GraphDrawing extends HorizontalPanel{
    constructor(x,y,width,height,data,dotSize,margins,ngss){
        super(x,y,width,height,data,4,dotSize,margins)
        let gradeBands = [["K","1","2"],["3","4","5",],["6","7","8"],["9","10","11","12"]];
        gradeBands.forEach(band => {
            this.add(new VerticalGrowGradeBand(x,y,this.width()/5,band));
        });
        //graph only the main 7 cccs (deal with other 5 with Seps?)
        //Prepare all 7 CCC rows in all 4 grade bands
        //Include ETS? missing PEs with only 7
        for (let i = 0; i < 7; i++) {
            for(let j = 0; j < 4; j++){
                let child = this.children[j];
                let newRow = new DotSetRow(child.x(),child.y(),child.width(),ngss[this.hasChild[i].value])
                this.children[j].add(newRow);
                for(let k = 0; k<8;k++){
                    newRow.add(new DotSet(newRow.x(),newRow.y(),newRow.height(),sepsIcons.children[k]))
                }
            }
            let ccc = ngss[this.hasChild[i].value];
            ccc.hasChild.forEach(subCccRef => {
                for (let p = 0; p < this.children.length; p++) {
                    if(gradeBands[p].includes(ngss[subCccRef.value].educationLevel[0].value)){
                        //keep track of all CCC refs for adding PE dots to correct grade band and DotSetRow
                        this.children[p].children[i].addRef(new SimpleRef(subCccRef.value,ngss[subCccRef.value]));
                    }
                }    
            });
        }
        let cccCount = 0;
        //Add all performance expectations as dots!
        Object.keys(ngss).forEach((k)=>{
            if(ngss[k].statementLabel && ngss[k].statementLabel[0].value == "Performance Expectation"){
                let pe = ngss[k];
                let comprisedOf = pe.comprisedOf.map(e=>{return e.value})
                let cccRow = null;
                
                for(let i = 0; i< comprisedOf.length && !cccRow; i++){
                        cccRow = this.getRefElement(comprisedOf[i])
                }
                if(cccRow){
                    cccCount++;
                }else{
                    console.log("PE not recorded in CCCs: "+pe.statementNotation[0].value )
                    //console.log(pe)
                }
                if(cccRow){
                    //ToDo: look through each dot set in row to find corresponding sep, 
                    //and add dot to that dotset for this PE (with ref)
                    let peHome = null;
                    for(let i = 0; i< comprisedOf.length && !peHome; i++){
                        peHome = cccRow.getSepRefElement(comprisedOf[i])
                    }
                    peHome.add(new Dot(0,0,this.getDotSize,peHome.children.length,pe,cccRow,peHome.possibleRefs[0]))
                    cccRow.totalPEs++;
                    cccRow.parent.totalPEs++;
                }
            }
        })
        console.log("PEs with CCCs identified: "+ cccCount)
        //
        this.updateLayout()
    }
    updateLayout(){
        this.setWidth(width);
        let graphHeightRatio = (height - 100)/(this.children[3].totalPEs*this.getDotSize());
        this.children.forEach(child => {
            //child.setHeight(child.totalPEs * this.dotSize/10);
            child.children.forEach(row=>{
                let plannedHeight = row.totalPEs * this.getDotSize() * graphHeightRatio
                if(plannedHeight != 0 && plannedHeight < this.getDotSize()){
                    plannedHeight = this.getDotSize();
                }
                row.setHeight(plannedHeight)
            })
            child.setWidth(this.width()/5)
        });
        super.updateLayout();
    }
}
class SepsPannel extends HorizontalPanel{
    constructor(x,y,width,height,data,ngss,practiceLogos){
        super(x,y,width,height,data,8)
        //refs 0-6 & 11 to be displayed
        let i = 0;
        let imageIndex = 0
        this.hasChild.forEach(child =>{
            let sepRef;
            if(i < 7 || i == 11){
                sepRef = new SepRefIcon(x,y,40,ngss[child.value],color(122,244,144),i,practiceLogos[imageIndex]);
                this.add(sepRef)
                imageIndex++;
            }else{
                //deal with non-displayed sep references
                sepRef = new SimpleRef(child.value,ngss[child.value])
                this.addRef(sepRef)
            }
            
            ngss[child.value].hasChild.forEach(grandChild=>{
                //TODO: Could still store the grade level desctriptor for each sep?
                //sepRef.addRef(new SimpleRef(grandChild.value,ngss[grandChild.value]))
                if(ngss[grandChild.value].hasChild){
                    ngss[grandChild.value].hasChild.forEach(ref=>{
                        sepRef.addRef(new SimpleRef(ref.value,ngss[ref.value]))
                    })
                }else{
                    sepRef.addRef(new SimpleRef(grandChild.value,ngss[grandChild.value]))
                }
            })  
            i++;
        })
        this.updateLayout()
    }

}