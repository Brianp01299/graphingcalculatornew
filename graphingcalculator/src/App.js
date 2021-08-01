import './App.css';
import React, {useEffect} from "react";
import Component from "react";
import { create, all } from 'mathjs';
const math = create(all); 

math.import({
  ddx: function (fcn,tx) {
    var dx = .005
    return ((math.compile(fcn).evaluate({'x':tx+dx})-math.compile(fcn).evaluate({'x':tx-dx}))/(2*dx)).toFixed(5)
  },

  int: function integrals(fcn,a,b) {
    var dx = .005
    var dir = 1;
    if (a>=b-dx) {
      return 0
    }
    return integrals(fcn,a+dx,b) + (math.compile(fcn).evaluate({'x':a})+math.compile(fcn).evaluate({'x':a+dx}))*dx/2
  } 
})

//to do 
//add limits to dx/dy
//add textboxes (+hopefully scroll wheel) for boundaries of graph
//long term/less important: 
//vertical lines (maybe check functinosn if name==='x' change the visualiztion to rely on y rather than x)
//produce csv of data point
//int(fcn,0,x)dt
//add calculation sections
//CSS for better UI

//next week create video for CHu

class App extends React.Component {

  constructor(props) {
    var d = new Date()
    super(props)
    this.state = {
      "minX": 0, //minmaxXY for visualization
      "minY":0,
      "maxX":10,
      "maxY":10,
      "sfg":{"derivative":"", "sliders":[
        {"name":"dx = ", "value":1,"min":1,"max":2,"step":.1,"switch":0},
        {"name":"dy = ", "value":1,"min":1,"max":2,"step":.1,"switch":0},
        {"name":"Length:", "value":1,"min":1,"max":2,"step":.1,"switch":0},
      ]},
      "dataX":[],//dataX/Y are arrays used to append arr (generic array) for data points and trances.
      "dataY":[],
      "arr":[],      
      "arr_2":[],
      "functions":[{"value":"x","name":"y"}],//array of functions
      "time":d.getTime(),
      "eulers":[{"min":0,"max":1,"value":"2*x","step":.1,"name":'dy/dx','num':10,"switch":0,"dx":.1, "x0":0,"y0":0,"time":0}],
      "constants":[{"min":0,"max":1,"value":.5,"step":.1,"name":'a',"switch":0}],//array of constants starts with 1 constant 'a'
      "switch":[9654 , 10074,"",10074],//used for the switch for paus/play button
      "fcnoffset":0,//offsets for constants, eulers and functions so can keep track of deleted arrays when making new ones so there
      "constoffset":97, //is not an overlap of default names.
      "euleroffset":0,
      "length":0
    }
  }
  //using mathjs evaluates a mathematical expression and a scope
  //should rename calculate bc its also used for functions
  evaluateExpression(tx, ty, expression,scope) {
    scope['x'] = tx;
    scope['y'] = ty;
    try {
     return math.compile(expression).evaluate(scope).toFixed(2);
    } catch(e) {
      return 0
    }
  }




  produceDataPointsE(derivative,scope,object) {  
    //produces a set of data points stored in state variables dataX/Y to be visualized 
    //as an antiderivative using euler's method
    this.state.dataX = [];
    this.state.dataY = [];  
    var y = parseFloat(object.y0);
    var x0 = parseFloat(object.x0);
    var dx = parseFloat(object.dx);
    for (var i = 0;i<parseFloat(object.num);i++) {  
      this.state.dataX.push(i*dx+x0);     
      y= y+(this.evaluateExpression(i*dx+x0,y,derivative,scope)*dx);
      this.state.dataY.push(y);     
    }
  }

  

  produceDataPointsS(derivative,scope) {
    //produces sets of 4 points (2x,2y) to generate a slope field stored 
    //in state virables arr
    var that =this;
    that.state.arr = [];
    this.state.arr_2=[];
    var dx=parseFloat(that.state.sfg.sliders[0].value);
    var dy=parseFloat(that.state.sfg.sliders[1].value);
    var len=parseFloat(that.state.sfg.sliders[2].value);
    var minX=parseFloat(that.state.minX);
    var maxX=parseFloat(that.state.maxX);
    var minY=parseFloat(that.state.minY);
    var maxY=parseFloat(that.state.maxY);
    for (var i =  minX;i<maxX;i+=dx) {
      for (var j = minY;j<maxY;j+=dy) {
        var evaled = that.evaluateExpression(i,j,derivative,scope);
        that.state.arr.push([i-len/2,i+len/2]);
        that.state.arr.push([j-evaled*len/2,j+evaled*len/2]);
      }
    }
  }



  produceDataPointsF(fcn,scope) {
    //creates a function trace based on 1000 pts.
      this.state.dataX = [];
      this.state.dataY = [];
      var that = this;
      const dxf = (that.state.maxX-that.state.minX)/1000;
      for (var i =that.state.minX;i<that.state.maxX;i+=dxf) {
        that.state.dataX.push(i)
        that.state.dataY.push(that.evaluateExpression(i,0,fcn,scope))
      }

  }

  make_trace({data, set_type = "scatter", set_mode = "lines"} = {}){
    //makes data points into correct format for visualization
    let dataPoint = [];
    for(let i = 0; i<data.length; i+=3){
      dataPoint.push({
                  x: data[i],
                  y: data[i+1],
                  mode: set_mode,
                  type: set_type,
                  name: data[i+2]
              });
    }
    return dataPoint;
  }

  make_sfg_trace({data, set_type = "scatter", set_mode = "lines"} = {}){
    //makes data points into correct format for visualization
    let dataPoint = [];
    for(let i = 0; i<data.length; i+=2){
      dataPoint.push({
                  x: data[i],
                  y: data[i+1],
                  mode: set_mode,
                  type: set_type,
                  showlegend: false,
                  line: {color:'blue'},
              });
    }
    return dataPoint;
  }

  addFunction(index) {
    //adds a textbox and corresponding elements for functions
    this.state.functions.push({"value":"","name":"y"+String(index)});
    this.setState({functions:this.state.functions});
  }
  
  addEuler(index) {
    //dito for eulers
    this.state.eulers.push({"min":0,"max":1,"value":"2*x","step":.1,"time":0,"name":'dy/dx'+String(index),'num':10,"switch":0,"dx":.1, "x0":0,"y0":0});
    this.setState({eulers:this.state.eulers});

  }

  addConstant(index) {
    //adds a textbox and corresponding elements for constants
    this.state.constants.push({"name":String.fromCharCode(index),"min":0,"max":1,"value":.5,"step":.1,"switch":0});
    this.setState({constants:this.state.constants});
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
    try {
      var graphDiv = document.getElementById('graph');
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
      var sfg_plots = this.make_sfg_trace({data:this.state.arr,set_type:"scatter", set_mode : "lines"})
      var other_plot = this.make_trace({data:this.state.arr_2,set_type:"scatter", set_mode : "lines"})
      for (var i = 0;i<other_plot.length;i++) {
        sfg_plots.push(other_plot[i])
      }
      this.state.length=sfg_plots.length;
      window.Plotly.newPlot(graphDiv, sfg_plots, layout);
    } catch(e) {
      alert(e);
     // console.log(e)
    }

  }

  update() {
    //visualizes data points using plotly
    try {
      var graphDiv = document.getElementById('graph');
      let scope = {};
      //create the scope by evaluating the constants.
      for (var i = 0;i<this.state.constants.length;i++) {
        scope[this.state.constants[i].name] = math.compile(this.state.constants[i].value).evaluate(scope);
        
      }
      
      this.produceDataPointsS(document.getElementById("derivative").value,scope); //produce the slope field generator traces
      //produce traces for functions.
      for (var i = 0;i<this.state.functions.length;i++) {
        this.produceDataPointsF(String(this.state.functions[i].value),scope);
        this.state.arr_2.push(this.state.dataX);
        this.state.arr_2.push(this.state.dataY);
        this.state.arr_2.push(this.state.functions[i].name)     
      }

      //produces eulers method traces
      for (var i = 0;i<this.state.eulers.length;i++) {
        this.produceDataPointsE(this.state.eulers[i].value,scope,this.state.eulers[i]);
        this.state.arr_2.push(this.state.dataX);
        this.state.arr_2.push(this.state.dataY);
        this.state.arr_2.push(this.state.eulers[i].name)
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
      var sfg_plots = this.make_sfg_trace({data:this.state.arr,set_type:"scatter", set_mode : "lines"})
      var other_plot = this.make_trace({data:this.state.arr_2,set_type:"scatter", set_mode : "lines"})
      for (var i = 0;i<other_plot.length;i++) {
        sfg_plots.push(other_plot[i])
      }
      var remove = []
      for (var i =0;i<this.state.length;i++) {
        remove.push(i)

      }
      window.Plotly.deleteTraces(graphDiv,remove);
      window.Plotly.addTraces(graphDiv,sfg_plots)
      this.state.length=sfg_plots.length;
    } catch(e) {
      alert(e);
      //console.log(e)
    }

  }
  componentDidMount() {
    var that = this
    this.graph()
    
    this.interval = setInterval(function(){
      //every second if the + button is pressed uses the timer to run through eaach slider.
        for (var i=0;i<that.state.sfg.sliders.length;i++) {
          var value = parseFloat(that.state.sfg.sliders.[i].value);
          var max = parseFloat(that.state.sfg.sliders.[i].max);
          var min = parseFloat(that.state.sfg.sliders.[i].min);
          var step = parseFloat(that.state.sfg.sliders.[i].step);
          if(that.state.sfg.sliders.[i].switch===1) {
            if(value>max-step) {
              that.state.sfg.sliders.[i].value=(min-step).toFixed(2);
              value=min-step
            }
            that.state.sfg.sliders.[i].value=(value+step).toFixed(2);
            that.setState({sliders:that.state.sliders})
          }
           }
        for (var i=0;i<that.state.eulers.length;i++) {
          var dx = parseFloat(that.state.eulers[i].dx);
          var max = parseFloat(that.state.eulers[i].max);
          var min = parseFloat(that.state.eulers[i].min);
          var step = parseFloat(that.state.eulers[i].step);
          if(that.state.eulers[i].switch===1) {
            if(dx>max-step) {
              that.state.eulers[i].dx=(min-step).toFixed(2);
              dx=min-step
            }
            that.state.eulers[i].dx=(dx+step).toFixed(2);
            that.setState({eulers:that.state.eulers})
          }
           }
        for (var i=0;i<that.state.constants.length;i++) {
          var value = parseFloat(that.state.constants[i].value); 
          var max = parseFloat(that.state.constants[i].max);
          var min = parseFloat(that.state.constants[i].min);
          var step = parseFloat(that.state.constants[i].step);
          if(that.state.constants[i].switch===1) {
            if(value>max-step) {
              that.state.constants[i].value=(min-step).toFixed(2);
              value=min-step
            }
            that.state.constants[i].value=(value+step).toFixed(2);
            that.setState({constants:that.state.constants})
          }
           }
          that.update()
      }, 1000);
    }
  componentWillUnmount() {
   clearTimeout(this.interval());
 }


  render() {
    //render function. Three different divs for different types of functions
    var that = this;
    return ( 
      <div className="App">
         <header className="App-header">
         

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
          <br /> 
         </div>
         <div id = "slope field generator">
           <text> Slope Field Generator </text>
           <br />
           <text>dy/dx = </text>
           <input type ="text" id = "derivative"/>
           <br />
           {

            that.state.sfg.sliders.map((inputObject,index) => {
              return (
                <div>
                  <output>{inputObject.name} </output>
                  <input id = {String(index)+"sfga0s"} value={inputObject.value} type="text" onChange = {function(){
                      inputObject.value = document.getElementById(String(index)+"sfga0s").value;
                      that.setState({sfg:that.state.sfg});
                  }} />
                 <br />
                 <output>min:</output>
                 <input id = {String(index)+"sfgbs"} value={inputObject.min} type="text" onChange = {function(){
                            inputObject.min = document.getElementById(String(index)+"sfgbs").value;
                            that.setState({sfg:that.state.sfg});
                        }} />
                 <input type="range" id={String(index)+"sfgce0"} value={inputObject.value} step={inputObject.step} min={inputObject.min} max={inputObject.max} onChange={
                          function() {
                            inputObject.value = document.getElementById(String(index)+"sfgce0").value;
                            that.setState({sfg:that.state.sfg});
                          }
                        } />  
                 <output>max:</output>
                 <input id = {String(index)+"sfgbso"} value={inputObject.max} type="text" onChange = {function(){
                            inputObject.max = document.getElementById(String(index)+"sfgbso").value;
                            that.setState({sfg:that.state.sfg});
                        }} />
                 <output>step:</output>
                 <input id = {String(index)+"ee0"} value={inputObject.step} type="text" onChange = {function(){
                      inputObject.step = document.getElementById(String(index)+"ee0").value;
                      that.setState({sfg:that.state.sfg});
                  }} />
                 <button onClick ={
                    function() {
                      inputObject.switch=(inputObject.switch+1)%2;
                      that.setState({sfg:that.state.sfg});
                      //will do something
                    }
                  }>{String.fromCharCode(that.state.switch[inputObject.switch],that.state.switch[inputObject.switch+2])}</button>

               </div>
              )})}   
           <br /> 
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
                      inputObject.value = document.getElementById(String(index)+"ae").value;
                      that.setState({eulers:that.state.eulers});
                  }} />
                  <output> num: </output>
                  <input id = {String(index)+"nume"} value={inputObject.num} type="text" onChange = {function(){
                      inputObject.num = document.getElementById(String(index)+"nume").value;
                      that.setState({eulers:that.state.eulers});
                  }} />
                  <br />
                  <output>dx = </output>
                  <input id = {String(index)+"a0e"} value={inputObject.dx} type="text" onChange = {function(){
                      inputObject.dx = document.getElementById(String(index)+"a0e").value;
                      that.setState({eulers:that.state.eulers});
                  }} />
                  <output> x0 = </output>
                  <input id = {String(index)+"x0e"} value={inputObject.x0} type="text" onChange = {function(){
                      inputObject.x0 = document.getElementById(String(index)+"x0e").value;
                      that.setState({eulers:that.state.eulers});
                  }} />
                  <output> y0 = </output>
                  <input id = {String(index)+"y0e"} value={inputObject.y0} type="text" onChange = {function(){
                      inputObject.y0 = document.getElementById(String(index)+"y0e").value
                      that.setState({eulers:that.state.eulers})
                  }} />
                  <br />
                  <output>min:</output>
                  <input id = {String(index)+"be"} value={inputObject.min} type="text" onChange = {function(){
                      inputObject.min = document.getElementById(String(index)+"be").value;
                      that.setState({eulers:that.state.eulers});
                  }} />
                  <input type="range" id={String(index)+"ce"} value={inputObject.dx} step={inputObject.step} min={inputObject.min} max={inputObject.max} onChange={
                    function() {
                      inputObject.dx = document.getElementById(String(index)+"ce").value;
                      that.setState({eulers:that.state.eulers});
                    }
                  }
                  />
                  <output>max:</output>
                  <input id = {String(index)+"de"} value={inputObject.max} type="text" onChange = {function(){
                      inputObject.max = document.getElementById(String(index)+"de").value;
                      that.setState({eulers:that.state.eulers});
                  }} />
                  <output>step:</output>
                  <input id = {String(index)+"ee"} value={inputObject.step} type="text" onChange = {function(){
                      inputObject.step = document.getElementById(String(index)+"ee").value;
                      that.setState({eulers:that.state.eulers});
                  }} />
                  <button onClick ={
                    function() {
                      inputObject.switch=(inputObject.switch+1)%2;
                      //inputObject.dx = String(parseFloat(inputObject.dx)+parseFloat(inputObject.step))
                      that.setState({eulers:that.state.eulers});
                      //will do something
                    }
                  }>{String.fromCharCode(that.state.switch[inputObject.switch],that.state.switch[inputObject.switch+2])}</button>
                  <button onClick={
                    function() {
                      that.state.eulers.splice(index,1);
                      that.state.euleroffset++;
                      that.setState({eulers:that.state.eulers});
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
                      inputObject.name = document.getElementById(String(index)+"sc").value;
                      that.setState({constants:that.state.constants});
                  }} />
                  <output>=</output>
                  <input id = {String(index)+"ac"} value={inputObject.value} type="text" onChange = {function(){
                      inputObject.value = document.getElementById(String(index)+"ac").value;
                      that.setState({constants:that.state.constants});
                  }} />
                  <br />
                  <output>min:</output>
                  <input id = {String(index)+"bc"} value={inputObject.min} type="text" onChange = {function(){
                      inputObject.min = document.getElementById(String(index)+"bc").value;
                      that.setState({constants:that.state.constants});
                  }} />
                  <input type="range" id={String(index)+"cc"} value={inputObject.value} step={inputObject.step} min={inputObject.min} max={inputObject.max} onChange={
                    function() {
                      inputObject.value = document.getElementById(String(index)+"cc").value;
                      that.setState({constants:that.state.constants});
                    }
                  } />
                  <output>max:</output>
                  <input id = {String(index)+"dc"} value={inputObject.max} type="text" onChange = {function(){
                      inputObject.max = document.getElementById(String(index)+"dc").value;
                      that.setState({constants:that.state.constants});
                  }} />
                  <output>step:</output>
                  <input id = {String(index)+"ec"} value={inputObject.step} type="text" onChange = {function(){
                      inputObject.step = document.getElementById(String(index)+"ec").value;
                      that.setState({constants:that.state.constants});
                  }} />
                  <button onClick ={
                    function() {
                      inputObject.switch=(inputObject.switch+1)%2;
                      that.setState({constants:that.state.constants});
                      //will do something
                    }
                  }>{String.fromCharCode(that.state.switch[inputObject.switch],that.state.switch[inputObject.switch+2])}</button>
                  <button onClick={
                    function() {
                      that.state.constants.splice(index,1);
                      that.state.constoffset++;
                      that.setState({constants:that.state.constants});
                    }
                  } >-</button>
                  <br />
                </div>
              )
           })
          }
           <button onClick = {function(){that.addConstant(that.state.constants.length+that.state.constoffset);}}>+</button>
        <br /> 
        </div>         
         <div id = "graph"></div>

        </header>
      </div>
    );
  }
}



export default App;
