var graphicEvent = function(object, new_color) {
            this.object = object;
            this.last_color = object.material.color.getHex();
            this.new_color = new_color;
};

graphics = {
    millisecondsToWait : 500,
    
    print3DResult:function(result, textColor){
        // Get text from hash
        var theText = result;

        text3d = new THREE.TextGeometry( theText, {
                                                        size: 80,
                                                        height: 20,
                                                        curveSegments: 2,
                                                        font: "helvetiker"
                                            });

        text3d.computeBoundingBox();
        var centerOffset = -0.5 * ( text3d.boundingBox.max.x - text3d.boundingBox.min.x );

        var textMaterial = new THREE.MeshBasicMaterial( { color: textColor } );
        text = new THREE.Mesh( text3d, textMaterial );

        text.position.x = 400;
        text.position.y = 300;
        text.position.z = 0;

        text.rotation.x = 0;
        text.rotation.y = Math.PI * 2;

        group = new THREE.Object3D();
        group.add( text );
        graphics.scene.add( group );
        
    },
    
    refreshScene:function(){
        $isAnimated = $('#isAnimated');
        if(!$isAnimated.is(':checked'))
            return;
        
        var current_event = null;
        if(algorithm.event_queue.length > 0){
            current_event = algorithm.event_queue.splice(0,1)[0];
            current_event.object.material.color.setHex(current_event.new_color);
            
            current_event.object.scale.x = 1.5; // SCALE
            current_event.object.scale.y = 1.5; // SCALE
            current_event.object.scale.z = 1.5; // SCALE
        }
        
        setTimeout(function(){
            if(current_event != null){
                current_event.object.material.color.setHex(current_event.last_color);
                current_event.object.scale.x = 1; // SCALE
                current_event.object.scale.y = 1; // SCALE
                current_event.object.scale.z = 1; // SCALE
            }
            graphics.refreshScene();
        }, graphics.millisecondsToWait);
    }
    
}

algorithm = {
    event_queue:[],
    graph: null,
    found_solutions: [],
    final_solutions_dom:"",
    
    clear: function(){
        algorithm.path = [];
        
        algorithm.graph.nodes.forEach(function(node) {
            node.visited = false;
        });
    },
    
//    printPrettyPath: function(temporal_path){
//        var path_string = "";
//        temporal_path.forEach(function(node){
//             path_string += node.id + " "; 
//        });
//        
//        console.log(path_string);
//    },

    createDOMAndSaveSolution: function(solution){
        algorithm.found_solutions.push(solution);        
        algorithm.final_solutions_dom += "<div class='solution'>";
        
        solution.forEach(function(node){
            algorithm.final_solutions_dom += "<div class='node' style='background-color:" + node.color + "'>" + node.id +  "</div>";
        });
        
        algorithm.final_solutions_dom += "</div><div style='clear:both'/>";
    },
    
    printDOMSolution: function(){
        if(algorithm.found_solutions.length == 0){
            graphics.print3DResult("Not Solvable", 0xFF0000);
            return;
        }
        
        graphics.print3DResult("Solvable", 0x00FF00);
        
        $leyend = $('#leyend').find('.solutions');
        $leyend.append(algorithm.final_solutions_dom);
    },
    
    dfs: function(node, solution){
        if(node != null){
            algorithm.event_queue.push(new graphicEvent(node.object,0xffffff));
            solution.push(node);
        }
        else {
            //Start Point
            console.log(algorithm.graph.nodes);
            
            algorithm.graph.nodes.forEach(function(node){ //DFS from every start node    
                algorithm.dfs(node,[]);
            });
            
             algorithm.printDOMSolution();
            
            return;
        }
        
        node.visited = true;
        var next_node = null;
        
        node.neighboors.forEach(function(neighboor){
            if(neighboor.neighboor.visited /*|| neighboor.limit == 0*/)
                return false;
            
            neighboor.limit --;
            solution = algorithm.dfs(neighboor.neighboor, solution);
        });
        
        if(solution.length == algorithm.graph.nodes.length) //We just found a solution
        {
            algorithm.createDOMAndSaveSolution(solution);
        }
        
        node.visited = false;
        solution.splice(algorithm.path-1,1);
        
        return solution;
    },    
};


