<?php

// Shortcode [tolvignetten_map_widget]
require_once \sprintf(
    '%sshortcodes/map/tolvignetten-map-shortcode.php',
    TOLVIGNETTEN_PATH
);

// Shortcode [tolvignetten_store_widget]
require_once \sprintf(
    '%sshortcodes/store/tolvignetten-store-shortcode.php',
    TOLVIGNETTEN_PATH
);

// Shortcode [tolvignetten_store_cart_button_widget]
require_once \sprintf(
    '%sshortcodes/store-cart-button/tolvignetten-store-cart-button-shortcode.php',
    TOLVIGNETTEN_PATH
);

\add_action('init', 'tolvignetten_public_init');
function tolvignetten_public_init()
{
    // Force refresh
    if (\function_exists('tolvignetten_force_refresh_ui')) {
        \tolvignetten_force_refresh_ui();
    }

    // Affiliates
    if (function_exists('tolvignetten_affiliate_init')) {
        tolvignetten_affiliate_init();
    }
}

\add_action('wp_enqueue_scripts', 'tolvignetten_generic_scripts_load');
function tolvignetten_generic_scripts_load()
{
    \wp_enqueue_script(
        'tolvignetten-generic-scripts-load',
        \tolvignetten_plugin_url(
            'public/js/partner-logo.js'
        ),
        array('jquery')
    );
}
