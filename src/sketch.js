var ngss;
var cccGraph;
var sepsIcons;
var practiceLogos;
var dciLists;
var detailsBar;
var canvas
var infoPanePrim
var hoveredElement;
var selectedElement;
var mouseManager;

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
    canvas = createCanvas(window.innerWidth,window.innerHeight);
    canvas.position(0,0,"relative")
    infoPanePrim = new InfoPane();
    
    //Create NGSS Graphs
    //TODO: create new class that extends RowSet with graphDrawing :)
    sepsIcons = new SepsPannel(30,30,400,80,ngss["S2467516"],ngss,practiceLogos)
    dciLists = new DciPannel(50,100,500,200,ngss["S2467517"],ngss)
    cccGraph = new GraphDrawing(0,0,width,height,ngss["S2467518"],15,5,ngss);
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
    let desiredWidth = 800;
    let desiredHeight = 405;
    if(window.innerWidth -150 > 800){
        desiredWidth = window.innerWidth-150;
        infoPanePrim.position(window.innerWidth-150,0,"fixed")
        if(window.innerHeight > 405){
            desiredHeight = window.innerHeight;
        }
    }else{
        if(window.innerWidth> 800){
            desiredWidth = window.innerWidth;
        }
        if(window.innerHeight - 100 > 405){
            desiredHeight = window.innerHeight-100;
            infoPanePrim.position(0,window.innerHeight-100,"fixed")
        }else{
            canvas.position(0,0,"relative")
            
        }infoPanePrim.position(0,0,"relative")
    }
    
    
    resizeCanvas(desiredWidth,desiredHeight)
    background(0,0,0)
    noFill();
    cccGraph.setBounds([0,0,width-150,height]);
    cccGraph.updateLayout();
    sepsIcons.redraw();
    cccGraph.redraw();
    dciLists.redraw()
}

// EVENTS
function mouseMoved(event){
    if(mouseManager){
        mouseManager.mouseMoved();
    }
}

function mouseClicked(event){
    cccGraph.checkHover();
    sepsIcons.checkHover();
    dciLists.checkHover();
    if(hoveredElement != null){
        hoveredElement.select();
        selectedElement = hoveredElement;
    }
}

class MouseManager{
    constructor(){
        this.hoveredElement = null;
        this.linkedElements = [];
    }
    setHover(element,linkedElements){
        fill(255,255,255)
        let title
        let description
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
        textAlign(RIGHT,TOP)
        text(title,470,30,100,120)
        textAlign(LEFT,TOP)
        text(description,580,30,width-580,120)
        
        this.hoveredElement = element;
        element.highlight();
        this.linkedElements = linkedElements;
        linkedElements.forEach(link=>{
            link.highlight()
        })
    }
    clearHover(){
        fill(0,0,0)
        noStroke()
        rect(450,30,width-460,60)
        this.hoveredElement.dehighlight();
        this.hoveredElement = null;
        this.linkedElements.forEach(link=>{
            link.dehighlight()
        })
        this.linkedElements = []
    }
    mouseMoved(){
        if(this.hoveredElement){
            if(!this.hoveredElement.checkHover()){
                this.clearHover();
                this.mouseMoved();
            }
        }else{
            let element = sepsIcons.checkHover() || dciLists.checkHover() || cccGraph.checkHover();
            if(element){
                this.setHover(element, element.linkedElements);
            }
        }
    }
}