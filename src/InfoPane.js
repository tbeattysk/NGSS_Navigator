class InfoPane{
    
    constructor(){
        this.elem = createElement("div","Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.")
        this.elem.position(window.innerWidth-150,0,"relative") 
    }
    position(x,y,type){
        this.elem.position(x,y,type)
    }
    updateData(id,desc,cccTitle,cccDesc,sepTitle,sepDesc,dciTitle,dciDesc,comment){
       this.elem.html(`<b>${id}</b> - ${desc}<br>
                    <i>${cccTitle}</i> - ${cccDesc}<br>
                    <i>${sepTitle}</i> - ${sepDesc}`);
    }
    width(){
        return this.elem.width;
    }
}