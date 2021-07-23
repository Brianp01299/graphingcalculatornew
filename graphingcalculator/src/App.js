
import './App.css';
import React from "react";
import Component from "react";
import { create, all } from 'mathjs';
const math = create(all); 


class App extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      "minX": 0, //minmaxXY for visualization
      "minY":0,
      "maxX":10,
      "maxY":10,
      "dataX":[],//dataX/Y are arrays used to append arr (generic array) for data points and trances.
      "dataY":[],
      "arr":[],      
      "functions":[{"value":"x","name":"y"}],//array of functions
      "eulers":[{"min":0,"max":1,"value":.5,"step":.1,"name":'dy/dx','num':10,"switch":0,"dx":.1, "x0":0,"y0":0}],
      "constants":[{"min":0,"max":1,"value":.5,"step":.1,"name":'a',"switch":0}],//array of constants starts with 1 constant 'a'
      "switch":[9654 , 10074,"",10074],//used for the switch for paus/play button
      "fcnoffset":0,//offsets for constants and functions so can keep track of deleted arrays when making new ones so there
      //is not an overlap of names.
      "constoffset":97,
      "euleroffset":0,
      //counter is an array of graph, sfg, and eulers so we know how many of each exist
      //in order to make removal more efficient, assign the minus buttons next to them with the same number
    }
  }
  //using mathjs evaluates a mathematical expression and a scope
  //should rename calculate bc its also used for functions
  evaluateDer(tx, ty, expression,scope) {
    scope['x'] = tx;
    scope['y'] = ty;
    return math.compile(expression).evaluate(scope);
  }

  produceDatePointsE(derivative,scope,object) {  
    //produces a set of data points stored in state variables dataX/Y to be visualized 
    //as an antiderivative using euler's method
    this.state.dataX = []
    this.state.dataY = []
    var y = object.y0
    for (var i = 0;i<object.num;i++) {  
      this.state.dataX.push(i*object.dx+object.x0);
      //console.log(i,this.state.dataX[i]);
      y= y+(this.evaluateDer(i*object.dx+object.x0,y,derivative,scope)*object.dx);
        this.state.dataY.push(y);
      
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

  produceDatePointsF(fcn,scope) {
    //creates a function trace based on 1000 pts.
      this.state.dataX = []
      this.state.dataY = []
      var that = this;
      const dxf = (that.state.maxX-that.state.minX)/1000;
      for (var i =that.state.minX;i<that.state.maxX;i+=dxf) {
        that.state.dataX.push(i)
        that.state.dataY.push(that.evaluateDer(i,0,fcn,scope))
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

  addFunction(index) {
    //adds a textbox and corresponding elements for functions
    this.state.functions.push({"value":"","name":"y"+String(index)})
    this.setState({functions:this.state.functions})
  }
  
  addEuler(index) {
    //dito for eulers
    this.state.eulers.push({"min":0,"max":1,"value":.5,"step":.1,"name":'dy/dx'+String(index),'num':10,"switch":0,"dx":.1, "x0":0,"y0":0})
    this.setState({eulers:this.state.eulers})

  }

  addConstant(index) {
    //adds a textbox and corresponding elements for constants
    this.state.constants.push({"name":String.fromCharCode(index),"min":0,"max":1,"value":.5,"step":.1,"switch":0})
    this.setState({constants:this.state.constants})
  }
  //being phased out instead using slice with .map

  //need to update visualiztion as right now it is very expensive CPU wise learning and researching Plotly.update()
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
    //try {
      var graphDiv = document.getElementById('graph');
      let scope = {};
      //create the scope by evaluating the constants.
      for (var i = 0;i<this.state.constants.length;i++) {
        scope[this.state.constants[i].name] = math.compile(this.state.constants[i].value).evaluate(scope);
        
      }
      
      this.produceDatePointsS(document.getElementById("derivative").value,scope); //produce the slope field generator traces
      //produce traces for functions.
      for (var i = 0;i<this.state.functions.length;i++) {
        this.produceDatePointsF(String(this.state.functions[i].value),scope);
        this.state.arr.push(this.state.dataX);
        this.state.arr.push(this.state.dataY);
        
      }
      //produces eulers method traces
      for (var i = 0;i<this.state.eulers.length;i++) {
        //console.log(String(this.state.eulers[i].value))
        this.produceDatePointsE(this.state.eulers[i].value,scope,this.state.eulers[i]);
        this.state.arr.push(this.state.dataX);
        this.state.arr.push(this.state.dataY);
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
    //} catch(e) {
      //alert(e);
     // console.log(e)
   // }

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
            that.state.functions.map((inputObject,index) => {
              return (
                <div>
                  <input id = {String(index)+"sf"} value={inputObject.name} type="text" onChange = {function(){
                      inputObject.name = document.getElementById(String(index)+"sf").value
                      that.setState({functions:that.state.functions})
                  }} />
                  <output>=</output>
                  <input id = {String(index)+"af"} value={inputObject.value} type="text" onChange = {function(){
                      inputObject.value = document.getElementById(String(index)+"af").value
                      that.setState({functions:that.state.functions})
                  }} />
                  <button onClick={
                    function() {
                      that.state.functions.splice(index,1);
                      that.state.fcnoffset++;
                      that.setState({functions:that.state.functions})
                    }
                  }> -</button>
                  <br />
                </div>
              )
           })
          }
          <button onClick = {function(){that.addFunction(that.state.functions.length+that.state.fcnoffset)}}>+</button>
         </div>
         
         <div id = "euler">
           <text>Euler's Method</text>
           {
             that.state.eulers.map((inputObject,index) => {
              return (
                <div>
                  <output id = {String(index)+"se"} >{inputObject.name} </output>
                  <output> = </output>
                  <input id = {String(index)+"ae"} value={inputObject.value} type="text" onChange = {function(){
                      inputObject.value = document.getElementById(String(index)+"ae").value
                      that.setState({eulers:that.state.eulers})
                  }} />
                  <br />
                  <output>dx = </output>
                  <input id = {String(index)+"a0e"} value={inputObject.dx} type="text" onChange = {function(){
                      inputObject.dx = document.getElementById(String(index)+"a0e").value
                      that.setState({eulers:that.state.eulers})
                  }} />
                  <output> x0 = </output>
                  <input id = {String(index)+"x0e"} value={inputObject.x0} type="text" onChange = {function(){
                      inputObject.x0 = document.getElementById(String(index)+"x0e").value
                      that.setState({eulers:that.state.eulers})
                  }} />
                  <output> y0 = </output>
                  <input id = {String(index)+"y0e"} value={inputObject.y0} type="text" onChange = {function(){
                      inputObject.y0 = document.getElementById(String(index)+"y0e").value
                      that.setState({eulers:that.state.eulers})
                  }} />
                  <br />
                  <output>min:</output>
                  <input id = {String(index)+"bc"} value={inputObject.min} type="text" onChange = {function(){
                      inputObject.min = document.getElementById(String(index)+"be").value
                      that.setState({eulers:that.state.eulers})
                  }} />
                  <input type="range" id={String(index)+"ce"} value={inputObject.dx} step={inputObject.step} min={inputObject.min} max={inputObject.max} onChange={
                    function() {
                      inputObject.dx = document.getElementById(String(index)+"ce").value
                      that.setState({eulers:that.state.eulers})
                    }
                  } />
                  <output>max:</output>
                  <input id = {String(index)+"de"} value={inputObject.max} type="text" onChange = {function(){
                      inputObject.max = document.getElementById(String(index)+"de").value
                      that.setState({eulers:that.state.eulers})
                  }} />
                  <output>step:</output>
                  <input id = {String(index)+"ee"} value={inputObject.step} type="text" onChange = {function(){
                      inputObject.step = document.getElementById(String(index)+"ee").value
                      that.setState({eulers:that.state.eulers})
                  }} />
                  <button onClick ={
                    function() {
                      inputObject.switch=(inputObject.switch+1)%2;
                      that.setState({eulers:that.state.eulers})
                      //will do something
                    }
                  }>{String.fromCharCode(that.state.switch[inputObject.switch],that.state.switch[inputObject.switch+2])}</button>
                  <button onClick={
                    function() {
                      that.state.eulers.splice(index,1)
                      that.state.euleroffset++;
                      that.setState({eulers:that.state.euelrs})
                    }
                  } >-</button>
                  <br />
                </div>
              )
           })
          }
           <button onClick = {function(){that.addEuler(that.state.eulers.length+that.state.euleroffset  )}}>+</button>
         </div>

         <div id = "constants">
           <text>Constants</text>
           <div id = "addConstants"></div>
           {
            that.state.constants.map((inputObject,index) => {
              return (
                <div>
                  <input id = {String(index)+"sc"} value={inputObject.name} type="text" onChange = {function(){
                      inputObject.name = document.getElementById(String(index)+"sc").value
                      that.setState({constants:that.state.constants})
                  }} />
                  <output>=</output>
                  <input id = {String(index)+"ac"} value={inputObject.value} type="text" onChange = {function(){
                      inputObject.value = document.getElementById(String(index)+"ac").value
                      that.setState({constants:that.state.constants})
                  }} />
                  <br />
                  <output>min:</output>
                  <input id = {String(index)+"bc"} value={inputObject.min} type="text" onChange = {function(){
                      inputObject.min = document.getElementById(String(index)+"bc").value
                      that.setState({constants:that.state.constants})
                  }} />
                  <input type="range" id={String(index)+"cc"} value={inputObject.value} step={inputObject.step} min={inputObject.min} max={inputObject.max} onChange={
                    function() {
                      inputObject.value = document.getElementById(String(index)+"cc").value
                      that.setState({constants:that.state.constants})
                    }
                  } />
                  <output>max:</output>
                  <input id = {String(index)+"dc"} value={inputObject.max} type="text" onChange = {function(){
                      inputObject.max = document.getElementById(String(index)+"dc").value
                      that.setState({constants:that.state.constants})
                  }} />
                  <output>step:</output>
                  <input id = {String(index)+"ec"} value={inputObject.step} type="text" onChange = {function(){
                      inputObject.step = document.getElementById(String(index)+"ec").value
                      that.setState({constants:that.state.constants})
                  }} />
                  <button onClick ={
                    function() {
                      inputObject.switch=(inputObject.switch+1)%2;
                      that.setState({constants:that.state.constants})
                      //will do something
                    }
                  }>{String.fromCharCode(that.state.switch[inputObject.switch],that.state.switch[inputObject.switch+2])}</button>
                  <button onClick={
                    function() {
                      that.state.constants.splice(index,1)
                      that.state.constoffset++;
                      that.setState({constants:that.state.constants})
                    }
                  } >-</button>
                  <br />
                </div>
              )
           })
          }
           <button onClick = {function(){that.addConstant(that.state.constants.length+that.state.constoffset);}}>+</button>
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
