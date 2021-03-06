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
            for (let i = 0; i < this.children.length; i++) {
                const childHover = this.children[i].checkHover();
                if(childHover)return childHover
            }
        }
        return null;
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
        this.children.forEach(child => {
            child.redraw();
        })
    }
    // redraw(){
 
    //     
        
    // }
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
class EmptyBox extends InteractiveContainer{
    constructor(x,y,width){
        super(x,y,width,0)
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
    constructor(x,y,width,data,prev,colors){
        super(x,y,width,0,data,8)
        this.totalPEs = 0;
        this.prev = prev;
        this.colors = colors
    }
    redraw(){
        fill(this.colors[1])
        noStroke()
        if(this.parent.gradeBand[0]=="K"){
            this.bezGraphStartSection()
        }else{
            this.bezGraphMidSection()
        }
        if(this.parent.gradeBand[0]=="9"){
            rect(this.right()-this.getDotSize()-1,this.bottom(),width,this.top()-2-this.bottom())
        }
        // Don't call super.redraw() otherwise next grade level might cover dots
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
    top(){return this.y()}
    bottom(){return this.bounds[1]+this.bounds[3]}
    left(){return this.x()}
    right(){return this.bounds[0]+this.bounds[2]}
    bezGraphStartSection(){ 
        beginShape()
        vertex(0,height)
        bezierVertex(0,this.bottom(), this.left(), this.bottom(),this.left(), this.bottom())
        vertex(this.right()-this.getDotSize(),this.bottom())
        vertex(this.right()-this.getDotSize(),this.top()-2)
        vertex(this.left(),this.top()-2)
        bezierVertex(this.left(), this.top()-2, 0, this.top()-2, 0, height)
        endShape()
      }
      bezGraphMidSection(){
        beginShape()
        let prevRight = this.prev.right()-this.getDotSize()-1
        let xcontr = width/30
        vertex(prevRight,this.prev.bottom())
        bezierVertex(prevRight + xcontr,this.prev.bottom(), this.left()+this.getDotSize()-xcontr, this.bottom(),this.left()+this.getDotSize(), this.bottom())
        vertex(this.right()-this.getDotSize(), this.bottom())
        vertex(this.right()-this.getDotSize(), this.top()-2)
        vertex(this.left()+this.getDotSize(), this.top()-2)
        bezierVertex(this.left()+this.getDotSize()-xcontr, this.top()-2, prevRight+xcontr, this.prev.top()-2, prevRight, this.prev.top()-2)
        vertex(prevRight,this.prev.bottom())
        endShape()
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
    // redraw(){
    //     noFill()
    //     stroke(255,255,255)
    //     strokeWeight(1)
    //     rect(this.x(),this.y(),this.width(),this.height());
    //     super.redraw();
    // }
}
class InteractiveElement extends InteractiveContainer{
    constructor(x,y,diameter,data){
        super(x,y,diameter, diameter,data)
        this.linkedElements = []
        this.restLook = {fill:color(255,255,255), stroke:color(255,255,255)};
        this.highlightLook = {fill:color(150,150,150), stroke:color(0,0,0)};
        this.background = color(0,0,0)
        this.outlineColor = color(255,200);
        this.selected = false;
        this.outlined = false;
        this.highlighted = false;
        this.hidden = false;
    }
    drawBackground(){
        //draw background
    }
    redraw(withBackground){
        if(withBackground){
                this.drawBackground();
        }if(!this.hidden){
            if(!this.highlighted && !this.outlined && !this.selected)this.drawRest()
            if(this.highlighted)this.drawHighlighted();
            if(this.outlined)this.drawOutlined();
            if(this.selected)this.drawSelected();
        }
        if(this instanceof DciElement) super.redraw()
        
    }
    hide(){
        this.hidden = true;
        this.drawBackground();
    }
    show(){
        this.hidden = false;
        this.redraw(true)
    }
    select(){
        this.selected = true;
        this.redraw(true)
    }
    deselect(){
        this.selected = false;
        this.redraw(true);
    }
    highlight(){
        this.highlighted = true;
        this.redraw(false);
    }
    dehighlight(){
        this.highlighted = false;
        this.redraw(true);
    }
    outline(outlineColor){
        this.outlined=true;
        this.redraw(true);
        this.outlineColor = outlineColor || color(0,200);

    }
    deoutline(){
        this.outlined=false;
        this.redraw(true);
    }
    drawRest(){
        //Abstract
    }
    drawHighlighted(){
        //Abstract
    }
    drawOutlined(){
        //Abstract
    }
    drawSelected(){
        //Abstract
    }

}
class Dot extends InteractiveElement{
    constructor(x, y, diameter, index, data,selfRef,cccRef, sepRef, dciRefs, dciTitleRef,colors){
        super(x,y,diameter,data)
        this.index = index
        this.data = data
        this.refNotation = selfRef
        this.cccRef = cccRef;
        this.sepRef = sepRef;
        this.dciRefs = dciRefs;
        this.dciTitleRef = dciTitleRef;
        this.colors = colors;
        this.restLook.fill = colors[0]
        this.background = colors[1]
        this.highlightLook.fill = colors[2]
        this.featured = false;
        this.dciId = dciTitleRef.statementNotation[0].value.split("-")[1]
        this.dciDesc = dciTitleRef.description[0].value
        this.linkedElements = [sepRef];
        this.linkedElements = this.linkedElements.concat(dciRefs);
        sepRef.linkedElements.push(this);
        dciRefs.forEach(ref=>{
            ref.linkedElements.push(this);
            if(this.dciId == ref.parent.tempNotation){
                this.linkedElements.push(ref.parent)
                this.linkedElements.push(ref.parent.parent)
                ref.parent.linkedElements.push(this)
                ref.parent.parent.linkedElements.push(this)
            }
        })
        
    }
    updateLayout(){
        //get the dot position from the DotSet parent
        this.setPosition(this.parent.getDotPosition(this.index));
    }
    drawBackground(){
        fill(this.background)
        noStroke()
        circle(this.x(),this.y(),this.getDotSize());
    }
    checkHover(){
        let d = dist(mouseX,mouseY,this.x(),this.y());
        if(d<this.getDotSize()/2){
            return this;
        }
        return null;
    } 
    // hover(){
    //     super.hover();
    //     let cccDesc = this.searchComprisedOf(this.cccRef.possibleRefs);
    //     let sepsDesc = this.searchComprisedOf(this.sepRef.possibleRefs)
    //     infoPanePrim.updateData(this.statementNotation[0].value,
    //         this.description[0].value,
    //         this.parent.parent.description[0].value,
    //         cccDesc.description[0].value,
    //         this.parent.possibleRefs[0].description[0].value,
    //         sepsDesc.description[0].value)
    // }
    drawRest(){
        fill(this.restLook.fill);
        noStroke();

        if(this.featured){
            this.star(this.x(),this.y(),this.getDotSize()/4, this.getDotSize()-1.5*this.getDotSpacing(),5)
        }else{
            circle(this.x(),this.y(),this.getDotSize()-this.getDotSpacing());
        }
    }
    drawHighlighted(){
        fill(this.highlightLook.fill);
        noStroke()
        if(this.featured){
            this.star(this.x(),this.y(),this.getDotSize()/4, this.getDotSize()-1.5*this.getDotSpacing(),5)
        }else{
            circle(this.x(),this.y(),this.getDotSize()-this.getDotSpacing());
        }
    }
    drawOutlined(){
        if(!this.highlighted)this.drawRest()
        stroke(this.outlineColor);
        strokeWeight(3)
        //fill(200)
        noFill()
        if(this.featured){
            this.star(this.x(),this.y(),this.getDotSize()/4, this.getDotSize()-1.5*this.getDotSpacing(),5)
        }else{
            circle(this.x(),this.y(),this.getDotSize()-this.getDotSpacing());
        }
    }
    drawSelected(){
        stroke(color(100));
        strokeWeight(5)
        //fill(this.highlightLook.fill)
        if(this.featured){
            this.star(this.x(),this.y(),this.getDotSize()/4, this.getDotSize()-1.5*this.getDotSpacing(),5)
        }else{
            circle(this.x(),this.y(),this.getDotSize()-this.getDotSpacing());
        }
    }
    searchComprisedOf(elements){
        let results = [];
        if(elements){
            for(let i = 0; i<this.comprisedOf.length; i++){
                elements.forEach(element=>{
                    if(element.ref == this.comprisedOf[i].value){
                        results.push(element)
                    }
                });
            }
        }
        return results;
    }
    getAllPossibleDciRefs(){
        let allRefs = [];
        this.dciRefs.forEach(ref=>{
            ref.possibleRefs.forEach(subRef=>{
                subRef.possibleRefs.forEach(bottom=>{
                    allRefs.push(bottom);
                })
            })
        })
        return allRefs;
    }

    star(x, y, radius1, radius2, npoints) {
        let angle = TWO_PI / npoints;
        let halfAngle = angle / 2.0;
        beginShape();
        for (let a = -0.315; a < TWO_PI; a += angle) {
          let sx = x + cos(a) * radius2;
          let sy = y + sin(a) * radius2;
          vertex(sx, sy);
          sx = x + cos(a + halfAngle) * radius1;
          sy = y + sin(a + halfAngle) * radius1;
          vertex(sx, sy);
        }
        endShape(CLOSE);
      }
}
class SepRefIcon extends InteractiveElement{
    constructor(x,y,width,data,colorVal,id,image){
        super(x,y,width,data);
        this.id = id
        this.image = image
        this.restLook = {fill:color(0,0,0), stroke:color(0,0,0)};
        this.hoverLook = {fill:color(80,80,80), stroke:color(50,50,50)};
    }
    drawBackground(){
        fill(this.background)
        noStroke()
        rect(this.x(),this.y(),this.width(),this.height())
        circle(this.x()+this.width()/2,this.y()+this.height()/2, 52)
    }

    checkHover(){
        if(mouseX>this.x() && mouseX<this.x()+this.width() &&mouseY>this.y() && mouseY<this.y()+this.height()){
            return this
        }
        return null
    }
    drawRest(){
        tint(128)
        image(this.image, this.x(),this.y(),this.width(),this.height(),0.5)
    }
    drawHighlighted(){
        fill(this.hoverLook.fill)
        noStroke()
        circle(this.x()+this.width()/2,this.y()+this.height()/2, 50)
        this.drawRest()
    }
    drawOutlined(){
        this.drawRest()
        noFill()
        stroke(this.outlineColor)
        strokeWeight(2)
        circle(this.x()+this.width()/2,this.y()+this.height()/2, 50)
    }
    drawSelected(){
        this.drawBackground()
        if(this.highlighted)this.drawHighlighted()
        tint(255)
        image(this.image, this.x(),this.y(),this.width(),this.height(),0.5)
        noFill()
        stroke(255)
        strokeWeight(2)
        circle(this.x()+this.width()/2,this.y()+this.height()/2, 50)

    }
    
}
class DciElement extends InteractiveElement{
    constructor(x,y,diameter,data,title){
        super(x,y,diameter,data)
        this.title = title
    }
    redraw(){
        this.drawBackground()
        textAlign(CENTER,CENTER)
        noStroke();
        if(this.highlighted){
            
        }
        if(this.hovered || this.selected){
            fill(255,255,255)
        }else{
            fill(150,150,150)
        }
        text(this.title, this.x(), this.y()+2)
        super.redraw()  
    }
    drawBackground(){
        fill(0,0,0)
        noStroke()
        circle(this.x(),this.y(),this.width()+3)
    }
    init(){
        this.children.forEach(child=>{
            child.init();
        })
    }
    checkHover(){
        let result = null;
        //hack to deal with shortcomming of horizontalRow parent
        if(mouseX>dciLists.x()-20 && mouseX<dciLists.x()+dciLists.width()+100 && mouseY>dciLists.y()-50 && mouseY<dciLists.y()+dciLists.height()){
            let d = dist(mouseX,mouseY,this.x(),this.y());
            if(d<this.width()/2){
                result = this;
            }
            if(result == null){
                for (let i = 0; i < this.children.length; i++) {
                    const childHover = this.children[i].checkHover();
                    if(childHover)return childHover
                }
            }
        }
        return result
    }

    drawRest(){
        if(!this.selected){
            fill(150,150,150)
            noStroke()
            textAlign(CENTER,CENTER)
            text(this.title, this.x(), this.y()+2)
        }
    }
    drawHighlighted(){
        fill(80,80,80)
        noStroke()
        circle(this.x(),this.y(),this.width())
        this.drawRest()
    }
    drawOutlined(){
        this.drawRest()
        noFill()
        stroke(this.outlineColor)
        strokeWeight(2)
        circle(this.x(),this.y(),this.width())
    }
    drawSelected(){
        fill(255,255,255)
        noStroke()
        text(this.title, this.x(), this.y()+2)
        this.drawOutlined()
    }
    add(element){
        super.add(element);
    }
}
class DciDropDown extends DciElement{
    constructor(x,y,diameter,data,title){
        super(x,y,diameter,data,title);
        for(let i = 1; i <= data.length; i++){
            this.add(new DciDropRight(x,y+40*i,diameter,data[i-1],i))
        }
        this.setHeight(50)
        this.setWidth(50)
    }
    updateLayout(){
        this.children.forEach(child=>{
            child.setPosition([this.x(),child.y()])
        })
        super.updateLayout()
    }
    redraw(){
        textSize(24);
        super.redraw();
    }

}
class DciDropRight extends DciElement{
    constructor(x,y,diameter,data,title){
        super(x,y,diameter,data,title);
        let alpha = ["A","B","C","D","E"]
        for(let i = 1; i <= data; i++){
            let newDci = new DciEnd(x+25*i,y,diameter,null,alpha[i-1])
            this.add(newDci)
        }
    }
    init(){
        this.tempNotation = this.parent.title+this.title;
        super.init();
    }
    redraw(){
        textSize(18);
        super.redraw();
    }
    updateLayout(){
        let i = 1;
        this.children.forEach(child=>{
            child.setPosition([this.x()+25*i,this.y()])
            i++
        })
        super.updateLayout()
    }
}
class DciEnd extends DciElement{
    constructor(x,y,diameter,data,title){
        super(x,y,diameter,data,title);    
    }
    init(){
        this.tempNotation = this.parent.tempNotation+"."+this.title;
        //yuck :(
        this.parent.parent.parent.hasChild.forEach(child=>{
            let possibleRef = ngss[child.value];
            if(possibleRef.statementNotation[0].value === this.tempNotation){
                let simple = new SimpleRef(child.value,possibleRef)
                this.addRef(simple)
                let title = possibleRef.statementNotation[0].value+": "+possibleRef.description[0].value;
                simple.dciParent = this;
                simple.hasChild.forEach(refChild=>{
                    let sub = new SimpleRef(refChild.value, ngss[refChild.value])
                    sub.dciParentTitle = title;
                    simple.addRef(sub)
                    sub.dciParent = simple;
                    
                })
            }
        })
    }
    redraw(){
        textSize(18);
        super.redraw();
    }
    rest(){
        if(this.selected)
        super.rest();
    }
    select(){
        super.select()
    }
    drawOutlined(){
        this.drawRest()
        noFill()
        stroke(this.outlineColor)
        strokeWeight(2)
        circle(this.x(),this.y(),this.width())
    }
}
class GraphDrawing extends HorizontalPanel{
    constructor(x,y,width,height,data,dotSize,margins,ngss,colors){
        super(x,y,width,height,data,6,dotSize,margins)
        let gradeBands = [["K","1","2"],["3","4","5",],["6","7","8"],["9","10","11","12"]];
        this.add(new EmptyBox(x,y,15))
        gradeBands.forEach(band => {
            this.add(new VerticalGrowGradeBand(x,y,this.width()/5,band));
        });
        this.add(new EmptyBox(x,y,0))
        //graph only the main 7 cccs (deal with other 5 with Seps?)
        //Prepare all 7 CCC rows in all 4 grade bands
        //Include ETS? missing PEs with only 7
        for (let i = 0; i < 7; i++) {
            let newRow, prevRow
            for(let j = 1; j < 5; j++){
                let child = this.children[j];
                newRow = new DotSetRow(child.x(),child.y(),child.width(),ngss[this.hasChild[i].value],prevRow,colors[i])
                this.children[j].add(newRow);
                for(let k = 0; k<8;k++){
                    newRow.add(new DotSet(newRow.x(),newRow.y(),newRow.height(),sepsIcons.children[k]),colors[i])
                }
                prevRow = newRow
            }
            let ccc = ngss[this.hasChild[i].value];
            ccc.hasChild.forEach(subCccRef => {
                for (let p = 1; p < 5; p++) {
                    if(gradeBands[p-1].includes(ngss[subCccRef.value].educationLevel[0].value)){
                        //keep track of all CCC refs for adding PE dots to correct grade band and DotSetRow
                        this.children[p].children[i].addRef(new SimpleRef(subCccRef.value,ngss[subCccRef.value]));
                    }
                }    
            });
        }
        let cccCount = 0;
        //Add all performance expectations as dots!
        Object.keys(ngss).forEach((k)=>{
            if(ngss[k].statementLabel && ngss[k].statementLabel[0].value == "Disciplinary Core Idea"){
                let dciTitleRef = ngss[k];
                dciLists.children.forEach(header=>{
                    header.children.forEach(dci=>{
                        if(dci.tempNotation == dciTitleRef.statementNotation[0].value.substring(dciTitleRef.statementNotation[0].value.length - dci.tempNotation.length)){
                            Object.assign(dci,dciTitleRef)
                        }
                    })
                })
                // Skip "Students who demonstrate understaning..." blah blah
                ngss[dciTitleRef.hasChild[0].value].hasChild.forEach(peRef=>{
                    let pe = ngss[peRef.value];
                    let comprisedOf = pe.comprisedOf.map(e=>{return e.value})
                    let cccRow = null;
                    
                    for(let i = 0; i< comprisedOf.length && !cccRow; i++){
                            cccRow = this.getRefElement(comprisedOf[i])
                    }
                    if(cccRow){
                        cccCount++;
                        //ToDo: look through each dot set in row to find corresponding sep, 
                        //and add dot to that dotset for this PE (with ref)
                        let peHome = null;
                        for(let i = 0; i< comprisedOf.length && !peHome; i++){
                            peHome = cccRow.getSepRefElement(comprisedOf[i])
                        }
                        let dciLinks = []
                        for(let i = 0; i< comprisedOf.length; i++){
                            let possibleRef = dciLists.getRefElement(comprisedOf[i])
                            if(possibleRef.dciParent && dciLinks.indexOf(possibleRef.dciParent.dciParent) === -1){
                                dciLinks.push(possibleRef.dciParent.dciParent)
                            } 
                        }
                        peHome.add(new Dot(0,0,this.getDotSize,peHome.children.length,pe,peRef.value,cccRow,peHome.possibleRefs[0],dciLinks,dciTitleRef,cccRow.colors))
                        cccRow.totalPEs++;
                        cccRow.parent.totalPEs++;
                    }else{
                        console.log("PE not recorded in CCCs: "+pe.statementNotation[0].value )
                        //console.log(pe)
                    }
                })
            }
        })
        console.log("PEs with CCCs identified: "+ cccCount)
        //
        this.updateLayout()
    }
    updateLayout(){
        //this.setWidth(width);
        let graphHeightRatio = (height - 100)/(this.children[4].totalPEs*this.getDotSize());
        this.children.forEach(child => {
            //child.setHeight(child.totalPEs * this.dotSize/10);
            child.children.forEach(row=>{
                let plannedHeight = row.totalPEs * this.getDotSize() * graphHeightRatio
                if(plannedHeight != 0 && plannedHeight < this.getDotSize()){
                    plannedHeight = this.getDotSize();
                }
                row.setHeight(plannedHeight)
            })
            if(child instanceof VerticalGrowGradeBand) child.setWidth(this.width()/5)
        });
        super.updateLayout();
    }
    redraw(){
        super.redraw();
    }
    redrawDots(){
        //Ensure dots are drawn over all graph area
        this.children.forEach(child => {
            child.children.forEach(row=>{
                row.children.forEach(dotSet=>{
                    dotSet.children.forEach(dot=>{
                        dot.redraw();
                    })
                })
            })
        });
    }
    redrawText(){
        //draw text
        this.children[4].children.forEach(row =>{
            fill(row.colors[2])
            textAlign(CENTER,TOP)
            textSize(18)
            noStroke()
            text(row.description[0].value,row.x()-10,row.y()+5,row.width()+45)
        })
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
class DciPannel extends HorizontalPanel{
    constructor(x,y,width,height,data,ngss){
        super(x,y,width,height,data,4)
        let structure = {
            "PS":[3,2,4,3],
            "LS":[4,4,2,4],
            "ESS":[3,5,4,],
            "ETS":[3]
        }
        Object.keys(structure).forEach(k=>{
            this.add(new DciDropDown(x,y,22,structure[k],k))
        })
        this.children.forEach(child=>{
            child.init();
        })
        this.updateLayout()
    }
    checkHover(){
        if(mouseX>dciLists.x()-20 && mouseX<dciLists.x()+dciLists.width()+100 && mouseY>dciLists.y()-50 && mouseY<dciLists.y()+dciLists.height()){
            for (let i = 0; i < this.children.length; i++) {
                const childHover = this.children[i].checkHover();
                if(childHover)return childHover
            }
        }
        return null
    }

}