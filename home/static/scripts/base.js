var aadhar = "";
var candidate_details_json;
var parties_list_json;

// Modern toast alert message
function showAlert(inner_html, bg_color, color, animation=null){
    var pillHtml = '<div class="status" style="color: ' + (color || 'var(--indigo-700)') + '; background: ' + (bg_color || 'rgba(238, 242, 255, 0.95)') + ';">' + inner_html + '</div>';
    $('.status-box').html(pillHtml);
    $('.status').addClass('translateStatus');

    if(animation){
        $('.status').addClass(animation);
        setTimeout(function(){
            $('.status').removeClass(animation);
        }, 1000);
    }
}

// Show Loading
function show_loading(message = 'Please wait...') {
    $('.loading-message').html(message);
    $('.loading-div').css({'display': 'flex', 'opacity': '1'});
}

// Hide Loading
function hide_loading(){
    $('.main-content').hide();
    $('.loading-div').animate(
        {'opacity': '0'},
        {
            duration: 350,
            complete: function() {
                $('.loading-div').hide();
                $('.main-content').css('display', 'flex');
            }
        }
    );
}

// Hide Loading without reload
function hide_loading_without_reload(){
    $('.loading-div').animate(
        {'opacity': '0'},
        {
            duration: 300,
            complete: function() {
                $('.loading-div').hide();
            }
        }
    );
}

// Animation during showing drawer
function show_drawer() {
    $('.navigation').fadeIn(200);
    $('.navigation-drawer').removeClass('drawer-slide-to-left').addClass('drawer-slide-from-left').show();
}

// Animation during hiding drawer
function hide_drawer() {
    $('.navigation-drawer').removeClass('drawer-slide-from-left').addClass('drawer-slide-to-left');
    setTimeout(function(){
        $('.navigation-drawer').hide();
        $('.navigation').fadeOut(200);
    }, 250);
}

$(document).ready(function(){
    // -------------------- Navigation Drawer Handlers ----------------------
    $('.menu-btn, .header .logo').click(function(e){
        // Only open drawer if clicking menu-btn, or clicking logo while not on a standard link click
        if ($(this).hasClass('menu-btn')) {
            e.preventDefault();
            show_drawer();
        }
    });

    $('.menu-btn').click(function(e){
        e.preventDefault();
        show_drawer();
    });
    
    $('.navigation').click(function(event){
        if($(event.target).hasClass('navigation')){
            hide_drawer();
        }
    });
    
    $('.drawer-item-back, .drawer-close-btn').click(function(){
        hide_drawer();
    });
});
