<?php

function tolvignetten_setup_admin_menu()
{
    \add_menu_page(
        'Tolvignetten.nl configuration',
        'Tolvignetten.nl',
        'manage_options',
        'tolvignetten',
        'tolvignetten_admin_page_init'
    );
}

function tolvignetten_admin_page_init()
{
    \wp_enqueue_script(
        'tolvignetten-admin-js',
        tolvignetten_plugin_url('admin/js/tolvignetten-admin.js'),
        ['jquery']
    );

    \wp_enqueue_style(
        'tolvignetten-admin-css',
        tolvignetten_plugin_url('admin/css/styles.css')
    );

    $shortcodes = tolvignetten_get_shortcodes_descriptions();

    include \sprintf(
        '%sadmin/templates/configuration-page.php',
        TOLVIGNETTEN_PATH
    );
}

\add_action(
    'admin_menu',
    'tolvignetten_setup_admin_menu'
);
