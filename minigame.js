// == interface for the game ==
function run_mini_game (size, prize, shuffle) {

    var selected = {x : 0, y : 0 }; // The selected square
    var size = size || 10,
        shuffle = shuffle || size,
        game = {
            is_win : false,
            gold : prize || 30
        },
        field = [];

    var handleKeys = function(event) {
        var name = event.key;
        var code = event.code;
        if (code.startsWith("Arrow")) {
            //console.log("Cleanup previous selected");
            $('#m' + selected.x + '_' + selected.y)['toggleClass']('s');
        }
        switch(code) {
            case "ArrowRight":
                selected.x += 1;
                if (selected.x >= size) selected.x = 0;
                //console.log(`Move right (${selected.x}, ${selected.y})`);
                break;
            case "ArrowLeft":
                selected.x -= 1;
                if (selected.x < 0) selected.x = size - 1;
                //console.log(`Move left (${selected.x}, ${selected.y})`);
                break;
            case "ArrowUp":
                selected.y -= 1;
                if (selected.y < 0) selected.y = size - 1;
                //console.log(`Move up (${selected.x}, ${selected.y})`);
                break;
            case "ArrowDown":
                selected.y += 1;
                if (selected.y >= size) selected.y = 0;
                //console.log(`Move down (${selected.x}, ${selected.y})`);
                break;
            case "Space":
                //console.log(`Click selected square (${selected.x}, ${selected.y})`);
                move(selected.x, selected.y, false);
                break;
        }
        if (code.startsWith("Arrow")) {
            //console.log("select new selected");
            $('#m' + selected.x + '_' + selected.y)['toggleClass']('s');
        }
    }
    var turn = function(x, y) {
        var row = field[y];
        row[x] = !row[x];
        $('#m' + x + '_' + y)['toggleClass']('r');
    }

    var is_win_position = function() {
        for(var j = 0; j < size; ++j)
            for(var i = 0; i < size; ++i)
                if (!field[j][i])
                    return false;
        return true;
    }

    var win = function () {
        game.is_win = true;
        //$('#mg')['hide']()['empty']();
        $('#mf')['hide']()['empty']();
        $('#g')['hide']()['empty']();
    }

    // do the move
    var move = function(x, y, shuffle_phase) {
        for(var i=0; i<size; i++) {
            turn(x, i);
            turn(i, y);
        }
        turn(x,y);
        if (is_win_position() && !shuffle_phase) {
            win();
        }
    }

    var generate = function() {
        // generate field
        for(var j=0, s=''; j<size; ++j) {
            field[j] = [];
            for(var i=0; i<size; ++i) {
                field[j][i] = true;
                s += '<b class="f" id="m' + i + '_' + j + '"></b>'
            }
        }

        // game field
        $('#mf')                        // hide on start
        ['html'](s)                     // draw
        ['css']({                       // set dimensions and position
            width: size * 96,
            height: size * 96
        });

        // shuffle field
        for (var i=0; i < shuffle; ++i) {
            move(rand(0, size), rand(0, size), true);
            if (is_win_position())
                i=0;
        };
    }

    // create html
    $('#mg')['html']('<p id="mt">$' + prize + '</p>'+
        '<p id="mr">' +
        "<br>Goal of this minigame is turn <br>all the pipes to its right position (+).<br>" +
        "Click to turn pipe. <br>" + 
        '<input type="number" id="minigamesize" min="2" max="10" value="4"><br>' +
        '<br><button id="ms">Start!</button>' +
        '</p>' + 
        '<p id="mf"/><button id="g">Give up!</button>');

    //generate();

    // start button runs the game
    //          $('#ms')['bind']('click.mg', function() {
    //          });

    // set onclick for 
    $('#mg')['bind']('click.mg', function(e) {
        var el = e.target;
        if (el.tagName == 'B') {
            move( el.id.replace(/^m(\d+)_\d+$/, '$1'), el.id.replace(/^m\d+_(\d+)$/, '$1'));
        } 
        switch(el.id) {
            case 'g':
                game.gold = 1;
                win();
                break;
            case 'ms': 
                document.addEventListener('keydown', handleKeys, false);
                selected = {x : 0, y : 0 };
                size = document.getElementById("minigamesize").value;
                game.gold = 1000*2**(2*size);
                $('#mt')['html']('$' + game.gold);
                generate();
                $('#mr')['hide']();
                $('#mf, #g')['show']();
                // start timer!
                $('#mg')['bind']('tick.mg', {
                    's': game,
                    'id': setInterval("$('#mg').trigger('tick.mg')", 1000)
                }, function(e) {
                    var s = e.data['s'];
                    if (s.gold > 100)
                        s.gold = floor(s.gold / 1.05);
                    else
                        s.gold -= rand(0, 1);
                    if (s.gold < 1)
                        s.gold = 1;

                    if (s.is_win) {
                        clearInterval(e.data['id']);
                        $('#mg')['unbind']('.mg');
                        $('#mt')['html']('$' + s.gold);
                    }
                    else {
                        $('#mt')['html']('$' + s.gold);
                    }
                }
                );
                $('#m' + selected.x + '_' + selected.y)['toggleClass']('s');
        }
    })['show']();
    $('#ms')['focus']();

}

