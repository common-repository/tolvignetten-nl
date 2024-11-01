<?php

// Affiliates Functions
require_once \sprintf(
    '%sincludes/affiliates/functions.php',
    TOLVIGNETTEN_PATH
);

function tolvignetten_affiliate_init()
{
    $pageExists = tolvignetten_affiliate_page_exists();
    $issetPartnerId = !empty($_GET[TOLVIGNETTEN_AFFILIATE_PARTNER_ID_PARAM_NAME]);
    $issetPartnerAnvr = !empty($_GET[TOLVIGNETTEN_AFFILIATE_PARTNER_ANVR_PARAM_NAME]);
    $issetPartnerBdr = !empty($_GET[TOLVIGNETTEN_AFFILIATE_PARTNER_BDR_PARAM_NAME]);
    $issetPartnerInfoOld = !empty($_GET[TOLVIGNETTEN_AFFILIATE_PARTNER_INFO_PARAM_NAME_OLD]);

    if (
        $issetPartnerInfoOld
        || (
            $pageExists
            && !$issetPartnerId
            && !$issetPartnerAnvr
            && !$issetPartnerBdr
        )
    ) {
        if (true === \function_exists('tolvignetten_affiliate_refresh')) {
            tolvignetten_affiliate_refresh();
        }

        return;
    }

    $affiliate = tolvignetten_get_stored_affiliate();
    if (!$pageExists || $issetPartnerId) {
        $affiliateIdName = !empty($_SERVER['REQUEST_URI']) ? \current(\explode('?', $_SERVER['REQUEST_URI'])) : '';
        if ($issetPartnerId) {
            $affiliateIdName = (int) $_GET[TOLVIGNETTEN_AFFILIATE_PARTNER_ID_PARAM_NAME];
        }

        if( 0 !== \preg_match('/^[a-z0-9-]+$/i', ltrim($affiliateIdName, '/')) ){
            $affiliate = tolvignetten_get_affiliate_info(
                $affiliateIdName
            );
        }
    }

    if (empty($affiliate)) {
        if (true === \function_exists('tolvignetten_affiliate_refresh')) {
            tolvignetten_affiliate_refresh();
        }

        tolvignetten_affiliate_clean_redirect();
        return;
    }

    if (!empty($_GET[TOLVIGNETTEN_AFFILIATE_PARTNER_INFO_PARAM_NAME])) {
        $affiliate[TOLVIGNETTEN_AFFILIATE_COOKIE_KEY_INFO] = $_GET[TOLVIGNETTEN_AFFILIATE_PARTNER_INFO_PARAM_NAME];
    }

    if ($issetPartnerAnvr) {
        $affiliate[TOLVIGNETTEN_AFFILIATE_COOKIE_KEY_ANVR] = $_GET[TOLVIGNETTEN_AFFILIATE_PARTNER_ANVR_PARAM_NAME];
    }

    if ($issetPartnerBdr) {
        $affiliate[TOLVIGNETTEN_AFFILIATE_COOKIE_KEY_BDR] = $_GET[TOLVIGNETTEN_AFFILIATE_PARTNER_BDR_PARAM_NAME];
    }

    tolvignetten_store_affiliate(
        $affiliate
    );

    if (!tolvignetten_affiliate_current_page_exists()) {
        tolvignetten_affiliate_redirect();
    }
    else if( \array_key_exists(TOLVIGNETTEN_AFFILIATE_PARTNER_ID_PARAM_NAME, $_GET) ){
        tolvignetten_affiliate_clean_redirect();
    }
}

function tolvignetten_affiliate_clean_redirect()
{
    if( !\array_key_exists(TOLVIGNETTEN_AFFILIATE_PARTNER_ID_PARAM_NAME, $_GET) ){
        return;
    }

    $queryParams = $_GET;
    unset($queryParams[TOLVIGNETTEN_AFFILIATE_PARTNER_ID_PARAM_NAME]);
    $currentUrlParts = \explode('?', $_SERVER['REQUEST_URI']);

    $newQueryParams = \http_build_query(
        $queryParams
    );

    if( !empty($newQueryParams) ) {
        $newQueryParams = \sprintf(
            "?%s",
            $newQueryParams
        );
    }

    \wp_redirect(
        \sprintf(
            "%s%s",
            $currentUrlParts[0] ? $currentUrlParts[0] : '/',
            $newQueryParams
        )
    );

    die;
}

/**
 * @return boolean
 */
function tolvignetten_affiliate_page_exists()
{
    return (
        empty($_GET[TOLVIGNETTEN_AFFILIATE_PARTNER_ID_PARAM_NAME])
        && tolvignetten_affiliate_current_page_exists()
    );
}

function tolvignetten_affiliate_redirect()
{
    $query = '';
    if (!empty($_GET)) {
        $query = \sprintf(
            "?%s",
            \http_build_query(
                $_GET
            )
        );
    }

    \wp_redirect(
        \sprintf(
            "%s%s",
            \home_url(),
            $query
        )
    );

    die;
}

\add_action('wp_enqueue_scripts', 'tolvignetten_affiliate_custom_css');
function tolvignetten_affiliate_custom_css()
{
    $css = tolvignetten_affiliate_get_custom_affiliate_css();
    if (null === $css) {
        return;
    }

    \wp_enqueue_style(
        'tolvignetten-affiliates-css',
        \tolvignetten_plugin_url(
            'public/css/affiliates.css'
        )
    );

    \wp_add_inline_style(
        'tolvignetten-affiliates-css',
        $css
    );

    \wp_enqueue_script(
        'tolvignetten-affiliates-js',
        \tolvignetten_plugin_url(
            'public/js/affiliates.js'
        ),
        array('jquery')
    );

    \wp_localize_script(
        'tolvignetten-affiliates-js',
        'TolvignettenAffiliateConfig',
        array(
            'primaryColorTextPointer' => TOLVIGNETTEN_AFFILIATE_CSS_SELECTOR_PRIMARY_COLOR_TEXT,
            'primaryColorBgPointer' => TOLVIGNETTEN_AFFILIATE_CSS_SELECTOR_PRIMARY_COLOR_BG,
            'secondaryColorTextPointer' => TOLVIGNETTEN_AFFILIATE_CSS_SELECTOR_SECONDARY_COLOR_TEXT,
            'secondaryColorBgPointer' => TOLVIGNETTEN_AFFILIATE_CSS_SELECTOR_SECONDARY_COLOR_BG,
        )
    );
}
