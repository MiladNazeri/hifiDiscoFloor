//  createDiscoFloor.js
//
//  Script Type: Entity Spawner
//  Created by Jeff Moyes on 6/30/2017
//  Copyright 2017 High Fidelity, Inc.
//
//  This script creates a disco floor (a multitiled floor with each tile having a random color.
//  When an avatar steps on a tile, the tile should switch to a highlighted (lighter) version of its color
//  and then return to normal when the avatar steps off
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

// Settings
var position1 = {
    x: 4.5,
    y: -0.7,
    z: 30.9
};
var position2 = {
    x: 15.7,
    y: -0.7,
    z: 25.8
};
var position3 = {
    x: 12.7,
    y: -0.7,
    z: 34.0
};
var position4 = {
    x: 8.0,
    y: 0.7,
    z: 22.5
};

var positionXHigh = Math.max(position1.x, position2.x, position3.x, position4.x);
var positionXLow = Math.min(position1.x, position2.x, position3.x, position4.x);
var positionZHigh = Math.max(position1.z, position2.z, position3.z, position4.z);
var positionZLow = Math.min(position1.z, position2.z, position3.z, position4.z);
print("positionXHigh", positionXHigh);
print("positionXLow", positionXLow);
print("positionZHigh", positionZHigh);
print("positionZLow", positionZLow);


var positionXOffset = ((positionXHigh - positionXLow) / 2) + positionXLow;
var positionZOffset = ((positionZHigh - positionZLow) / 2) + positionZLow;
print("positionXOffset", positionXOffset);
print("positionZOffset", positionZOffset);
// var numColumns = 100;
// var numRows = 100;
// var tileDimensionX = 2;
// var tileDimensionY = 2;
// var tileDimensionZ = 2;
// var positionY = 0;

var numColumns = 8;
var numRows = 8;
var tileDimensionX = 1;
var tileDimensionY = 1;
var tileDimensionZ = 1;
var positionY = -2;

// The colors are in the following order: red, green ,blue, purple, coral(orange), yellow, maroon
var colorPallet = [
    { "base":{ "red": 200, "green": 0, "blue": 0 }, "highlight":{ "red": 255, "green": 0, "blue": 0 }},
    { "base":{ "red": 0, "green": 200, "blue": 0 }, "highlight":{ "red": 0, "green": 255, "blue": 0 }},
    { "base":{ "red": 0, "green": 0, "blue": 200 }, "highlight":{ "red": 255, "green": 0, "blue": 255 }},
    { "base":{ "red": 128, "green": 0, "blue": 128 }, "highlight":{ "red": 186, "green": 85, "blue": 211 }},
    { "base":{ "red": 255, "green": 127, "blue": 80 }, "highlight":{ "red": 255, "green": 165, "blue": 0 }},
    { "base":{ "red": 255, "green": 255, "blue": 0 }, "highlight":{ "red": 255, "green": 255, "blue": 200 }},
    { "base":{ "red": 128, "green": 0, "blue": 0 }, "highlight":{ "red": 178, "green": 34, "blue": 34 }},
];
// End Settings

// Don't change things below here unless you are reprogramming things
var colOffset = -(Math.floor( numColumns / 2 ));
var rowOffset = -(Math.floor( numRows / 2 ));
var tileOffsetX = ( numColumns % 2 === 0 ) ? tileDimensionX/2 : 0;
var tileOffsetZ = ( numRows % 2 === 0 ) ? tileDimensionZ/2 : 0;
//print("\ncolOffset = " + colOffset + ", numColumns = " + numColumns + "\nrowOffset = " + rowOffset + ", numRows = " +
//numRows + "\n( numColumns % 2 == 0 ): " + ( numColumns % 2 == 0 ) + " -- tileOffsetX = " + tileOffsetX + ", tileOffsetZ = " + tileOffsetZ);

var floorTiles = [];
var currentTile = undefined;
var discoFloorSensorZone;
var scriptURL_discoZone = Script.resolvePath('discoZone.js');
var updateConnected = false;

function makeTiles() {
    var rowNum, colNum, rowArray, randomColorIndex, boxEntity;

    for (rowNum = 0; rowNum < numRows; rowNum++) {
        rowArray = [];
        for (colNum = 0; colNum < numColumns; colNum++) {
            randomColorIndex = Math.floor( Math.random() * colorPallet.length )
            boxEntity = this.makeTile( rowNum, colNum, randomColorIndex );
          //  rowArray.push({"tile":boxEntity, "r": randomColorIndex, "rowNum": rowNum, "colNum": colNum});
		    rowArray.push({"tile":boxEntity, "r": randomColorIndex});
        }
        floorTiles.push(rowArray);
    }
}

function makeTile( rowNum, colNum, randomColorIndex) {
    var positionX, positionZ, tileProps;

    positionX = (colNum + colOffset) * tileDimensionX  + tileOffsetX;
    print("positionX:", positionX);
    positionX = positionX + positionXOffset;
    print("positionX-offset:", positionX);
    positionZ = (rowNum + rowOffset) * tileDimensionZ  + tileOffsetZ;
    print("positionz:", positionZ);
    positionZ = positionZ + positionZOffset;
    print("positionZ-offset:", positionZ);

    tileProps = {
       type: 'Box',
       name: 'DiscoFloor_' + rowNum + '_' + colNum,
       color:  colorPallet[randomColorIndex].base,
       position: { "x": positionX, "y":  positionY, "z": positionZ },
       grabbable: false,
       dimensions: {
           "x": tileDimensionX,
           "y": tileDimensionY,
           "z": tileDimensionZ
       },
       userData: JSON.stringify({"colorIndex": randomColorIndex})
    }

    return Entities.addEntity(tileProps);
}

function makeZone(){
    // Because the registration point is in the middle of a zone just give the zone the dimensions
    // and place it at 0 and it will automatically be centered correctly
    var zoneProps = {
       type: 'Zone',
       name: 'DiscoFloorSensorZone',
       script: scriptURL_discoZone,
       position: {
           "x": 0,
           "y": positionY + tileDimensionY,
           "z": 0,
       },
       dimensions: {
           "x": numColumns * tileDimensionX,
           "y": positionY + tileDimensionY + 4,
           "z": numRows * tileDimensionZ
       },
    }
    discoFloorSensorZone = Entities.addEntity(zoneProps);
}

function update() {
    var rowNum, colNum, x, z;
    var footPosition = MyAvatar.getJointPosition("LeftFoot");

    x = Math.floor(footPosition.x);
    z = Math.floor(footPosition.z);
    colNum = Math.ceil((x - tileDimensionX/2) / tileDimensionX) - colOffset;
    rowNum = Math.ceil((z - tileDimensionZ/2) / tileDimensionZ) - rowOffset;

    if ( !currentTile ) {
        setCurrentTile( rowNum, colNum );
        } else {
        if ( rowNum != currentTile.rowNum || colNum != currentTile.colNum ) {
            unsetCurrentTile();
            setCurrentTile( rowNum, colNum );
        } else {
            /* it's the same */
        }
    }
}

function setCurrentTile(rowNum, colNum) {

    if ( typeof floorTiles[rowNum] === undefined  || typeof floorTiles[rowNum][colNum] === undefined ) {
        // tile doesn't exist - so returning
        return;
    }
    currentTile = floorTiles[rowNum][colNum];
    setTileColor('highlight');
}

function unsetCurrentTile() {
    setTileColor('base');
    currentTile = undefined;
}

function setTileColor(state) {
    var randomColorIndex = currentTile.r;
    var newColor = (state == 'base' ) ? colorPallet[randomColorIndex].base : colorPallet[randomColorIndex].highlight;
    Entities.editEntity( currentTile.tile, { color: newColor });
}

function handleMessages(channel, message, sender) {
    if (sender === MyAvatar.sessionUUID) {
        if (channel === 'zoneEntered' && !updateConnected) {
            updateConnected = true;
            Script.update.connect(update);
        }
        if (channel === 'zoneLeft' && updateConnected) {
            if ( currentTile  ) {
                unsetCurrentTile();
            }
            updateConnected = false;
            Script.update.disconnect(update);
        }
    }
}

function init() {
    var footPosition, zoneXMin, zoneXMax, zoneYMin, zoneYMax, zoneZMin, zoneZMax;

    Script.scriptEnding.connect( cleanUp );
    Messages.messageReceived.connect(handleMessages);

    makeTiles();
    makeZone();

    footPosition = MyAvatar.getJointPosition("LeftFoot");
    x = Math.floor(footPosition.x);
    z = Math.floor(footPosition.z);

    zoneXMin = 0 - (numColumns * tileDimensionX) / 2;
    zoneXMax = 0 + (numColumns * tileDimensionX) / 2;
    zoneYMin = positionY;
    zoneYMax = positionY + tileDimensionY;
    zoneZMin = 0 - (numRows * tileDimensionZ) / 2;
    zoneZMax = 0 + (numRows * tileDimensionZ) / 2;

    if ( zoneXMin < footPosition.x && footPosition.x < zoneXMax && zoneYMin < footPosition.y && footPosition.y < zoneYMax && zoneZMin < footPosition.z && footPosition.z < zoneZMax) {
        print("YOU ARE IN THE ZONE");
        updateConnected = true;
        Script.update.connect(update);
    }
}

function cleanUp() {
    for (var rowNum = 0; rowNum < numRows; rowNum++) {
        for (var colNum = 0; colNum < numColumns; colNum++) {
            Entities.deleteEntity(floorTiles[rowNum][colNum].tile);
        }
    }
     floorTiles = [];

    Entities.deleteEntity(discoFloorSensorZone);
}

init();
