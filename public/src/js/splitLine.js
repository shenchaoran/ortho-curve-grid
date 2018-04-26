/**
 * Accepts an ol.geom.LineString instance and a number (the desired number of segments) as parameters
 */
var splitLineString = function (geometry, n) {
    var splitPoints = [];
    var coords = geometry.getCoordinates();
    var coordIndex = 0;
    var startPoint = coords[coordIndex];
    var nextPoint = coords[coordIndex + 1];
    var segmentLength = geometry.getLength() / n;
    var currentSegmentLength = 0;
    splitPoints.push(startPoint);

    for (var i = 0; i < n; ) {
        var distanceBetweenPoints = calculatePointsDistance(startPoint, nextPoint);
        currentSegmentLength += distanceBetweenPoints;

        if (currentSegmentLength < segmentLength) {
            coordIndex++;
            if(coordIndex< coords.length - 1) {
                startPoint = coords[coordIndex];
                nextPoint = coords[coordIndex + 1];
                // i--;
                continue;
            }
            else {
                break;
            }
        } else {
            var distanceToSplitPoint = currentSegmentLength - segmentLength;
            var splitPointCoords = calculateSplitPointCoords(startPoint, nextPoint, distanceBetweenPoints, distanceToSplitPoint);
            var splitPoint = new ol.geom.Point(splitPointCoords);
            //   splitPoints.push(splitPoint);
            splitPoints.push(splitPointCoords);
            startPoint = splitPoint.getCoordinates();
            currentSegmentLength = 0;
            i++;
        }
    }
    splitPoints.push(coords[coords.length - 1]);

    return splitPoints;
};


var calculateSplitPointCoords = function (startNode, nextNode, distanceBetweenNodes, distanceToSplitPoint) {
    var d = distanceToSplitPoint / distanceBetweenNodes;
    var x = nextNode[0] + (startNode[0] - nextNode[0]) * d;
    var y = nextNode[1] + (startNode[1] - nextNode[1]) * d;

    return [x, y];
};


var calculatePointsDistance = function (coord1, coord2) {
    var dx = coord1[0] - coord2[0];
    var dy = coord1[1] - coord2[1];

    return Math.sqrt(dx * dx + dy * dy);
};

