function dom_init() {

  // See http://fancybox.net/api for all options
  $("a.fancybox").fancybox({
    'speedIn' : 600,
    'speedOut' : 300
  });

    var req = new XMLHttpRequest();
    var url = 'guttenplag.csv';
    req.open('GET', url, true);
    req.onreadystatechange = function(e) {
        if (req.readyState == 4) {  
            if(req.status == 200) {
                var json = CSVToArray(req.responseText, ', ');

                json.splice(0, 1);  // remove first CSV element (headings)
                draw_barcode(json);
            } else {
            alert('Could not reach Guttenviz API at <' + url + '>.');
            }
        }
    }
    req.send(null);
}

function draw_barcode(json) {
    var pages = 475;  // number of pages to be checked
    var height = 100  // height of barcode

    var fragments = 0;
    var rows = 0;

    var canvas =  $('#barcode')[0];
    var ctx = canvas.getContext('2d');

    // remove loading indicator
    $('#barcode-container')[0].removeChild($('#barcode-container > span')[0]);

    // fucking coordinates, how do they work?
    ctx.translate(-0.5, 0.5);

    // background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, pages, height);

    var page = 0;
    while (++page) {
        // check every page
        for (var i=0, len=json.length; i<len; ++i) {
            pagenumber_current = parseInt(json[i][0], 10);
            if (page == pagenumber_current) {
                // plagiarism fragment
                fragments++;

                ctx.strokeStyle = '#000000';
                ctx.moveTo(page, 0);
                ctx.lineTo(page, height);
                ctx.stroke();

                var rowNode = document.createElement('tr');
                rowNode.className = 'page' + pagenumber_current;

                var pageNode = document.createElement('td');
                var pageRowsNode = document.createElement('td');
                var guttenNode = document.createElement('td');
                var originalNode = document.createElement('td');
                var sourceNode = document.createElement('td');

                var urlNode = document.createElement('td');

                pageNode.textContent = pagenumber_current;

                var rowsText = fix_text(json[i][1])
                pageRowsNode.textContent = rowsText;

                var rowsList = rowsText.split('-');
                n1 = parseInt(rowsList[0], 10);
                n2 = parseInt(rowsList[1], 10);

                if (typeof rowsList[1] == typeof undefined) {
                    rows_current = 1;
                } else {
                    rows_current = n2 - n1 + 1;
                };

                if (isNaN(rows_current)) {
                    $('#errors')[0].textContent += 'Nicht auswertbare Zeilenangabe zu Seite ' + pagenumber_current + ': „' + rowsText + '“\n';
                } else {
                    rows += rows_current;
                };

                guttenNode.textContent = fix_text(json[i][2]);
                originalNode.textContent = fix_text(json[i][5]);
                sourceNode.textContent = fix_text(json[i][8]);

                if (json[i][9] != '') {
                    var aNode = document.createElement('a');

                    aNode.href = fix_text(json[i][9]);
                    aNode.textContent = aNode.href;

                    urlNode.appendChild(aNode);
                }

                rowNode.appendChild(pageNode);
                rowNode.appendChild(pageRowsNode);
                rowNode.appendChild(guttenNode);
                rowNode.appendChild(originalNode);
                rowNode.appendChild(sourceNode);

                rowNode.appendChild(urlNode);

                $('#fragments')[0].appendChild(rowNode)
            }
        }

        // break on final page
        if (page == pages) {
            $('#fragment-count')[0].textContent = fragments + ' Fragmente / ' + rows + ' Zeilen';
            break;
        }
    }

    canvas.addEventListener(
        'click', 
        function(e) {
            var pagenumber = get_pagenumber(this, e);
            var fragments = $('.page' + pagenumber).length;
            if (fragments == 1) {
                $('#fragment-count')[0].textContent = '1 Fragment auf Seite ' + pagenumber + '.';
            } else {
                $('#fragment-count')[0].textContent = fragments + ' Fragmente auf Seite ' + pagenumber + '.';
            }

            var css = '#fragments > tr {display: none;} #fragments > tr.page' + pagenumber + ' {display: table-row;}';
            $('#style')[0].textContent = css;
        },
        false
    );

    canvas.addEventListener(
        'mousemove',
        function(e) {
            var pagenumber = get_pagenumber(this, e);
            $('#tooltip')[0].textContent = pagenumber;
        },
        false
    );

    canvas.addEventListener(
        'mouseover',
        function(e) {
            $('#tooltip')[0].style.visibility = 'visible'
        },
        false
    );

    canvas.addEventListener(
        'mouseout',
        function(e) {
            $('#tooltip')[0].style.visibility = 'hidden';
        },
        false
    );
}

function fix_text(text) {
    text = text.replace(/&#13;&#10;/g, ' ');
    text = text.replace(/&#039;/g, "'");
    text = text.replace(/&quot;/g, '"');
    text = text.replace(/&#9;/g, '    ');
    return text;
}

function get_pagenumber(that, event) {
    // quick hack, needs to be changed if number of canvas parent elements changes
    return event.pageX - that.offsetLeft - that.parentNode.offsetLeft - that.parentNode.parentNode.offsetLeft -1;
}
