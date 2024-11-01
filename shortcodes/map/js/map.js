(function ($) {
    function getQueryVariable(variable)
    {
        var query = decodeURIComponent(window.location.search.substring(1));
        var vars = query.split("&");
        for (var i=0;i<vars.length;i++) {
            var pair = vars[i].split("=");
            if(pair[0] === variable){return pair[1];}
        }
        return false;
    }

    var _locale = 'nl_NL';
    $(document).on('ready', function () {
        if (undefined === _TOLVIGNETTEN_COUNTRIES_) {
            _TOLVIGNETTEN_COUNTRIES_ = {};
        }

        var _TOLVIGNETTEN_COUNTRIES_BY_ISO_CODE_ = {};
        for (var i in _TOLVIGNETTEN_COUNTRIES_) {
            if (!_TOLVIGNETTEN_COUNTRIES_.hasOwnProperty(i)) {
                continue;
            }
            _TOLVIGNETTEN_COUNTRIES_BY_ISO_CODE_[_TOLVIGNETTEN_COUNTRIES_[i]] = i;
        }

        var map;
        var mapPolygonsByCountryIsoCode = {};
        var mapMarkers = {};
        var mapMarkersInfoWindow = {};
        var directionsService;
        var directionsDisplay;
        var $mapWidget = $('.ta-map-widget');
        var $mapSimulatedSpacing = $('.ta-map-simulated-spacing', $mapWidget);
        var $mapWrapper = $('.ta-map-wrapper', $mapWidget);
        var countriesLatLng = TolvignettenMapShortcode['countriesLatLng'] || {};
        _locale = TolvignettenMapShortcode['locale'];

        if (
            undefined !== TolvignettenMapShortcode['fixFullWidth']
            && 'true' === TolvignettenMapShortcode['fixFullWidth']
        ) {
            $mapWrapper
                .wrap('<div class="' + $mapWidget.attr('class') + '"/>')
                .parent()
                .prependTo('body')
                .addClass('ta-map-external-wrapper');

            $mapWrapper = $('.ta-map-wrapper', 'body');
            $mapWrapper.parent().css({top: $mapSimulatedSpacing.offset().top});
        }

        var $form = $('form[name="map_form"]', $mapWrapper);
        var $startInput = $('#start', $form);
        var $endInput = $('#end', $form);
        var $message = $('.ta-map-details-column-wrapper .message');
        var $productsButtons = $('.ta-map-details-column-wrapper .buttons');
        var $productsPreloader = $('.ta-map-details-column-wrapper .h-preloader');
        var $hddnCountries = $('input[name="countries"][type="hidden"]', $form);
        var $hddnTolls = $('input[name="tolls"][type="hidden"]', $form);
        var $mapProductsList = $('.ta-map-details-column-wrapper > ul');

        $form.on('submit', function (e) {
            e.preventDefault();
            calcRoute();
        });

        $startInput.on('change', function (e) {
            $(this).data('lastValue', $(this).val());
        });

        $endInput.on('change', function (e) {
            $(this).data('lastValue', $(this).val());
        });

        // -------
        var $initText = $('.ta-map-details-column-wrapper .init-text');
        var $routeText = $('.ta-map-details-column-wrapper .route-text');
        var defaultOrigin = window.localStorage.getItem('map_origin');
        var defaultDestination = window.localStorage.getItem('map_destination');

        var uriMapOrigin = getQueryVariable('origin');
        if(uriMapOrigin){
            defaultOrigin = uriMapOrigin;
        }

        var uriMapDestination = getQueryVariable('destination');
        if(uriMapDestination){
            defaultDestination = uriMapDestination;
        }

        if (undefined !== defaultOrigin && defaultOrigin) {
            $startInput.val(defaultOrigin);
        }

        if (undefined !== defaultDestination && defaultDestination) {
            $endInput.val(defaultDestination);
        }

        $routeText.addClass('hide');
        if (defaultOrigin && defaultDestination) {
            $('form[name="map_form"]').submit();
        } else {
            $initText.removeClass('hide');
        }
        // ---------

        $('button.continue-btn', 'form[name="map_form"]').on('click', function (e) {
            e.preventDefault();
            var $btn = $(this);
            if( $btn.is('.disabled') || $btn.is('[disabled]') ){
                return;
            }

            if (
                $startInput.val().toString().toLowerCase() !== $startInput.data('lastValue').toString().toLowerCase()
                || $endInput.val().toString().toLowerCase() !== $endInput.data('lastValue').toString().toLowerCase()
            ) {
                calcRoute();
                return;
            }

            var countries = $hddnCountries.val().split(',').filter(function (el) {
                return ('' !== el.trim());
            });

            var hasOrigin = ('' !== $startInput.val().toString().trim());
            var hasDestination = ('' !== $endInput.val().toString().trim());
            if (countries.length > 0 && hasOrigin && hasDestination) {
                $startInput.css({border: 'none'});
                $endInput.css({border: 'none'});

                var tolls = {};
                try {
                    tolls = JSON.parse($hddnTolls.val());
                } catch (e) {
                }

                window.location = TolvignettenMapShortcode.targetUrl + '?' + decodeURIComponent(
                    $.param(
                        {
                            locale: _locale,
                            country: countries,
                            tolls: tolls || [],
                            reset: (true === TolvignettenMapShortcode['reset'])
                        }
                    )
                );
            } else {
                scanErrors();
            }
        });

        function showMapPreload() {
            hideMapPreload();
            $('button.continue-btn', 'form[name="map_form"]').addClass('disabled').prop('disabled', true);
            $('.map-form-container .ta-map-preload').removeClass('hide');
        }

        function hideMapPreload() {
            $('button.continue-btn', 'form[name="map_form"]').removeClass('disabled').prop('disabled', false);
            $('.map-form-container .ta-map-preload').addClass('hide');
        }

        var __calcRouteTimeout = null;
        function calcRoute(provideRouteAlternatives) {
            if( null !== __calcRouteTimeout ){
                clearTimeout(__calcRouteTimeout);
            }

            showMapPreload();

            __calcRouteTimeout = setTimeout(function () {
                if (undefined === provideRouteAlternatives) {
                    provideRouteAlternatives = false;
                }

                scanErrors();
                resetMapMarkers();

                directionsService = new google.maps.DirectionsService();
                var start = document.getElementById("start").value;
                var end = document.getElementById("end").value;

                if (start.length > 0 && end.length > 0) {
                    $startInput.data('lastValue', start);
                    $endInput.data('lastValue', end);

                    window.localStorage.setItem('map_origin', start);
                    window.localStorage.setItem('map_destination', end);

                    var request = {
                        origin: start,
                        destination: end,
                        travelMode: google.maps.TravelMode.DRIVING,
                        provideRouteAlternatives: provideRouteAlternatives
                    };

                    directionsService.route(request, function (result, status) {
                        if (status === google.maps.DirectionsStatus.OK) {
                            for (var i = 0, len = result.routes.length; i < len; i++) {
                                var routeInfo = getRouteInfo(result, i);
                                if (routeInfo[0].length > 1) {
                                    directionsDisplay.setDirections(result);
                                    directionsDisplay.setRouteIndex(i);
                                    return;
                                }

                            }
                            directionsDisplay.setDirections(result);
                        }
                    });
                } else {
                    scanErrors();
                }

                __calcRouteTimeout = null;
                hideMapPreload();
            }, 500);
        }

        function setCountryNameFromLastStep(step, $targetElement) {
            if (undefined === step['end_point']) {
                return;
            }

            $.ajax({
                method: 'GET',
                dataType: 'json',
                url: 'https://maps.googleapis.com/maps/api/geocode/json',
                data: {
                    key: (TolvignettenMapShortcode['gPublicApiKey'] || ''),
                    latlng: [
                        step['end_point'].lat(),
                        step['end_point'].lng()
                    ].join(','),
                    locale: _locale
                }
            }).done(function (response) {
                gMapsGeocodeResponseHandler(
                    response,
                    $targetElement
                );
            });
        }

        function gMapsGeocodeResponseHandler(response, $targetElement) {
            if (undefined === response.results) {
                return;
            }

            for (var i in response.results) {
                if (
                    !response.results.hasOwnProperty(i)
                    || undefined === response.results[i]['address_components']
                ) {
                    continue;
                }

                var addressComponents = response.results[i]['address_components'];
                for (var i2 in addressComponents) {
                    if (
                        !addressComponents.hasOwnProperty(i2)
                        || undefined === addressComponents[i2]['types']
                        || -1 === addressComponents[i2]['types'].indexOf('country')
                        || undefined === addressComponents[i2]['short_name']
                    ) {
                        continue;
                    }

                    if (undefined !== addressComponents[i2]['short_name']) {
                        var countryIsoCode = addressComponents[i2]['short_name'].toString().toUpperCase().trim();
                        if (undefined !== _TOLVIGNETTEN_COUNTRIES_BY_ISO_CODE_[countryIsoCode]) {
                            var oldValue = $targetElement.val();
                            if ($targetElement === $startInput && oldValue.toString() !== $startInput.val().toString()) {
                                window.localStorage.setItem('map_origin', $startInput.val());
                            } else if ($targetElement === $endInput && oldValue.toString() !== $endInput.val().toString()) {
                                window.localStorage.setItem('map_destination', $endInput.val());
                            }
                        }
                    }
                }
            }

            scanErrors();
        }

        function resetMapMarkers() {
            if (0 === Object.keys(mapMarkers).length) {
                return;
            }

            for (var i in mapMarkers) {
                if (false === mapMarkers.hasOwnProperty(i)) {
                    continue;
                }

                if (undefined !== mapMarkers[i].setMap) {
                    mapMarkers[i].setMap(null);
                }
            }

            mapMarkers = {};
        }

        function getRouteInfo(directions, routeIndex) {
            var countriesIsoCodes = [];
            var initialCountryName = directions.routes[routeIndex].legs[0].start_address.split(',').pop().trim();
            var initialCountryIsoCode = _TOLVIGNETTEN_COUNTRIES_[initialCountryName.trim()] || undefined;
            if (undefined !== initialCountryIsoCode && -1 === countriesIsoCodes.indexOf(initialCountryIsoCode)) {
                countriesIsoCodes.push(
                    initialCountryIsoCode
                );
            }

            var tolls = {};
            var duration = directions.routes[routeIndex].legs[0].duration.text;
            var distance = directions.routes[routeIndex].legs[0].distance.text;
            var firstStep = undefined;
            var lastStep = undefined;
            var tollsInformation = TolvignettenMapShortcode.tollsInformation || {};

            function appendTollsInformation(
                stepData
            ) {
                for (var dataIsoCode in tollsInformation) {
                    if (false === tollsInformation.hasOwnProperty(dataIsoCode)) {
                        continue;
                    }

                    var roads = tollsInformation[dataIsoCode] || [];
                    for (var roadKey in roads) {
                        if (
                            false === roads.hasOwnProperty(roadKey)
                            || undefined === roads[roadKey]['lat_lngs']
                        ) {
                            continue;
                        }

                        var roadCode = roads[roadKey]['code'];
                        var roadRef = roads[roadKey]['reference'];
                        if (undefined === roadCode || undefined === roadRef) {
                            continue;
                        }

                        var roadLatLngs = roads[roadKey]['lat_lngs'] || [];
                        var found = false;
                        for (var roadLatLngsKey in roadLatLngs) {
                            if (false === roadLatLngs.hasOwnProperty(roadLatLngsKey)) {
                                continue;
                            }

                            var roadLat = roadLatLngs[roadLatLngsKey]['lat'];
                            var roadLng = roadLatLngs[roadLatLngsKey]['lng'];
                            var inLatLngInZone = isLatLngInZone(
                                stepData['path'] || [],
                                roadLat,
                                roadLng,
                                roadLatLngs[roadLatLngsKey]['radius_km'],
                                roadRef
                            );

                            if (true === inLatLngInZone && false === found) {
                                found = true;

                                if (undefined !== roads[roadKey]['marker'] && undefined === mapMarkers['toll_' + roadRef]) {
                                    var productMarker = roads[roadKey]['marker'] || {};
                                    mapMarkers['toll_' + roadRef] = new google.maps.Marker({
                                        position: {
                                            lat: productMarker['lat_lng']['lat'],
                                            lng: productMarker['lat_lng']['lng']
                                        },
                                        map: map,
                                        title: productMarker['title'],
                                        animation: google.maps.Animation.DROP,
                                        icon: {
                                            url: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjEwMjRweCIgaGVpZ2h0PSIxMDI0cHgiIHZpZXdCb3g9IjAgMCAxMDI0IDEwMjQiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDEwMjQgMTAyNCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PGc+PGRlZnM+PHJlY3QgaWQ9IlNWR0lEXzFfIiB3aWR0aD0iMTAyNCIgaGVpZ2h0PSIxMDI0Ii8+PC9kZWZzPjxjbGlwUGF0aCBpZD0iU1ZHSURfMl8iPjx1c2UgeGxpbms6aHJlZj0iI1NWR0lEXzFfIiAgb3ZlcmZsb3c9InZpc2libGUiLz48L2NsaXBQYXRoPjxwYXRoIGNsaXAtcGF0aD0idXJsKCNTVkdJRF8yXykiIGZpbGw9IiM2RkFGQ0QiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIyMCIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBkPSJNOTEyLjUyNSw0MDAuNTI1QzkxMi41MjUsNjIxLjcyOSw1MTIsMTAyNCw1MTIsMTAyNFMxMTEuNDc1LDYyMS43MjksMTExLjQ3NSw0MDAuNTI1UzI5MC43OTYsMCw1MTIsMEM3MzMuMjA0LDAsOTEyLjUyNSwxNzkuMzIxLDkxMi41MjUsNDAwLjUyNSIvPjxwYXRoIGNsaXAtcGF0aD0idXJsKCNTVkdJRF8yXykiIGZpbGw9IiNFOEU4RTYiIGQ9Ik0yNzEuODE0LDU3My4yNjNoMTEwLjk1MVYxOTJIMjcxLjgxNFY1NzMuMjYzeiBNMjk1LjY3NCw0NDQuNzg1di04NC4yNjFsNjMuOTEsNDMuNTI5TDI5NS42NzQsNDQ0Ljc4NXogTTI5NS42NzQsMzA5LjI1N3YtODQuMjYxbDYzLjkxLDQzLjUyOUwyOTUuNjc0LDMwOS4yNTd6Ii8+PHBvbHlnb24gY2xpcC1wYXRoPSJ1cmwoI1NWR0lEXzJfKSIgZmlsbD0iI0U4RThFNiIgcG9pbnRzPSI0MzYuODI4LDQxMS4wNzMgMzk0LjY5Nyw0MTEuMDczIDM5NC42OTcsMzk3Ljc0MyA0MzYuODI4LDM5Ny43MTUgIi8+PHBhdGggY2xpcC1wYXRoPSJ1cmwoI1NWR0lEXzJfKSIgZmlsbD0iI0U4RThFNiIgZD0iTTc4MC4xNTgsNDM5LjIxNmMwLTEyLjY0NS04LjQyMS0yMy4xNzgtMjAuMzUyLTI1Ljk3NWwtMTYuMTU2LTY4LjgyYy0yLjgyNS0xMS45MzEtMTQuNzU3LTIxLjA2NS0yNi42ODgtMjEuMDY1SDU0OS44MzZjLTExLjI0NiwwLTIzLjg5MSw5LjgxOS0yNi42ODgsMjEuMDY1bC0xMS45MzEsNDkuMTUzaC01MS45NWMtNS42MjMsMC0xMC41MzMsNC4xOTYtMTAuNTMzLDkuODE5YzAsNS41OTUsNC45MSw5LjgxOSwxMC41MzMsOS44MTloNDcuMDRjLTExLjkzMSwzLjUxMS0yMC4zNTIsMTMuMzMtMjAuMzUyLDI1Ljk3NXY0My41M2MwLDExLjI0Niw3LjAyMiwyMS4wNjYsMTYuODQyLDI0LjU3NnY1MS45NWMwLDcuNzM1LDYuMzM2LDE0Ljc1NywxNC43NTYsMTQuNzU3aDE0Ljc1N2M3LjczNSwwLDE0Ljc1Ny02LjMzNywxNC43NTctMTQuNzU3di00OS44NjZsMTY5LjkyMS0wLjAyN3Y0OS44NjZjMCw3LjczNiw2LjMzNywxNC43NTcsMTQuNzU3LDE0Ljc1N0w3NDYuNDc0LDU3NGM4LjQ0OCwwLDE0Ljc1OC02LjMzNywxNC43NTgtMTQuNzU3di01MS4yNjZjMTAuNTMyLTMuNTEsMTguMjY4LTEzLjM1OCwxOC4yNjgtMjUuMjg5bDAuNjg3LDAuMDAxTDc4MC4xNTgsNDM5LjIxNnogTTYxNi41NjcsNDEzLjE4MWMtMC43MTMtMy41MTEtMi4xMTItNy4wMjItMy41MTEtMTAuNTMzYy0zLjUxMS03LjAyMi04LjQyMS0xMC41MzItMTYuMTU1LTEwLjUzMmgtMTUuNDQydi01LjYyM2M2LjMzNi0yLjc5OCwxMS4yNDYtOS44MiwxMS4yNDYtMTcuNTU1YzAtMTEuMjQ2LTkuMTM1LTE5LjY2Ny0xOS42NjctMTkuNjY3Yy0xMS4yNDYsMC0xOS42NjcsOS4xMzUtMTkuNjY3LDE5LjY2N2MwLDcuNzM1LDQuOTM4LDE0Ljc1NywxMS4yNDYsMTcuNTU1djUuNjIzaC0xNi44NDFjLTQuMTk2LDAtMTAuNTMyLDEuMzk4LTE1LjQ0MiwyLjc5N2wxMC41MzMtNDQuMjQzYzAuNjg2LTMuNTEsMy41MTEtNS42MjIsNi4zMDktNS42MjJoMTY1LjcyOWgtMC4wMDNjMi43OTgsMCw1LjU5NiwyLjgyNSw3LjcwOCw1LjY1bDE1LjQ0Miw2Mi40ODNINjE2LjU2N3oiLz48L2c+PC9zdmc+',
                                            scaledSize: new google.maps.Size(50, 60)
                                        }
                                    });

                                    (function (roadRef) {
                                        mapMarkersInfoWindow['toll_' + roadRef] = new google.maps.InfoWindow({
                                            content: '<strong>{type}</strong><br/>{title}'.replace(
                                                '{type}',
                                                'Tol'
                                            ).replace(
                                                '{title}',
                                                productMarker['title']
                                            )
                                        });

                                        mapMarkers['toll_' + roadRef].addListener('click', function () {
                                            for (var i in mapMarkersInfoWindow) {
                                                if (false === mapMarkersInfoWindow.hasOwnProperty(i)) {
                                                    continue;
                                                }

                                                if (undefined !== mapMarkersInfoWindow[i].close) {
                                                    mapMarkersInfoWindow[i].close();
                                                }
                                            }

                                            mapMarkersInfoWindow['toll_' + roadRef].open(
                                                map,
                                                mapMarkers['toll_' + roadRef]
                                            );
                                        });
                                    })(roadRef);
                                }
                            }
                        }

                        if (false === found) {
                            continue;
                        }

                        if (undefined === tolls[dataIsoCode]) {
                            tolls[dataIsoCode] = [];
                        }

                        if (-1 === tolls[dataIsoCode].indexOf(roadRef)) {
                            tolls[dataIsoCode].push(
                                roadRef
                            );
                        }
                    }
                }
            }

            function calcKmBetweenCoords(coords1, coords2) {
                var R = 6371;
                var dLat = (coords2.lat - coords1.lat) * (Math.PI / 180);
                var dLon = (coords2.lng - coords1.lng) * (Math.PI / 180);
                var a =
                    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(coords1.lat * (Math.PI / 180)) * Math.cos(coords2.lat * (Math.PI / 180)) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2)
                ;

                var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                var d = R * c;

                return d;
            }

            function isLatLngInZone(latLngs, lat, lng, radiusKm, roadRef) {
                if (latLngs.length <= 0) {
                    return false;
                }

                radiusKm = parseFloat(radiusKm);
                if (undefined === radiusKm || isNaN(radiusKm)) {
                    radiusKm = 1;
                }

                var minDistance = null;
                for (var i in latLngs) {
                    if (false === latLngs.hasOwnProperty(i)) {
                        continue;
                    }

                    var latLng = latLngs[i];
                    var km = calcKmBetweenCoords(
                        {
                            lat: latLng.lat(),
                            lng: latLng.lng()
                        },
                        {
                            lat: lat,
                            lng: lng
                        }
                    );

                    if (null === minDistance || km < minDistance) {
                        minDistance = km;
                    }
                }

                return (minDistance <= radiusKm);
            }

            function isLatLngInPolygon(lat, lng, polygon) {
                var coordinate = new google.maps.LatLng(lat, lng);
                return true === google.maps.geometry.poly.containsLocation(coordinate, polygon);
            }

            for (var r in directions.routes) {
                if (false === directions.routes.hasOwnProperty(r)) {
                    continue;
                }

                var route = directions.routes[r];
                for (var i in route.legs) {
                    if (false === route.legs.hasOwnProperty(i)) {
                        continue;
                    }

                    var leg = route.legs[i];
                    for (var s in leg.steps) {
                        if (false === leg.steps.hasOwnProperty(s)) {
                            continue;
                        }

                        var step = leg.steps[s];
                        if (0 === parseInt(s)) {
                            firstStep = step;
                        } else if (parseInt(s) === (leg.steps.length - 1)) {
                            lastStep = step;
                        }

                        appendTollsInformation(
                            step
                        );

                        var stepPath = [
                            {
                                lat: step['start_location'].lat(),
                                lng: step['start_location'].lng(),
                            },
                            {
                                lat: step['end_location'].lat(),
                                lng: step['end_location'].lng(),
                            }
                        ];

                        for (var i in stepPath) {
                            if( false === stepPath.hasOwnProperty(i) ){
                                continue;
                            }

                            var pathLatLng = stepPath[i];
                            for (var iIsoCode in mapPolygonsByCountryIsoCode) {
                                if( false === mapPolygonsByCountryIsoCode.hasOwnProperty(iIsoCode) ){
                                    continue;
                                }

                                var isInCountry = isLatLngInPolygon(
                                    pathLatLng['lat'],
                                    pathLatLng['lng'],
                                    mapPolygonsByCountryIsoCode[iIsoCode]
                                );

                                if (true !== isInCountry) {
                                    continue;
                                }

                                var countryName = Object.keys(_TOLVIGNETTEN_COUNTRIES_).find(function (key) {
                                    return _TOLVIGNETTEN_COUNTRIES_[key].toString() === iIsoCode.toString();
                                });

                                if( -1 === countriesIsoCodes.indexOf(iIsoCode) ){
                                    countriesIsoCodes.push(iIsoCode);
                                }

                                if (undefined === countriesLatLng[iIsoCode]) {
                                    continue;
                                }

                                if (
                                    undefined === countriesLatLng[iIsoCode]['lat']
                                    || undefined === countriesLatLng[iIsoCode]['lng']  ) {
                                    continue;
                                }

                                var vignetteMarkerRef = '{lat}.{lng}'.replace(
                                    '{lat}',
                                    countriesLatLng[iIsoCode]['lat'].toString()
                                ).replace(
                                    '{lng}',
                                    countriesLatLng[iIsoCode]['lng'].toString()
                                );

                                if (undefined !== mapMarkers['vignette_' + vignetteMarkerRef]) {
                                    continue;
                                }

                                mapMarkers['vignette_' + vignetteMarkerRef] = new google.maps.Marker({
                                    map: map,
                                    animation: google.maps.Animation.DROP,
                                    position: {
                                        lat: countriesLatLng[iIsoCode]['lat'],
                                        lng: countriesLatLng[iIsoCode]['lng']
                                    },
                                    title: 'Vignet {countryName}'.replace(
                                        '{countryName}',
                                        countryName.trim()
                                    ),
                                    icon: {
                                        url: 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjEwMjRweCIgaGVpZ2h0PSIxMDI0cHgiIHZpZXdCb3g9IjAgMCAxMDI0IDEwMjQiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDEwMjQgMTAyNCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PGc+PGRlZnM+PHJlY3QgaWQ9IlNWR0lEXzFfIiB3aWR0aD0iMTAyNCIgaGVpZ2h0PSIxMDI0Ii8+PC9kZWZzPjxjbGlwUGF0aCBpZD0iU1ZHSURfMl8iPjx1c2UgeGxpbms6aHJlZj0iI1NWR0lEXzFfIiAgb3ZlcmZsb3c9InZpc2libGUiLz48L2NsaXBQYXRoPjxwYXRoIGNsaXAtcGF0aD0idXJsKCNTVkdJRF8yXykiIGZpbGw9IiMyRUJBOUQiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIyMCIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBkPSJNOTExLjUyNSw0MDAuNTI1QzkxMS41MjUsNjIxLjcyOSw1MTEsMTAyNCw1MTEsMTAyNFMxMTAuNDc1LDYyMS43MjksMTEwLjQ3NSw0MDAuNTI1UzI4OS43OTYsMCw1MTEsMEM3MzIuMjA0LDAsOTExLjUyNSwxNzkuMzIxLDkxMS41MjUsNDAwLjUyNSIvPjxwYXRoIGNsaXAtcGF0aD0idXJsKCNTVkdJRF8yXykiIGZpbGw9IiMyRUJBOUQiIGQ9Ik02OTAuNjczLDYwNkgzMzMuMzI4QzMwOC4zOTgsNjA2LDI4OCw1ODUuNjA0LDI4OCw1NjAuNjczVjIwMy4zMjhDMjg4LDE3OC4zOTcsMzA4LjM5OCwxNTgsMzMzLjMyOCwxNThoMzU3LjM0NWMyNC45MywwLDQ1LjMyNywyMC4zOTcsNDUuMzI3LDQ1LjMyOHYzNTcuMzQ1QzczNiw1ODUuNjA0LDcxNS42MDMsNjA2LDY5MC42NzMsNjA2Ii8+PHBhdGggY2xpcC1wYXRoPSJ1cmwoI1NWR0lEXzJfKSIgZmlsbD0iI0VFRURFRCIgZD0iTTY1OS40ODEsMzQxLjA5NEgzNjQuNTE5Yy0zLjM5NSwwLTYuMTQ1LDIuNzUtNi4xNDUsNi4xNDVzMi43NSw2LjE0NSw2LjE0NSw2LjE0NWgxOC40MzV2MTguNDM1YzAsMy4zOTUsMi43NSw2LjE0NSw2LjE0Niw2LjE0NWMzLjM5NSwwLDYuMTQ1LTIuNzUsNi4xNDUtNi4xNDV2LTE4LjQzNWgyMzMuNTEzdjE4LjQzNWMwLDMuMzk1LDIuNzUsNi4xNDUsNi4xNDYsNi4xNDVjMy4zOTUsMCw2LjE0NS0yLjc1LDYuMTQ1LTYuMTQ1di0xOC40MzVoMTguNDM2YzMuMzk2LDAsNi4xNDYtMi43NSw2LjE0Ni02LjE0NVM2NjIuODc3LDM0MS4wOTQsNjU5LjQ4MSwzNDEuMDk0Ii8+PHBhdGggY2xpcC1wYXRoPSJ1cmwoI1NWR0lEXzJfKSIgZmlsbD0iI0VFRURFRCIgZD0iTTQ5My41NjMsMzc3Ljk2OGgtNjEuNDUxYy0yLjgyNywwLTUuMjg1LDEuOTItNS45NjEsNC42NTVsLTM2Ljg3LDE0Ny40ODFjLTAuNDYxLDEuODQ0LTAuMDQ2LDMuNzc5LDEuMTIxLDUuMjdjMS4xNTMsMS40ODksMi45NSwyLjM2NCw0Ljg0LDIuMzY0aDk4LjMyMWMzLjM5NSwwLDYuMTQ1LTIuNzUsNi4xNDUtNi4xNDRWMzg0LjExM0M0OTkuNzA4LDM4MC43MTgsNDk2Ljk1OCwzNzcuOTY4LDQ5My41NjMsMzc3Ljk2OCIvPjxwYXRoIGNsaXAtcGF0aD0idXJsKCNTVkdJRF8yXykiIGZpbGw9IiNFRUVERUQiIGQ9Ik00NDQuNDAyLDMxNi41MTNoNDkuMTYxYzMuMzk1LDAsNi4xNDUtMi43NSw2LjE0NS02LjE0NXYtNzMuNzQxYzAtMy4zOTUtMi43NS02LjE0NS02LjE0NS02LjE0NWgtMzYuODcxYy0zLjAxMSwwLTUuNTYxLDIuMTgxLTYuMDUzLDUuMTMxbC0xMi4yOSw3My43NDFjLTAuMjkyLDEuNzgyLDAuMTk5LDMuNTk1LDEuMzY3LDQuOTc3QzQ0MC44ODQsMzE1LjcxNCw0NDIuNTg5LDMxNi41MTMsNDQ0LjQwMiwzMTYuNTEzeiIvPjxwYXRoIGNsaXAtcGF0aD0idXJsKCNTVkdJRF8yXykiIGZpbGw9IiNFRUVERUQiIGQ9Ik01OTcuODQ2LDM4Mi42MjFjLTAuNjktMi43MzUtMy4xMzQtNC42NTUtNS45Ni00LjY1NWgtNjEuNDUxYy0zLjM5NSwwLTYuMTQ1LDIuNzUtNi4xNDUsNi4xNDV2MTQ3LjQ4MmMwLDMuMzk1LDIuNzUsNi4xNDUsNi4xNDUsNi4xNDVoOTguMzIxYzEuODksMCwzLjY4OC0wLjg3Niw0Ljg0LTIuMzY1YzEuMTY3LTEuNDksMS41ODItMy40NDEsMS4xMjEtNS4yN0w1OTcuODQ2LDM4Mi42MjF6Ii8+PHBhdGggY2xpcC1wYXRoPSJ1cmwoI1NWR0lEXzJfKSIgZmlsbD0iI0VFRURFRCIgZD0iTTUzMC40MzgsMzE2LjUxM2g0OS4xNmMxLjgxMywwLDMuNTE5LTAuNzk5LDQuNjg2LTIuMTgyYzEuMTY4LTEuMzgyLDEuNjc2LTMuMTk1LDEuMzgzLTQuOTc3bC0xMi4yOTEtNzMuNzQxYy0wLjUwNi0yLjk0OS0zLjA1Ny01LjEzMS02LjA2Ny01LjEzMWgtMzYuODdjLTMuMzk2LDAtNi4xNDYsMi43NS02LjE0Niw2LjE0NXY3My43NDFDNTI0LjI5MSwzMTMuNzYzLDUyNy4wNDEsMzE2LjUxMyw1MzAuNDM4LDMxNi41MTMiLz48L2c+PC9zdmc+',
                                        scaledSize: new google.maps.Size(50, 60)
                                    }
                                });

                                (function (vignetteMarkerRef) {
                                    mapMarkersInfoWindow['vignette_' + vignetteMarkerRef] = new google.maps.InfoWindow({
                                        content: '<strong>{type}</strong><br/>{countryName}'.replace(
                                            '{type}',
                                            'Vignet'
                                        ).replace(
                                            '{countryName}',
                                            countryName.trim()
                                        )
                                    });

                                    mapMarkers['vignette_' + vignetteMarkerRef].addListener('click', function () {
                                        for (var i in mapMarkersInfoWindow) {
                                            if (false === mapMarkersInfoWindow.hasOwnProperty(i)) {
                                                continue;
                                            }

                                            if (undefined !== mapMarkersInfoWindow[i].close) {
                                                mapMarkersInfoWindow[i].close();
                                            }
                                        }

                                        mapMarkersInfoWindow['vignette_' + vignetteMarkerRef].open(
                                            map,
                                            mapMarkers['vignette_' + vignetteMarkerRef]
                                        );
                                    });
                                })(vignetteMarkerRef);
                            }
                        }
                    }
                }
            }

            if (undefined !== firstStep) {
                setCountryNameFromLastStep(firstStep, $startInput);
            }

            if (undefined !== lastStep) {
                setCountryNameFromLastStep(lastStep, $endInput);
            }

            if (countriesIsoCodes.length > 0) {
                $hddnCountries.val(countriesIsoCodes.join(','));
            }
            else{
                $hddnCountries.val('');
            }

            if (Object.keys(tolls).length > 0) {
                $hddnTolls.val(JSON.stringify(tolls));
            }
            else{
                $hddnTolls.val('');
            }

            if ($mapProductsList.find('li').length > 0) {
                getProductsByCountryIsoCodes(
                    countriesIsoCodes
                );
            } else {
                requestProductsByCountryIsoCodes(
                    countriesIsoCodes
                );
            }

            return [
                countriesIsoCodes,
                duration,
                distance,
                tolls
            ];
        }

        var __stopProductsByCountryIsoCodesRechargingAttempts = 0;
        var __productsByCountryIsoCodesRechargingXhr = null;

        function requestProductsByCountryIsoCodes(countryIsoCodes) {
            ++__stopProductsByCountryIsoCodesRechargingAttempts;
            if (__stopProductsByCountryIsoCodesRechargingAttempts > 3 || null !== __productsByCountryIsoCodesRechargingXhr) {
                return;
            }

            var itemsType = 'main';
            if (undefined !== TolvignettenMapShortcode['itemsType']) {
                itemsType = TolvignettenMapShortcode['itemsType'].toString().toLowerCase();
            }

            $initText.addClass('hide');
            $message.addClass('hide');
            $productsButtons.addClass('hide');
            $productsPreloader.removeClass('hide');

            __productsByCountryIsoCodesRechargingXhr = $.ajax({
                method: 'GET',
                dataType: 'json',
                url: TolvignettenMapShortcode['ajaxUrl'],
                data: {
                    action: 'get_products_from_countries',
                    countries: countryIsoCodes,
                    itemsType: itemsType
                }
            }).done(function (response) {
                __stopProductsByCountryIsoCodesRechargingAttempts = 0;
                $mapProductsList.html(response.html);
                getProductsByCountryIsoCodes(
                    countryIsoCodes
                );
            })
                .fail(function () {
                    requestProductsByCountryIsoCodes(
                        countryIsoCodes
                    );
                })
                .always(function () {
                    __productsByCountryIsoCodesRechargingXhr = null;
                });
        }

        function getProductsByCountryIsoCodes(countryIsoCodes) {
            if (!$.isArray(countryIsoCodes) || 0 === countryIsoCodes.length) {
                return;
            }

            var $target = $mapProductsList;
            if (0 === $target.length) {
                return;
            }

            var countriesStr = countryIsoCodes.join(',');
            var cacheCountries = $target.data('currentCountries');
            if (countriesStr === cacheCountries) {
                return;
            }

            $target.data(
                'currentCountries',
                countriesStr
            );

            $initText.addClass('hide');
            $message.addClass('hide');
            $productsButtons.addClass('hide');
            $productsPreloader.removeClass('hide');
            $target.find('li[data-country-iso-code]').addClass('hide');

            setTimeout(
                function () {
                    $target.find('li[data-country-iso-code]').each(function () {
                        var $item = $(this);
                        var itemCountryIsoCode = $item.data('country-iso-code').toString().toUpperCase();
                        if (-1 !== countryIsoCodes.indexOf(itemCountryIsoCode)) {
                            $item.removeClass('hide');
                            $item.find('h5').text(
                                (undefined !== _TOLVIGNETTEN_COUNTRIES_BY_ISO_CODE_[itemCountryIsoCode] ? _TOLVIGNETTEN_COUNTRIES_BY_ISO_CODE_[itemCountryIsoCode] : '')
                            );
                        }
                    });

                    $initText.addClass('hide');
                    $routeText.addClass('hide');
                    $message.addClass('hide');
                    $productsPreloader.addClass('hide');
                    $productsButtons.addClass('hide');

                    if ($target.find('li[data-country-iso-code]:not(.hide)').length > 0) {
                        $routeText.removeClass('hide');
                        $productsButtons.removeClass('hide');
                    } else {
                        $message.removeClass('hide');
                    }

                    setTimeout(
                        function () {
                            updateScrollbar();
                        },
                        250
                    )
                },
                500
            );
        }

        function updateScrollbar() {
            $('.ta-map-details-column .mCustomScrollbar').mCustomScrollbar("update");
        }

        function fill() {
            var windowHeight = parseInt($(window).height());

            var headerSelectorsHeight = 0;
            var headerSelectors = $mapWidget.data('header-selectors');
            if (undefined !== headerSelectors && '' !== headerSelectors) {
                var headerSelectorsArray = headerSelectors.split(',');
                for (var i in headerSelectorsArray) {
                    if (!headerSelectorsArray.hasOwnProperty(i)) {
                        continue;
                    }
                    var selector = headerSelectorsArray[i].toString().trim();
                    var $selectorPointer = $(selector);
                    if ($selectorPointer.length > 0) {
                        var selectorHeight = parseInt($selectorPointer.outerHeight());
                        if (isNaN(selectorHeight) || !selectorHeight) {
                            selectorHeight = parseInt($selectorPointer.height());
                            if (isNaN(selectorHeight) || !selectorHeight) {
                                selectorHeight = 0;
                            }
                        }

                        headerSelectorsHeight += selectorHeight;
                    }
                }
            }

            var windowWidth = parseInt($(window).outerWidth());
            if (isNaN(windowWidth) || !windowWidth) {
                windowWidth = parseInt($(window).width());
                if (isNaN(windowWidth)) {
                    windowWidth = 0;
                }
            }

            $mapWrapper.css('width', windowWidth);
            $mapWrapper.css(
                'left',
                -(
                    parseInt($mapWrapper.offset().left)
                    - parseInt($mapWrapper.css('left'))
                )
            );

            var height = (windowHeight - headerSelectorsHeight);
            var $simulatedSpacing = $('.ta-map-simulated-spacing');
            $simulatedSpacing.css('height', height);
            $mapWrapper.parent().css({top: $simulatedSpacing.offset().top});
            $('.map-height').each(function () {
                var property = $(this).is('.mCustomScrollbar') ? 'max-height' : 'height';
                $(this).css(property, height);
            });
        }

        function createHomepageGoogleMap() {
            if (parseInt($('#map').length) === 0) {
                return;
            }

            fill();

            var mapOptions = {
                center: {lat: 53.9638081, lng: 12.8166495},
                zoom: 4,
                streetViewControl: false,
                disableDefaultUI: true,
                scrollwheel: false,
                mapTypeControl: false,
                zoomControlOptions: {
                    style: google.maps.ZoomControlStyle.LARGE,
                    position: google.maps.ControlPosition.RIGHT_CENTER
                },
                panControlOptions: {
                    position: google.maps.ControlPosition.RIGHT_CENTER
                },
                zoomControl: true
            };

            var mapElement = document.getElementById('map');
            map = new google.maps.Map(mapElement, mapOptions);
            google.maps.event.trigger(map, 'resize');

            directionsDisplay = new google.maps.DirectionsRenderer({draggable: true});
            directionsDisplay.setMap(map);

            directionsService = new google.maps.DirectionsService();
            var start = $startInput.first().get(0);
            var end = $endInput.first().get(0);

            var startAutocomplete = new google.maps.places.Autocomplete(start);
            startAutocomplete.bindTo('bounds', map);

            var polygonConfig = {};
            if ('true' === TolvignettenMapShortcode['_dev']) {
                polygonConfig = {
                    strokeColor: '#990000',
                    strokeOpacity: 0.5,
                    strokeWeight: 2,
                    fillColor: '#990000',
                    fillOpacity: 0.35,
                    map: map
                };
            }

            for (var isoCode in __COUNTRIES_COORS_MAPPING) {
                polygonConfig['paths'] = __COUNTRIES_COORS_MAPPING[isoCode] || {};
                if (undefined !== polygonConfig['strokeColor']) {
                    var localStoragePolygonColorItemName = isoCode + '_polygon_color';
                    if( !window.localStorage.getItem(localStoragePolygonColorItemName) ){
                        window.localStorage.setItem(
                            localStoragePolygonColorItemName,
                            ('#' + Math.floor(Math.random() * 16777215).toString(16))
                        );
                    }

                    var polygonColor = window.localStorage.getItem(localStoragePolygonColorItemName);
                    polygonConfig['strokeColor'] = polygonColor;
                    polygonConfig['fillColor'] = polygonColor;
                }

                mapPolygonsByCountryIsoCode[isoCode] = new google.maps.Polygon(
                    polygonConfig
                );
            }

            google.maps.event.addListener(startAutocomplete, 'place_changed', function () {
                calcRoute();
                $(start).trigger('change');
                $(end).trigger('change');

                setTimeout(function () {
                    $(start).trigger('change');
                }, 500);
            });

            var endAutocomplete = new google.maps.places.Autocomplete(end);
            endAutocomplete.bindTo('bounds', map);

            var __placeChangedTimeout = null;
            google.maps.event.addListener(endAutocomplete, 'place_changed', function () {
                if( null !== __placeChangedTimeout ){
                    clearTimeout(__placeChangedTimeout);
                }

                __placeChangedTimeout = setTimeout(function () {
                    calcRoute();
                    $(start).trigger('change');
                    $(end).trigger('change');

                    setTimeout(function () {
                        $(end).trigger('change');
                    }, 500);

                    __placeChangedTimeout = null;
                }, 500);
            });

            var __directionsChangedTimeout = null;
            google.maps.event.addListener(directionsDisplay, 'directions_changed', function () {
                if( null !== __directionsChangedTimeout ){
                    clearTimeout(__directionsChangedTimeout);
                }

                showMapPreload();
                __directionsChangedTimeout = setTimeout(function () {
                    $(start).trigger('change');
                    $(end).trigger('change');

                    resetMapMarkers();
                    var directions = directionsDisplay.getDirections();
                    for (var i = 0; i < directions.routes.length; i++) {
                        var routeInfo = getRouteInfo(directions, i);
                        var countries = routeInfo[0];
                        var duration = routeInfo[1];
                        var distance = routeInfo[2];
                        if (countries.length > 1) {
                            $routeText.find('.route-distance').html(distance.replace(/(\.+)$/g, ''));
                            $routeText.find('.route-duration').html(duration.replace(/(\.+)$/g, ''));
                            break;
                        }
                    }

                    __directionsChangedTimeout = null;
                    hideMapPreload();
                }, 500);
            });
        }

        function scanErrors() {
            var hasOrigin = ('' !== $startInput.val().toString().trim());
            var hasDestination = ('' !== $endInput.val().toString().trim());
            if (true === hasOrigin && true === hasDestination) {
                $startInput.css({border: 'none'});
                $endInput.css({border: 'none'});
                return;
            }

            $hddnCountries.val('');
            $message.addClass('hide');
            $routeText.addClass('hide');
            $productsPreloader.addClass('hide');
            $productsButtons.addClass('hide');
            $initText.removeClass('hide');

            $mapProductsList.data('currentCountries', null);
            $mapProductsList.find('li[data-country-iso-code]').addClass('hide');

            var startBorder = (true !== hasOrigin ? '1px solid red' : 'none');
            $startInput.css({border: startBorder});

            var endBorder = (true !== hasDestination ? '1px solid red' : 'none');
            $endInput.css({border: endBorder});
        }

        function closeProductsColumn() {
            $('.ta-map-widget').addClass('closed').removeClass('opened');
        }

        function openProductsColumn() {
            $('.ta-map-widget').addClass('opened').removeClass('closed');
        }

        function toggleDisplayMode($eventTarget) {
            var mode = $eventTarget.data('mode');
            if (undefined === mode) {
                mode = '';
            }

            var $mapContainer = $('.map-container.tolvignetten').parent();
            $mapContainer.removeClass('display-mode-map display-mode-list');
            $mapContainer.addClass('display-mode-' + mode.toLowerCase());
        }

        function init() {
            createHomepageGoogleMap();
            calcRoute();

            $('body').on('click', '.ta-map-details-column .continue-button,.ta-map-column .continue-button', function () {
                $('button.continue-btn', 'form[name="map_form"]').click();
            }).on('click', '.ta-map-widget .toggle-products', function () {
                if ($('.ta-map-widget').is('.closed')) {
                    openProductsColumn();
                } else {
                    closeProductsColumn();
                }
            }).on('click', '.display-mode-btn', function (e) {
                e.preventDefault();

                toggleDisplayMode(
                    $(this)
                );
            });

            $(window).on('resize', function () {
                fill();
            });

            fill();
        }

        init();
    });
})(jQuery);
