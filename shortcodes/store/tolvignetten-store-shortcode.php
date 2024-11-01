<?php
/**
 * @param array $attrs
 *
 * @return string
 */
function tolvignetten_store_shortcode($attrs)
{
	$attrs = tolvignetten_process_shotcode_attrs(
		TOLVIGNETTEN_STORE_SHORCODE,
		$attrs
	);

	if (empty($attrs['partner_id'])) {
		$attrs['partner_id'] = tolvignetten_affiliate_id();
	}

	if (empty($attrs['partner_info'])) {
		$attrs['partner_info'] = tolvignetten_affiliate_info();
	}

	if (empty($attrs['partner_anvr'])) {
		$attrs['partner_anvr'] = tolvignetten_affiliate_anvr();
	}

	if (empty($attrs['partner_bdr'])) {
		$attrs['partner_bdr'] = tolvignetten_affiliate_bdr();
	}

	if (!empty($_GET[TOLVIGNETTEN_AFFILIATE_LICENSE_PLATE_NUMBER_PARAM_NAME])) {
		$attrs['license_plate_number'] = $_GET[TOLVIGNETTEN_AFFILIATE_LICENSE_PLATE_NUMBER_PARAM_NAME];
	}

	tolvignetten_enqueue_required_libs();

	\wp_enqueue_script(
		'tolvignetten-jquery-cookies-js',
		\tolvignetten_plugin_url(
			'public/js/jquery.cookies.js'
		),
		['jquery']
	);

	\wp_enqueue_script(
		'tolvignetten-jquery-history-js',
		\tolvignetten_plugin_url(
			'public/js/jquery.history.js'
		),
		['jquery']
	);

	\wp_enqueue_script(
		'tolvignetten-store-js',
		\tolvignetten_plugin_url(
			'shortcodes/store/js/store.js'
		),
		['jquery']
	);

	\wp_localize_script(
		'tolvignetten-store-js',
		'TolvignettenStoreShortcode',
		array(
			'pluginVersion' => TOLVIGNETTEN_PLUGIN_VERSION,
			'pluginVersionCookieName' => TOLVIGNETTEN_PLUGIN_VERSION_COOKIE_NAME,
			'affiliateCookieName' => TOLVIGNETTEN_AFFILIATE_COOKIE_NAME,
			'ajaxUrl' => \admin_url('admin-ajax.php'),
			'storeUrl' => $attrs['store_url'],
			'countries' => $attrs['countries'],
			'partnerId' => $attrs['partner_id'],
			'partnerInfo' => $attrs['partner_info'],
			'partnerAnvr' => $attrs['partner_anvr'],
			'partnerBdr' => $attrs['partner_bdr'],
			'showTrailerOption' => $attrs['show_trailer_option'],
			'allowDeleteMainItems' => $attrs['allow_delete_main_items'],
			'showConfigurationSummary' => $attrs['show_configuration_summary'],
			'showInfo' => $attrs['show_info'],
			'itemsType' => $attrs['items_type'],
			'allowUnselectOptionalItems' => $attrs['allow_unselect_optional_items'],
			'defaultOptionalItemsStatus' => $attrs['default_optional_items_status'],
		)
	);

	\wp_enqueue_style(
		'tolvignetten-store-css',
		\tolvignetten_plugin_url(
			'shortcodes/store/css/store.css'
		)
	);

	return \tolvignetten_store_shortcode_html(
		$attrs
	);
}

/**
 * @param array $attrs
 *
 * @return string
 */
function tolvignetten_store_shortcode_html($attrs)
{
	return tolvignetten_load_template(
		'shortcodes/store/templates/store-template.php',
		tolvignetten_process_shotcode_attrs(
			TOLVIGNETTEN_STORE_SHORCODE,
			$attrs
		)
	);
}

\add_shortcode(
	TOLVIGNETTEN_STORE_SHORCODE,
	'tolvignetten_store_shortcode'
);
