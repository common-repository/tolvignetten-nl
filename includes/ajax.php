<?php

\add_action('wp_ajax_get_cart_items', 'tolvignetten_ajax_get_cart_items');
\add_action('wp_ajax_nopriv_get_cart_items', 'tolvignetten_ajax_get_cart_items');
function tolvignetten_ajax_get_cart_items()
{
    $action =  isset($_GET['action']) ? $_GET['action'] : '';
    switch (\strtolower($action)) {
        case 'get_cart_items':
            $response = tolvignetten_ajax_get_cart_items_handler();
            break;
        default:
            $response = tolvignetten_ajax_bad_request_handler(
                'Action not found !'
            );
            break;
    }

    echo \json_encode(
        $response
    );

    \wp_die();
}

/**
 * @return array
 */
function tolvignetten_ajax_get_cart_items_handler()
{
    \http_response_code(200);

    return [
        'status' => 'success',
        'itemsNumber' => tolvignetten_get_current_cart_items(),
    ];
}

/**
 * @param mixed $message
 *
 * @return array
 */
function tolvignetten_ajax_bad_request_handler($message = '')
{
    \http_response_code(403);

    return [
        'status' => 'error',
        'message' => 'Action not found !',
    ];
}

\add_action('wp_ajax_get_products_from_countries', 'tolvignetten_ajax_get_products_from_countries');
\add_action('wp_ajax_nopriv_get_products_from_countries', 'tolvignetten_ajax_get_products_from_countries');
function tolvignetten_ajax_get_products_from_countries()
{
    $locale = (isset($_GET['locale']) ? $_GET['locale'] : TOLVIGNETTEN_DEFAULT_LOCALE);
    $itemsType = !empty($_GET['itemsType']) ? $_GET['itemsType'] : 'all';
    $productsInformation = tolvignetten_get_products(
        $itemsType,
        $locale
    );

    echo \json_encode(
        [
            'html' => tolvignetten_load_template(
                'shortcodes/map/templates/map-products-template-items.php',
                [
                    'productsInformation' => tolvignetten_group_products_by_country(
                        $productsInformation
                    )
                ]
            )
        ]
    );

	\wp_die();
}