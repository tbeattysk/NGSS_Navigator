highlight(){
    super.highlight();
    if(this.checkHover() == this){
    let points = []
    this.linkedElements.forEach(pe=>{
        points.push(pe.getPosition());
    })
    points.sort((a,b)=>{return a[0]-b[0]})
    strokeWeight(2)
    noFill()
    stroke(255)
    beginShape()
    curveVertex(0,0)
    points.forEach(point=>{
        vertex(point[0],point[1])
    })
    endShape()
    }
}