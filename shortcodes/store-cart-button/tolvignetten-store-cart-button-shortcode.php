<?php

/**
 * @param array $attrs
 *
 * @return string
 */
function tolvignetten_store_cart_button_shortcode($attrs)
{
    tolvignetten_enqueue_required_libs();

    \wp_enqueue_style(
        'animate_css',
        \tolvignetten_plugin_url(
            'public/css/animate.css'
        )
    );

    \wp_enqueue_style(
        'tolvignetten-stroe-cart-button-css',
        \tolvignetten_plugin_url(
            'shortcodes/store-cart-button/css/store-cart-button.css'
        )
    );

    return tolvignetten_get_store_cart_button_shortcode_html(
        $attrs
    );
}

/**
 * @param array $attrs
 *
 * @return string
 */
function tolvignetten_get_store_cart_button_shortcode_html($attrs)
{
    $attrs = tolvignetten_process_shotcode_attrs(
        TOLVIGNETTEN_STORE_CART_BUTTON_SHORCODE,
        $attrs
    );

    $attrs['itemsNumber'] = tolvignetten_get_current_cart_items();
    $query = tolvignetten_get_current_query();
    if (isset($attrs['target_path']) && !empty($query)) {
        $attrs['target_path'] = \sprintf(
            '%s?%s',
            \rtrim(
                $attrs['target_path'],
                '?'
            ),
            $query
        );
    }

    return tolvignetten_load_template(
        'shortcodes/store-cart-button/templates/store-cart-button-template.php',
        $attrs
    );
}

\add_shortcode(
    TOLVIGNETTEN_STORE_CART_BUTTON_SHORCODE,
    'tolvignetten_store_cart_button_shortcode'
);
