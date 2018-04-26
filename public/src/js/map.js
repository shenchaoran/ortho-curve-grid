var TENSION = 1;
var POINTS_PER_SEG = 10;
var POINTS_Y_DIR = 5;

var X_STEP;
var Y_STEP;

var X_NUM = 40;
var Y_NUM = 20;

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
    var lineLayer = new ol.layer.Vector({
        title: 'Polyline layer',
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
            center: [0, 0],
            // projection: 'EPSG:4326'
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
            lineLayer,
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
    Map.lineLayer = lineLayer;
    Map.layers = [
        vectorLayer,
        bezierLayer,
        lineLayer,
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

    Map.gridLayer.setStyle([
        new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#ffcc33',
                width: 2
            }),
        })
    ]);

};

Map.addEditbar = () => {
    // region draw polygon
    var editbar = new ol.control.Bar({
        toggleOne: true,
        group: false,
        className: 'edit-bar sub-bar'
    });
    Map.pullRightBar.addControl(editbar);

    let inter = new ol.interaction.Draw({
        type: 'Polygon',
        source: Map.vectorLayer.getSource(),
        geometryFunction: function(coordinates, geometry) {
            this.nbpts = coordinates[0].length;
            if (geometry) geometry.setCoordinates([coordinates[0].concat([coordinates[0][0]])]);
            else geometry = new ol.geom.Polygon(coordinates);
            return geometry;
        }
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
                    handleClick: function () {
                        if (polygonEdit.getInteraction().nbpts > 1) polygonEdit.getInteraction().removeLastPoint();
                    }
                }),
                new ol.control.TextButton({
                    html: 'finish',
                    title: "finish",
                    handleClick: function () {
                        // Prevent null objects on finishDrawing
                        if (polygonEdit.getInteraction().nbpts > 3) polygonEdit.getInteraction().finishDrawing();
                    }
                })
            ]
        })
    });
    editbar.addControl(polygonEdit);
    // endregion

    // region draw circle
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
    // endregion

    // region draw polygon
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
    // endregion

    // region clear draw graph
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
    // endregion
}

Map.addLayerSwitch = () => {
    var switcher = new ol.control.LayerSwitcher({
        show_progress: true,
        extent: true,
        trash: true,
        oninfo: function (l) {
            alert(l.get("title"));
        }
    });
    var button = $('<div class="toggleVisibility" title="show/hide">')
        .text("Show/hide all")
        .click(function () {
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
        onToggle: function () {
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
        geometryFunction: function (coordinates, geometry) {
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
            meshCurveGrid();
        }
    });
    bezierBar.addControl(meshEdit);
}

Map.addLineBar = () => {
    var lineBar = new ol.control.Bar({
        toggleOne: true,
        group: false,
        className: 'polyline-bar sub-bar'
    });
    Map.pullRightBar.addControl(lineBar);

    // region draw polyline
    inter = new ol.interaction.Draw({
        source: Map.lineLayer.getSource(),
        type: 'LineString',
        geometryFunction: function (coordinates, geometry) {
            if (geometry) geometry.setCoordinates(coordinates);
            else geometry = new ol.geom.LineString(coordinates);
            this.nbpts = geometry.getCoordinates().length;
            return geometry;
        }
    });
    inter.on('drawend', () => {});
    var polylineEdit = new ol.control.Toggle({
        html: '<i class="fa fa-share-alt" ></i>',
        title: 'Draw polyline',
        interaction: inter,
        bar: new ol.control.Bar({
            controls: [new ol.control.TextButton({
                    html: 'undo',
                    title: "Delete last point",
                    handleClick: function () {
                        if (polylineEdit.getInteraction().nbpts > 1) polylineEdit.getInteraction().removeLastPoint();
                    }
                }),
                new ol.control.TextButton({
                    html: 'Finish',
                    title: "finish",
                    handleClick: function () { // Prevent null objects on finishDrawing
                        if (polylineEdit.getInteraction().nbpts > 2) polylineEdit.getInteraction().finishDrawing();
                    }
                })
            ]
        })
    });
    lineBar.addControl(polylineEdit);

    let snap = new ol.interaction.Snap({
        source: Map.lineLayer.getSource()
    });
    Map.map.addInteraction(snap);
    // endregion

    // region draw multi polyline
    // inter = new ol.interaction.Draw({
    //     source: Map.lineLayer.getSource(),
    //     type: 'MultiLineString',
    //     geometryFunction: function (coordinates, geometry) {
    //         if (geometry) geometry.setCoordinates(coordinates);
    //         else geometry = new ol.geom.LineString(coordinates);
    //         this.nbpts = geometry.getCoordinates().length;
    //         return geometry;
    //     }
    // });
    // inter.on('drawend', () => {});
    // var multilineEdit = new ol.control.Toggle({
    //     html: '<i class="fa fa-share-alt" ></i>',
    //     title: 'Draw polyline',
    //     interaction: inter,
    //     bar: new ol.control.Bar({
    //         controls: [new ol.control.TextButton({
    //                 html: 'undo',
    //                 title: "Delete last point",
    //                 handleClick: function () {
    //                     if (multilineEdit.getInteraction().nbpts > 1) multilineEdit.getInteraction().removeLastPoint();
    //                 }
    //             }),
    //             new ol.control.TextButton({
    //                 html: 'Finish',
    //                 title: "finish",
    //                 handleClick: function () { // Prevent null objects on finishDrawing
    //                     if (multilineEdit.getInteraction().nbpts > 2) multilineEdit.getInteraction().finishDrawing();
    //                 }
    //             })
    //         ]
    //     })
    // });
    // lineBar.addControl(multilineEdit);
    // endregion

    // generate regular grid
    var meshEdit = new ol.control.Button({
        html: '<i class="fab fa-connectdevelop"></i>',
        title: 'Mesh polyline',
        handleClick: () => {
            meshRegularGrid();
        }
    });
    lineBar.addControl(meshEdit);

    // var splitEdit = new ol.control.Button({
    //     html: 'split',
    //     title: 'Split line',
    //     handleClick: () => {
    //         Map.splitLine();
    //     }
    // });
    // lineBar.addControl(splitEdit);
}

Map.splitLine = () => {
    var pts = [];
    let feats = Map.lineLayer.getSource().getFeatures();
    _.map(feats, feat => {
        let coors = splitLineString(feat.getGeometry(), X_NUM);
        pts = _.concat(pts, coors);
    })


    Map.lineLayer.setStyle([
        new ol.style.Style({
            image: new ol.style.Circle({
                stroke: new ol.style.Stroke({
                    color: 'red',
                    width: 2
                }),
                radius: 1
            }),
            geometry: new ol.geom.MultiPoint(pts)
        }),
        new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: '#0099ff',
                width: 2
            }),
        })
    ])
}

// 画边界矩阵上的点
getIntersectPts = (matrixX, matrixY) => {
    var coors = [];
    for (var i = 0; i < matrixX.length; i++) {
        for (var j = 0; j < matrixX[0].length; j++) {
            if (matrixX[i][j] !== '0' && matrixY[i][j] !== '0') {
                coors.push([matrixX[i][j], matrixY[i][j]]);
            }
        }
    }
    return coors;

    // var geometry = new ol.geom.MultiPoint(coors);

    // var feature = new ol.Feature({
    //     geometry: geometry
    // });
    // Map.gridLayer.getSource().addFeature(feature);


    // var style = new ol.style.Style({
    //     image: new ol.style.Circle({
    //         stroke: new ol.style.Stroke({
    //             color: 'red',
    //             width: 1
    //         }),
    //         radius: 1
    //     }),
    //     geometry: geometry
    // });
    // Map.gridLayer.setStyle(style);
    // return geometry;
}

// region ortho grid

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
meshCurveGrid = () => {
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

        getIntersectPts(matrixX, matrixY);
        getOrthoGridInnerPts(matrixX, matrixY);
    } else {
        alert('invalid bezier number! Please draw 2 bezier!');
        _.map(Map.layers, layer => {
            layer.getSource().clear();
        });
    }
}

// 从后台请求矩阵内部的值
getOrthoGridInnerPts = (matrixX, matrixY) => {
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

                drawCurveGrid(matrixX, matrixY);
            } else {
                alert('mesh failed!');
            }
        })
        .error((err) => {

        });
}

// 通过矩阵画网格
drawCurveGrid = (matrixX, matrixY) => {
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
// endregion

// region regular grid
meshRegularGrid = () => {
    var lineSrc = Map.lineLayer.getSource();
    var features = lineSrc.getFeatures();
    // 至少画两条线，前两条为河网的边界，后两条是分叉口的边界
    if (features.length >= 2) {
        var coorsTop = features[0].getGeometry().getCoordinates();
        var coorsBottom = features[1].getGeometry().getCoordinates();
        var splitedTop = splitLineString(features[0].getGeometry(), X_NUM);
        var splitedBottom = splitLineString(features[1].getGeometry(), X_NUM);

        let mxL = _.min([splitedTop.length, splitedBottom.length]);
        var matrix = new Array(Y_NUM + 1);
        _.map(matrix, (row, i) => {
            matrix[i] = new Array(mxL);
            _.fill(matrix[i], ['0', '0']);
        });
        matrix[0] = _.slice(splitedTop, 0, mxL);
        matrix[Y_NUM] = _.slice(splitedBottom, 0, mxL);

        var dirtXl = (matrix[Y_NUM][0][0] - matrix[0][0][0]) / Y_NUM;
        var dirtYl = (matrix[Y_NUM][0][1] - matrix[0][0][1]) / Y_NUM;
        var dirtXr = (matrix[Y_NUM][mxL - 1][0] - matrix[0][mxL - 1][0]) / Y_NUM;
        var dirtYr = (matrix[Y_NUM][mxL - 1][1] - matrix[0][mxL - 1][1]) / Y_NUM;
        for (let i = 1; i < Y_NUM + 1; i++) {
            matrix[i][0] = [matrix[0][0][0] + dirtXl * i, matrix[0][0][1] + dirtYl * i];
            matrix[i][mxL - 1] = [matrix[0][mxL - 1][0] + dirtXr * i, matrix[0][mxL - 1][1] + dirtYr * i];
        }


        var m = matrix.length;
        var n = matrix[0].length;
        getRegularGridInnerPts(matrix, 0, m - 1);

        var matrixX = [];
        var matrixY = [];
        _.map(matrix, (row, i) => {
            matrixX.push([]);
            matrixY.push([]);
            _.map(row, td => {
                matrixX[i].push(td[0]);
                matrixY[i].push(td[1]);
            });
        });

        var innerPts = getIntersectPts(matrixX, matrixY);
        let newStyle = _.concat(
            Map.gridLayer.getStyle(),
            new ol.style.Style({
                id: 'intersect-pt',
                image: new ol.style.Circle({
                    stroke: new ol.style.Stroke({
                        color: 'red',
                        width: 2
                    }),
                    radius: 1
                }),
                geometry: new ol.geom.MultiPoint(innerPts)
            }),
        );


        if(features.length === 4) {
            let innerTop = features[2].getGeometry();
            let innerBottom = features[3].getGeometry();
            let ptIntersect = _.intersectionWith(innerTop.getCoordinates(), innerBottom.getCoordinates(), _.isEqual);
            if(ptIntersect.length) {
                ptIntersect = ptIntersect[0];let loc = getNearistPt(matrix, ptIntersect);
                let splitedInnerTop = splitLineString(innerTop, X_NUM - loc.col);
                let splitedInnerBottom = splitLineString(innerBottom, X_NUM - loc.col);
                console.log(matrix.length, matrix[0].length)
                divideMatrix(matrix, loc, splitedInnerTop, splitedInnerBottom);
                console.log(matrix.length, matrix[0].length)
                var m = matrix.length;
                drawRegularGrid(matrix, 0, loc.row);
                drawRegularGrid(matrix, loc.row + 1, m - 1);
            }
            else {
                alert('分叉口必须有交点！');
            }
        }
        else {
            drawRegularGrid(matrix);
        }

        // Map.gridLayer.setStyle(newStyle);

        // addModify
        var layer = Map.gridLayer;
        var modify = new ol.interaction.Modify({
            source: layer.getSource()
        });
        let movingPt;
        modify.on('modifystart', e => {
            console.log('modifystart', e.mapBrowserEvent.coordinate);
            movingPt = e.mapBrowserEvent.coordinate;

        })
        modify.on('modifyend', e => {
            console.log('modifyend', e.mapBrowserEvent.coordinate);
            // _.map(innerPts, pt => {
            //     if(pt === movingPt) {
            //         console.log('start');
            //         pt = e.mapBrowserEvent.coordinate;
            //     }
            // });
            // _.map(innerPts, pt => {
            //     if(pt === e.mapBrowserEvent.coordinate) {
            //         console.log('end');
            //         pt = e.mapBrowserEvent.coordinate;
            //     }
            // });


            // let modifiedFeatures = [];
            // var features = e.features.getArray();
            // for (var i = 0; i < features.length; i++) {
            //     var rev = features[i].getRevision();
            //     if (rev > 1) {
            //         console.log("feature with revision:" + rev + " has been modified");
            //         modifiedFeatures.push(features[i]);
            //     }
            // }
            // if (modifiedFeatures.length) {
            //     let newStyle = _.concat(
            //         Map.gridLayer.getStyle()[0],
            //         new ol.style.Style({
            //             id: 'intersect-pt',
            //             image: new ol.style.Circle({
            //                 stroke: new ol.style.Stroke({
            //                     color: 'red',
            //                     width: 2
            //                 }),
            //                 radius: 1
            //             }),
            //             geometry: new ol.geom.MultiPoint(modifiedFeatures[0].getGeometry().getCoordinates())
            //         }),
            //     );
            //     Map.gridLayer.setStyle(newStyle);
            // }
        })
        Map.map.addInteraction(modify);

        snap = new ol.interaction.Snap({
            source: layer.getSource()
        });
        Map.map.addInteraction(snap);
    } else {
        alert('线段数量不符合要求，请输入2条或4条线段！');
        _.map(Map.layers, layer => {
            layer.getSource().clear();
        });
    }
}

lineIntersect = (p1, p2, v1, v2) => {
    line1 = turf.lineString([p1, p2]);
    line2 = turf.lineString([v1, v2]);
    var intersects = turf.lineIntersect(line1, line2);
    return _.get(intersects, 'features.0.geometry.coordinates');
}

getNearistPt = (matrix, targetPt) => {
    let x0;
    let y0;
    let distance = Infinity;
    var m = matrix.length;
    var n = matrix[0].length;

    _.map(matrix, (row, i) => {
        _.map(row, (td, j) => {
            let v = calculatePointsDistance(td, targetPt);
            if (v < distance) {
                x0 = j;
                y0 = i;
                distance = v;
            }
        });
    });

    return {
        row: y0,
        col: x0
    };
}

getRegularGridInnerPts = (matrix, startRow, endRow) => {
    var m = matrix.length;
    var n = matrix[0].length;
    for (let j = 1; j < n - 1; j++) {
        var dirtX = (matrix[endRow][j][0] - matrix[startRow][j][0]) / (endRow - startRow);
        var dirtY = (matrix[endRow][j][1] - matrix[startRow][j][1]) / (endRow - startRow);
        for (let i = startRow + 1; i < endRow; i++) {
            matrix[i][j] = [matrix[startRow][j][0] + dirtX * (i - startRow), matrix[startRow][j][1] + dirtY * (i - startRow)];
        }
    }
}

divideMatrix = (matrix, loc, splitedInnerTop, splitedInnerBottom) => {
    var m = matrix.length;
    var n = matrix[0].length;
    
    // 从row行 下面开始向下平移一行
    let rowN = _.cloneDeep(matrix[loc.row]);
    matrix.splice(loc.row + 1, 0, rowN);

    for(let i=loc.col; i< n; i++) {
        matrix[loc.row][i] = splitedInnerTop[i - loc.col];
        matrix[loc.row + 1][i] = splitedInnerBottom[i - loc.col];
    }

    getRegularGridInnerPts(matrix, 0, loc.row);
    getRegularGridInnerPts(matrix, loc.row + 1, m - 1);
}

drawRegularGrid = (matrix, startRow, endRow) => {
    var multiLine = [];

    let v = _
        .chain(matrix)
        .cloneDeep()
        .flattenDeep()
        .filter(v => v===undefined|| v===null ||v==='NaN')
        .value();
    console.log(v);


    // var m = matrix.length;
    var n = matrix[0].length;
    for (let i = startRow + 1; i < endRow; i++) {
        for (let j = 0; j < n; j++) {
            if (j !== 0) {
                // left line
                multiLine.push([matrix[i][j - 1], matrix[i][j]]);

            }
            // top line
            multiLine.push([matrix[i - 1][j], matrix[i][j]]);
            if (i == endRow - 1) {
                // bottom line
                multiLine.push([matrix[i][j], matrix[i + 1][j]])
            }
        }
    }
    var geometry = new ol.geom.MultiLineString(multiLine);
    var feature = new ol.Feature(geometry);
    Map.gridLayer.getSource().addFeature(feature);
    return geometry;
}
// endregion