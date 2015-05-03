var utils = {

    s4: function() {
      return Math.floor((1 + Math.random()) * 0x10000)
                 .toString(16)
                 .substring(1);
    },
    guid: function() {
      return this.s4() + this.s4() + '-' + this.s4() + '-' + this.s4() + '-' +
             this.s4() + '-' + this.s4() + this.s4() + this.s4();
    },

    toRadians: function  (angle) {
      return angle * (Math.PI / 180);
    },

    toDegrees: function  (radian) {
      return radian * (180 / Math.PI );
    },

    hipotenuseX:function(node1,node2){
        return Math.sqrt(Math.pow(node2.y - node1.y,2) + Math.pow(node2.z - node1.z,2));
    },

    hipotenuseY:function(node1,node2){
        return Math.sqrt(Math.pow(node2.z - node1.z,2) + Math.pow(node2.x - node1.x,2));
    },

     hipotenuseZ:function(node1,node2){
        return Math.sqrt(Math.pow(node2.x - node1.x,2) + Math.pow(node2.y - node1.y,2));
    },

    distance:function(node1,node2){
        return Math.sqrt(Math.pow(node2.x - node1.x,2) + Math.pow(node2.y - node1.y,2) + Math.pow(node2.z - node1.z, 2));
    },

    oppositeX:function(node1,node2){
        return node2.y - node1.y;
    },


    graphCreator: function(graph){
        var nodes = [];

        var max_node_count = 10;
        var node_count = Math.floor(Math.random()*max_node_count+1); //Goes from 1 to max_node_count

        for(i = 0;i<node_count; i++){
            nodes.push(new node());
        }

        var existingEdges = "";
        var edges = [];
        var n = 0;
        for(i=0;i<(nodes.length*nodes.length-1)/2;i++){

            n = Math.floor(Math.random()*3+1);
            edge_with_i = (Math.random()*10+1 >= 1)?true:false;

            if(!edge_with_i)
                continue;

            random_direction = Math.floor(Math.random()*10+1);

            direction = 0
            if(random_direction > 7)
                direction = 1;
            else if(random_direction < 3)
                direction = -1;

            node1 = Math.floor(Math.random()*nodes.length);
            node2 = Math.floor(Math.random()*nodes.length);

            if(node1 == node2 || existingEdges.indexOf("_" + node1 + node2) != -1
                    || existingEdges.indexOf("_" + node2 + node1)!= -1)
                continue;

            existingEdges += "_" + node1 + node2;

            if(!edge_with_i)
                continue;

            var new_edge = new edge(nodes[node1],nodes[node2],direction,n);
            edges.push(new_edge);

            if(new_edge.direction == 1) //Add it to Node 1
                nodes[node1].neighboors.push(new neighboor(nodes[node2],n));
            else if(new_edge.direction == -1) //Add it to Node 2
                nodes[node2].neighboors.push(new neighboor(nodes[node1],n));
            else { //Add it to both
                nodes[node1].neighboors.push(new neighboor(nodes[node2],n));
                nodes[node2].neighboors.push(new neighboor(nodes[node1],n));
            }
        }

        graph.nodes = nodes;
        graph.edges = edges;
    }
};


var edge = function(node1,node2,direction,limit) {
    //DIrection 0 Means undirectional
    //Direction 1 means from 1 to 2
    //Direction 2 means from 2 to 1

    this.direction = direction;
    this.limit = limit;
    this.node1 = node1;
    this.node2 = node2;
    this.id = node1.id+node2.id;
};


var neighboor = function(neighboor, limit) {
    this.neighboor = neighboor;
    this.limit = limit;
};

var nodes = 0;

var node = function() {
    this.id = nodes++;//utils.guid();
    this.label = "";
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.neighboors = [];
};

var graph_cell = function(node1,node2,edge) {
    this.node1 = node1;
    this.node2 = node2;
    this.edge = edge; //Edge will always be interpreted going from node1 to node2, if Directional
};


var graph_row =  function(cells){
    this.cells =  cells; // List of Graph Cells
};


var graph = function() {
    this.nodes = [];
    this.edges = [];

    this.read = function(){
        utils.graphCreator(this);
    };

    this.paint = function(scene) {

        var x = -500, y=300, z=0;

        var top_columns = 6;
        var i = 0;

        // particles
        var PI2 = Math.PI * 2;
        var material = new THREE.SpriteCanvasMaterial( {

            color: 0xffffff,
            program: function ( context ) {

                context.beginPath();
                context.arc( 0, 0, 0.5, 0, PI2, true );
                context.fill();

            }

        } );

        var geometry = new THREE.Geometry();
        var painted_nodes = "";

        //Painting nodes
        var paintNode = function(node){
            node.color = '#'+Math.floor(Math.random()*16777215).toString(16);
            var nodeMaterial = new THREE.MeshBasicMaterial( { color:  node.color} );
            var sphere = new THREE.Mesh(new THREE.SphereGeometry(20, 8, 8), nodeMaterial);

            x = Math.floor((Math.random()*500)+1)-500;
            y = Math.floor((Math.random()*500)+1)-400;
            z = Math.floor((Math.random()*500)+1);
            sphere.overdraw = true;
            sphere.position.set( x, y, z );
            scene.add(sphere);

            //Making sure the node remember it's position
            node.x = x;
            node.y = y;
            node.z = z;

            node.object = sphere;

            var text3d = new THREE.TextGeometry(
                node.id.toString(),
                {
                        size: 50,
                        height: 20,
                        curveSegments: 2,
                        font: "helvetiker"
                }
            );
            text3d.computeBoundingBox();
            var centerOffset = -0.5 * ( text3d.boundingBox.max.x - text3d.boundingBox.min.x );

            var textMaterial = new THREE.MeshBasicMaterial( { color: node.color } );
            text = new THREE.Mesh( text3d, textMaterial );

            text.position.x = node.x + 10;
            text.position.y = node.y + 10;
            text.position.z = node.z;

            text.rotation.x = 0;
            text.rotation.y = Math.PI * 2;

            group = new THREE.Object3D();
            group.add( text );
            scene.add( group );
        };
        this.nodes.forEach(function(node) {
            if(painted_nodes.indexOf(node.id) == -1){
                paintNode(node);
                painted_nodes += node.id;
            }
        });

        //Painting nodes
        this.edges.forEach(function(edge) {
            if(edge.node1.id == edge.node2.id)
                return;

            var material = new THREE.LineBasicMaterial({
                color: 0xff00000,
                linewidth: 3,
                fog:false
            });

            var geometry = new THREE.Geometry();
            geometry.vertices.push(new THREE.Vector3(edge.node1.x, edge.node1.y, edge.node1.z));
            geometry.vertices.push(new THREE.Vector3(edge.node2.x, edge.node2.y, edge.node2.z));

            var distance = utils.distance(edge.node1,edge.node2);
            var v1 = null,v2 = null;

            if(edge.direction == 1){
                v2 = edge.node1;
                v1 = edge.node2;
            }
            if(edge.direction == -1){
                v1 = edge.node1;
                v2 = edge.node2;
            }

            // Arrow
            if(v1!= null && v2 != null){

                var arrow_material = new THREE.MeshBasicMaterial( { color: v2.color} );

                var tenthDistanceX = (v2.x - v1.x)/10 + v1.x;
                var tenthDistanceY = (v2.y - v1.y)/10 + v1.y;
                var tenthDistanceZ = (v2.z - v1.z)/10 + v1.z;

                var point1 = new THREE.Vector3(v1.x, v1.y, v1.z);
                var point2 = new THREE.Vector3(v2.x, v2.y, v2.z);
                var direction = new THREE.Vector3().subVectors(point1, point2);
                var arrow = new THREE.ArrowHelper(direction.normalize(), point1);
                var rotation = new THREE.Euler().setFromQuaternion( arrow.quaternion );

                var cylinder = new THREE.Mesh(new THREE.CylinderGeometry(0,5,  distance/10, 10, 10, false), arrow_material);
                cylinder.position.set((tenthDistanceX+v1.x)/2,(tenthDistanceY+v1.y)/2,(tenthDistanceZ+v1.z)/2);
                cylinder.rotation.x = arrow.rotation.x;
                cylinder.rotation.y = arrow.rotation.y;
                cylinder.rotation.z = arrow.rotation.z;
                scene.add(cylinder);
            }

            var edge_line = new THREE.Line(geometry, material);
            //edge_line.scale.multiplyScalar( 1.01 );
            edge.object = edge_line;
            scene.add(edge_line);
        });
    }
}
