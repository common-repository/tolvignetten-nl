<?php

/**
 * @param array $attrs
 *
 * @return string
 */
function tolvignetten_map_shortcode($attrs)
{
    tolvignetten_enqueue_required_libs();

    \wp_enqueue_script(
        'google_maps',
        \sprintf(
            '//maps.googleapis.com/maps/api/js?v=3&language=nl&libraries=places,geometry&key=%s',
            TOLVIGNETTEN_GOOGLE_MAPS_API_KEY
        )
    );

    \wp_enqueue_script(
        'tolvignetten-countries-js',
        \tolvignetten_plugin_url(
            'public/js/countries.js'
        )
    );

    \wp_enqueue_script(
        'tolvignetten-countries-bulgaria-data',
        \tolvignetten_plugin_url(
            'shortcodes/map/js/countries-coors-mapping.js'
        )
    );

    \wp_enqueue_script(
        'tolvignetten-map-js',
        \tolvignetten_plugin_url(
            'shortcodes/map/js/map.js'
        ),
        ['jquery']
    );

    $locale = (isset($attrs['locale']) ? $attrs['locale'] : TOLVIGNETTEN_DEFAULT_LOCALE);
    $itemsType = !empty($attrs['items_type']) ? $attrs['items_type'] : 'main';
    $productsInformation = tolvignetten_get_products(
        $itemsType,
        $locale
    );

    \wp_localize_script('tolvignetten-map-js', 'TolvignettenMapShortcode', array(
        'locale' => $locale,
        'ajaxUrl' => \admin_url('admin-ajax.php'),
        'targetUrl' => (isset($attrs['target_path']) ? $attrs['target_path'] : tolvignetten_get_default_map_target_url()),
        'reset' => (isset($attrs['reset']) ? $attrs['reset'] : true),
        'gPublicApiKey' => \defined('TOLVIGNETTEN_GOOGLE_MAPS_PUBLIC_API_KEY') ? TOLVIGNETTEN_GOOGLE_MAPS_PUBLIC_API_KEY : '',
        'itemsType' => $itemsType,
        'fixFullWidth' => !empty($attrs['fix_full_width']) ? $attrs['fix_full_width'] : 'false',
        'tollsInformation' => tolvignetten_get_tolls_information($locale),
        'countriesLatLng' => tolvignetten_extract_countries_lat_lng_from_products(
            $productsInformation
        ),
        '_dev' => \getenv('TOLVIGNETTEN_DEV_MODE') ? 'true' : 'false',
    ));

    \wp_enqueue_style(
        'tolvignetten-map-css',
        \tolvignetten_plugin_url(
            'shortcodes/map/css/map.css'
        )
    );

    return \get_tolvignetten_map_shortcode_html(
        $attrs,
        $productsInformation
    );
}

/**
 * @param array $attrs
 * @param array $productsInformation
 *
 * @return string
 */
function get_tolvignetten_map_shortcode_html(
    $attrs,
    $productsInformation
)
{
    return tolvignetten_load_template(
        'shortcodes/map/templates/map-panel-template.php',
        \array_merge(
            tolvignetten_process_shotcode_attrs(
                TOLVIGNETTEN_MAP_SHORCODE,
                tolvignetten_process_shotcode_attrs(
                    TOLVIGNETTEN_MAP_SHORCODE,
                    $attrs
                )
            ),
            array(
                'productsInformation' => tolvignetten_group_products_by_country(
                    $productsInformation
                )
            )
        )
    );
}

\add_shortcode(
    TOLVIGNETTEN_MAP_SHORCODE,
    'tolvignetten_map_shortcode'
);
