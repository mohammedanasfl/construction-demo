(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        var seen = false;
        try { seen = sessionStorage.getItem('constra-intro'); sessionStorage.setItem('constra-intro', '1'); } catch (e) {}
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, seen ? 350 : 1400);
    };
    spinner(0);
    
    
    // Initiate the wowjs
    new WOW().init();


    // Sticky Navbar: always pinned to the top, gains a shadow once scrolled
    $(window).scroll(function () {
        $('.sticky-top').toggleClass('shadow-sm', $(this).scrollTop() > 20);
    });


   // Back to top button
   $(window).scroll(function () {
    if ($(this).scrollTop() > 300) {
        $('.back-to-top').fadeIn('slow');
    } else {
        $('.back-to-top').fadeOut('slow');
    }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });

})(jQuery);

