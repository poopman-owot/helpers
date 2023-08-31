const help = {
  //Modified to allow for flexible inputs and a new "empty" return key

  getCharInfo(...args) {
    let tileX, tileY, charX, charY;

    if (args.length === 1 && Array.isArray(args[0]) && args[0].length === 2) {
      const [x, y] = args[0];
      const cellArray = help.pixelToCell([x, y]);
      [tileX, tileY, charX, charY] = cellArray;
    } else if (args.length === 1 && Array.isArray(args[0]) && args[0].length === 4) {
      [tileX, tileY, charX, charY] = args[0];
    } else if (args.length === 1 && typeof args[0] === 'object') {
      const objArgs = args[0];
      if ('tileX' in objArgs) {
        tileX = objArgs.tileX;
      }
      if ('tileY' in objArgs) {
        tileY = objArgs.tileY;
      }
      if ('charX' in objArgs) {
        charX = objArgs.charX;
      }
      if ('charY' in objArgs) {
        charY = objArgs.charY;
      }
      if ('x' in objArgs && 'y' in objArgs) {
        const cellArray = help.pixelToCell([objArgs.x, objArgs.y]);
        [tileX, tileY, charX, charY] = cellArray;
      }
    } else {
      if (!cursorCoords) {
        return null;
      }
      [tileX, tileY, charX, charY] = cursorCoords;
    }

    const char = getChar(tileX, tileY, charX, charY);
    const color = getCharColor(tileX, tileY, charX, charY);
    const protection = getCharProtection(tileX, tileY, charX, charY);
    const protectionTypes = ["public", "member", "owner"];

    return {
      loaded: isTileLoaded(tileX, tileY),
      char: char,
      color: color,
      bgColor: getCharBgColor(tileX, tileY, charX, charY),
      protection: protection,
      decoration: getCharDecoration(tileX, tileY, charX, charY),
      empty: (char === " " || color === resolveColorValue(styles[protectionTypes[protection]]))
    };
  },
  // modified to allow for flexible inputs. (a,b,c,d,e,f,g,h) || (array[4], e,f,g h) || (a,b,c,d,array[4]) || (array[4], array[4]) || (array[8])
  coordinateAdd(...args) {


    let tileX1, tileY1, charX1, charY1, tileX2, tileY2, charX2, charY2;


    if (args[0] instanceof Array && args.length === 5) {
      [tileX1, tileY1, charX1, charY1] = args[0];
      [tileX2, tileY2, charX2, charY2] = args.slice(1);
    } else if (args[4] instanceof Array && args.length === 5) {
      [tileX1, tileY1, charX1, charY1] = args;
      [tileX2, tileY2, charX2, charY2] = args[4];

    } else if (args.length === 8) {
      [tileX1, tileY1, charX1, charY1, tileX2, tileY2, charX2, charY2] = args;
    } else if (args.length === 2 && args[0] instanceof Array && args[1] instanceof Array) {
      [tileX1, tileY1, charX1, charY1] = args[0];
      [tileX2, tileY2, charX2, charY2] = args[1];
    } else if (args.length === 1 && args[0] instanceof Array) {
      if (args[0].length == 8) {
        [tileX1, tileY1, charX1, charY1, tileX2, tileY2, charX2, charY2] = args[0];
      }
    } else {
      return null
    }

    return [
      tileX1 + tileX2 + Math.floor((charX1 + charX2) / tileC),
      tileY1 + tileY2 + Math.floor((charY1 + charY2) / tileR),
      (charX1 + charX2) - Math.floor((charX1 + charX2) / tileC) * tileC,
      (charY1 + charY2) - Math.floor((charY1 + charY2) / tileR) * tileR
    ];

  },
  pixelToCell(...args) {
    let x, y;
    if (args.length === 2) {
      [x, y] = args;
    } else if (args.length === 1 && Array.isArray(args[0]) && args[0].length === 2) {
      [x, y] = args[0];
    } else if (args.length === 1 && typeof args[0] === 'object') {
      if ('x' in args[0]) {
        x = args[0].x;
      }
      if ('y' in args[0]) {
        y = args[0].y;
      }
    } else {
      throw new Error('Invalid input format. Use either (x, y), [x, y], or an object with x and y properties.');
    }

    var tileX = 0;
    var tileY = 0;
    var charX = 0;
    var charY = 0;
    var mpX = x - positionX - Math.trunc(owotWidth / 2);
    var mpY = y - positionY - Math.trunc(owotHeight / 2);
    // add global cell position
    charX = Math.floor(mpX / cellW);
    charY = Math.floor(mpY / cellH);
    // add tile position
    tileX = Math.floor(charX / tileC);
    tileY = Math.floor(charY / tileR);
    // add in-tile cell position
    charX = charX - (Math.floor(charX / tileC) * tileC);
    charY = charY - (Math.floor(charY / tileR) * tileR);
    return [tileX, tileY, charX, charY];
  },
  cellToPixel(...cellCoords) {
    let x, y, z, w;

    if (Array.isArray(cellCoords[0])) {
      [x = 0, y = 0, z = 0, w = 0] = cellCoords[0];
    } else if (typeof cellCoords[0] === "object") {
      if ('tileX' in cellCoords[0]) {
        x = cellCoords[0].tileX;
      }
      if ('tileY' in cellCoords[0]) {
        y = cellCoords[0].tileY;
      }
      if ('charX' in cellCoords[0]) {
        z = cellCoords[0].charX;
      }
      if ('charY' in cellCoords[0]) {
        w = cellCoords[0].charY;
      }
    } else {
      [x = 0, y = 0, z = 0, w = 0] = cellCoords;
    }

    if (cellCoords.length > 4 || x === undefined || y === undefined || z === undefined || w === undefined) {
      console.error(`CellToPixelCoords: Invalid cellCoords. Arguments can either be ([x, y, z, w]) or (x,y,z,w) or an object with tileX, tileY, charX, charY. Your cellCoords was: ${cellCoords}`);
      return;
    }

    const X = Math.round(x) * tileW + z * cellW + Math.round(positionX) + Math.round(owotWidth / 2);
    const Y = Math.round(y) * tileH + w * cellH + Math.round(positionY) + Math.round(owotHeight / 2);

    return [X, Y];
  },
  lerp(start = 0, end = 0, amt = 0.5, roundResult = false) {
    if (typeof start === 'object' && typeof end === 'object') {
      if (Array.isArray(start)) {
        return start.map((value, i) => help.lerp(value, end[i], amt, roundResult));
      }
      const resultObject = {};
      for (const key in start) {
        if (end.hasOwnProperty(key)) {
          resultObject[key] = help.lerp(start[key], end[key], amt, roundResult);
        }
      }
      return resultObject;
    }

    if (Array.isArray(start)) {
      if (typeof end === 'number') {
        return start.map((value) => help.lerp(value, end, amt, roundResult));
      }
      if (Array.isArray(end)) {
        if (end.length === 1) {
          return start.map((value) => help.lerp(value, end[0], amt, roundResult));
        }
        if (start.length === end.length) {
          return start.map((value, i) => help.lerp(value, end[i], amt, roundResult));
        }
      }
    }

    let value = (1 - amt) * start + amt * end;
    if (roundResult !== false) {
      if (typeof roundResult === 'number') {
        const factor = 1 / roundResult;
        value = Math.round(value * factor) / factor;
      } else {
        value = Math.round(value);
      }
    }
    return value;
  },
  subtract(source = [0], subtractBy = 0, roundResult = false) {
    if (Array.isArray(source)) {
      if (Array.isArray(subtractBy)) {
        if (source.length === subtractBy.length) {
          const resultArray = source.map((value, index) => {
            let result = value - subtractBy[index];
            if (roundResult) {
              result = Math.round(result);
            }
            return result;
          });
          return resultArray;
        }
      } else if (typeof subtractBy === 'number') {
        const resultArray = source.map((value) => {
          let result = value - subtractBy;
          if (roundResult) {
            result = Math.round(result);
          }
          return result;
        });
        return resultArray;
      }
    } else if (typeof source === 'object' && typeof subtractBy === 'object') {
      const resultObject = {};
      for (const key in source) {
        if (subtractBy.hasOwnProperty(key)) {
          resultObject[key] = source[key] - subtractBy[key];
          if (roundResult) {
            resultObject[key] = Math.round(resultObject[key]);
          }
        }
      }
      return resultObject;
    }
  },
  add(source = [0], addBy = 0, roundResult = false) {
    if (Array.isArray(source)) {
      if (Array.isArray(addBy)) {
        if (source.length === addBy.length) {
          const resultArray = source.map((value, index) => {
            let result = value + addBy[index];
            if (roundResult) {
              result = Math.round(result);
            }
            return result;
          });
          return resultArray;
        }
      } else if (typeof addBy === 'number') {
        const resultArray = source.map((value) => {
          let result = value + addBy;
          if (roundResult) {
            result = Math.round(result);
          }
          return result;
        });
        return resultArray;
      }
    } else if (typeof source === 'object' && typeof addBy === 'object') {
      const resultObject = {};
      for (const key in source) {
        if (addBy.hasOwnProperty(key)) {
          resultObject[key] = source[key] + addBy[key];
          if (roundResult) {
            resultObject[key] = Math.round(resultObject[key]);
          }
        }
      }
      return resultObject;
    }
  },
  correctLocation(...args) {
    let location = null;
    if (Array.isArray(args[0])) {
      location = args[0];
    } else if (args[0] instanceof Object) {
      const {
        tileX = 0, tileY = 0, charX = 0, charY = 0
      } = args[0];
      location = [tileX, tileY, charX, charY];
    } else {
      location = args;
    }

    const roundedLocation = location.map((coord) => Math.round(coord));
    const outLocation = [...roundedLocation];

    if (roundedLocation[2] > 15) {
      outLocation[2] = (((roundedLocation[2] % 16 + (roundedLocation[2] < 0 ? 17 : 0)) + 16) % 16);
      outLocation[0] += Math.abs(Math.ceil(-roundedLocation[2] / 16));
    }
    if (roundedLocation[2] < 0) {
      outLocation[2] = (((roundedLocation[2] % 16 + (roundedLocation[2] < 0 ? 17 : 0)) - 1 + 16) % 16);
      outLocation[0] -= Math.ceil(-roundedLocation[2] / 16);
    }
    if (roundedLocation[3] > 7) {
      outLocation[3] = (((roundedLocation[3] % 8 + (roundedLocation[3] < 0 ? 9 : 0)) + 8) % 8);
      outLocation[1] += Math.abs(Math.ceil(-roundedLocation[3] / 8));
    }
    if (roundedLocation[3] < 0) {
      outLocation[3] = (((roundedLocation[3] % 8 + (roundedLocation[3] < 0 ? 9 : 0)) - 1 + 8) % 8);
      outLocation[1] -= Math.ceil(-roundedLocation[3] / 8);
    }

    return outLocation;
  },
  getDistance(start, end, separate = false, cellUnit = false) {
    let startX, startY, endX, endY;

    if (Array.isArray(start) && Array.isArray(end)) {
      [startX, startY] = start;
      [endX, endY] = end;
    } else if (typeof start === 'object' && typeof end === 'object' &&
      'x' in start && 'y' in start && 'x' in end && 'y' in end) {
      startX = start.x;
      startY = start.y;
      endX = end.x;
      endY = end.y;
    } else {
      throw new Error('Invalid arguments');
    }

    if (cellUnit) {
      startX /= cellW;
      startY /= cellH;
      endX /= cellW;
      endY /= cellH;
    }

    const dx = endX - startX;
    const dy = endY - startY;
    const length = Math.sqrt(dx * dx + dy * dy);

    if (separate) {
      return [dx, dy];
    }

    return length;
  },

  AreArraysEqual(arr1, arr2) {
    if (!arr1 || !arr2) {
      return false;
    }
    if (arr1.length !== arr2.length) {
      return false;
    }

    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i] !== arr2[i]) {
        return false;
      }
    }

    return true;
  },
  getLinePositions(start, end, callback) {
    const errorMessage = `Start and End arguments can either be pixel-based [x,y] or they can be cell-based [tileX, tileY, charX, charY] arrays, or objects{x,y} or objects{tileX, tileY, charX, charY} type help.getLinePositions.info() for more information`;

    // Function to convert an object with x and y keys to an array of [x, y]
    function convertToXYArray(obj) {
      if (typeof obj === 'object' && 'x' in obj && 'y' in obj) {
        return [obj.x, obj.y];
      }
      return null;
    }

    // Function to convert an object with tileX, tileY, charX, and charY keys to an array of [tileX, tileY, charX, charY]
    function convertToTileArray(obj) {
      if (typeof obj === 'object' && 'tileX' in obj && 'tileY' in obj && 'charX' in obj && 'charY' in obj) {
        return [obj.tileX, obj.tileY, obj.charX, obj.charY];
      }
      return null;
    }

    // Convert start and end objects to arrays if they are objects
    const startXArray = convertToXYArray(start) || convertToTileArray(start) || start;
    const endXArray = convertToXYArray(end) || convertToTileArray(end) || end;

    // Ensure start and end are arrays
    if (!Array.isArray(startXArray) || !Array.isArray(endXArray)) {
      throw new Error(errorMessage);
    }

    let currentPixel, endPixel;
    if (startXArray.length === 2) {
      currentPixel = startXArray.slice(); // Copy the array
    } else if (startXArray.length === 4) {
      currentPixel = help.cellToPixel(startXArray);
    } else {
      throw new Error(errorMessage);
    }
    if (endXArray.length === 2) {
      endPixel = endXArray.slice(); // Copy the array
    } else if (endXArray.length === 4) {
      endPixel = help.cellToPixel(endXArray);
    } else {
      throw new Error(errorMessage);
    }

    let distance = help.getDistance(currentPixel, endPixel, false, true);

    const points = []; // Array to collect points

    if (distance !== 0) {
      const loopStep = 1 / distance;
      let previousPoint = null;

      for (let i = 0; i < 1; i += loopStep) {
        const point = help.pixelToCell(help.lerp(currentPixel, endPixel, i, true));
        if (!help.AreArraysEqual(previousPoint, point)) {
          const [tileX, tileY, charX, charY] = point;
          previousPoint = point;
          callback(tileX, tileY, charX, charY); // Call the callback with the data
          points.push(point); // Add the point to the array
        }
      }
    }

    return points; // Return the array of points
  },
 getSquarePositions(...args) {
    let centerPosition, distanceFromCenter = 0,
      cellBuffer = 1,
      forceSquare = false,
      debug = false,
      callback = null;

    if (args.length >= 1) {
      centerPosition = args[0];
    }

    if (args.length >= 2) {
      if (typeof args[1] === 'number') {
        distanceFromCenter = args[1];
      } else if (typeof args[1] === 'function') {
        callback = args[1];
      } else if (typeof args[1] === 'boolean') {
        forceSquare = args[1]; // New: Check if forceSquare is provided
        debug = args[1]; // Assume the boolean argument is for debug
      } else {
        cellBuffer = args[1];
      }
    }

    if (args.length >= 3) {
      if (typeof args[2] === 'number') {
        if (typeof args[1] === 'number') {
          cellBuffer = args[2];
        } else {
          distanceFromCenter = args[2];
        }
      } else if (typeof args[2] === 'boolean') {
        debug = args[2];
      } else {
        callback = args[2];
      }
    }

    if (args.length >= 4) {
      debug = args[3];
    }

    if (args.length >= 5) {
      callback = args[4];
    }
    function performDebugHighlight(debug, position, color) {
      if (!debug) {
        return
      }
      highlight([position], true, int_to_rgb(color))

    }
    // Calculate the starting position of the square
    function calculateStartPosition(centerPosition, distanceFromCenter, cellBuffer) {
      return help.coordinateAdd(centerPosition, [0, 0, -1 * (distanceFromCenter + cellBuffer), -1 * (distanceFromCenter + cellBuffer)]);
    }

    // Initialize the return object with empty arrays
    function initializeSquarePositions() {
      return {
        top: {
          left: [],
          center: [],
          right: []
        },
        bottom: {
          left: [],
          center: [],
          right: []
        },
        left: [],
        right: [],
        center: []
      };
    }

    // Determine the color and position based on the row and column
    function determineColorAndPosition(row, col, squareSize, start, cellBuffer) {
      const colorMap = {
        topLeft: 255,
        bottomLeft: 754674,
        trueLeft: 7542674,
        topRight: 23463,
        bottomRight: 2343463,
        trueRight: 23434463,
        topCenter: 53434463,
        bottomCenter: 939434463,
        innerSquare: 93943
      };

      const d1 = col;
      const d2 = row;
      const isLeft = d1 < cellBuffer;
      const isRight = d1 >= squareSize - cellBuffer;
      const isTop = d2 < cellBuffer;
      const isBottom = d2 >= squareSize - cellBuffer;

      let color;
      let position;
      let type;
      if (isLeft) {
        if (isTop) {
          color = colorMap.topLeft;
          type = `topLeft`;
        } else if (isBottom) {
          color = colorMap.bottomLeft;
          type = `bottomLeft`;
        } else {
          color = colorMap.trueLeft;
          type = `trueLeft`;
        }
      } else if (isRight) {
        if (isTop) {
          color = colorMap.topRight;
          type = `topRight`;
        } else if (isBottom) {
          color = colorMap.bottomRight;
          type = `bottomRight`;
        } else {
          color = colorMap.trueRight;
          type = `trueRight`;
        }
      } else {
        if (isTop) {
          color = colorMap.topCenter;
          type = `topCenter`;
        } else if (isBottom) {
          color = colorMap.bottomCenter;
          type = `bottomCenter`;
        } else {
          color = colorMap.innerSquare;
          type = `innerSquare`;
        }
      }

      position = help.coordinateAdd(start, [0, 0, d1, d2]);
      const [x, y, z, w] = position;
      return {
        color,
        position,
        type
      };
    }

    // Add the position to the appropriate section of the return object
    function addToReturnObject(squarePositions, color, position) {
      if (color === 255) {
        squarePositions.top.left.push(position);
      } else if (color === 754674) {
        squarePositions.bottom.left.push(position);
      } else if (color === 7542674) {
        squarePositions.left.push(position);
      } else if (color === 23463) {
        squarePositions.top.right.push(position);
      } else if (color === 2343463) {
        squarePositions.bottom.right.push(position);
      } else if (color === 23434463) {
        squarePositions.right.push(position);
      } else if (color === 53434463) {
        squarePositions.top.center.push(position);
      } else if (color === 939434463) {
        squarePositions.bottom.center.push(position);
      } else {
        squarePositions.center.push(position);
      }
    }

    // Calculate the total size of the square
    const squareSize = (distanceFromCenter + cellBuffer) * 2 + 1;

    // Calculate the starting position of the square
    const start = calculateStartPosition(centerPosition, distanceFromCenter, cellBuffer);

    // Initialize the return object to store square positions
    const squarePositions = initializeSquarePositions();

    // Iterate through each position in the square
    for (let row = 0; row < squareSize; row++) {
      for (let col = 0; col < squareSize; col++) {
        // Determine the color and position based on the current row and column
        const {
          color,
          position,
          type
        } = determineColorAndPosition(row, col, squareSize, start, cellBuffer);
        // Call the callback with the array of color-position pairs
        if (typeof callback === 'function') {
          callback(type, position);
        }
        performDebugHighlight(debug, position, color);
        // Add the position to the appropriate section of the return object
        addToReturnObject(squarePositions, color, position);

      }
    }

    return squarePositions;



  },
  getMouseData() {
    const [x, y] = currentMousePosition;
    const coords = help.pixelToCell(x, y);
    const info = {
      pos: {
        screen: [x, y],
        cell: coords
      },
      charInfo: help.getCharInfo(coords)
    }
    return info
  },
async username(e) {
  let n = await async function(e) {
    return new Promise(async (n, t) => {
      let a = null;
      e = async function(...t) {
        let c = t.find(e => "object" == typeof e && e.type);
        c ? /^T\w+( \w+)*\.$/.test(c.message) && !c.date && (getChatfield().lastElementChild.remove(), "anon_nick" === c.type ? n(e = a = `${c.nickname}_${c.id}`) : n(e = a = c.nickname || c.realUsername || c.id || w.clientId)) : (OWOT.events.chat.push(e), api_chat_send("/test"))
      }, await e(e)
    })
  }();
  help.username = n
},
  //----------------------------------------------------Info
  build() {
      help.username()
    help.getCharInfo.info = function() {
      console.warn(`help.getCharInfo:
This function is used to get infomation about a cell's: char, colors, decorations, protection, and if it appears empty.

The following examples are considered valid inputs: 
(a,b,c,d)
(array[4])
an object containing tileX, tileY, charX, charY keys.

Example usage: help.getCharInfo(cursorCoords) this will get cell data of your current cursor.
This would be useful when trying to determine if a cell is protected, and what kind of data is in the cell in case we wanna do collision detection of a game or store a cells value for use later.
`);
    }
    help.coordinateAdd.info = function() {
      console.warn(`help.coordinateAdd:
This function is used to add two cell coordinates together.

The following examples are considered valid inputs: 
(a,b,c,d,e,f,g,h)
(array[4], e,f,g,h)
(a,b,c,d,array[4])
(array[4], array[4])
(array[8])

Example usage: help.coordinateAdd(cursorCoords,[0,0,0,1]) this will get the coords 1 to the right of your cursor coordinate.
This would be useful to get a cell that is nearby another.
`);
    }
    help.pixelToCell.info = function() {
      console.warn(`help.pixelToCell:
This function is used to a convert pixel coordinate [x,y] to a cell coordinate [tileX, tileY, charX, charY].

The following examples are considered valid inputs: 
(x,y)
(array[2])
an object containing x, y keys such as a click event object.

Example usage: function (e) { help.pixelToCell(e) this will get the coords from the event x,y pixel location.
This would be useful when trying to get a pixel coord from a mouse or perhaps from a pixel-based character on another canvas, and translating it to the nearest cell on the owot canvas.
`);
    }
    help.cellToPixel.info = function() {
      console.warn(`help.cellToPixel:
This function is used to a convert cell coordinate [tileX, tileY, charX, charY] to a pixel coordinate [x,y].

The following examples are considered valid inputs: 
(x,y,z,w)
(array[4])
an object containing tileX, tileY, charX, charY keys.

Example usage: help.cellToPixel([5,5,4,4]) this will return a pixel [x,y] location.
This would be useful when trying translate cell coords to pixel coords.
`);
    }
    help.lerp.info = function() {
      console.warn(`help.lerp:
This function is used to blend numbers together. (start, end, amt = 0.5, roundResult = false)

The following examples are considered valid inputs: (amt and roundResult are optional): 
(a,b)
(array[N] , b)
(array[N],array[N])
(object,object)

Example usage: help.lerp([0, 100], [100, 200], 0.5)); this Outputs: [50, 150].
This would be useful when trying get coords along a linear path, or having a smooth change in a character's speed; slowly increasing or decreasing. 
Feature: roundResult can be set to false to not round, true to round to the nearest integer, or you can set a specific number to round to for example help.lerp(10,2,0.1,0.25) = 9.25 instead of 9 or 9.2.
`);
    }
    help.subtract.info = function() {
      console.warn(`help.subtract:
This function is used to substract two variables from eachother. It can be arrays, numbers and objects.

The following examples are considered valid inputs: 
(array , array)
(array , number)
(object, object)

Example usage:  help.subtract([10,10,5,5],1), the output would be [9,9,4,4] 
`);
    }
    help.add.info = function() {
      console.warn(`help.add:
This function is used to add two variables together. It can be arrays, numbers and objects.

The following examples are considered valid inputs: 
(array , array)
(array , number)
(object, object)

Example usage: help.add([10,10,5,5],1), the output would be [11,11,6,6] 
`);
    }
    help.correctLocation.info = function() {
      console.warn(`help.correctLocation:
This function is used to convert an invalid cell location into a valid one.

The following examples are considered valid inputs: (amt and roundResult are optional): 
(a,b,c,d)
([a,b,c,d])
an object containing tileX, tileY, charX, charY keys.

Example usage: help.correctLocation(10,10,5,100) x is 100 which is invalid so the tileX value is shifted. This outputs: [10, 22, 5, 4]
This would be useful when moving a character left or right, or over large distances, just update the cellX or cellY and this will correct any issues for you.
`);
    }
    help.getDistance.info = function() {
      console.warn(`help.getDistance:
This function is used to return the distance between two [x,y] or {x,y} points either in pixel space or in owot cell space.
The following examples are considered valid inputs: (separate, cellUnit, are both optional): ([x,y]) || ({x,y})
Example usage: help.getDistance([10,0],[0,0],true,true) this will return [-1, 0] since seperate == true and we are converting to cell coords
This would be useful for checking the distance between two 2d coords.
`);
    }
    help.AreArraysEqual.info = function() {
      console.warn(`help.AreArraysEqual:
This function returns true if two arrays are the same.
The following examples are considered valid inputs: (array,array)
Example usage: help.AreArraysEqual([10,0],[0,0]) this will return false
This would be useful for checking two arrays against eachother, like when looping through pixels and converting to cell coords, if you only want to return cellcoords when they are not the same as the one before it.
`);
    }
    help.getLinePositions.info = function() {
      console.warn(`help.getLinePositions:
This  function has a looped callback of (tileX, tileY, charX, charY). it will also return an array at the end of the function call.

The following examples are considered valid inputs: 
array[tileX, tileY, charX, charY]
array[x,y]
object{x,y}
object{tileX, tileY, charX, charY}

Example usage: help.getLinePositions(startCoords, endCoords,function(a, b, c, d){console.log(a, b, c, d)}) this will run a callback and log all the coords.
This would be useful for getting points in a line between two points. The callback data can be used for building line drawers.
`);
    }
    help.getSquarePositions.info = function() {
      console.warn(`help.getSquarePositions:
This  function has a looped callback of type, position(tileX, tileY, charX, charY). it will also return an object at the end of the function call.

The following examples are considered valid inputs: 
getSquarePositions(centerPosition);
getSquarePositions(centerPosition);
getSquarePositions(centerPosition, cellBuffer);
getSquarePositions(centerPosition, callback);
getSquarePositions(centerPosition, distanceFromCenter);
getSquarePositions(centerPosition, cellBuffer, debug);
getSquarePositions(centerPosition, distanceFromCenter, callback);
getSquarePositions(centerPosition, cellBuffer, debug, callback);

Example usage: help.getSquarePositions(cursorCoords,true,function(color,position){console.log(color,position)}). This function will console log each positin and color, it will also highlight the square.
This will be usefull for drawing squares, or using this with a character for collision detection or serrounding cells.
`);
    }
    help.getMouseData.info = function() {
      console.warn(`help.getMouseData:
This  function returns the mouse location in pixel-space and cell-space. It also gets the character data under the mouse position.
`);
    }

    help.build = null;
  }

}

help.build()
