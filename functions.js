function changeAngleToBearing(angle){
	return (360 - angle + 90) % 360;
}

//takes in coordinates, distance to next point, and the angle created by the line between them, with respect to north
//return coordinates of said point
function coordsGivenPointDistanceAndAngle(p, dist, angle){

	var distanceFromLineOfLongitude = Math.cos(angle*Math.PI/180) * dist;
	var latitudeOfB = distanceFromLineOfLongitude / ONE_DEGREE_OF_LATITUDE;
	var oneDegreeOfLongitude = (Math.PI / 180) * RADIUS_OF_EARTH * (Math.cos(latitudeOfB));
	var longitudeOfB = Math.sqrt((dist * dist) - (distanceFromLineOfLongitude*distanceFromLineOfLongitude))/ oneDegreeOfLongitude;
	if(angle>180) {longitudeOfB *= -1;}
	var b = {lat:latitudeOfB+p.lat, lng:longitudeOfB+p.lng};
	b.lat = precisionRound(b.lat,6);
	b.lng = precisionRound(b.lng,6);
	return b;
}

//given two points, returns distance between them
//only works on earth
function distanceBetweenTwoPoints(point1, point2){
	var dLat = (Math.PI/180) * (point2.lat - point1.lat);
	var dLng = (Math.PI/180) * (point2.lng - point1.lng);
	var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos((Math.PI/180) * point1.lat) * Math.cos((Math.PI/180) *point2.lat) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	var d = RADIUS_OF_EARTH * c;
	return d; // returns the distance in meters
}

//finds the angle created by a line formed by points a and b with respect to the north-south line
//in degrees
function angleCreated(a, b){
	var slope = (b.lat - a.lat) / (b.lng - a.lng)
	var gradient = Math.atan(slope);
	var degrees = gradient * 180 / Math.PI;
	//see if b is east of a, in which case add 180 degrees
	//this makes function only work if a is the user's location and b
	//is some other point
	if(b.lng < a.lng) degrees += 180;
	return (changeAngleToBearing(degrees));
}

//round number to precision places
function precisionRound(number, precision) {
	var factor = Math.pow(10, precision);
	return Math.round(number * factor) / factor;
}

//returns theta as a scale of leftness or rightness
function xCoordOfLandmark(point, centre, left, right){
	var θ = angleCreated(centre, point)
	var α = angleCreated(centre, left)
	var β = angleCreated(centre, right)
	return (θ - α) / (β - α);
}

//get slope of line created by point in question, and centre
//if it is less than the slope of the line of the leftmost point
//of the sector and greater than the slope of the rightmost point
//then it is in the sector
function liesWithinSector(point, centre, left, right){
	if(distanceBetweenTwoPoints(point, centre) > DISTANCE_TO_HORIZON){
		return false;
	}
	var θ = angleCreated(centre, point)
	var α = angleCreated(centre, left)
	var β = angleCreated(centre, right)
	return(θ > α && θ < β)
}


function scaleAnglesInArray(arr, scalingFactor){
	if(scalingFactor===undefined) scalingFactor = 1;
	var scaledValues = [];
	var biggest = arr[0];
	for(var i = 1; i < arr.length; i++){
		if(arr[i]>biggest) biggest = arr[i];
	}

	for(var i = 0; i < arr.length; i++){
		scaledValues[i] = arr[i] * scalingFactor/ biggest;
	}

	return scaledValues;
}	 
