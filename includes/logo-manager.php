<?php

/**
 * Prints HTML of affiliate logo
 */
function tolvignetten_print_logo_html()
{
	$affiliateInfo = tolvignetten_get_stored_affiliate();
	if( empty($affiliateInfo) || empty($affiliateInfo['logo_url']) ){
		return;
	}

	echo tolvignetten_load_template(
		'public/templates/affiliate-logo.php',
		[
			'logoUrl' => $affiliateInfo['logo_url'],
			'targetUrl' => !empty($affiliateInfo['website']) ? $affiliateInfo['website'] : ''
		]
	);
}

/**
 * Assets HTML of affiliate logo
 */
function tolvignetten_print_has_logo()
{
	$affiliateInfo = tolvignetten_get_stored_affiliate();
	return !empty($affiliateInfo['logo_url']);
}