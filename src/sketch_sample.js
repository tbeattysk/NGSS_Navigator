
let container = [300,60];
let dotSpacing = 6;
let dotSize = 10;
let vstack;
let refs;
let totalHeight = 0;
let hoveredElement = null;
let selectedElement = null;

function setup() {
  createCanvas(500, 400);
  console.log("out");

  let data= [
    [1,0,1,0,1,0,1,0],
    [2,0,3,2,0,2,0,2],
    [0,0,1,0,0,0,0,0],
    [2,0,1,0,3,0,0,0]
                ]
  let idTally = 0;  
  data = data.map(element =>{
    return{
    children:
        element.map(sets=>{
            return{
                children: function(){
                    let dots = []
                    for(let i = 0; i<sets;i++){
                        dots.push({
                            id: idTally,
                            ref: [ceil(Math.random()*4)]
                        })
                        idTally++;
                    }
                    return dots;
                }()
            }
        })
    }          
  })  
  
  refs = new VGrowPanel(10,300,60);
  refs.add(new Ref(refs.x(),refs.y(),refs.width(),60,color(80,255,80),1))
  refs.add(new Ref(refs.x(),refs.y(),refs.width(),60,color(80,80,255),2))
  refs.add(new Ref(refs.x(),refs.y(),refs.width(),60,color(225,80,80),3))
  refs.add(new Ref(refs.x(),refs.y(),refs.width(),60,color(200,80,200),4))

  vStack = new VGrowPanel(width/2 - container[0]/2, height,container[0],dotSize,dotSpacing);

  data.forEach(row => {
    let totalDots = row.children.reduce((a,b)=>{return {children:Array.prototype.concat(a.children,b.children)}}).children.length;
    let newHeight = totalDots * vStack.getDotSize()/2.5;
    if(newHeight<vStack.getDotSize()){
        newHeight = vStack.getDotSize()
    }
    let nextRow = new RowSet(vStack.x(),vStack.y()-newHeight,vStack.width(),newHeight);
    vStack.add(nextRow);
    row.children.forEach(dotSet =>{
        let nextSet = new DotSet(nextRow.x(),nextRow.y(),nextRow.height(),dotSet.children.length);
        nextRow.add(nextSet);
        for(let i = 0; i<dotSet.children.length; i++){
            let pos = nextSet.getDotPosition(i);
            let newDot = new Dot(pos[0],pos[1],vStack.getDotSize(),i,dotSet.children[i]);
            nextSet.add(newDot);
            dotSet.children[i].ref.forEach(ref => {
                newDot.addRef(function(){
                    for (let i = 0; i < refs.children.length; i++) {
                        const refId = refs.children[i].id;
                        if(refId == ref){
                            refs.children[i].addRef(newDot);
                            return refs.children[i];
                        }
                    }
                }())
            });
        }
        
    })
    nextRow.updateLayout(); //align all the dots
  })


}

function draw() {
    background(120,220,80)
    vStack.redraw();
    refs.redraw();
}

// EVENTS
function mouseMoved(event){
    vStack.checkHover();
    refs.checkHover();
}

function mouseClicked(event){
    vStack.checkHover();
    refs.checkHover();
    if(hoveredElement != null){
        hoveredElement.select();
        selectedElement = hoveredElement;
    }
}

