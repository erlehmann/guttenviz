function dom_init() {

  // See http://fancybox.net/api for all options
  $("a.fancybox").fancybox({
    'speedIn' : 600,
    'speedOut' : 300
  });

    var req = new XMLHttpRequest();
    var url = 'http://fiesh.homeip.net/createCSV.php';
    req.open('GET', url, true);
    req.onreadystatechange = function(e) {
        if (req.readyState == 4) {  
            if(req.status == 200) {
                var json = CSVToArray(req.responseText);

                console.log(json[0]);
                console.log(json[1]);

                json.splice(0, 1);  // remove first CSV element (headings)
                json = bar_generate(json);
                bar_chart(json);
            } else {
            alert('Could not reach Guttenviz API at <' + url + '>.');
            }
        }
    }
    req.send(null);
}

function bar_chart(json) {
    var barChart = new $jit.BarChart({
        injectInto: 'infovis',
        orientation: 'horizontal',
        barsOffset: 1,
        labelOffset: 5,
        type: 'stacked',
        showLabels:true,
        //label styles
        Label: {
            type: 'Native', //Native or HTML
            size: 12,
            family: 'sans-serif',
            color: 'white'
        },
        //tooltip options
        Tips: {
            enable: true,
            onShow: function(tip, elem) {
                tip.innerHTML = "<b>" + elem.name + "</b>: " + elem.value;
            }
        }
    });

    barChart.loadJSON(json);

    var legend = barChart.getLegend();
}

function bar_generate(json) {
    var newjson = {
        'label': [],
        'values': [
            {
                'values': []
            }
        ]
    };

    for (var i=0, len=json.length; i<len; ++i) {
        console.log(json[i]);

        var pagenumber_current = json[i][0];

        var pagenumber_previous = newjson['label'][i-1];
        if (typeof pagenumber_previous == typeof undefined) {
            pagenumber_previous = 0;
        }

        if (pagenumber_current == pagenumber_previous) {
            break;
        }

        clean_block = pagenumber_current - pagenumber_previous - 1
        if (clean_block > 0) {
            newjson['label'].push('Seiten in plagiatfreiem Block');
            newjson['values'][0]['values'].push(clean_block);
        };

        newjson['label'].push(pagenumber_current);
        newjson['values'][0]['values'].push(1);
    }

    console.log(newjson);
    return newjson;
}
