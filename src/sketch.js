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
        loadImage("src/calculating.svg"),
        
      ]
      
}
function setup() {
    canvas = createCanvas(window.innerWidth,window.innerHeight);
    canvas.position(0,0,"relative")
    infoPanePrim = new InfoPane();
    //Create NGSS Graphs
    //TODO: create new class that extends RowSet with graphDrawing :)
    sepsIcons = new SepsPannel(30,30,400,80,ngss["S2467516"],ngss,practiceLogos)
    cccGraph = new GraphDrawing(0,0,width,height,ngss["S2467518"],15,5,ngss);
    
    //Add grade-band rows by refs...
    redraw()
    //cccGraph.redraw();
     
    //openFullScreen();
}

function draw(){
    background(255,255,255)
    cccGraph.redraw();
    sepsIcons.redraw();
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
    background(255,255,255)
   
    noFill();
    cccGraph.setBounds([0,0,width-150,height]);
    cccGraph.updateLayout();
    sepsIcons.redraw();
    cccGraph.redraw();
}

// EVENTS
function mouseMoved(event){
    cccGraph.checkHover();
    sepsIcons.checkHover();
}

function mouseClicked(event){
    cccGraph.checkHover();
    sepsIcons.checkHover();
    if(hoveredElement != null){
        hoveredElement.select();
        selectedElement = hoveredElement;
    }
}
