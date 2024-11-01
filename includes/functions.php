<?php

// Logo manager
require_once \sprintf(
    '%sincludes/logo-manager.php',
    TOLVIGNETTEN_PATH
);

// Affiliates
require_once \sprintf(
    '%sincludes/affiliates/affiliates.php',
    TOLVIGNETTEN_PATH
);

/**
 * @param string $path
 *
 * @return string
 */
function tolvignetten_plugin_url($path)
{
    return \plugins_url(
        $path,
        \realpath(
            __DIR__
        )
    );
}

/**
 * @return string
 */
function tolvignetten_get_default_map_target_url()
{
    return \sprintf(
        '%s%s',
        \get_site_url(),
        '/aanvragen'
    );
}

/**
 * @return string
 */
function tolvignetten_get_default_store_url()
{
    return TOLVIGNETTEN_STORE_DEFAULT_URL;
}

/**
 * @return int
 */
function tolvignetten_get_current_cart_items()
{
    $cookieName = TOLVIGNETTEN_UI_SID_COOKIE_NAME;
    $sid = (!empty($_COOKIE[$cookieName]) ? $_COOKIE[$cookieName] : null);
    if (null === $sid) {
        return 0;
    }

    try {
        $response = \wp_remote_get(
            \sprintf(
                '%s/_ajax/order/get-cart-summary?SID=%s',
                \rtrim(
                    TOLVIGNETTEN_STORE_DEFAULT_URL,
                    '/'
                ),
                $sid
            ),
            [
                'timeout' => tolvignetten_get_request_default_timeout(),
            ]
        );

        $return = array();
        if (\is_array($response)) {
            $return = \json_decode(
                (string) \wp_remote_retrieve_body($response),
                true
            );
        }
    } catch (\Exception $e) {
        return 0;
    }

    return (int) (isset($return['items']) ? $return['items'] : 0);
}

/**
 * @param string $locale
 *
 * @return array
 */
function tolvignetten_get_tolls_information($locale = null)
{
    try {
        $locale = null !== $locale ? $locale : TOLVIGNETTEN_DEFAULT_LOCALE;
        $response = \wp_remote_get(
            \sprintf(
                '%s/product-variants/tolls-information?%s',
                \rtrim(
                    TOLVIGNETTEN_STORE_DEFAULT_URL,
                    '/'
                ),
                \http_build_query(
                    [
                        'locale' => $locale,
                    ]
                )
            ),
            [
                'timeout' => tolvignetten_get_request_default_timeout()
            ]
        );

        $return = array();
        if (\is_array($response)) {
            $return = \json_decode(
                (string) \wp_remote_retrieve_body($response),
                true
            );
        }
    } catch (\Exception $e) {
        return array();
    }

    return $return;
}

/**
 * @return int|null
 */
function tolvignetten_get_request_default_timeout()
{
    $timeout = 10000;
    if( true === \defined('TOLVIGNETTEN_REQUEST_DEFAULT_TIMEOUT') ){
        $timeout = (int) TOLVIGNETTEN_REQUEST_DEFAULT_TIMEOUT;
    }

    return $timeout;
}

/**
 * @return string|null
 */
function tolvignetten_get_current_query()
{
    $cookieName = TOLVIGNETTEN_UI_QUERY_COOKIE_NAME;

    return !empty($_COOKIE[$cookieName]) ? \ltrim($_COOKIE[$cookieName], '?') : null;
}

function tolvignetten_enqueue_required_libs()
{
    \wp_enqueue_script(
        'tolvignetten-required-libs',
        tolvignetten_plugin_url('public/js/required-libs.js'),
        ['jquery']
    );

    \wp_localize_script('tolvignetten-required-libs', 'TolvignettenPlugin', array(
        'pluginUrl' => tolvignetten_plugin_url(''),
    ));
}

/**
 * @param string $path
 * @param array  $vars
 *
 * @return string
 */
function tolvignetten_load_template($path, $vars = array())
{
    if (\is_array($vars)) {
        foreach ($vars as $k => $v) {
            $$k = $v;
        }
    }

    \ob_start();

    include \sprintf(
        '%s%s',
        TOLVIGNETTEN_PATH,
        $path
    );

    return \ob_get_clean();
}

/**
 * @param string $path
 * @param array  $vars
 *
 * @return string
 */
function tolvignetten_load_css_template($path, $vars = array())
{
    return tolvignetten_load_template(
        $path,
        $vars
    );
}

/**
 * @return array
 */
function tolvignetten_get_shortcodes_descriptions()
{
    return array(
        TOLVIGNETTEN_MAP_SHORCODE => array(
            'name' => 'Map',
            'parameters' => array(
                'locale' => array(
                    'type' => 'string',
                    'description' => 'Language locale code.',
                    'default_value' => 'nl_NL',
                ),
                'target_path' => array(
                    'type' => 'string',
                    'description' => 'Target URL for "continue" button.',
                    'default_value' => '/aanvragen',
                ),
                'reset' => array(
                    'type' => 'boolean',
                    'description' => 'Resets current store session on "continue".',
                    'default_value' => 'true',
                    'value_map' => function ($value) {
                        return tolvignetten_process_input_boolean(
                            $value
                        );
                    },
                ),
                'products_panel' => array(
                    'type' => 'boolean',
                    'description' => 'Display products panel from map data.',
                    'default_value' => 'true',
                    'value_map' => function ($value) {
                        return tolvignetten_process_input_boolean(
                            $value
                        );
                    },
                ),
                'items_type' => array(
                    'type' => 'string',
                    'description' => 'Allowed values "<strong>main</strong>", "<strong>non-main</strong>", "<strong>all</strong>"',
                    'default_value' => 'main',
                ),
                'header_selectors' => array(
                    'type' => 'string',
                    'description' => 'CSS selectors to detect necessary height. (Separated by comma)',
                    'default_value' => '#wpadminbar,header',
                ),
                'fix_full_width' => array(
                    'type' => 'boolean',
                    'description' => 'Try to fix full with for IE and MS-EDGE',
                    'default_value' => 'false',
                    'value_map' => function ($value) {
                        return tolvignetten_process_input_boolean(
                            $value
                        );
                    },
                ),
            ),
        ),
        TOLVIGNETTEN_STORE_SHORCODE => array(
            'name' => 'Store',
            'parameters' => array(
                'locale' => array(
                    'type' => 'string',
                    'description' => 'Language locale code.',
                    'default_value' => 'nl_NL',
                ),
                'currency' => array(
                    'type' => 'string',
                    'description' => 'Currency code',
                    'default_value' => 'EUR',
                ),
                'store_url' => array(
                    'type' => 'string',
                    'description' => 'URL of UI for iframe.',
                    'default_value' => tolvignetten_get_default_store_url(),
                ),
                'countries' => array(
                    'type' => 'string',
                    'description' => 'ISO code of countries separated by commas.',
                    'default_value' => array(
                        'NL',
                    ),
                    'value_map' => function ($value) {
                        if (\is_string($value)) {
                            return \explode(
                                ',',
                                \preg_replace(
                                    "/\s+/",
                                    '',
                                    $value
                                )
                            );
                        }

                        return $value;
                    },
                ),
                'partner_id' => array(
                    'type' => 'string',
                    'description' => '',
                    'default_value' => '',
                ),
                'partner_info' => array(
                    'type' => 'string',
                    'description' => '',
                    'default_value' => '',
                ),
                'show_trailer_option' => array(
                    'type' => 'boolean',
                    'description' => 'Display "trailer option" checkbox.',
                    'default_value' => 'false',
                    'value_map' => function ($value) {
                        return tolvignetten_process_input_boolean(
                            $value
                        );
                    },
                ),
                'allow_delete_main_items' => array(
                    'type' => 'boolean',
                    'description' => '',
                    'default_value' => 'false',
                    'value_map' => function ($value) {
                        return tolvignetten_process_input_boolean(
                            $value
                        );
                    },
                ),
                'show_configuration_summary' => array(
                    'type' => 'boolean',
                    'description' => '',
                    'default_value' => 'false',
                    'value_map' => function ($value) {
                        return tolvignetten_process_input_boolean(
                            $value
                        );
                    },
                ),
                'show_info' => array(
                    'type' => 'boolean',
                    'description' => '',
                    'default_value' => 'false',
                    'value_map' => function ($value) {
                        return tolvignetten_process_input_boolean(
                            $value
                        );
                    },
                ),
                'items_type' => array(
                    'type' => 'string',
                    'description' => 'Allowed values "<strong>main</strong>", "<strong>non-main</strong>", "<strong>all</strong>"',
                    'default_value' => 'main',
                ),
                'vehicle' => array(
                    'type' => 'int',
                    'description' => '',
                    'default_value' => '',
                    'value_map' => function ($value) {
                        return (int) $value;
                    },
                ),
                'start_date' => array(
                    'type' => 'string',
                    'description' => 'Format: Y-m-d',
                    'default_value' => '',
                ),
                'end_date' => array(
                    'type' => 'string',
                    'description' => 'Format: Y-m-d',
                    'default_value' => '',
                ),
                'license_plate_number' => array(
                    'type' => 'string',
                    'description' => '',
                    'default_value' => '',
                    'hide_for_admin' => true,
                ),
                'allow_unselect_optional_items' => array(
                    'type' => 'boolean',
                    'description' => '',
                    'default_value' => 'true',
                    'value_map' => function ($value) {
                        return tolvignetten_process_input_boolean(
                            $value
                        );
                    },
                ),
                'default_optional_items_status' => array(
                    'type' => 'string',
                    'description' => 'Allowed values "<strong>selected</strong>", "<strong>unselected</strong>"',
                    'default_value' => 'selected',
                ),
            ),
        ),
        TOLVIGNETTEN_STORE_CART_BUTTON_SHORCODE => array(
            'name' => 'Store cart button',
            'parameters' => array(
                'target_path' => array(
                    'type' => 'string',
                    'description' => 'Target path.',
                    'default_value' => '/aanvragen',
                ),
                'style' => array(
                    'type' => 'string',
                    'description' => 'HTML style attribute value.',
                    'default_value' => '',
                ),
                'icon_style' => array(
                    'type' => 'string',
                    'description' => 'HTML style attribute value for cart icon.',
                    'default_value' => '',
                ),
            ),
        ),
    );
}

/**
 * @param mixed $value
 *
 * @return string
 */
function tolvignetten_process_input_boolean($value)
{
    return 'true' === \strtolower($value) ? 'true' : 'false';
}

/**
 * @param array $attrs
 * @param mixed $shortcode
 *
 * @return array
 */
function tolvignetten_process_shotcode_attrs($shortcode, $attrs)
{
    static $shortcodes = null;
    if (null === $shortcodes) {
        $shortcodes = tolvignetten_get_shortcodes_descriptions();
    }

    $return = array();
    if (isset($shortcodes[$shortcode])) {
        foreach ($shortcodes as $k => $v) {
            if (\is_array($shortcodes[$shortcode]['parameters'])) {
                foreach ($shortcodes[$shortcode]['parameters'] as $parameterName => $parameter) {
                    $return[$parameterName] = '';
                    if (isset($attrs[$parameterName])) {
                        $return[$parameterName] = $attrs[$parameterName];
                    } elseif (isset($parameter['default_value'])) {
                        $return[$parameterName] = $parameter['default_value'];
                    }

                    if (
                        isset($parameter['value_map'])
                        &&
                        \is_callable($parameter['value_map'])
                    ) {
                        $return[$parameterName] = $parameter['value_map'](
                            $return[$parameterName]
                        );
                    }
                }
            }
        }
    }

    return $return;
}

/**
 * @param string $source
 * @param string $target
 *
 * @return boolean
 */
function tolvignetten_copy($source, $target)
{
    $dir = \opendir($source);
    if (!\is_dir($target)) {
        @\mkdir($target);
    }

    while (false !== ($file = \readdir($dir))) {
        if (preg_match("/^(\.\.?)/", $file)) {
            continue;
        }

        if (\is_dir($source . '/' . $file)) {
            tolvignetten_copy(
                \sprintf(
                    "%s/%s",
                    $source,
                    $file
                ),
                \sprintf(
                    "%s/%s",
                    $target,
                    $file
                )
            );

            continue;
        }

        \copy(
            \sprintf(
                "%s/%s",
                $source,
                $file
            ),
            \sprintf(
                "%s/%s",
                $target,
                $file
            )
        );
    }

    \closedir($dir);

    return true;
}

/**
 * @param string $directory
 */
function tolvignetten_rmdir($directory)
{
    if (\is_dir($directory)) {
        return;
    }

    $objects = \scandir($directory);
    foreach ($objects as $object) {
        if ($object == "." && $object == "..") {
            continue;
        }

        $objectDir = \sprintf(
            "%s/%s" .
            $directory,
            $object
        );

        if (\is_dir($objectDir)) {
            tolvignetten_rmdir(
                $objectDir
            );
        } else {
            \unlink(
                $objectDir
            );
        }
    }

    \reset($objects);
    \rmdir($directory);
}

/**
 * @return array
 */
function tolvignetten_get_templates_child_file_list()
{
    $templatesChildPattern = \sprintf(
        "%stemplates-child/*",
        TOLVIGNETTEN_PATH
    );

    $list = \glob(
        $templatesChildPattern,
        GLOB_ONLYDIR
    );

    return false !== $list ? $list : array();
}

/**
 * @return string
 */
function tolvignetten_get_root_themes_path()
{
    return \realpath(
        \sprintf(
            "%s../../themes/",
            TOLVIGNETTEN_PATH
        )
    );
}

/**
 * @param string      $itemsType
 * @param string|null $locale
 *
 * @return array
 */
function tolvignetten_get_products($itemsType, $locale = null)
{
    try {
        $locale = null !== $locale ? $locale : TOLVIGNETTEN_DEFAULT_LOCALE;
        $response = \wp_remote_get(
            \sprintf(
                '%s/products/by-countries?%s',
                \rtrim(
                    TOLVIGNETTEN_STORE_DEFAULT_URL,
                    '/'
                ),
                \http_build_query(
                    array(
                        'locale' => $locale,
                        'countries' => [],
                        'itemsType' => $itemsType,
                    )
                )
            ),
            [
                'timeout' => tolvignetten_get_request_default_timeout(),
            ]
        );

        $return = array();
        if (\is_array($response)) {
            $return = \json_decode(
                (string) \wp_remote_retrieve_body($response),
                true
            );
        }
    } catch (\Exception $e) {
        return array();
    }

    return $return;
}

/**
 * @param array $products
 *
 * @return array
 */
function tolvignetten_group_products_by_country($products)
{
    $output = array();
    foreach ($products as $product) {
        if (!isset($product['country_products']) || false === \is_array($product['country_products'])) {
            continue;
        }

        $countryProducts = $product['country_products'];
        foreach ($countryProducts as $countryProduct) {
            if (true === empty($countryProduct['country']['iso_code'])) {
                continue;
            }

            $countryIsoCode = $countryProduct['country']['iso_code'];
            $output[$countryIsoCode][] = array(
                'title' => $product['title'],
                'desc' => $product['short_description'],
            );
        }
    }

    return $output;
}

/**
 * @param array $products
 *
 * @return array
 */
function tolvignetten_extract_countries_lat_lng_from_products($products)
{
    $output = array();
    foreach ($products as $product) {
        if (!isset($product['country_products']) || false === \is_array($product['country_products'])) {
            continue;
        }

        $countryProducts = $product['country_products'];
        foreach ($countryProducts as $countryProduct) {
            $country = $countryProduct['country'];
            if (true === empty($country['iso_code'])) {
                continue;
            }

            $countryIsoCode = $country['iso_code'];

            $latLng = false === empty($country['data']['lat_lng']) ? $country['data']['lat_lng'] : array();
            $output[$country['iso_code']] = $latLng;
        }
    }

    return $output;
}

function tolvignetten_force_refresh_ui()
{
    if (\defined('TOLVIGNETTEN_REFRESH_URL_SEGMENT') && false === empty($_SERVER['REQUEST_URI'])) {
        if (false !== \strpos($_SERVER['REQUEST_URI'], TOLVIGNETTEN_REFRESH_URL_SEGMENT)) {
            $reload = false;
            foreach ($_COOKIE as $name => $value) {
                if (\preg_match('/^(prod_iframe_loc-?)/ui', $name)) {
                    $_COOKIE[$name] = '';
                    unset($_COOKIE[$name]);
                    \setcookie($name, null, -1, '/');
                    $reload = true;
                }
            }

            if (true === $reload) {
                if (\defined('TOLVIGNETTEN_REFRESH_PARAM_NAME')) {
                    if (!empty($_GET[TOLVIGNETTEN_REFRESH_PARAM_NAME])) {
                        \header(
                            \sprintf(
                                'Location: %s',
                                $_GET[TOLVIGNETTEN_REFRESH_PARAM_NAME]
                            )
                        );

                        die;
                    }
                }

                \header(
                    \sprintf(
                        'Location: %s',
                        '/'
                    )
                );

                die;
            }
        }
    }
}
