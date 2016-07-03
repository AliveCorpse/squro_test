$(document).ready(function() {
    var current_node_id;

    $.getJSON('db.php?action=get_all', function(data) {
        $("div.tree").html(drawTree(data));

        $( "div.tree>ul" ).nestedSortable({
            rootID: 'tree',
            forcePlaceholderSize: true,
            listType: 'ul',
            handle: 'div',
            helper: 'clone',
            items: 'li',
            opacity: .6,
            placeholder: 'placeholder',
            tabSize: 25,
            tolerance: 'pointer',
            toleranceElement: '>div',
            isTree: true,
            expandOnHover: 100,
            startCollapsed: false,
            relocate: function(){
                var all_nodes = $(this).find("div.node");;
               
                for(var i = 0; i < all_nodes.length; i++){

                    var parent_id = (typeof( $(all_nodes[i]).closest('ul')
                                            .parent('li')
                                            .children('div')
                                            .children('input[type="hidden"]')).val() == "undefined")
                                    ? 0
                                    : $(all_nodes[i]).closest('ul')
                                            .parent('li')
                                            .children('div')
                                            .children('input[type="hidden"]').val();

                    var node_id = $(all_nodes[i]).children('input[type="hidden"]').val();
                    var node_name = $(all_nodes[i]).children('span.name').text();
                    
                    $.post('db.php?action=save', {
                            id: node_id,
                            parent_id: parent_id,
                            name: node_name
                        }, function(result){
                            
                        },
                        "json"
                    );
                }
            }
        });
    });

    $("div.tree").delegate(".disclose", "click", function(){
        $(this).closest('li').toggleClass('mjs-nestedSortable-collapsed').toggleClass('mjs-nestedSortable-expanded');
        $(this).toggleClass('ui-icon-plusthick').toggleClass('ui-icon-minusthick');
    });

    // Double click открывает узел для редактирования
    $("div.tree").delegate("div.node", "dblclick", function(event) {
        $(this).children('span.name').replaceWith('<input type="text" value="' + $(this).children('span.name').text() + '">');
        $(this).children('input').focus();
    });

    // Нажатие Enter или уход фокуса сохроняет измениеия в имени узла
    $("div.tree").on("keypress focusout", "input", function(event) {
        if (event.which == 13 || event.type == 'focusout') {
            if('' == $(this).val()){
                $(this).parent('div').parent('li').remove();
            }else{
                var node_id = $(this).prev('input[type="hidden"]').val();
                var parent_id = $(this)
                        .closest('ul')
                        .parent('li')
                        .children('div')
                        .children('input[type="hidden"]').val();

                var input_id = $(this).prev('input[type="hidden"]');       
                $(this).replaceWith('<span class="name">' + $(this).val() + '</span>');

                $.post('db.php?action=save', {
                        id: node_id,
                        parent_id: parent_id,
                        name: $(this).val()
                    }, function(result){
                        input_id.val(result);
                    },
                    "json"
                );
            }
        }
    });

    //Добавление корневого элемента
    $("form#rootnode").submit(function(event){
        event.preventDefault();
        
        var node_name = $(this).children('input').val();
        $(this).children('input').val('');
        var node_parent_id = 0;
        $("div.tree>ul").append('<li><span title="Click to show/hide children" class="disclose ui-icon ui-icon-minusthick"><span></span></span><div class="node"><input type="hidden" value=""><span class="name">'
                            + node_name
                            + '</span></div></li>');
        var input_id = $("div.tree>ul>li:last-child>div>input[type='hidden']");
        $.post('db.php?action=save', {
                parent_id: 0,
                name: node_name
            }, function(result){
                input_id.val(result);
                $(this).children('input').val('');
            },
            "json"
        );
    });

    //Выбор узла
    $("div.tree").delegate("div.node", "click", function(event) {

        $("div.tree span").css('background-color', 'white');
        $(this).children('span').css('background-color', 'green');
        current_node_id = $(this).children('input[type="hidden"]').val();
    });

    //Удаление узла по ID
    $("button.delete").click(function() {
        var conf = confirm('Вы уверены, что хотите удалить этот и все его дочерние узлы?');
        if(conf){
            $('input[value="' + current_node_id + '"]').parent('div').parent('li').remove();
            $.post('db.php?action=delete', {
                id: current_node_id
                },
                function(result){
                    console.log(result);
                    // alert('Было удалено ' + result + ' узел(ов)!');
                },
                "json"
            );
        }   
    });

    //Добавление дочернего узла
    $("button.create").click(function(){
        var parent_ul = $('input[value="' + current_node_id + '"]')
            .parent('div')
            .parent('li');
        
        parent_ul.append('<ul><li><span title="Click to show/hide children" class="disclose ui-icon ui-icon-minusthick"><span></span></span><div class="node"><input type="hidden" value=""><input type="text"></div></ul></li>');
        $("input[type='text']").focus();
    });

    // Отрисовка дерева
    function drawTree(items, parent_id = 0) {
        var result = '<ul class="sortable">';
        for (var element in items) {
            if (parent_id == items[element].parent_id) {
                result += '<li><span title="Click to show/hide children" class="disclose ui-icon ui-icon-minusthick"><span></span></span><div class="node"><input type="hidden" value="'
                            + items[element].id
                            + '"><span class="name">' 
                            + items[element].name
                            + '</span></div>';
                result += drawTree(items, items[element].id);
                result += '</li>';
            }
        }
        result += '</ul>';
        return result;
    }

/*
    $('#serialize').click(function(){
        serialized = $('ol.sortable').nestedSortable('serialize');
        $('#serializeOutput').text(serialized+'\n\n');
    })

    $('#toHierarchy').click(function(e){
        hiered = $('ol.sortable').nestedSortable('toHierarchy', {startDepthCount: 0});
        hiered = dump(hiered);
        (typeof($('#toHierarchyOutput')[0].textContent) != 'undefined') ?
        $('#toHierarchyOutput')[0].textContent = hiered : $('#toHierarchyOutput')[0].innerText = hiered;
    })

    $('#toArray').click(function(e){
        arraied = $('ol.sortable').nestedSortable('toArray', {startDepthCount: 0});
        arraied = dump(arraied);
        (typeof($('#toArrayOutput')[0].textContent) != 'undefined') ?
        $('#toArrayOutput')[0].textContent = arraied : $('#toArrayOutput')[0].innerText = arraied;
    });

    function dump(arr,level) {
        var dumped_text = "";
        if(!level) level = 0;

        //The padding given at the beginning of the line.
        var level_padding = "";
        for(var j=0;j<level+1;j++) level_padding += "    ";

        if(typeof(arr) == 'object') { //Array/Hashes/Objects
            for(var item in arr) {
                var value = arr[item];

                if(typeof(value) == 'object') { //If it is an array,
                    dumped_text += level_padding + "'" + item + "' ...\n";
                    dumped_text += dump(value,level+1);
                } else {
                    dumped_text += level_padding + "'" + item + "' => \"" + value + "\"\n";
                }
            }
        } else { //Strings/Chars/Numbers etc.
            dumped_text = "===>"+arr+"<===("+typeof(arr)+")";
        }
        return dumped_text;
    }*/

});