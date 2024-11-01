(function ($) {
    function getCookie(name) {
        var value = "; " + document.cookie;
        var parts = value.split("; " + name + "=");
        if (parts.length === 2) return parts.pop().split(";").shift();
    }

    $(document).on('ready', function () {
        var affiliateInfo = getCookie('tolvignetten_affiliate_storage');
        if (affiliateInfo) {
            affiliateInfo = JSON.parse(
                decodeURIComponent(affiliateInfo)
            );

            if( !affiliateInfo ){
                return;
            }

            if (affiliateInfo['logo_url']) {
                var $logoLink = $('a.ta-affiliate-logo');
                if ($logoLink.length > 0) {
                    var $logoImg = $logoLink.find('img');
                    if ($logoImg.length > 0) {
                        var currentLogoUrl = $logoImg.attr('src');
                        if (currentLogoUrl !== affiliateInfo['logo_url']) {
                            $logoImg.attr('src', affiliateInfo['logo_url']);
                        }
                    }
                }
            }
        }
    });
})(jQuery);
