(function ($) {
    $(document).on('ready', function () {

        var TOLVIGNETTEN_PLUGIN_VERSION = TolvignettenStoreShortcode.pluginVersion || '1.0.0';

        var parseQueryString = function (queryString) {
            var params = {}, queries, temp, i, l;
            queries = queryString.split("&");
            for (i = 0, l = queries.length; i < l; i++) {
                temp = queries[i].split('=');
                if (/\[(.+)?\]/gi.test(temp[0])) {
                    var key = temp[0].replace('[]', '');
                    if (undefined === params[key]) {
                        params[key] = [];
                    }
                    params[key].push(
                        temp[1]
                    );
                } else {
                    params[temp[0]] = temp[1];
                }
            }

            return params;
        };

        function getProdIframeLocCookieName() {
            return 'prod_iframe_loc-'
                + window.location.toString()
                .replace(/(https?:\/\/)/g, '')
                .replace(/([^a-zA-z0-9-])/g, '-')
                .replace(/\[/g, '-')
                .replace(/\]/g, '-')
                .replace(/(-+)/g, '-')
                .replace(/(^-+|-+$)/g, '');
        }

        function adjustHeight(h) {
            $('#product_frame').prop(
                'height',
                75 + parseInt(h)
            );
        }

        function locationChanged(loc) {
            $.cookie(
                getProdIframeLocCookieName(),
                loc,
                {
                    path: '/'
                }
            );
        }

        function updatePluginVersion() {
            var storedVersion = $.cookie(
                TolvignettenStoreShortcode.pluginVersionCookieName
            );

            var update = (storedVersion !== TOLVIGNETTEN_PLUGIN_VERSION);
            if( update ){
                $.cookie(
                    TolvignettenStoreShortcode.pluginVersionCookieName,
                    TOLVIGNETTEN_PLUGIN_VERSION,
                    {
                        path: '/'
                    }
                );
            }

            return update;
        }

        function storePartnerData(data) {
            var pd = {};
            try {
                pd = JSON.parse(
                    window.localStorage.getItem(
                        'pd'
                    )
                ) || {};
            } catch (e) {
            }

            var partnerCookie = {};
            try {
                partnerCookie = JSON.parse(
                    $.cookie(
                        TolvignettenStoreShortcode.affiliateCookieName
                    )
                );
            } catch (e) {

            }

            var changeIdFromCookie = undefined !== partnerCookie['id'] && parseInt(partnerCookie['id']) !== parseInt(pd['partner_id']);
            if (changeIdFromCookie) {
                data['partner_id'] = partnerCookie['id'].toString();
            }

            var store = false;
            for (var i in data) {
                if (!data.hasOwnProperty(i) || !/^(partner_)/g.test(i)) {
                    continue;
                }

                if (undefined !== pd[i] && undefined !== data[i] && data[i].toString() !== pd[i].toString()) {
                    pd[i] = data[i];
                    store = true;
                }
            }

            if (store) {
                window.localStorage.setItem(
                    'pd',
                    JSON.stringify(
                        pd
                    )
                );
            }

            return store;
        }

        function buildLoc() {
            var loc = TolvignettenStoreShortcode.storeUrl;
            var params = {};
            if (window.location.search.length > 0) {
                params = parseQueryString(
                    window.location.search.substr(
                        1
                    )
                );
            }

            var queryLoc = undefined !== params['loc'] ? params['loc'] : null;

            if (undefined !== params['anvr']) {
                delete params['anvr'];
            }

            if (undefined !== params['bdr']) {
                delete params['bdr'];
            }

            var $iframe = $('iframe#product_frame');
            var iframeLocale = $iframe.data('locale');
            var iframePartnerId = $iframe.data('partner-id');
            var iframePartnerInfo = $iframe.data('partner-info');
            var iframePartnerAnvr = $iframe.data('partner-anvr');
            var iframePartnerBdr = $iframe.data('partner-bdr');
            var iframeVehicle = $iframe.data('vehicle');
            var iframeStartDate = $iframe.data('start-date');
            var iframeEndDate = $iframe.data('end-date');
            var iframeCurrency = $iframe.data('currency');

            params.partner_id = iframePartnerId ? iframePartnerId.toString().trim() : (TolvignettenStoreShortcode.partnerId || '');
            params.partner_info = iframePartnerInfo ? iframePartnerInfo.toString().trim() : (TolvignettenStoreShortcode.partnerInfo || '');
            params.partner_extra = {};

            if( undefined !== iframeCurrency && '' !== iframeCurrency.toString().trim() ){
                params.currency = iframeCurrency;
            }

            if (undefined !== iframePartnerAnvr && '' !== iframePartnerAnvr.toString().trim()) {
                params.partner_extra['anvr'] = iframePartnerAnvr;
            }
            else if(undefined !== TolvignettenStoreShortcode.partnerAnvr && null !== TolvignettenStoreShortcode.partnerAnvr && '' !== TolvignettenStoreShortcode.partnerAnvr.toString().trim()){
                params.partner_extra['anvr'] = TolvignettenStoreShortcode.partnerAnvr;
            }

            if (undefined !== iframePartnerBdr && '' !== iframePartnerBdr.toString().trim()) {
                params.partner_extra['bdr'] = iframePartnerBdr;
            }
            else if(undefined !== TolvignettenStoreShortcode.partnerBdr && null !== TolvignettenStoreShortcode.partnerBdr && '' !== TolvignettenStoreShortcode.partnerBdr.toString().trim()){
                params.partner_extra['bdr'] = TolvignettenStoreShortcode.partnerBdr;
            }

            var vehicle = iframeVehicle ? iframeVehicle.toString().trim() : false;
            if (false !== vehicle) {
                params.vehicle = vehicle;
            }

            var startDate = iframeStartDate ? iframeStartDate.toString().trim() : false;
            if (false !== startDate) {
                params.startDate = startDate;
            }

            var endDate = iframeEndDate ? iframeEndDate.toString().trim() : false;
            if (false !== startDate) {
                params.endDate = endDate;
            }

            if (undefined === params['locale'] && undefined !== iframeLocale && '' !== iframeLocale) {
                params.locale = iframeLocale;
            }

            if (undefined === params['allowDeleteMainItems']) {
                params.allowDeleteMainItems = ('true' === TolvignettenStoreShortcode.allowDeleteMainItems.toString().toLowerCase());
            }

            if (undefined === params['showConfigurationSummary']) {
                params.showConfigurationSummary = ('true' === TolvignettenStoreShortcode.showConfigurationSummary.toString().toLowerCase());
            }

            if (undefined === params['showTrailerOption']) {
                params.showTrailerOption = ('true' === TolvignettenStoreShortcode.showTrailerOption.toString().toLowerCase());
            }

            if (undefined === params['showInfo']) {
                params.showInfo = ('true' === TolvignettenStoreShortcode.showInfo.toString().toLowerCase());
            }

            if (undefined === params['itemsType']) {
                params.itemsType = TolvignettenStoreShortcode.itemsType.toString().toLowerCase();
            }

            if (undefined === params['allowUnselectOptionalItems']) {
                params.allowUnselectOptionalItems = ('true' === TolvignettenStoreShortcode.allowUnselectOptionalItems.toString().toLowerCase());
            }

            if (undefined === params['defaultOptionalItemsStatus']) {
                params.defaultOptionalItemsStatus = TolvignettenStoreShortcode.defaultOptionalItemsStatus.toString().toLowerCase();
            }

            if (undefined !== params['your-name'] && '' !== params['your-name'].toString().trim()) {
                params.userName = decodeURIComponent(params['your-name']);
                delete params['your-name'];
            }

            if (undefined !== params['your-email'] && '' !== params['your-email'].toString().trim()) {
                params.userEmail = decodeURIComponent(params['your-email']);
                delete params['your-email'];
            }

            var defaultCountries = TolvignettenStoreShortcode.countries || [];
            params.country = params.country || defaultCountries;
            params.loc = window.top.location.href.replace(window.top.location.search, '');
            loc += '?' + decodeURIComponent($.param(params));

            return {
                queryLoc: queryLoc,
                loc: loc,
                params: params
            };
        }

        function getIframeHashParams() {
            var $iframe = $('iframe#product_frame');
            var varNames = [
                'license-plate-number'
            ];

            var hashData = {};
            for(var i in varNames){
                var varName = varNames[i];
                if(undefined !== $iframe.data(varName)){
                    hashData[varName] = $iframe.data(varName).toString().trim();
                }
            }

            return hashData;
        }

        function addIframeHashParams(loc)
        {
            var locHashParams = getIframeHashParams();
            var hashPosition = loc.indexOf('#');
            if( -1 !== hashPosition ){
                loc = loc.substring(
                    0,
                    hashPosition
                );
            }

            if( Object.keys(locHashParams).length > 0 ){
                loc += '#' + JSON.stringify(
                    locHashParams
                );
            }

            return loc;
        }

        var locObject = buildLoc();
        var loc = locObject.loc;
        var params = locObject.params;
        var wasStored = storePartnerData(params);
        var updatedPluginVersion = updatePluginVersion();

        if (null !== locObject['queryLoc']) {
            loc = decodeURIComponent(locObject.queryLoc);
        } else if (
            false === updatedPluginVersion
            && !wasStored
            && undefined !== $.cookie(getProdIframeLocCookieName())
            && (undefined === params['reset'] || 'false' === params['reset'])
        ) {
            loc = $.cookie(getProdIframeLocCookieName());
        } else if (undefined !== params.reset) {
            var pageQueries = parseQueryString(window.location.search.substr(1));
            delete pageQueries.reset;
            History.replaceState(
                {},
                '',
                ('/' + window.location.pathname + '?' + decodeURIComponent($.param(pageQueries)))
            );
        }

        loc = addIframeHashParams(loc);
        $('#product_frame').prop('src', loc);

        $(window).on("message", function (e) {
            var data = e.originalEvent.data;
            var data = parseQueryString(data);
            if( undefined === data.action ){
                data.action = '';
            }
            data.action = data.action.toString();

            var currentIframeQueryParams = decodeURIComponent(data.location).split('?');
            if (undefined !== currentIframeQueryParams[1]) {
                var currentIframeParams = parseQueryString(currentIframeQueryParams[1]);
                if (undefined !== currentIframeParams['SID']) {
                    $.cookie(
                        'prod_ui_sid',
                        currentIframeParams['SID'],
                        {
                            path: '/'
                        }
                    );

                    $.cookie(
                        'prod_ui_query',
                        window.location.search.substr(1),
                        {
                            path: '/'
                        }
                    );

                    $.ajax({
                        url: TolvignettenStoreShortcode.ajaxUrl,
                        method: 'GET',
                        dataType: 'json',
                        data: {
                            action: 'get_cart_items',
                            SID: currentIframeParams['SID']
                        }
                    }).done(function (response) {
                        if (undefined !== response['itemsNumber']) {
                            var itemsNumber = parseInt(response.itemsNumber);

                            if (isNaN(itemsNumber) || 0 === itemsNumber) {
                                $(".tolvignetten-cart-button").addClass('empty');
                                $(".tolvignetten-cart-button .badge").addClass('hide');
                            } else {

                                $(".tolvignetten-cart-button").removeClass('empty');
                                $(".tolvignetten-cart-button .badge").removeClass('hide');
                            }

                            $(".tolvignetten-cart-button .badge").text(
                                !isNaN(itemsNumber) ? itemsNumber : 0
                            );
                        }
                    });
                }
            }

            // height
            if (data.action === 'update') {
                adjustHeight(data.height);
                locationChanged(decodeURIComponent(data.location));
                $('#spinner').hide();
            } else if (data.action === 'load') {
                $('#spinner').show();
            } else if (data.action === 'finished_load') {
                $('#spinner').hide();
            } else if (data.action === 'scroll') {
                var targetOffsetTop = parseFloat(data.offsetTop);
                if( isNaN(targetOffsetTop) ){
                    targetOffsetTop = 0;
                }

                // targetOffsetTop -= 70;

                var iframeOffsetTop = parseInt($('iframe[name="tolvignetten_store_iframe"]').offset().top);
                if( !isNaN(iframeOffsetTop) && 0 < iframeOffsetTop ){
                    targetOffsetTop += iframeOffsetTop;
                }

                var targetHeight= parseFloat(data.targetHeight);
                if( isNaN(targetHeight) ){
                    targetHeight = 0;
                }

                var currentScrollTop = parseFloat($('html,body').scrollTop());
                if( isNaN(currentScrollTop) ){
                    currentScrollTop = 0;
                }

                var wHeight = $(window).height() - currentScrollTop;
                var move = wHeight < targetHeight;

                if( true === move ){
                    var _header = $('.tt-header .top-inner').get(0);
                    if( _header ){
                        var headerHeight = parseInt(_header.offsetHeight);
                        if( !isNaN(headerHeight) ){
                            targetOffsetTop -= headerHeight;
                        }
                    }

                    $('html,body').animate(
                        {
                            scrollTop: targetOffsetTop
                        },
                        'slow'
                    );
                }
            }
            else{
                $('#spinner').hide();
            }
        });

        $('#product_frame').on('load', function () {
            $('#spinner').hide();
            var topInnerHeight = $('.tt-header .top-inner').first().outerHeight() + 10;
            $('html,body').animate({
                scrollTop: ($('#product_frame').offset().top - topInnerHeight)
            }, 'fast');
        });
    });
})(jQuery);
