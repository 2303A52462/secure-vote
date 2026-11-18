var selected = [];
var exp_len, all_check = false;

$(document).ready(function(){
    exp_len = $('.verify-button').find('input').length - 1;
    $('.verify-button').find('input').each(function(){
        $(this).prop('checked', false);
    });
});

function verifySelect(item) {
    if(item.checked) {
        if( $(item).parent().parent().parent().attr('id') ) {
            selected.push(parseInt($(item).parent().parent().parent().attr('id')));
            if(selected.length == exp_len) {
                $('.table-header').find('input').prop('checked', true);
            }
        }
        else {
            $('.verify-button').find('input').each(function(){
                $(this).prop('checked', true);

                if( $(this).parent().parent().parent().attr('id') ){
                    var index = selected.indexOf( parseInt($(this).parent().parent().parent().attr('id')) );
                    if(index==-1){
                        selected.push(parseInt($(this).parent().parent().parent().attr('id')));
                    }
                }
            });
        }
    }
    else {
        if( $(item).parent().parent().parent().attr('id') ){
            var index = selected.indexOf( parseInt($(item).parent().parent().parent().attr('id')) );
            if(index>-1) {
                selected.splice(index, 1);
            }
            $('.table-header').find('input').prop('checked', false);
        }
        else {
            $('.verify-button').find('input').each(function(){
                $(this).prop('checked', false);

                if( $(this).parent().parent().parent().attr('id') ){
                    var index = selected.indexOf( parseInt($(this).parent().parent().parent().attr('id')) );
                    if(index>-1){
                        selected.splice(index, 1);
                    }
                }
            });
        }
    }

    selected.sort(function(a, b){return a - b});
}

function verifyBlock(item) {
    if($(item).parent().parent().parent().attr('id')) {
        sendBlockVerifyRequest([$(item).parent().parent().parent().attr('id')]);
        $(item).parent().parent().html('<span style="font-size: 12px; color: var(--indigo-600); font-weight: 600;">Verifying...</span>');
    }
    else {
        sendBlockVerifyRequest(selected);
        for( var ele of selected ) {
            $('#'+ele).find('.verify-button').parent().html('<span style="font-size: 12px; color: var(--indigo-600); font-weight: 600;">Verifying...</span>');
        }
        if(selected.length == exp_len) {
            $('.table-header').find('.verify-button').parent().html('<span style="font-size: 11.5px; font-weight: 700;">Verifying...</span>');
            all_check = true;
        }
    }

    $('.verify-button').find('input').each(function(){
        $(this).prop('checked', false);
    });
    selected = [];
    exp_len = $('.verify-button').find('input').length - 1;
}

function sendBlockVerifyRequest(selected_blocks) {
    $.ajax({
        type:'GET',
        url: '/verify-block/',
        data: {'selected[]': selected_blocks},
        success: function(data){
            for( var d in data){
                if(data[d]){
                    var html = `
                        <div class="tampered-chain-cell-badge">
                            <span class="tampered-pill">⚠️ Tampered</span>
                            <a class="sync-now-link" onclick="synNow(`+d+`)">
                                🔄 Sync Now
                            </a>
                        </div>
                    `;
                    $('#'+d+' td:last-child').html(html);
                    $('#'+d).css({'background': '#fef2f2'});
                }
                else {
                    $('#'+d+' td:last-child').html('<span class="verified-chain-cell-badge">✓ Verified</span>');
                    $('#'+d).css({'background': '#f0fdf4'});
                }
                if(all_check) {
                    $('.table-header td:last-child').html('<span style="font-size: 11.5px; font-weight: 700; text-transform: uppercase;">Result</span>');
                }
            }
        }
    });
}

function synNow(blocks) {
    var id = blocks;
    $.ajax({
        type:'GET',
        url: '/sync-block/',
        data: {'block-id': id},
        success: function(data){
            if(data.success) {
                $('#'+id).css({'background': '#f0fdf4'});
                $('#'+id+' td:last-child').html('<span class="verified-chain-cell-badge">✓ Verified</span>');
            }
        }
    });
}
