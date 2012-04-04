$(function(){
  // "use strict";


   // This will parse a delimited string into an array of
    // arrays. The default delimiter is the comma, but this
    // can be overriden in the second argument.
    function CSVToArray( strData, strDelimiter ){
      // Check to see if the delimiter is defined. If not,
      // then default to comma.
      strDelimiter = (strDelimiter || ",");

      // Create a regular expression to parse the CSV values.
      var objPattern = new RegExp(
        (
          // Delimiters.
          "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

          // Quoted fields.
          "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

          // Standard fields.
          "([^\"\\" + strDelimiter + "\\r\\n]*))"
        ),
        "gi"
        );


      // Create an array to hold our data. Give the array
      // a default empty first row.
      var arrData = [[]];

      // Create an array to hold our individual pattern
      // matching groups.
      var arrMatches = null;


      // Keep looping over the regular expression matches
      // until we can no longer find a match.
      while (arrMatches = objPattern.exec( strData )){

              // Get the delimiter that was found.
              var strMatchedDelimiter = arrMatches[ 1 ];

              // Check to see if the given delimiter has a length
              // (is not the start of string) and if it matches
              // field delimiter. If id does not, then we know
              // that this delimiter is a row delimiter.
              if (
                strMatchedDelimiter.length &&
                (strMatchedDelimiter != strDelimiter)
                ){

                      // Since we have reached a new row of data,
                      // add an empty row to our data array.
                      arrData.push( [] );

                    }


              // Now that we have our delimiter out of the way,
              // let's check to see which kind of value we
              // captured (quoted or unquoted).
              if (arrMatches[ 2 ]){

                      // We found a quoted value. When we capture
                      // this value, unescape any double quotes.
                      var strMatchedValue = arrMatches[ 2 ].replace(
                        new RegExp( "\"\"", "g" ),
                        "\""
                        );

                    } else {

                      // We found a non-quoted value.
                      var strMatchedValue = arrMatches[ 3 ];

                    }


              // Now that we have our value string, let's add
              // it to the data array.
              arrData[ arrData.length - 1 ].push( strMatchedValue );
            }
        arrData.pop()
      // Return the parsed data.
      return( arrData );
  }


  function chart ( options ) {

    var totals = options.totals
    , lookups = options.lookups
    , container = options.container
    , dates = options.dates
    w = dates.length *10,
    h = 600,
    margin = 20,
    y = d3.scale.linear().domain([0, d3.max(totals)]).range([0 + margin, h - margin]),
    x = d3.scale.linear().domain([0, totals.length]).range([0 + margin, w - margin])

    var vis = d3.select(container)
        .append("svg:svg")
        .attr("width", w)
        .attr("height", h)

    var g = vis.append("svg:g")
        .attr("transform", "translate(0, " + h + ")");
    
    var line = d3.svg.line()
        .x(function(d,i) { return x(i); })
        .y(function(d) { return -1 * y(d); })
    
    g.append("svg:path")
      .attr("d", line(totals))
      .attr("class", "totals")

    g.append("svg:path")
      .attr("d", line(lookups))
      .attr("class", "lookups")
    
    g.append("svg:line")
        .attr("x1", x(0))
        .attr("y1", -1 * y(0))
        .attr("x2", x(w))
        .attr("y2", -1 * y(0))

    g.append("svg:line")
        .attr("x1", x(0))
        .attr("y1", -1 * y(0))
        .attr("x2", x(0))
        .attr("y2", -1 * y(d3.max(totals)))
    
    g.selectAll(".xLabel")
        .data(x.ticks(w/200))
        .enter().append("svg:text")
        .attr("class", "xLabel")
        .text (function(d) {
          var date = new Date(dates[d]*1000)
          return date.toUTCString()
        })
        .attr("x", function(d) { return x(d) })
        .attr("y", 0)
        .attr("text-anchor", "middle")

    g.selectAll(".yLabel")
        .data(y.ticks(4))
        .enter().append("svg:text")
        .attr("class", "yLabel")
        .text(String)
        .attr("x", 0)
        .attr("y", function(d) { return -1 * y(d) })
        .attr("text-anchor", "right")
        .attr("dy", 4)
    
    g.selectAll(".xTicks")
        .data(x.ticks(5))
        .enter().append("svg:line")
        .attr("class", "xTicks")
        .attr("x1", function(d) { return x(d); })
        .attr("y1", -1 * y(0))
        .attr("x2", function(d) { return x(d); })
        .attr("y2", -1 * y(-0.3))

    g.selectAll(".yTicks")
        .data(y.ticks(4))
        .enter().append("svg:line")
        .attr("class", "yTicks")
        .attr("y1", function(d) { return -1 * y(d); })
        .attr("x1", x(-0.3))
        .attr("y2", function(d) { return -1 * y(d); })
        .attr("x2", x(0))
  }


  function data_to_chart(data, container){
    var d = CSVToArray(data, " ")
      d_length = d.length
      , lookups = []
      , totals = []
      , dates = []

    // console.log(d)
    for (var i = 1; i < d_length; i++){ // skip the first row because it's headers
      dates[i-1] = d[i][0]
      lookups[i-1] = d[i][1] || null
      totals[i-1] = d[i][5] || null
    }
    // console.log(totals);

    chart({
      totals: totals
      , lookups: lookups
      , container: "#" + container
      , dates: dates
    })
    scrollTo(0, $('body').width())
  }

  setInterval(function(){
    $("#dns, #ip").children().not('h1').remove()

    $.ajax({
      url: './by-dns.out'
      , success: function(data){ data_to_chart(data, "dns") }
      , error: function(jqXHR, status, err){
        console.log(err)
      }
    })

    $.ajax({
      url: './by-ip.out'
      , success: function(data){ data_to_chart(data, "ip") }
      , error: function(jqXHR, status, err){
        console.log(err)
      }
    })
  }, 1000 * 7)

}())
