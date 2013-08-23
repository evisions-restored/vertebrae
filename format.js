define([], function() { 
	var Format = function(inputNumber, format)
	{
	  var formatChunk = function(number, format, formatStyle)
	  {
	    //deal with negatives
	    var negative = number < 0,
	    returnVal    = "";
	    if (negative)
	      number *= -1;


	    var stringNumber    = number.toString(),
	    fixedFormat         = format,
	    //get rid of everything but the first period
	    fixedFormat         = fixedFormat.indexOf(".") == -1 ? fixedFormat : fixedFormat.substring(0,fixedFormat.indexOf(".")+1) + fixedFormat.substring(fixedFormat.indexOf(".")+1).replace(/\./g,""),
	    useCommas           = fixedFormat.indexOf(",") > -1,
	    //remove all commas (they will be added in later)
	    fixedFormat         = fixedFormat.replace(/\,/g,""),
	    //detect scientific notation
	    negativeE           = fixedFormat.indexOf("e-") > -1 || fixedFormat.indexOf("E-")> -1,
	    scientificNotation  = negativeE || fixedFormat.indexOf("e+")> -1 || fixedFormat.indexOf("E+")> -1,
	    //remove scientific notation
	    fixedFormat         = fixedFormat.replace(/(\e|\E)(\+|\-)/g,""),
	    //replace double quotes with singles for easyness
	    fixedFormat         = fixedFormat.replace(/\"/g,"'"),
	    splitFormat         = fixedFormat.split("."),
	    foundHashes         = 0,
	    maxLength           = 0;
	    //add rounding to the proper decimal into the mix.  then convert to a number and process it like its THAT number instead.
	    for (var i = 0; splitFormat.length == 2 && i < splitFormat[1].length; i++)
	    {
	      var curChar = splitFormat[1].substring(i,i+1);
	      if (curChar == '0' || curChar == '#')
	      {
	        maxLength = 1 + maxLength + foundHashes;
	        foundHashes = 0;
	      }
	    }
	    stringNumber = parseFloat(number.toFixed(maxLength)).toString();
	    //process the number input
	    var splitNumber         = stringNumber.toString().split("."),
	    placesBefore_Number = splitNumber[0].length, 
	    placesAfter_Number  = splitNumber.length > 1 ? splitNumber[1].length : 0,
	    grabberIndex        = 0,
	    numberPusherInc     = 0,
	    inQuoteMode         = false;
	    if (scientificNotation)  {
	      return number; //thats not happening.
	    }
	    //make a digit grabber function.  each time you grab, it will give you the next digit from the number (depending on wether or not you are before/after the decimalpoint)
	    var grabber = function(isBefore,reset) {
	      if (reset) {
	        numberPusherInc = 0;
	        grabberIndex = 0; 
	        return;
	      }
	      var gString = isBefore ? splitNumber[0] :  (placesAfter_Number ? splitNumber[1] : ""),
	      indexToGrab = !isBefore ? grabberIndex : placesBefore_Number - grabberIndex-1,
	      gChar       = null;
	      if (indexToGrab < splitNumber[isBefore ? 0 : 1].length && indexToGrab >= 0)
	        gChar = splitNumber[isBefore ? 0 : 1].substring(indexToGrab,indexToGrab+1)
	      grabberIndex++;
	      return gChar;
	    },
	    isLastNumberChar = function(currentPos) { //determines wether or not there are more # or 0 after a certain position in a format string
	      var temp = fixedFormat.substring(0,currentPos);
	      return temp.indexOf('#') == -1 && temp.indexOf('0') == -1;
	    },
	    pushNumber = function(no,before) { //push a number onto the return, takes care of the commas if need be
	      if (numberPusherInc == 3)
	      {
	        returnVal = "," + returnVal;
	        numberPusherInc = 0;
	      }
	      if (before)
	        returnVal = no + returnVal;
	      else
	        returnVal += no;
	      if (useCommas && before)
	        numberPusherInc++;
	    },
	    pushChar = function(chunk, before)  { //push a chunk/character onto the return
	      if (before)
	        returnVal = chunk + returnVal;
	      else
	        returnVal += chunk;
	    },
	    processor = function(formatStr, isBefore)  { //a number using a format string.  uses the grabber to get the numbers
	      //loop through first half of format
	      for (var i = isBefore ? formatStr.length-1 : 0 ; (isBefore && i>=0) || (!isBefore && i <formatStr.length); isBefore ? i-- : i++) {
	        var formatChar = formatStr.substring(i,i+1);
	        if (formatChar == "'")  {
	          inQuoteMode = !inQuoteMode;
	          continue;
	        }
	        else if (inQuoteMode) {
	          pushChar(formatChar,isBefore);
	          continue;
	        }
	        else if (formatChar == "0")
	        {
	          if (isLastNumberChar(i) && isBefore) {
	            var temp = grabber(isBefore);
	            if (temp === null)  {
	              pushNumber("0",isBefore);
	            }
	            while (temp !== null) {
	              pushNumber(temp,isBefore);
	              temp = grabber(isBefore);
	            }
	          } else {
	            var temp = grabber(isBefore);
	            pushNumber(temp ? temp :"0",isBefore);
	          }
	          continue;
	        }
	        else if (formatChar == "#")  {
	          if (isLastNumberChar(i) && isBefore) {
	            var temp = grabber(isBefore);
	            while (temp !== null)  {
	              pushNumber(temp,isBefore);
	              temp = grabber(isBefore);
	            }
	          } else {
	            var temp = grabber(isBefore);
	            //if i grabbed a number, push it.  if not, should i push a zero?  i should only push a zero if there is a '0' char further along that will require me to have a zero.
	            pushNumber(temp ? temp : (((formatStr.lastIndexOf('0') > i && !isBefore) || (isBefore && formatStr.indexOf('0') > -1 && formatStr.indexOf('0')<i)) ? "0" : ""),isBefore);
	          }
	          continue;
	        } else  {
	          pushChar(formatChar,isBefore);
	        }

	      }
	    }
	    //run the number through the formatter.  the number is split up and run seperately through the formatter around the '.'
	    processor(splitFormat[0],true);
	    if (splitFormat.length == 2)  {
	      if (splitNumber.length == 1)
	        splitNumber[1] = '';
	      if (splitNumber[1].length > 0 || splitFormat.length == 2 && splitFormat[1].indexOf("0") > -1) 
	        pushChar("."); //parsing after decimal and there's numbers.  we'll need this
	      //reset the grabber
	      grabber(false,true);
	      processor(splitFormat[1],false);
	    }
	    //only add the negative sign back if we _aren't_ in the negative format style.  if we are, we assume the user dealt with it
	    if (formatStyle != 1 && negative)  {
	      returnVal = "-" + returnVal;
	    }
	    return returnVal;
	  }
	  //make sure format is not null
	  format = format || ''
	  //first i need to split up my formatters and get each one out, postitive/negative/zero
	  var formatters = format.split(";"), returnVal = format;
	  if (formatters.length == 3 && inputNumber === 0) {
	    returnVal = formatChunk(inputNumber,formatters[2],2);
	  } else if (formatters.length >= 2 && inputNumber < 0) {
	    returnVal = formatChunk(inputNumber,formatters[1],1); 
	  } else {
	    returnVal = formatChunk(inputNumber,formatters[0],0);
	  } 
	  return returnVal;
	}
	var e = window.EVI || {};
	e.Format = Format;
	return Format;


});