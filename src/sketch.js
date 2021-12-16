var ngss;
var cccGraph;
var sepsIcons;
var practiceLogos;
var dciLists;
var detailsBar;
var canvas
var infoPane
var hoveredElement;
var selectedElement;
var mouseManager;
var colors;

function preload(){
    ngss = loadJSON("ngssMini.JSON");
    practiceLogos =[
        loadImage("src/powerpoint.svg"),
        loadImage("src/conversation.svg"),
        loadImage("src/maze.svg"),
        loadImage("src/model.svg"),
        loadImage("src/consult.svg"),
        loadImage("src/newspaper.svg"),
        loadImage("src/biometric.svg"),
        loadImage("src/calculating.svg")
      ]
}
function setup() {
    colors = [  [color(255,215,187), color(255,156,110),  color(172,0,0)],  //volcano 2,4,8
                [color(255,241,177), color(255,215,102),  color(167,81,0)], //gold 2,4,8
                [color(241,255,175), color(212,243,97),   color(60,128,0)], //lime 2,4,8
                [color(162,274,236), color(92,220,212),   color(0,93,99)],  //cyan 2,4,8
                [color(211,228,255), color(133,165,255),  color(15,0,147)], //geekblue 2,4,8
                [color(243,217,255), color(180,128,236),  color(48,0,120)], //purple 2,4,8
                [color(255,212,232), color(255,134,193),  color(154,0,87)], //magenta 2,4,8
                [color(255,255,255), color(205,205,205),  color(0,0,0)]
          ]
    canvas = createCanvas(window.innerWidth,window.innerHeight);
    canvas.position(0,0,"relative")
    infoPane = new InfoPane();
    
    //Create NGSS Graphs
    //TODO: create new class that extends RowSet with graphDrawing :)
    sepsIcons = new SepsPannel(30,30,400,80,ngss["S2467516"],ngss,practiceLogos)
    dciLists = new DciPannel(50,100,500,200,ngss["S2467517"],ngss)
    cccGraph = new GraphDrawing(0,0,width,height,ngss["S2467518"],15,5,ngss,colors);
    mouseManager = new MouseManager();
    //Add grade-band rows by refs...
    redraw()
    //cccGraph.redraw();
     
    //openFullScreen();
    noLoop();
}

function draw(){
    
}

window.onresize = function() {
    // assigns new values for width and height variables
    redraw();
}
let redraw = function(){ 
    let desiredWidth = 890;
    let desiredHeight = 405;
    if(window.innerWidth - 400 > desiredWidth){
        //exceeds size for size panel
        desiredWidth = 890;
        infoPane.position(890,0,"fixed")
        if(window.innerHeight > 405){
            desiredHeight = window.innerHeight;
        }
    }else{
        if(window.innerWidth > 800){
            desiredWidth = window.innerWidth;
        }
        desiredHeight = 650
        if(window.innerHeight - 100 > 405){
            infoPane.position(0,window.innerHeight-100,"fixed")
        }else{
            canvas.position(0,0,"relative")
        }infoPane.position(0,0,"relative")
    }
    
    
    resizeCanvas(window.innerWidth,desiredHeight)
    background(0,0,0)
    noFill();
    cccGraph.setBounds([0,0,desiredWidth,height]);
    cccGraph.updateLayout();
    cccGraph.redraw()
    sepsIcons.redraw()
    dciLists.redraw()
    mouseManager.redraw();
    cccGraph.redrawDots();
    cccGraph.redrawText()
    mouseManager.drawHoverText()
}

// EVENTS
function mouseMoved(event){
    if(mouseManager){
        mouseManager.mouseMoved();
    }
}

function mouseClicked(event){
    if(mouseManager){
        mouseManager.mouseClicked();
    }
}

class MouseManager{
    constructor(){
        this.hoveredElement = null;
        this.linkedHoverElements = [];
        this.selectedElement = null;
        this.inspectedElement = null;
    }
    setHover(element,linkedHoverElements){
        fill(255,255,255)
        this.hoveredElement = element;
        element.highlight();
        this.linkedHoverElements = linkedHoverElements;
        linkedHoverElements.forEach(link=>{
            link.highlight()
        })
        this.drawHoverText()
        //if(element instanceof DciEnd)
    }
    drawHoverText(){
        if(this.hoveredElement){
            let title
            let description
            let element = this.hoveredElement
            if(element instanceof Dot){
                title = element.statementNotation[0].value
                description = element.dciTitleRef.description[0].value
            }else if(element instanceof SepRefIcon){
                title = ""
                description = element.description[0].value
            }else if(element instanceof DciEnd){
                title = element.tempNotation
                description = element.possibleRefs[0].description[0].value
            }else if(element instanceof DciDropRight){
                title = element.tempNotation
                description =  element.description[0].value
            }
            fill(255)
            noStroke()
            textAlign(RIGHT,TOP)
            text(title,470,30,100,120)
            textAlign(LEFT,TOP)
            text(description,580,30,300,120)
        }
    }
    clearHover(){
        fill(255,0,0)
        noStroke()
        this.hoveredElement.dehighlight();
        this.hoveredElement = null;
        this.linkedHoverElements.forEach(link=>{
            link.dehighlight()
        })
        this.linkedHoverElements = []
        redraw()
    }
    setSelect(selectedElement, linkedSelectedElements){
        console.log(gtag('send','event','On Page Navigation','Element Selected','',0,{'nonInteration':false}));
        this.selectedElement = selectedElement;
        selectedElement.select();
        this.linkedSelectedElements = linkedSelectedElements;
        let outlineColor;
        if(selectedElement instanceof Dot){
            outlineColor = 100
            infoPane.selectPE(this.selectedElement)
        }else{
            outlineColor = 120
        }
        linkedSelectedElements.forEach(link=>{
            link.outline(color(outlineColor));
            if(link instanceof DciEnd){
                link.linkedElements.forEach(otherPE=>{
                    otherPE.outline(color(outlineColor));
                })
            }
        })
        
       // redraw()
    }
    clearSelect(){
        this.selectedElement.deselect();
        this.linkedSelectedElements.forEach(link=>{
            link.deoutline()
            if(link instanceof DciEnd){
                link.linkedElements.forEach(otherPE=>{
                    otherPE.deoutline();
                })
            }
        })
        infoPane.deselectPE()
    }
    setInspect(){
        console.log(this.inspectedElement);
        console.log(gtag('send','event','On Page Navigation','Element Inspected','',0,{'nonInteration':false}));
        if(this.inspectedElement){
            this.clearInspect()
        }
        infoPane.setInspect()
        this.inspectedElement = this.selectedElement;
        this.linkedInspectedElements = this.linkedSelectedElements;
        this.redrawInspected()
    }
    clearInspect(){
        infoPane.deinspectPE()
        if(!this.inspectedElement)return
        this.inspectedElement.deselect();
        this.inspectedElement.dehighlight();
        this.linkedInspectedElements.forEach(link=>{
            link.deoutline()
            if(link instanceof DciEnd){
                link.linkedElements.forEach(otherPE=>{
                    otherPE.deoutline();
                })
            }
        })
        this.inspectedElement = null;
    }
    redrawInspected(){
        if(!this.inspectedElement) return
        let outlineColor = 255;
        this.inspectedElement.outline(255)
        this.inspectedElement.highlight();
        this.linkedInspectedElements.forEach(link=>{

            if(link instanceof DciEnd){
                link.outline(color(outlineColor));
                link.linkedElements.forEach(otherPE=>{
                    otherPE.outline(color(outlineColor));
                })
                this.drawDciConnections(link,color(outlineColor))
                outlineColor -= 50;
            }else{
                link.outline(color(255));
            }
        })
    }
    mouseMoved(){
        if(this.hoveredElement){
            if(!this.hoveredElement.checkHover()){
                this.clearHover();
            }
        }else{
            let element = sepsIcons.checkHover() || dciLists.checkHover() || cccGraph.checkHover();
            if(element){
                this.setHover(element, element.linkedElements);
            }
            redraw()
        }
    }
    mouseClicked(){
        if(this.hoveredElement && this.hoveredElement!=this.inspectedElement){
            if(this.hoveredElement == this.selectedElement){
                if(this.hoveredElement instanceof Dot){
                    this.setInspect();
                    this.clearSelect();
                }else{
                    this.clearInspect();
                    this.redrawInspected()
                }
            }else{
                if(this.selectedElement){
                    this.clearSelect();
                }
                let selected = this.hoveredElement;
                this.setSelect(selected,selected.linkedElements)
            }
        }
        redraw()
    }
    redraw(){
        if(this.selectedElement instanceof DciEnd && !this.inspectedElement){
            this.drawDciConnections(this.selectedElement,color(120))
        }
        if(this.hoveredElement instanceof DciEnd && !this.inspectedElement){
            this.drawDciConnections(this.hoveredElement,color(120))
        }
        if(this.inspectedElement){
            this.redrawInspected();
        }
    }
    drawDciConnections(dciElement, color){
        let points = []
        dciElement.linkedElements.forEach(pe=>{
            points.push(pe.getPosition());
        })
        points.sort((a,b)=>{return a[0]-b[0]})
        strokeWeight(2)
        noFill()
        stroke(color)
        beginShape()
        points.forEach(point=>{
            vertex(point[0],point[1])
        })
        endShape()
}
}
