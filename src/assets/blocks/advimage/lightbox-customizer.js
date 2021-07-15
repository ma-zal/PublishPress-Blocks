jQuery(document).ready(function ($) {
    document.addEventListener("DOMSubtreeModified", function(){
        try {
            $('.advgb-lightbox').colorbox({
                title: function () {
                    return $(this).find('.advgb-image-title').text();
                },
                maxWidth: '90%',
                maxHeight: '85%',
                fixed: true,
                className: 'advgb_lightbox',
                href: function () {
                    return $(this).data('image');
                }
            });
        } catch(e) {
            // console.error(e);
        }
    });
});
