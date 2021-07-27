redraw(){
    if(this.parent.gradeBand[0]=="K"&&this.description[0].value =="Patterns"){
    fill(255,0,0)
    stroke(0,0,0)
    strokeWeight(5)
    noStroke()
    this.bezGraphStartSection()}
    super.redraw()
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
    vertex(this.right()-this.getDotSize(),this.top())
    vertex(this.left(),this.top())
    bezierVertex(this.left(), this.top(), 0, this.top(), 0, height)
    endShape()
  }
  bezGraphMidSection(section,topStart,bottomStart,topEnd,bottomEnd,xScale,yScale){
    beginShape()
    var startX = (section - 1)*xScale/4
    var bezEndX = (section - 1)*xScale/4 + xScale/12;
    var endX = section*xScale/4
    var xcontr = xScale/24
    vertex(startX,h-bottomStart*yScale)
    bezierVertex(startX+xcontr,h - bottomStart*yScale, bezEndX-xcontr, h-bottomEnd*yScale,bezEndX, h-bottomEnd*yScale)
    vertex(endX, h - bottomEnd*yScale)
    vertex(endX, h - topEnd*yScale)
    vertex(bezEndX,h-topEnd*yScale)
    bezierVertex(bezEndX-xcontr, h - topEnd*yScale, startX+xcontr, h - topStart*yScale, startX, h-topStart*yScale)
    vertex(startX,h-bottomStart*yScale)
    endShape()
  }