<?php

/**
 * @param string $ref
 *
 * @return array
 */
function tolvignetten_get_affiliate_info($ref)
{
	if( false !== \strpos($ref, 'xmlrcp.php') ){
		return array();
	}

	try{
		$request = \wp_remote_get(
			\sprintf(
				"%s%s?%s",
				TOLVIGNETTEN_STORE_DEFAULT_URL,
				'/affiliate/info',
				\http_build_query([
					'ref' => \trim(
						$ref,
						'/ '
					),
					'sourceDomain' => tolvignetten_get_affiliate_get_source_domain()
				])
			),
            [
                'timeout' => tolvignetten_get_request_default_timeout(),
            ]
		);

		$responseCode = ((int) \wp_remote_retrieve_response_code($request));
		if( 200 !== $responseCode ){
			throw new \Exception(
				'',
				$responseCode
			);
		}
	}
	catch(\Exception $e){
		return array();
	}

	$response = \json_decode(
		(string) \wp_remote_retrieve_body($request),
		true
	);

	return ((!empty($response) && !empty($response['id'])) ? $response : array());
}

/**
 * @return string
 */
function tolvignetten_get_affiliate_get_source_domain()
{
	$homeUrlInfo = \parse_url(
		\get_home_url()
	);

	$sourceDomain = '';
	if( !empty($homeUrlInfo['host']) ){
		$sourceDomain = \preg_replace(
			array(
				"/^(www\.)/ui",
				"/^\./ui",
			),
			array(
				'',
				''
			),
			$homeUrlInfo['host']
		);
	}

	return $sourceDomain;
}

/**
 * @param array $affiliate
 *
 * @return boolean
 */
function tolvignetten_store_affiliate($affiliate)
{
	$durationDays = (int) TOLVIGNETTEN_AFFILIATE_COOKIE_DURATION_DAYS;
	if($durationDays <= 0){
		$durationDays = 1;
	}

	if( \array_key_exists('id', $affiliate) ){
        \setcookie(
            TOLVIGNETTEN_AFFILIATE_COOKIE_PARTNER_ID,
            $affiliate['id'],
            (\time() + ((60 * 60 * 24) * $durationDays)),
            TOLVIGNETTEN_AFFILIATE_COOKIE_PATH
        );
    }

	return \setcookie(
		TOLVIGNETTEN_AFFILIATE_COOKIE_NAME,
		\json_encode($affiliate),
		(\time() + ((60 * 60 * 24) * $durationDays)),
		TOLVIGNETTEN_AFFILIATE_COOKIE_PATH
	);
}

/**
 * @return array
 */
function tolvignetten_get_stored_affiliate()
{
	$value = !empty($_COOKIE[TOLVIGNETTEN_AFFILIATE_COOKIE_NAME]) ? $_COOKIE[TOLVIGNETTEN_AFFILIATE_COOKIE_NAME] : null;
	if( null === $value ){
		return array();
	}

	$affiliate = \json_decode(
		\stripslashes(
			$value
		),
		true
	);

	return null !== $affiliate ? $affiliate : array();
}

/**
 * @return boolean
 */
function tolvignetten_affiliate_current_page_exists()
{
	$uriPath = \current(
		\explode(
			'?',
			$_SERVER['REQUEST_URI']
		)
	);

	if (empty($uriPath) || $uriPath === '/') {
		return true;
	}

	$pageExists = !empty(
		\get_page_by_path(
			$uriPath
		)
	);

	$scriptExists = true;
	$scriptName = ltrim(!empty($_SERVER['SCRIPT_NAME']) ? $_SERVER['SCRIPT_NAME'] : '', '/');
	if('index.php' === $scriptName || (!$pageExists && !empty($scriptName) && !file_exists($scriptName)) ){
        $scriptExists = false;
    }

	return $pageExists || $scriptExists;
}

/**
 * @return string|null
 */
function tolvignetten_affiliate_get_custom_affiliate_css()
{
	$affiliate = tolvignetten_get_stored_affiliate();
	if( empty($affiliate) ){
		return null;
	}

	$css = array();

	if( !empty($affiliate['main_logo_color']) ){
		$css[] = \sprintf(
			'
			%s a.logo:not(.ta-affiliate-logo) .cls-1 {fill: %s !important;}, 
			%s a.logo:not(.ta-affiliate-logo) .cls-1 {fill: %s !important;}
			',
			TOLVIGNETTEN_AFFILIATE_CSS_SELECTOR_PRIMARY_COLOR_BG,
			$affiliate['main_logo_color'],
			TOLVIGNETTEN_AFFILIATE_CSS_SELECTOR_PRIMARY_COLOR_TEXT,
			$affiliate['main_logo_color']
		);
	}

	if( !empty($affiliate['primary_color']) ){
		$css[] = tolvignetten_load_css_template(
			'includes/affiliates/css-templates/custom-affiliate-style.php',
			[
				'textSelector' => TOLVIGNETTEN_AFFILIATE_CSS_SELECTOR_PRIMARY_COLOR_TEXT,
				'bgSelector' => TOLVIGNETTEN_AFFILIATE_CSS_SELECTOR_PRIMARY_COLOR_BG,
				'color' => $affiliate['primary_color'],
			]
		);
	}

	if( !empty($affiliate['secondary_color']) ){
		$css[] = tolvignetten_load_css_template(
			'includes/affiliates/css-templates/custom-affiliate-style.php',
			[
				'textSelector' => TOLVIGNETTEN_AFFILIATE_CSS_SELECTOR_SECONDARY_COLOR_TEXT,
				'bgSelector' => TOLVIGNETTEN_AFFILIATE_CSS_SELECTOR_SECONDARY_COLOR_BG,
				'color' => $affiliate['secondary_color']
			]
		);
	}

	return !empty($css) ? \implode("\n", $css) : null;
}

/**
 * @return int|null
 */
function tolvignetten_affiliate_id()
{
	$affiliate = tolvignetten_get_stored_affiliate();
	if( empty($affiliate) ){
		return null;
	}

	return !empty($affiliate['id']) ? ((int) $affiliate['id']) : null;
}

/**
 * @return string|null
 */
function tolvignetten_affiliate_info()
{
	$affiliate = tolvignetten_get_stored_affiliate();
	if( empty($affiliate) ){
		return null;
	}

	return !empty($affiliate[TOLVIGNETTEN_AFFILIATE_COOKIE_KEY_INFO]) ? $affiliate[TOLVIGNETTEN_AFFILIATE_COOKIE_KEY_INFO] : null;
}

/**
 * @return string|null
 */
function tolvignetten_affiliate_anvr()
{
	$affiliate = tolvignetten_get_stored_affiliate();
	if( empty($affiliate) ){
		return null;
	}

	return !empty($affiliate[TOLVIGNETTEN_AFFILIATE_COOKIE_KEY_ANVR]) ? $affiliate[TOLVIGNETTEN_AFFILIATE_COOKIE_KEY_ANVR] : null;
}

/**
 * @return string|null
 */
function tolvignetten_affiliate_bdr()
{
	$affiliate = tolvignetten_get_stored_affiliate();
	if( empty($affiliate) ){
		return null;
	}

	return !empty($affiliate[TOLVIGNETTEN_AFFILIATE_COOKIE_KEY_BDR]) ? $affiliate[TOLVIGNETTEN_AFFILIATE_COOKIE_KEY_BDR] : null;
}

/**
 * @return boolean
 */
function tolvignetten_affiliate_refresh()
{
	$affiliate = tolvignetten_get_stored_affiliate();
	if( empty($affiliate) ){
		return false;
	}

	$affiliateInfo = tolvignetten_affiliate_info();
	$affiliateAnvr = tolvignetten_affiliate_anvr();
	$affiliateBdr = tolvignetten_affiliate_bdr();

	$expired = (true === empty($affiliate['expire']) || (false === empty($affiliate['expire']) && \time() > $affiliate['expire']) );
	if( true === $expired && false === empty($affiliate['id']) ){
	    $affiliate = tolvignetten_get_affiliate_info(
	        $affiliate['id']
        );

        $affiliate[TOLVIGNETTEN_AFFILIATE_COOKIE_KEY_INFO] = $affiliateInfo;
        $affiliate[TOLVIGNETTEN_AFFILIATE_COOKIE_KEY_ANVR] = $affiliateAnvr;
        $affiliate[TOLVIGNETTEN_AFFILIATE_COOKIE_KEY_BDR] = $affiliateBdr;

        $affiliate['expire'] = (\time() + 18000);
        tolvignetten_store_affiliate(
            $affiliate
        );

        return true;
    }

	return false;
}
