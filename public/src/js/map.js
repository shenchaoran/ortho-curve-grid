var TENSION = 1;
var POINTS_PER_SEG = 10;
var POINTS_Y_DIR = 5;

var Map = () => {};


Map.createMap = () => {
    var vectorLayer = new ol.layer.Vector({
        title: 'Draw layer',
        source: new ol.source.Vector()
    });
    var bezierLayer = new ol.layer.Vector({
        title: 'Bezier layer',
        source: new ol.source.Vector()
    });
    var gridLayer = new ol.layer.Vector({
        title: 'Grid',
        source: new ol.source.Vector()
    })
    var boundaryLayer = new ol.layer.Vector({
        title: 'Boundary point',
        source: new ol.source.Vector()
    })
    var baseLayers = new ol.layer.Group({
        title: 'Base Layers',
        openInLayerSwitcher: true,
        layers: [
            new ol.layer.Tile({
                title: "Watercolor",
                baseLayer: true,
                visible: false,
                source: new ol.source.Stamen({
                    layer: 'watercolor'
                })
            }),
            new ol.layer.Tile({
                title: "Toner",
                baseLayer: true,
                visible: false,
                source: new ol.source.Stamen({
                    layer: 'toner'
                })
            }),
            new ol.layer.Tile({
                title: "OSM",
                baseLayer: true,
                source: new ol.source.OSM(),
                visible: true
            })
        ]
    });
    Map.map = new ol.Map({
        target: 'map-container',
        view: new ol.View({
            zoom: 2,
            center: [0, 0]
        }),
        controls: ol.control
            .defaults({
                attribution: false,
                rotate: false,
                zoom: false
            }),
        layers: [
            baseLayers,
            vectorLayer,
            bezierLayer,
            gridLayer,
            boundaryLayer
        ]
    });
    const zoomCtrl = new ol.control.Zoom({
        className: 'sub-bar ol-zoom'
    });
    Map.vectorLayer = vectorLayer;
    Map.bezierLayer = bezierLayer;
    Map.gridLayer = gridLayer;
    Map.boundaryLayer = boundaryLayer;
    Map.layers = [
        vectorLayer,
        bezierLayer,
        gridLayer,
        boundaryLayer
    ]
    Map.pullRightBar = new ol.control.Bar({
        title: 'main',
        className: 'pull-right-bar'
    });
    Map.pullRightBar.addControl(zoomCtrl);
    Map.map.addControl(Map.pullRightBar);
    Map.pullLeftBar = new ol.control.Bar({
        title: 'main',
        className: 'pull-left-bar'
    });
    Map.map.addControl(Map.pullLeftBar);
};

Map.addEditbar = () => {
    // draw polygon
    var editbar = new ol.control.Bar({
        toggleOne: true,
        group: false,
        className: 'edit-bar sub-bar'
    });
    Map.pullRightBar.addControl(editbar);

    let inter = new ol.interaction.Draw({
        type: 'Polygon',
        source: Map.vectorLayer.getSource()
    });
    inter.on('drawend', () => {});
    var polygonEdit = new ol.control.Toggle({
        html: '<i class="fa fa-bookmark fa-rotate-270" ></i>',
        title: 'Draw polygon',
        interaction: inter,
        bar: new ol.control.Bar({
            controls: [new ol.control.TextButton({
                    html: 'undo',
                    title: "undo last point",
                    handleClick: function() {
                        if (fedit.getInteraction().nbpts > 1) fedit.getInteraction().removeLastPoint();
                    }
                }),
                new ol.control.TextButton({
                    html: 'finish',
                    title: "finish",
                    handleClick: function() {
                        // Prevent null objects on finishDrawing
                        if (fedit.getInteraction().nbpts > 3) fedit.getInteraction().finishDrawing();
                    }
                })
            ]
        })
    });
    editbar.addControl(polygonEdit);

    // draw circle
    inter = new ol.interaction.Draw({
        type: 'Circle',
        source: Map.vectorLayer.getSource()
    });
    inter.on('drawend', () => {});
    var circleEdit = new ol.control.Toggle({
        html: '<i class="fa fa-circle" ></i>',
        title: 'Draw circle',
        interaction: inter
    });
    editbar.addControl(circleEdit);

    inter = new ol.interaction.DrawRegular({
        canRotate: false,
        sides: 4,
        source: Map.vectorLayer.getSource()
    });
    inter.on('drawend', () => {});
    var rectEdit = new ol.control.Toggle({
        html: '<i class="fa fa-object-ungroup" ></i>',
        title: 'Draw rectangle',
        interaction: inter
    });
    editbar.addControl(rectEdit);

    // draw polygon
    inter = new ol.interaction.Draw({
        source: Map.vectorLayer.getSource(),
        type: 'Polygon',
        freehand: true
    });
    inter.on('drawend', () => {});
    var freePolygonEdit = new ol.control.Toggle({
        html: '<i class="fas fa-pencil-alt" ></i>',
        title: 'Draw polygon by freehand',
        interaction: inter
    });
    editbar.addControl(freePolygonEdit);

    // clear draw graph
    var clearBtn = new ol.control.Button({
        html: '<i class="fas fa-trash"></i>',
        title: 'Clear graph',
        handleClick: () => {
            _.map(Map.layers, layer => {
                layer.getSource().clear();
            });
        }
    })
    editbar.addControl(clearBtn);
    Map.clearBtn = clearBtn;
}

Map.addLayerSwitch = () => {
    var switcher = new ol.control.LayerSwitcher({
        show_progress: true,
        extent: true,
        trash: true,
        oninfo: function(l) {
            alert(l.get("title"));
        }
    });
    var button = $('<div class="toggleVisibility" title="show/hide">')
        .text("Show/hide all")
        .click(function() {
            var a = Map.map.getLayers().getArray();
            var b = !a[0].getVisible();
            if (b) button.removeClass("show");
            else button.addClass("show");
            for (var i = 0; i < a.length; i++) {
                a[i].setVisible(b);
            }
        });
    switcher.setHeader($('<div>').append(button))

    Map.map.addControl(switcher);
}

Map.addMenu = () => {
    var menu = new ol.control.Overlay({
        closeBox: true,
        className: "slide-left menu",
        content: $("#menu")
    });
    Map.map.addControl(menu);
    var t = new ol.control.Toggle({
        html: '<i class="fa fa-bars" ></i>',
        className: "menu sub-bar",
        title: "Menu",
        onToggle: function() {
            menu.toggle();
        }
    });
    Map.pullLeftBar.addControl(t);
}

Map.addBookmark = () => {
    var bm = new ol.control.GeoBookmark({
        editable: false,
        marks: {},
        className: 'ol-bookmark'
    });
    Map.map.addControl(bm);
}

Map.drawTestGrid = () => {
    var pts = [
        [406033, 5664901],
        [689767, 5664901],
        [689767, 6149206],
        [406033, 6149206]
    ];
    var count = 10;

    var dirtX = (pts[1][0] - pts[0][0]) / count;
    var dirtY = (pts[3][1] - pts[0][1]) / count;
    for (var i = 0; i < count + 1; i++) {
        var tp = [pts[0][0] + (i * dirtX), pts[0][1]];
        var bp = [pts[3][0] + (i * dirtX), pts[3][1]];
        var lp = [pts[0][0], pts[0][1] + (i * dirtY)];
        var rp = [pts[1][0], pts[1][1] + (i * dirtY)];
        Map.vectorLayer.getSource().addFeature(new ol.Feature(new ol.geom.LineString([
            tp, bp
        ])));
        Map.vectorLayer.getSource().addFeature(new ol.Feature(new ol.geom.LineString([
            lp, rp
        ])));
    }
    Map.map.getView().fit(Map.vectorLayer.getSource().getExtent(), Map.map.getSize());
}

Map.addBezierBar = () => {
    var bezierBar = new ol.control.Bar({
        toggleOne: true,
        group: false,
        className: 'bezier-bar sub-bar'
    });
    Map.pullRightBar.addControl(bezierBar);

    // draw bezier
    inter = new ol.interaction.Draw({
        source: Map.bezierLayer.getSource(),
        type: 'LineString',
        geometryFunction: function(coordinates, geometry) {
            if (!geometry) {
                geometry = new ol.geom.LineString(null);
            }

            // var line = {
            //     "type": "Feature",
            //     "properties": {},
            //     "geometry": {
            //         "type": "LineString",
            //         "coordinates": coordinates
            //     }
            // };
            // var curved = turf.bezier(line, {
            //     resolution: 8000,
            //     sharpness: .5
            // });
            var geometryTemp = new ol.geom.LineString(null);
            geometryTemp.setCoordinates(coordinates);
            var curved = csplineCurve(geometryTemp);

            // geometry.setCoordinates(curved["geometry"]["coordinates"]);
            geometry.setCoordinates(curved.getCoordinates());
            return geometry;
        }
    });
    inter.on('drawend', (e) => {
        console.log('cspline points number:' + e.feature.getGeometry().getCoordinates().length);
    });
    var bezierEdit = new ol.control.Toggle({
        html: '<i class="fas fa-pencil-alt" ></i>',
        title: 'Draw bezier',
        interaction: inter
    });
    bezierBar.addControl(bezierEdit);

    // generate ortho grid
    var meshEdit = new ol.control.Button({
        html: '<i class="fab fa-connectdevelop"></i>',
        title: 'Mesh',
        handleClick: () => {
            getMatrix();
            // testSpline();
        }
    });
    bezierBar.addControl(meshEdit);
}

// 
testSpline = () => {
    var bezierSrc = Map.bezierLayer.getSource();
    var features = bezierSrc.getFeatures();
    if (features.length) {
        var coors = features[0].getGeometry().getCoordinates();
        var style = new ol.style.Style({
            image: new ol.style.Circle({
                stroke: new ol.style.Stroke({
                    color: 'red',
                    width: 1
                }),
                radius: 1
            }),
            geometry: new ol.geom.MultiPoint(coors)
        });
        Map.bezierLayer.setStyle(style);
    }
}

// 剖分曲线
csplineCurve = (geometry) => {
    // TODO
    return geometry.cspline({
        tension: TENSION,
        pointsPerSeg: POINTS_PER_SEG,
        normalize: true
    });

    // var curved = turf.bezier(f, {
    //     resolution: 2000,
    //     sharpness: 1
    // });
    // return curved["geometry"]["coordinates"];
}

// 获取边界矩阵
getMatrix = () => {
    var bezierSrc = Map.bezierLayer.getSource();
    var features = bezierSrc.getFeatures();
    if (features.length === 2) {
        var tLength = features[0].getGeometry().getCoordinates().length;
        var bLength = features[1].getGeometry().getCoordinates().length;
        var rowLength = _.max([
            tLength,
            bLength
        ]);
        var X_NUM = rowLength;
        var matrixX = new Array(POINTS_Y_DIR);
        var matrixY = new Array(POINTS_Y_DIR);
        for (var i = 0; i < POINTS_Y_DIR; i++) {
            matrixX[i] = new Array(X_NUM);
            matrixY[i] = new Array(X_NUM);
            _.fill(matrixX[i], '0');
            _.fill(matrixY[i], '0');
        }
        _.map(features, (f, i) => {
            // TODO
            var coors = f.getGeometry().getCoordinates();
            if (i === 0) {
                _.map(coors, (pt, j) => {
                    matrixX[0][j] = pt[0];
                    matrixY[0][j] = pt[1];
                });
            } else if (i === 1) {
                _.map(coors, (pt, j) => {
                    matrixX[4][j] = pt[0];
                    matrixY[4][j] = pt[1];
                });
            }
        });

        Map.grid = {
            tLength: tLength,
            bLength: bLength
        }

        var ltp = features[0].getGeometry().getCoordinates()[0];
        var rtp = features[0].getGeometry().getCoordinates()[tLength - 1];
        var lbp = features[1].getGeometry().getCoordinates()[0];
        var rbp = features[1].getGeometry().getCoordinates()[bLength - 1];

        var dirtXl = (lbp[0] - ltp[0]) / 4;
        var dirtYl = (lbp[1] - ltp[1]) / 4;
        var dirtXr = (rbp[0] - rtp[0]) / 4;
        var dirtYr = (rbp[1] - rtp[1]) / 4;
        for (var i = 0; i < POINTS_Y_DIR; i++) {
            if (i === 0 || i === POINTS_Y_DIR - 1) {
                continue;
            }
            matrixX[i][0] = ltp[0] + dirtXl * i;
            matrixX[i][rowLength - 1] = rtp[0] + dirtXr * i;
            matrixY[i][0] = ltp[1] + dirtYl * i;
            matrixY[i][rowLength - 1] = rtp[1] + dirtYr * i;
        }

        drawBoundary(matrixX, matrixY);
        getInnerPts(matrixX, matrixY);
    } else {
        alert('invalid bezier number! Please draw 2 bezier!');
        _.map(Map.layers, layer => {
            layer.getSource().clear();
        });
    }
}

// 画边界矩阵上的点
drawBoundary = (matrixX, matrixY) => {
    var coors = [];
    for (var i = 0; i < matrixX.length; i++) {
        for (var j = 0; j < matrixX[0].length; j++) {
            if (matrixX[i][j] !== '0' && matrixY[i][j] !== '0') {
                coors.push([matrixX[i][j], matrixY[i][j]]);
            }
        }
    }

    var geometry = new ol.geom.MultiPoint(coors);
    var feature = new ol.Feature({
        geometry: geometry
    });
    Map.boundaryLayer.getSource().addFeature(feature);
    var style = new ol.style.Style({
        image: new ol.style.Circle({
            stroke: new ol.style.Stroke({
                color: 'red',
                width: 1
            }),
            radius: 1
        }),
        geometry: new ol.geom.MultiPoint(coors)
    });
    Map.boundaryLayer.setStyle(style);
}

// 从后台请求矩阵内部的值
getInnerPts = (matrixX, matrixY) => {
    $.ajax({
            type: 'POST',
            url: '/grid/mesh',
            contentType: 'application/json',
            data: JSON.stringify({
                matrixX: matrixX,
                matrixY: matrixY
            })
        })
        .success((res) => {
            if (res.succeed) {
                var matrixX = [];
                var matrixY = [];
                var rowsX = _.split(res.matrixX, '\r\n');
                _.map(rowsX, row => {
                    if (row !== '') {
                        matrixX.push(
                            _.chain(row)
                            .split('\t')
                            .map(td => parseFloat(td))
                            .value()
                        );
                    }
                });
                var rowsY = _.split(res.matrixY, '\r\n');
                _.map(rowsY, row => {
                    if (row !== '') {
                        matrixY.push(
                            _.chain(row)
                            .split('\t')
                            .map(td => parseFloat(td))
                            .value()
                        );
                    }
                });

                drawGrid(matrixX, matrixY);
            } else {
                alert('mesh failed!');
            }
        })
        .error((err) => {

        });
}

// 通过矩阵画网格
drawGrid = (matrixX, matrixY) => {
    var gridSrc = Map.gridLayer.getSource();
    gridSrc.clear();

    var m = matrixX.length;
    var n = matrixX[0].length;

    for (var i = 0; i < n; i++) {
        var coors = [];
        var geometry = new ol.geom.LineString(null);
        var feature = new ol.Feature({
            geometry: geometry
        });
        for (var j = 0; j < m; j++) {
            coors.push([
                matrixX[j][i],
                matrixY[j][i]
            ]);
        }
        var line = {
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "LineString",
                "coordinates": coors
            }
        };
        // TODO
        var curved = turf.bezier(line, {
            resolution: 10000,
            sharpness: 0.85
        });
        geometry.setCoordinates(curved["geometry"]["coordinates"]);
        gridSrc.addFeature(feature);
    }

    for (var j = 0; j < m; j++) {
        var coors = [];
        var geometry = new ol.geom.LineString(null);
        var feature = new ol.Feature({
            geometry: geometry
        });
        for (var i = 0; i < n; i++) {
            coors.push([
                matrixX[j][i],
                matrixY[j][i]
            ]);
        }
        var line = {
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "LineString",
                "coordinates": coors
            }
        };
        var curved = turf.bezier(line, {
            resolution: 10000,
            sharpness: 0.85
        });
        geometry.setCoordinates(curved["geometry"]["coordinates"]);
        gridSrc.addFeature(feature);
    }
}