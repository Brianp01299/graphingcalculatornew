
import './App.css';
import React from "react";
import Component from "react";
import { create, all } from 'mathjs';
const math = create(all); 
const EULER = 1
const CONSTANTS =2
//to do
// add constants
// document naming conventions
//create funciton w/ for loop to remove all elements from 
// a div using array of div names
//create 1 flexible create element function
//7/13 constants, document naming conventions
//7/14 create updated remove function
//7/15-7/16 work on create element functionx
class App extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      "dx":.5,
      "dxE":.5,
      "y0":0,
      "minX": 0,
      "minY":0,
      "maxX":10,
      "maxY":10,
      "dataX":[],
      "dataY":[],
      "arr":[],   
      "counter":[0,0,0],
      "value": .2,
      "sliders": [{"min":0,"max":1,"value":.5,"step":.1}],
      //counter is an array of graph, sfg, and eulers so we know how many of each exist
      //add state variables to control number of textboxes for each div and use that when naming them
      //in order to make removal more efficient, assign the minus buttons next to them with the same number
    }
  }
  //using mathjs evaluates a mathematical expression
  evaluateDer(tx, ty, expression,scope) {
    scope['x'] = tx;
    scope['y'] = ty;
    return math.compile(expression).evaluate(scope);
  }

  produceDatePointsE(derivative,scope) {  
    //produces a set of data points stored in state variables dataX/Y to be visualized 
    //as an antiderivative using euler's method
    this.state.dataX = []
    this.state.dataY = []
    for (var i =  this.state.minX;i<this.state.maxX;i+=this.state.dxE) {
      this.state.dataX.push(i)
      this.state.y0= this.state.y0+this.evaluateDer(i,this.state.y0,derivative,scope)*this.state.dxE;
      this.state.dataY.push(this.state.y0);
      
    }
  }

  produceDatePointsS(derivative,scope) {
    //produces sets of 4 points (2x,2y) to generate a slope field stored 
    //in state virables arr
    var that =this
    that.state.arr = []
    for (var i =  that.state.minX;i<that.state.maxX;i+=that.state.dx) {
      for (var j = that.state.minY;j<that.state.maxY;j+=that.state.dx) {
        var evaled = that.evaluateDer(i,j,derivative,scope);
        that.state.arr.push([i-that.state.dx/2,i+that.state.dx/2]);
        that.state.arr.push([j-evaled*that.state.dx/2,j+evaled*that.state.dx/2]);
      }
    }
  }

  make_trace({data, set_type = "scatter", set_mode = "lines"} = {}){
    //makes data points into correct format for visualization
    let dataPoint = [];
    for(let i = 0; i<data.length; i+=2){
      dataPoint.push({
                  x: data[i],
                  y: data[i+1],
                  mode: set_mode,
                  type: set_type,
                  name: 'y_' + i/2
              });
    }
    return dataPoint;
  }
  addInputLine(div,type){
      //dynamically adds a text box at the specified div
      var subDiv = div+String(this.state.counter[type]);
      var box = document.createElement("input");
      box.type = "text";
      box.id = subDiv+"I"; 
      document.getElementById(div).appendChild(box);
      var button = document.createElement("input");
      button.type = "button";
      button.value = "-";
      button.id = div+String(this.state.counter[type])+'-';
      var that = this
      button.onclick = function() {
        that.removeElements(subDiv,["I","-","br"])
      }
      document.getElementById(div).appendChild(button);
      const lineBreak = document.createElement('br');
      lineBreak.id = div+String(this.state.counter[type]) +'br';
      document.getElementById(div).appendChild(lineBreak);
      this.state.counter[type]+=1;
  } 
  
  addSlider(div,name) {
    this.state.sliders.push({"min":0,"max":1,"value":.5,"step":.1})
    this.setState({sliders:this.state.sliders})
    // var slider = document.createElement('input');
    // slider.id = div+String(this.state.counter[2]);
    // slider.type = 'range';
    // slider.min = 0;
    // slider.max = 1;
    // slider.value = 0.5;
    // slider.step = 0.1;
    // document.getElementById(div).appendChild(slider);
    // var box = document.createTextNode(name);
    // box.id = slider.id + "t";
    // box.type = "text";
    // box.value = name
    // document.getElementById(div).appendChild(box);

  }

  updateTextInput(val,id) {
    document.getElementById(id).value=val; 
  }
  

  addEQ(div,type) {
    var subDiv = div+String(this.state.counter[type]);
    var boxC = document.createElement("input");
    boxC.type = "text";
    boxC.id = subDiv+"C";
    document.getElementById(div).appendChild(boxC);
    var box = document.getElementById(div);
    var field = document.createElement('text');
    field.appendChild(document.createTextNode('='));
    field.id = subDiv+'=';
    box.appendChild(field);
    var boxV = document.createElement("input");
    boxV.type = "text";
    boxV.id = subDiv+"V";
    document.getElementById(div).appendChild(boxV);
    this.state.counter[type]+=1;
    var button = document.createElement("input");
    button.type = "button";
    button.value = "-";
    button.id = subDiv+'-';
    var that =this;
    button.onclick = function() {
      that.removeElements(subDiv,["C","=","V","-","br"])
      }
    document.getElementById(div).appendChild(button);
    const lineBreak = document.createElement('br');
    lineBreak.id = subDiv+'br';
    document.getElementById(div).appendChild(lineBreak);
  }

  removeElements(div,elements) {
    for (var i =0;i<elements.length;i++){
      var elem = document.getElementById(div+elements[i]);
      elem.parentNode.removeChild(elem);
   }
  }
  clear() {
     var layout = {
      xaxis: {
        title: 'x',
        showgrid: false,
        zeroline: false
      },
      yaxis: {
        title: 'y',
        showline: false
      }
    };  
    this.state.arr = []
    window.Plotly.newPlot("graph", this.make_trace({data:this.state.arr,set_type:"scatter", set_mode : "lines"}), layout);

  }
  graph() {
    //visualizes data points using plotly
    try {
      var graphDiv = document.getElementById('graph');
      let scope = {};
      for (var i = 0;i<this.state.counter[CONSTANTS];i++) {
        if(typeof(document.getElementById("addConstants"+String(i)+"C")) != 'undefined' && document.getElementById("addConstants"+String(i)+"C") != null){
          scope[document.getElementById("addConstants"+String(i)+"C").value] = math.compile(document.getElementById("addConstants"+String(i)+"V").value).evaluate(scope);
        }
      }
      this.produceDatePointsS(document.getElementById("derivative").value,scope);
      for (var i = 0;i<this.state.counter[EULER];i++) {
        if(typeof(document.getElementById("addEuler"+String(i)+"I")) != 'undefined' && document.getElementById("addEuler"+String(i)+"I") != null){
          this.produceDatePointsE(document.getElementById("addEuler"+String(i)+"I").value,scope);
          this.state.arr.push(this.state.dataX)
          this.state.arr.push(this.state.dataY);
        }

      }


      var layout = {
        xaxis: {
          title: 'x',
          showgrid: false,
          zeroline: false
        },
        yaxis: {
          title: 'y',
          showline: false
        }
      };  
      window.Plotly.newPlot(graphDiv, this.make_trace({data:this.state.arr,set_type:"scatter", set_mode : "lines"}), layout);
    } catch(e) {
      alert("There's an error");
    }

  }


  render() {
    //render function. Three different divs for different types of functions
    var that = this

    return (
      <div className="App">
         <header className="App-header">
         <div id = "slope field generator">
           <text> Slope Field Generator </text>
           <br />
           <text>dy/dx = </text>
           <input type ="text" id = "derivative"/>
           <br /> <br />
         </div>

         <div id = "function">
           <text>Function Graphing</text>
           <div id = "addFunction"></div>
           
           {
            that.state.sliders.map((inputObject,index) => {
              return (
                <div>
                  <input id = {String(index)+"a"} value={inputObject.value} type="text" onChange = {function(){
                      inputObject.value = document.getElementById(String(index)+"a").value
                      that.setState({sliders:that.state.sliders})
                  }} />
                  <br />
                  <input id = {String(index)+"b"} value={inputObject.min} type="text" onChange = {function(){
                      inputObject.min = document.getElementById(String(index)+"b").value
                      that.setState({sliders:that.state.sliders})
                  }} />
                  <input type="range" id={String(index)+"c"} value={inputObject.value} step={inputObject.step} min={inputObject.min} max={inputObject.max} onChange={
                    function() {
                      inputObject.value = document.getElementById(String(index)+"c").value
                      that.setState({sliders:that.state.sliders})
                    }
                  } />
                  <input id = {String(index)+"d"} value={inputObject.max} type="text" onChange = {function(){
                      inputObject.max = document.getElementById(String(index)+"d").value
                      that.setState({sliders:that.state.sliders})
                  }} />
                  <button id ="4" onClick={
                    function() {
                      that.state.sliders.splice(index,1)
                      that.setState({sliders:that.state.sliders})
                    }
                  } >-</button>
                  <br />
                </div>
              )
           })
          }
          <button onClick = {function(){that.addSlider("addFunction","dx")}}>+</button>
         </div>
         
         <div id = "euler">
           <text>Euler's Method </text>
           <div id = "addEuler"></div>
           <button onClick = {function(){that.addInputLine("addEuler",EULER)}}>+</button>
         </div>

         <div id = "constants">
           <text>Constants</text>
           <div id = "addConstants"></div>
           <button onClick = {function(){that.addEQ("addConstants",CONSTANTS);}}>+</button>
        </div>

         <div id = "run">
          <button onClick = {function(){that.graph()}}> run </button>
          <button onClick = {function(){that.clear()}}> clear </button>
         </div>
         
         <div id = "graph"></div>
        </header>
      </div>
    );
  }
}



export default App;
