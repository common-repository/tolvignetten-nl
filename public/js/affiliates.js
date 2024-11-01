(function ($) {
    $(document).on('ready', function () {
        var primaryColorTxtStrPointer = (TolvignettenAffiliateConfig.primaryColorTextPointer || '').toString();
        var primaryColorBgStrPointer = (TolvignettenAffiliateConfig.primaryColorBgPointer || '').toString();
        var secondaryColorTxtStrPointer = (TolvignettenAffiliateConfig.secondaryColorTextPointer || '').toString();
        var secondaryColorBgStrPointer = (TolvignettenAffiliateConfig.secondaryColorBgPointer || '').toString();

        var $header = $('body header').first();
        if ($header.size() > 0) {
            if ( /^\./g.test(primaryColorBgStrPointer) ) {
                $header.addClass(
                    primaryColorBgStrPointer.substr(1)
                );
                $header.find('.top-inner').addClass(
                    primaryColorBgStrPointer.substr(1)
                );
                $header.find('.toggle-block').css('background', 'transparent');
            } else if (/^#/g.test(primaryColorBgStrPointer)) {
                if (!$header.is(primaryColorBgStrPointer)) {
                    $header.prop(
                        'id',
                        primaryColorBgStrPointer.substr(1)
                    );
                }
            }

            if (/^\./g.test(secondaryColorTxtStrPointer)) {
                $header.addClass(
                    secondaryColorTxtStrPointer.substr(1)
                );

                $header.find('.top-inner').addClass(
                    secondaryColorTxtStrPointer.substr(1)
                );

                $header.find('.toggle-block').css('background', 'transparent');
            } else if (/^#/g.test(secondaryColorTxtStrPointer)) {
                if (!$header.is(secondaryColorTxtStrPointer)) {
                    $header.prop(
                        'id',
                        secondaryColorTxtStrPointer.substr(1)
                    );
                }
            }
        }
    });
})(jQuery);
